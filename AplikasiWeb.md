# Sistem Pemeriksaan LJK Otomatis - SMPN 1 Darangdan

## 📋 Masalah
Guru-guru di SMPN 1 Darangdan menghadapi tantangan dalam melakukan pemeriksaan hasil ujian berbasis Lembar Jawaban Komputer (LJK) karena:
- Keterbatasan alat OMR industri yang mahal (Rp 50-100 juta) dan sulit dioperasikan
- Proses koreksi manual memakan waktu (1 kelas = 30-40 siswa × 5-10 menit = 2-6 jam)
- Risiko kesalahan human error dalam penghitungan skor
- Kesulitan membuat laporan dan analisis hasil ujian
- Tidak ada dokumentasi digital untuk arsip nilai

## 💡 Solusi
Sistem berbasis web localhost yang memanfaatkan **Computer Vision (OpenCV)** untuk membaca LJK secara otomatis dengan:
- **Akurasi tinggi** (83-100% berdasarkan testing)
- **Gratis dan offline** (tidak perlu koneksi internet)
- **User-friendly** untuk guru non-teknis
- **Fleksibel** (mendukung 1-180 soal)
- **Terintegrasi** dengan program Python yang sudah proven (`ljk_manual_roi.py`)

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                     │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Dashboard │  │ Setup Ujian  │  │ Upload LJK   │         │
│  │   Page    │→ │   & Kunci    │→ │  & Proses    │         │
│  └───────────┘  └──────────────┘  └──────────────┘         │
│         ↓               ↓                   ↓                │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Lihat    │  │   Analisis   │  │ Export Excel │         │
│  │  Hasil    │  │   Statistik  │  │   & Print    │         │
│  └───────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP API (FastAPI)
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Python FastAPI)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         ljk_manual_roi.py (Core Processing)            │ │
│  │  • ROI Selection & Detection                           │ │
│  │  • Bubble Detection (OpenCV)                           │ │
│  │  • Answer Extraction                                   │ │
│  │  • Scoring & Validation                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Storage & Export Services                 │ │
│  │  • JSON File Storage (exams, results)                  │ │
│  │  • Excel Export (openpyxl)                             │ │
│  │  • Image Processing & Caching                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ File System
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL STORAGE                             │
│  /data                                                       │
│    /exams          → exam_[id].json                         │
│    /results        → result_[id].json                       │
│    /images                                                   │
│      /templates    → Ljk_contoh.jpg, roi_config.json       │
│      /uploads      → student_ljk_[timestamp].jpg           │
│      /processed    → marked_[id].jpg                        │
│    /exports        → excel_[date].xlsx                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Fitur Lengkap

### 1. **Dashboard Utama**
```
┌──────────────────────────────────────────────────────┐
│ 📊 DASHBOARD - Sistem Pemeriksaan LJK                │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Statistik Hari Ini:                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │   15    │  │   450   │  │  87.3%  │             │
│  │  Ujian  │  │  Siswa  │  │  Rata²  │             │
│  └─────────┘  └─────────┘  └─────────┘             │
│                                                       │
│  Ujian Terbaru:                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ ✓ UTS Matematika Kelas 9A    45 siswa  92%  │   │
│  │ ✓ UAS IPA Kelas 8B           38 siswa  78%  │   │
│  │ ⏳ Ulangan Harian IPS         0 siswa   -    │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  [+ Buat Ujian Baru]  [📂 Lihat Semua Ujian]       │
└──────────────────────────────────────────────────────┘
```

### 2. **Setup Ujian Baru**
**Langkah 1: Informasi Ujian**
- Nama Ujian (contoh: "UTS Matematika Kelas 9A")
- Tanggal Ujian
- Mata Pelajaran
- Kelas
- Jumlah Soal Aktif (1-180, dengan slider/dropdown)
- Sistem Penilaian:
  - Nilai per soal benar (default: 1)
  - Nilai per soal salah (default: 0)
  - Nilai tidak dijawab (default: 0)
  - Skala konversi (0-100 atau custom)

**Langkah 2: Kunci Jawaban**
```
┌─────────────────────────────────────────────────────┐
│ Kunci Jawaban (50 soal aktif dari 180 total)        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Soal 1-10:                                         │
│  [A] [B] [C] [D] [E]  ← Klik untuk pilih           │
│   ✓                   ← Hijau = terpilih           │
│                                                      │
│  Soal 11-20:                                        │
│  [A] [B] [C] [D] [E]                               │
│        ✓                                            │
│                                                      │
│  ... (hingga soal 50)                              │
│                                                      │
│  💡 Tips: Gunakan keyboard 1-5 untuk cepat input   │
│                                                      │
│  [Import dari Excel]  [Generate Random (Test)]      │
│  [Simpan Draft]       [Lanjut ke Upload LJK] →     │
└─────────────────────────────────────────────────────┘
```

