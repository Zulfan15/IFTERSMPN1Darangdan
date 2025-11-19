# 🎓 Sistem Pemeriksaan LJK Otomatis

Sistem berbasis web untuk memeriksa Lembar Jawaban Komputer (LJK) secara otomatis menggunakan Computer Vision.

## 📋 Fitur Utama

- ✅ **Setup Ujian Fleksibel** - Atur jumlah soal aktif (1-180)
- 🔑 **Input Kunci Jawaban** - Interface grid A-E yang mudah
- 📤 **Upload & Batch Processing** - Upload banyak LJK sekaligus
- 📄 **Support File PDF** - Upload PDF hasil scan mesin scanner
- 🎯 **Akurasi Tinggi** - Deteksi bubble dengan OpenCV (100% untuk soal dijawab)
- 📊 **Statistik Lengkap** - Analisis per siswa dan per soal
- 📥 **Export Excel** - Multiple sheets dengan formatting lengkap
- 💾 **Offline & Lokal** - Tidak perlu internet, data tersimpan lokal

## 🛠️ Teknologi

**Frontend:**
- Next.js 15
- TypeScript
- Tailwind CSS
- React Hook Form
- Zustand (State Management)
- Recharts (Charts)

**Backend:**
- Python 3.11
- FastAPI
- OpenCV
- PyMuPDF (PDF processing)
- Scikit-learn
- Pandas & OpenPyXL

## 📦 Instalasi

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm atau yarn

### 1. Clone & Setup

```bash
cd ljk-grading-system
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# atau dengan yarn
yarn install
```

## 🚀 Menjalankan Aplikasi

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

python main.py
# atau
uvicorn main:app --reload --port 8000
```

Backend akan berjalan di: `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend

npm run dev
# atau
yarn dev
```

Frontend akan berjalan di: `http://localhost:3000`

### Production Mode

**Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 📖 Panduan Penggunaan

### 1. Setup Template (Pertama Kali)

**Template sudah dikonfigurasi!** File `Ljk_contoh.jpg` dan `roi_config.json` sudah di-copy ke `data/images/templates/`.

Untuk mengecek status:
- Buka: `http://localhost:8000/api/template/status`
- Seharusnya menunjukkan `"roi_configured": true`

### 2. Buat Ujian Baru

1. Buka `http://localhost:3000`
2. Klik **"Buat Ujian Baru"**
3. Isi informasi:
   - Nama Ujian (contoh: "UTS Matematika Kelas 9A")
   - Tanggal
   - Mata Pelajaran
   - Kelas
   - Jumlah Soal Aktif (1-180)
4. Input kunci jawaban:
   - Klik tombol A-E untuk setiap soal
   - Tombol yang dipilih akan berwarna hijau
5. Klik **"Simpan & Lanjutkan"**

### 3. Upload & Proses LJK

1. Pada halaman ujian, klik **"Upload LJK"**
2. Drag & drop file atau klik untuk browse
3. Format yang didukung: JPG, PNG, PDF
4. Untuk batch: Upload banyak file sekaligus
5. Sistem akan memproses otomatis
6. Lihat progress real-time

### 4. Lihat Hasil

1. Setelah proses selesai, klik nama siswa untuk detail
2. Lihat:
   - Gambar LJK dengan marking (Hijau=Benar, Merah=Salah, Oranye=Kosong)
   - Tabel detail per soal
   - Skor dan persentase
3. Kembali ke halaman ujian untuk melihat statistik kelas

### 5. Export Excel

1. Di halaman hasil ujian, klik **"Export Excel"**
2. File akan di-download dengan 4 sheets:
   - **Ringkasan**: Info ujian & statistik
   - **Nilai Siswa**: Tabel nilai semua siswa
   - **Detail Per Soal**: Pivot table jawaban
   - **Analisis Soal**: Tingkat kesulitan per soal

## 📁 Struktur Project

```
ljk-grading-system/
├── backend/                  # Python FastAPI
│   ├── core/                 # Core processing (ljk_manual_roi.py)
│   ├── main.py               # FastAPI app
│   ├── config.py             # Configuration
│   ├── models.py             # Pydantic models
│   ├── storage.py            # JSON storage service
│   ├── ljk_processor.py      # LJK processing wrapper
│   ├── export_service.py     # Excel export
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Next.js 15
│   ├── app/                  # App router
│   │   ├── page.tsx          # Dashboard
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── exam/             # Exam pages
│   │   └── api/              # API routes (proxy)
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   └── package.json          # Node dependencies
│
└── data/                     # Storage lokal
    ├── exams/                # Exam configs (JSON)
    ├── results/              # Results (JSON)
    ├── images/
    │   ├── templates/        # Ljk_contoh.jpg, roi_config.json
    │   ├── uploads/          # Uploaded LJK
    │   └── processed/        # Marked images
    └── exports/              # Excel exports
```

## 🔧 Troubleshooting

### Backend tidak bisa start

**Error: Module not found**
```bash
# Pastikan virtual environment aktif
venv\Scripts\activate

# Install ulang dependencies
pip install -r requirements.txt
```

**Error: ROI not configured**
```bash
# Copy template dan config
copy ..\BubbleSheetGrader-master\images\Ljk_contoh.jpg data\images\templates\
copy ..\BubbleSheetGrader-master\roii_config.json data\images\templates\roi_config.json
```

### Frontend tidak bisa start

**Error: Dependencies not installed**
```bash
cd frontend
npm install
```

**Error: Port 3000 already in use**
```bash
# Gunakan port lain
npm run dev -- -p 3001
```

### Processing Error

**Error: Bubble detection failed**
- Pastikan gambar LJK jelas dan tidak blur
- Pastikan ROI config sesuai dengan template
- Cek pencahayaan gambar (tidak terlalu gelap/terang)

**Error: Wrong answers detected**
- Cek threshold di `backend/config.py` (`FILLED_THRESHOLD = 200`)
- Nilai lebih tinggi (210-220) = lebih sensitif
- Nilai lebih rendah (180-190) = lebih ketat

## 📊 API Endpoints

### Exams
- `POST /api/exams` - Create exam
- `GET /api/exams` - List all exams
- `GET /api/exams/{exam_id}` - Get exam detail
- `DELETE /api/exams/{exam_id}` - Delete exam

### Processing
- `POST /api/process-ljk` - Upload & process LJK

### Results
- `GET /api/results/{result_id}` - Get result detail
- `GET /api/exams/{exam_id}/results` - List exam results
- `GET /api/exams/{exam_id}/statistics` - Get statistics

### Export
- `GET /api/exams/{exam_id}/export/excel` - Export to Excel

### Template
- `GET /api/template/status` - Check template status

## 🎯 Next Development

**Phase 2 Features:**
- [ ] Multi-user authentication
- [ ] Student management
- [ ] Historical data analysis
- [ ] Mobile responsive design
- [ ] PDF export
- [ ] Auto backup system

**Phase 3 Features:**
- [ ] Custom template support
- [ ] AI-based bubble detection improvement
- [ ] Real-time processing monitoring
- [ ] Email notification
- [ ] Cloud backup option

## 📞 Support

Untuk bantuan atau pertanyaan:
- Email: support@example.com
- WhatsApp Group: (link)

## 📄 License

MIT License - Free for educational use

---

**Version:** 1.0.0  
**Last Updated:** Oktober 19, 2025  
**Status:** ✅ Production Ready
