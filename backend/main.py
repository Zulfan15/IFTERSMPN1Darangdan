# FastAPI Main Application

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from typing import List, Optional
import uuid
import shutil
import cv2
import zipfile
import json
import os
from datetime import datetime

from models import ExamCreate, ExamResponse, ProcessLJKRequest, ResultResponse
from storage import StorageService
from ljk_processor import LJKProcessor
from pdf_converter import convert_pdf_to_jpg
import config

# Initialize FastAPI app
app = FastAPI(
    title="LJK Grading System API",
    description="API for automated bubble sheet grading",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
storage = StorageService()
processor = LJKProcessor()

# Mount static files
app.mount("/uploads", StaticFiles(directory=str(config.UPLOADS_DIR)), name="uploads")
app.mount("/processed", StaticFiles(directory=str(config.PROCESSED_DIR)), name="processed")

# ============ HEALTH CHECK ============

@app.get("/")
async def root():
    return {
        "message": "LJK Grading System API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "roi_configured": processor.roi_config is not None
    }

# ============ EXAM ENDPOINTS ============

@app.post("/api/exams", response_model=ExamResponse)
async def create_exam(exam: ExamCreate):
    """Create new exam configuration"""
    try:
        exam_data = exam.model_dump(by_alias=True)
        exam_id = storage.save_exam(exam_data)
        
        saved_exam = storage.load_exam(exam_id)
        return saved_exam
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/exams", response_model=List[ExamResponse])
async def list_exams():
    """List all exams"""
    try:
        exams = storage.list_exams()
        return exams
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/exams/{exam_id}", response_model=ExamResponse)
async def get_exam(exam_id: str):
    """Get exam by ID"""
    exam = storage.load_exam(exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@app.delete("/api/exams/{exam_id}")
async def delete_exam(exam_id: str):
    """Delete exam and all associated results"""
    success = storage.delete_exam(exam_id)
    if not success:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam deleted successfully"}

@app.put("/api/exams/{exam_id}", response_model=ExamResponse)
async def update_exam(exam_id: str, exam: ExamCreate):
    """Update exam configuration"""
    try:
        existing_exam = storage.load_exam(exam_id)
        if not existing_exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        exam_data = exam.model_dump(by_alias=True)
        exam_data['exam_id'] = exam_id
        exam_data['created_at'] = existing_exam.get('created_at')
        
        success = storage.update_exam(exam_id, exam_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update exam")
        
        updated_exam = storage.load_exam(exam_id)
        return updated_exam
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ UPLOAD & PROCESS ============

@app.post("/api/process-ljk")
async def process_ljk(
    exam_id: str = Form(...),
    file: UploadFile = File(...),
    student_name: Optional[str] = Form(None),
    student_number: Optional[str] = Form(None)
):
    """Upload and process LJK image or PDF"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in config.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed: {config.ALLOWED_EXTENSIONS}"
            )
        
        # Load exam
        exam = storage.load_exam(exam_id)
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        # Save uploaded file
        upload_id = uuid.uuid4().hex[:12]
        file_path = config.UPLOADS_DIR / f"{upload_id}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Convert PDF to JPG if needed
        processing_image_path = str(file_path)
        if file_ext == '.pdf':
            try:
                print(f"📄 Converting PDF to JPG: {file.filename}")
                jpg_path = convert_pdf_to_jpg(
                    str(file_path),
                    output_dir=str(config.UPLOADS_DIR),
                    dpi=300
                )
                processing_image_path = jpg_path
                print(f"✅ PDF converted successfully")
            except Exception as pdf_error:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to convert PDF: {str(pdf_error)}"
                )
        
        # Process LJK
        result = processor.process_ljk(
            processing_image_path,
            exam['answer_key'],
            exam['active_questions']
        )
        
        # Save marked image
        marked_path = config.PROCESSED_DIR / f"marked_{upload_id}.jpg"
        cv2.imwrite(str(marked_path), result['marked_image'])
        
        # Determine display paths
        if file_ext == '.pdf':
            # Use converted JPG for display
            display_image_path = f"/uploads/{Path(processing_image_path).name}"
        else:
            display_image_path = f"/uploads/{file_path.name}"
        
        # Save result
        result_data = {
            'exam_id': exam_id,
            'student_name': student_name,
            'student_number': student_number,
            'answers': result['answers'],
            'unanswered': result['unanswered'],
            'score': result['score'],
            'details': result['details'],
            'image_path': display_image_path,
            'processed_image_path': f"/processed/{marked_path.name}"
        }
        
        result_id = storage.save_result(result_data)
        
        return {
            "success": True,
            "result_id": result_id,
            "score": result['score'],
            "details": result['details'],
            "marked_image_url": result_data['processed_image_path']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ RESULTS ============

@app.get("/api/results/{result_id}")
async def get_result(result_id: str):
    """Get result by ID"""
    result = storage.load_result(result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result

@app.get("/api/exams/{exam_id}/results")
async def get_exam_results(exam_id: str):
    """Get all results for an exam"""
    try:
        results = storage.list_results_by_exam(exam_id)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/exams/{exam_id}/statistics")
async def get_exam_statistics(exam_id: str):
    """Get statistics for an exam"""
    try:
        stats = storage.get_exam_statistics(exam_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/results/{result_id}")
async def delete_result(result_id: str):
    """Delete a result"""
    success = storage.delete_result(result_id)
    if not success:
        raise HTTPException(status_code=404, detail="Result not found")
    return {"message": "Result deleted successfully"}

# ============ EXPORT ============

@app.get("/api/exams/{exam_id}/export/excel")
async def export_to_excel(exam_id: str):
    """Export exam results to Excel"""
    try:
        from export_service import ExportService
        
        export_service = ExportService(storage)
        file_path = export_service.export_to_excel(exam_id)
        
        # Ensure file exists
        if not file_path.exists():
            raise HTTPException(status_code=500, detail="Export file was not created")
        
        return FileResponse(
            path=str(file_path),
            filename=file_path.name,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename={file_path.name}",
                "Cache-Control": "no-cache"
            }
        )
    except Exception as e:
        print(f"Export error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ TEMPLATE/ROI ============

@app.get("/api/template/status")
async def get_template_status():
    """Check if template is configured"""
    roi_path = config.TEMPLATES_DIR / "roi_config.json"
    template_path = config.TEMPLATES_DIR / "Ljk_contoh.jpg"
    
    return {
        "roi_configured": roi_path.exists(),
        "template_exists": template_path.exists(),
        "roi_config": processor.roi_config
    }

# ============ ARCHIVE ============

@app.post("/api/archive")
async def archive_exams(
    start_date: str = Query(..., description="Format: YYYY-MM-DD"),
    end_date: str = Query(..., description="Format: YYYY-MM-DD")
):
    """Archive ujian dalam rentang tanggal ke file ZIP"""
    try:
        # Parse dates
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Get all exams
        all_exams = storage.list_exams()
        exams_to_archive = []
        
        for exam in all_exams:
            # Parse exam date
            exam_date_str = exam.get('exam_date') or exam.get('date', '')
            if not exam_date_str:
                continue
            
            try:
                exam_date = datetime.strptime(exam_date_str, "%Y-%m-%d")
                if start <= exam_date <= end:
                    exams_to_archive.append(exam)
            except ValueError:
                continue
        
        if not exams_to_archive:
            raise HTTPException(status_code=404, detail="Tidak ada ujian dalam rentang tanggal tersebut")
        
        # Create archive folder
        archive_dir = config.DATA_DIR / "archives"
        archive_dir.mkdir(exist_ok=True)
        
        # Create ZIP filename
        zip_filename = f"archive_{start_date}_to_{end_date}.zip"
        zip_path = archive_dir / zip_filename
        
        # Create ZIP file
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Prepare archive data
            exam_ids = [exam['exam_id'] for exam in exams_to_archive]
            
            # Add exam JSON files
            for exam_id in exam_ids:
                exam_file = config.EXAMS_DIR / f"{exam_id}.json"
                if exam_file.exists():
                    zipf.write(exam_file, f"data/exams/{exam_id}.json")
            
            # Add result JSON files
            result_count = 0
            for exam_id in exam_ids:
                results = storage.list_results_by_exam(exam_id)
                for result in results:
                    result_id = result['result_id']
                    result_file = config.RESULTS_DIR / f"{result_id}.json"
                    if result_file.exists():
                        zipf.write(result_file, f"data/results/{result_id}.json")
                        result_count += 1
            
            # Add images
            for exam_id in exam_ids:
                upload_dir = config.UPLOADS_DIR / exam_id
                processed_dir = config.PROCESSED_DIR / exam_id
                
                # Add uploaded images
                if upload_dir.exists():
                    for img_file in upload_dir.rglob("*"):
                        if img_file.is_file():
                            arcname = f"data/images/uploads/{exam_id}/{img_file.relative_to(upload_dir)}"
                            zipf.write(img_file, arcname)
                
                # Add processed images
                if processed_dir.exists():
                    for img_file in processed_dir.rglob("*"):
                        if img_file.is_file():
                            arcname = f"data/images/processed/{exam_id}/{img_file.relative_to(processed_dir)}"
                            zipf.write(img_file, arcname)
            
            # Add archive info file
            archive_info = {
                "archived_date": datetime.now().isoformat(),
                "date_range": {
                    "start": start_date,
                    "end": end_date
                },
                "exam_count": len(exams_to_archive),
                "result_count": result_count,
                "exam_ids": exam_ids
            }
            zipf.writestr("archive_info.json", json.dumps(archive_info, indent=2, ensure_ascii=False))
        
        file_size = os.path.getsize(zip_path)
        
        return {
            "message": f"Berhasil mengarsipkan {len(exams_to_archive)} ujian",
            "exam_count": len(exams_to_archive),
            "result_count": result_count,
            "zip_file": zip_filename,
            "zip_path": str(zip_path),
            "file_size": file_size,
            "file_size_mb": round(file_size / (1024 * 1024), 2)
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Format tanggal salah. Gunakan YYYY-MM-DD")
    except Exception as e:
        print(f"Archive error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/archive/cleanup")
async def cleanup_archived_exams(
    start_date: str = Query(...),
    end_date: str = Query(...)
):
    """Hapus ujian yang sudah diarsipkan dari database"""
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        all_exams = storage.list_exams()
        deleted_count = 0
        
        for exam in all_exams:
            exam_date_str = exam.get('exam_date') or exam.get('date', '')
            if not exam_date_str:
                continue
            
            try:
                exam_date = datetime.strptime(exam_date_str, "%Y-%m-%d")
                if start <= exam_date <= end:
                    exam_id = exam['exam_id']
                    
                    # Delete exam from storage
                    storage.delete_exam(exam_id)
                    
                    # Delete image folders
                    upload_dir = config.UPLOADS_DIR / exam_id
                    processed_dir = config.PROCESSED_DIR / exam_id
                    
                    if upload_dir.exists():
                        shutil.rmtree(upload_dir)
                    if processed_dir.exists():
                        shutil.rmtree(processed_dir)
                    
                    deleted_count += 1
            except ValueError:
                continue
        
        return {
            "message": f"Berhasil menghapus {deleted_count} ujian yang sudah diarsipkan",
            "deleted_count": deleted_count
        }
    
    except Exception as e:
        print(f"Cleanup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/archive/list")
async def list_archives():
    """List semua file arsip yang tersedia"""
    archive_dir = config.DATA_DIR / "archives"
    archive_dir.mkdir(exist_ok=True)
    
    archives = []
    for zip_file in archive_dir.glob("*.zip"):
        archives.append({
            "filename": zip_file.name,
            "size": os.path.getsize(zip_file),
            "created_date": datetime.fromtimestamp(zip_file.stat().st_ctime).isoformat()
        })
    
    # Sort by created date descending
    archives.sort(key=lambda x: x['created_date'], reverse=True)
    
    return {"archives": archives}


@app.get("/api/archive/download/{filename}")
async def download_archive(filename: str):
    """Download file arsip"""
    # Sanitize filename to prevent path traversal
    filename = Path(filename).name
    zip_path = config.DATA_DIR / "archives" / filename
    
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="File arsip tidak ditemukan")
    
    return FileResponse(
        path=str(zip_path),
        filename=filename,
        media_type="application/zip"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