**Langkah 3: Setup Template ROI (Sekali Saja)**
```
┌─────────────────────────────────────────────────────┐
│ Setup Template LJK (One-time Setup)                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ✓ Template sudah dikonfigurasi                    │
│  File: Ljk_contoh.jpg                              │
│  ROI: (140, 909) - (1179, 1679)                    │
│  Ukuran: 1039 x 770 pixels                         │
│                                                      │
│  [Lihat Template]  [Reset ROI Jika Berubah]        │
│                                                      │
│  Status: ✓ Siap digunakan untuk semua ujian        │
└─────────────────────────────────────────────────────┘
```

### 3. **Upload & Proses LJK**
```
┌─────────────────────────────────────────────────────┐
│ Upload Lembar Jawaban Siswa                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Ujian: UTS Matematika Kelas 9A                    │
│  Soal Aktif: 50 soal (dari 180)                    │
│  Kunci: Sudah diset                                 │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  📤 Drag & Drop File di Sini                │   │
│  │     atau klik untuk browse                   │   │
│  │                                              │   │
│  │  Format: JPG, PNG, PDF (auto-convert)       │   │
│  │  Max: 10MB per file                         │   │
│  │  Batch: Hingga 50 file sekaligus           │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  File Queue:                                        │
│  ┌────────────────────────────────────────────┐    │
│  │ ✓ student_001.jpg  [Selesai] ✓ 100%  98pts│    │
│  │ ⏳ student_002.jpg  [Proses...]  45%        │    │
│  │ ⏸ student_003.jpg  [Antri]                 │    │
│  │ ❌ student_004.jpg  [Error: ROI tidak match]│    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  Progress: 25/45 siswa (55%)                       │
│  [⏸ Pause]  [▶ Resume]  [Lihat Hasil] →          │
└─────────────────────────────────────────────────────┘
```

### 4. **Hasil Individual Siswa**
```
┌─────────────────────────────────────────────────────┐
│ Hasil LJK - Ahmad Fauzi                             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📊 Ringkasan:                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  Skor: 85/100  (42.5/50 soal)               │   │
│  │  Benar: 42  Salah: 6  Kosong: 2             │   │
│  │  Persentase: 85%                             │   │
│  │  Predikat: B (Baik)                          │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  📷 Preview LJK:                                    │
│  [Gambar LJK dengan marking warna]                 │
│  🟢 Hijau = Benar  🔴 Merah = Salah  🟠 Kosong     │
│                                                      │
│  📝 Detail Per Soal:                               │
│  ┌─────┬────────┬────────┬────────┬────────┐       │
│  │ No. │ Kunci  │ Jawab  │ Status │ Poin   │       │
│  ├─────┼────────┼────────┼────────┼────────┤       │
│  │  1  │   A    │   A    │   ✓    │  1.0   │       │
│  │  2  │   B    │   B    │   ✓    │  1.0   │       │
│  │  3  │   C    │   D    │   ✗    │  0.0   │       │
│  │  4  │   D    │   -    │   ○    │  0.0   │       │
│  │ ... │  ...   │  ...   │  ...   │  ...   │       │
│  └─────┴────────┴────────┴────────┴────────┘       │
│                                                      │
│  [📥 Download Detail PDF]  [✏️ Edit Manual]         │
└─────────────────────────────────────────────────────┘
```

