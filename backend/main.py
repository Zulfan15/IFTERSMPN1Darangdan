# FastAPI Main Application

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from typing import List, Optional
import uuid
import shutil
import cv2

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