### 5. **Hasil Kelas (Aggregate)**
```
┌─────────────────────────────────────────────────────┐
│ Hasil Ujian: UTS Matematika Kelas 9A                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📊 Statistik Kelas:                               │
│  Rata-rata: 87.3  Tertinggi: 98  Terendah: 65     │
│  Lulus (≥75): 38/45 siswa (84%)                    │
│                                                      │
│  📈 Distribusi Nilai:                              │
│  [Histogram chart showing grade distribution]       │
│                                                      │
│  📋 Daftar Siswa:                                  │
│  ┌─────┬─────────────────┬────────┬────────┬────┐  │
│  │ No  │ Nama            │ Skor   │ Predikat│ ⚙ │  │
│  ├─────┼─────────────────┼────────┼────────┼────┤  │
│  │  1  │ Ahmad Fauzi     │ 98/100 │   A    │ 👁 │  │
│  │  2  │ Siti Nurhaliza  │ 92/100 │   A    │ 👁 │  │
│  │  3  │ Budi Santoso    │ 85/100 │   B    │ 👁 │  │
│  │ ... │ ...             │  ...   │  ...   │ ...│  │
│  └─────┴─────────────────┴────────┴────────┴────┘  │
│                                                      │
│  📊 Analisis Per Soal:                             │
│  ┌──────┬──────────┬──────────┬──────────┐         │
│  │ Soal │ Jawaban  │ % Benar  │ Tingkat  │         │
│  ├──────┼──────────┼──────────┼──────────┤         │
│  │  1   │    A     │   95%    │  Mudah   │         │
│  │  2   │    B     │   87%    │  Mudah   │         │
│  │  3   │    C     │   45%    │  Sulit   │  ⚠️    │
│  │ ...  │   ...    │   ...    │   ...    │         │
│  └──────┴──────────┴──────────┴──────────┘         │
│                                                      │
│  [📥 Export Excel]  [📄 Export PDF]  [🖨 Print]    │
└─────────────────────────────────────────────────────┘
```

### 6. **Export Excel**
Format output yang friendly untuk guru:
```
Sheet 1: Ringkasan Kelas
- Nama Ujian, Tanggal, Kelas
- Statistik (Rata-rata, Max, Min, Std Dev)
- Distribusi nilai (A, B, C, D, E)

Sheet 2: Nilai Siswa
- No, Nama, Kelas, Skor, Predikat
- Benar, Salah, Kosong
- Persentase

Sheet 3: Detail Per Soal Per Siswa
- Pivot table: Siswa vs Soal
- Warna: Hijau (benar), Merah (salah), Abu (kosong)

Sheet 4: Analisis Soal
- Soal, Kunci, % Benar, % Salah, Tingkat Kesulitan
- Rekomendasi (soal perlu direvisi)
```

---

## 🛠️ Teknologi Stack

### Frontend (Next.js 15 + TypeScript)
```typescript
/app
  /dashboard              → Dashboard page
  /exam
    /new                  → Create new exam
    /[id]
      /setup              → Setup answer key
      /upload             → Upload LJK
      /results            → View results
  /api
    /exam                 → CRUD exam
    /upload               → Handle file upload
    /process              → Trigger LJK processing
    /export               → Generate Excel

/components
  /ui                     → Shadcn/ui components
  /exam
    /AnswerKeyGrid        → Interactive A-E grid
    /FileUploader         → Drag & drop upload
    /ResultsTable         → Results data table
    /StatisticsCard       → Stats display
  /layout
    /Navbar               → Navigation
    /Sidebar              → Menu sidebar
```

**Dependencies:**
- `next@15` - Framework
- `typescript` - Type safety
- `tailwindcss` - Styling
- `shadcn/ui` - UI components
- `react-dropzone` - File upload
- `recharts` - Charts & graphs
- `zustand` - State management
- `axios` - HTTP client
- `react-hook-form` - Form handling
- `zod` - Validation

### Backend (Python FastAPI)
```python
/backend
  /api
    /routes
      exam.py             → Exam CRUD endpoints
      upload.py           → File upload handler
      process.py          → LJK processing
      export.py           → Excel export
    /models
      exam.py             → Exam data model
      result.py           → Result data model
    /services
      ljk_processor.py    → Wrapper for ljk_manual_roi.py
      storage_service.py  → JSON file management
      export_service.py   → Excel generation
    /utils
      image_utils.py      → Image preprocessing
      validation.py       → Input validation
  
  /core
    ljk_manual_roi.py     → Core LJK processing (EXISTING)
    answer_key_auto.py    → Answer key generation
  
  main.py                 → FastAPI app entry point
  config.py               → Configuration
  requirements.txt        → Dependencies
```

**Dependencies:**
```txt
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
opencv-python==4.8.1.78
numpy==2.3.4
imutils==0.5.4
scikit-learn==1.3.2
openpyxl==3.1.2
pandas==2.1.3
Pillow==10.1.0
pydantic==2.5.0
python-dotenv==1.0.0
```

### Data Storage (JSON)
```json
// exam_001.json
{
  "exam_id": "exam_001",
  "title": "UTS Matematika Kelas 9A",
  "date": "2025-10-19",
  "subject": "Matematika",
  "class": "9A",
  "total_questions": 180,
  "active_questions": 50,
  "scoring": {
    "correct": 1.0,
    "wrong": 0.0,
    "unanswered": 0.0
  },
  "answer_key": {
    "0": 0,  // A
    "1": 1,  // B
    // ... hingga 49
  },
  "created_at": "2025-10-19T10:30:00Z",
  "roi_config": {
    "x1": 140, "y1": 909,
    "x2": 1179, "y2": 1679
  }
}

// result_001_student_001.json
{
  "result_id": "result_001_student_001",
  "exam_id": "exam_001",
  "student_name": "Ahmad Fauzi",
  "student_number": "12345",
  "image_path": "/uploads/student_001.jpg",
  "processed_image_path": "/processed/marked_001.jpg",
  "answers": {
    "0": 0,  // Jawaban A
    "1": 1,  // Jawaban B
    // ...
  },
  "unanswered": [3, 15, 42],  // Soal kosong
  "score": {
    "correct": 42,
    "wrong": 6,
    "unanswered": 2,
    "total_points": 85.0,
    "percentage": 85.0
  },
  "processed_at": "2025-10-19T10:35:23Z"
}
```

---

## 🔄 Workflow Integration

### 1. **Proses Upload & Scoring**
```python
# backend/api/services/ljk_processor.py
import cv2
from core.ljk_manual_roi import process_ljk_180_manual, load_roi_config

class LJKProcessor:
    def __init__(self):
        self.roi_config = load_roi_config("data/templates/roi_config.json")
    
    def process_single_ljk(self, image_path: str, answer_key: dict, 
                           active_questions: int):
        """
        Process LJK using ljk_manual_roi.py
        """
        # Jalankan core processing
        result = process_ljk_180_manual(
            image_path, 
            self.roi_config,
            answer_key
        )
        
        # Filter hanya soal aktif
        filtered_result = self._filter_active_questions(
            result, 
            active_questions
        )
        
        return filtered_result
    
    def _filter_active_questions(self, result, active_questions):
        """
        Hanya ambil N soal pertama sesuai setting ujian
        """
        filtered_answers = {
            k: v for k, v in result['student_answers'].items() 
            if k < active_questions
        }
        
        filtered_unanswered = {
            k: v for k, v in result['unanswered'].items()
            if k < active_questions
        }
        
        # Hitung ulang skor
        correct = sum(
            1 for k, v in filtered_answers.items()
            if k in answer_key and answer_key[k] == v
        )
        
        return {
            'answers': filtered_answers,
            'unanswered': filtered_unanswered,
            'correct': correct,
            'wrong': len(filtered_answers) - correct,
            'total': active_questions,
            'image': result['image']
        }
```

### 2. **API Endpoints**
```python
# backend/api/routes/process.py
from fastapi import APIRouter, UploadFile, HTTPException
from services.ljk_processor import LJKProcessor
from services.storage_service import StorageService

router = APIRouter()
processor = LJKProcessor()
storage = StorageService()

@router.post("/process-ljk")
async def process_ljk(
    exam_id: str,
    file: UploadFile,
    student_name: str = None
):
    """
    Process uploaded LJK file
    """
    try:
        # Load exam config
        exam = storage.load_exam(exam_id)
        
        # Save uploaded file
        file_path = await storage.save_upload(file, exam_id)
        
        # Process LJK
        result = processor.process_single_ljk(
            file_path,
            exam['answer_key'],
            exam['active_questions']
        )
        
        # Calculate score
        score = calculate_score(result, exam['scoring'])
        
        # Save result
        result_data = {
            'exam_id': exam_id,
            'student_name': student_name,
            'answers': result['answers'],
            'unanswered': result['unanswered'],
            'score': score
        }
        
        result_id = storage.save_result(result_data)
        
        # Save marked image
        marked_path = storage.save_marked_image(
            result['image'], 
            result_id
        )
        
        return {
            'success': True,
            'result_id': result_id,
            'score': score,
            'marked_image': marked_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 📦 Struktur Project Lengkap

```
bubble-sheet-grader/
├── frontend/                    # Next.js app
│   ├── app/
│   │   ├── dashboard/
│   │   ├── exam/
│   │   └── api/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── backend/                     # Python FastAPI
│   ├── api/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── core/
│   │   ├── ljk_manual_roi.py   # EXISTING CORE
│   │   └── answer_key_auto.py
│   ├── main.py
│   ├── config.py
│   └── requirements.txt
│
├── data/                        # Storage lokal
│   ├── exams/
│   ├── results/
│   ├── images/
│   │   ├── templates/
│   │   ├── uploads/
│   │   └── processed/
│   └── exports/
│
├── docker-compose.yml           # Optional: Docker setup
├── README.md
└── .env.example
```

---

## 🚀 Implementasi Step-by-Step

### Phase 1: Setup & Backend Core (Week 1)
1. ✅ Setup project structure
2. ✅ Install dependencies
3. ✅ Wrap `ljk_manual_roi.py` into FastAPI service
4. ✅ Create basic API endpoints (exam CRUD, upload, process)
5. ✅ Test LJK processing dengan Postman

### Phase 2: Frontend Basic (Week 2)
1. ✅ Setup Next.js 15 + TypeScript
2. ✅ Create dashboard layout
3. ✅ Create exam setup form
4. ✅ Create answer key grid component
5. ✅ Test frontend-backend integration

### Phase 3: Upload & Processing (Week 3)
1. ✅ Implement file upload dengan drag-drop
2. ✅ Create processing queue system
3. ✅ Display processing progress
4. ✅ Show individual results
5. ✅ Test dengan multiple files

### Phase 4: Results & Analytics (Week 4)
1. ✅ Create results table
2. ✅ Implement statistics calculation
3. ✅ Create charts & graphs
4. ✅ Add filtering & sorting
5. ✅ Test dengan real data

### Phase 5: Export & Polish (Week 5)
1. ✅ Implement Excel export
2. ✅ Add PDF export
3. ✅ Create print-friendly layouts
4. ✅ Add error handling & validation
5. ✅ User testing & bug fixes

### Phase 6: Deployment & Documentation (Week 6)
1. ✅ Create installation guide
2. ✅ Create user manual (Bahasa Indonesia)
3. ✅ Setup backup & restore system
4. ✅ Final testing dengan guru
5. ✅ Deploy to school server/laptop

---

## 💻 Cara Menjalankan

### Development Mode
```bash
# Terminal 1: Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Akses: `http://localhost:3000`

### Production Mode (Sekolah)
```bash
# Build frontend
cd frontend
npm run build
npm start

# Run backend dengan production server
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

---

## 🎓 Keunggulan Sistem Ini

1. **Akurat & Reliable**
   - Menggunakan core `ljk_manual_roi.py` yang sudah proven (83-100% accuracy)
   - Deteksi bubble kosong otomatis
   - Visual validation dengan gambar marked

2. **User-Friendly untuk Guru**
   - Interface intuitif, tidak perlu training teknis
   - Workflow yang natural (setup → upload → hasil)
   - Preview real-time

3. **Fleksibel & Skalabel**
   - Support 1-180 soal (bisa disesuaikan)
   - Batch processing (upload banyak sekaligus)
   - Custom scoring system

4. **Offline & Gratis**
   - Tidak perlu internet setelah install
   - Tidak ada biaya subscription
   - Data tersimpan lokal (privacy)

5. **Comprehensive Reports**
   - Individual student reports
   - Class statistics & analytics
   - Excel export for further analysis
   - Print-ready layouts

6. **Maintainable**
   - Clean code architecture
   - Well-documented
   - Easy to extend (tambah fitur baru)

---

## 🎯 Next Steps

**Prioritas 1 (Critical):**
- [ ] Setup project structure lengkap
- [ ] Integrate `ljk_manual_roi.py` ke FastAPI
- [ ] Create basic UI untuk testing

**Prioritas 2 (Important):**
- [ ] Implement upload & processing pipeline
- [ ] Create results display
- [ ] Add Excel export

**Prioritas 3 (Nice to Have):**
- [ ] Add charts & analytics
- [ ] PDF export
- [ ] Batch processing optimization
- [ ] Mobile responsive design

**Prioritas 4 (Future):**
- [ ] Multi-user system (admin/guru)
- [ ] Historical data analysis
- [ ] Auto backup system
- [ ] Custom LJK template support

---

## 📞 Support & Maintenance

**Training untuk Guru:**
- Video tutorial setup (10 menit)
- Manual penggunaan (Bahasa Indonesia)
- FAQ & troubleshooting guide
- WhatsApp support group

**Maintenance:**
- Monthly backup reminder
- Update & bug fix quarterly
- Feature request gathering

---

**Status:** 🟡 Ready for Development
**Last Updated:** Oktober 19, 2025
**Version:** 2.0 (Enhanced)

