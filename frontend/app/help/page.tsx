'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  CheckCircle, 
  BarChart3,
  Download,
  BookOpen,
  AlertCircle
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <Image
                src="/Logo.jpg"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panduan Penggunaan</h1>
                <p className="text-sm text-gray-500">Sistem Pemeriksaan LJK Otomatis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-blue-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2">Selamat Datang!</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Sistem LJK Grading menggunakan teknologi Computer Vision untuk memeriksa
                lembar jawaban siswa secara otomatis. Ikuti panduan berikut untuk memulai.
              </p>
            </div>
          </div>
        </div>

        {/* Step by Step Guide */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Buat Ujian Baru</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Klik tombol "Buat Ujian Baru" di halaman utama untuk membuat ujian.
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Isi informasi ujian:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-2">
                    <li>Nama Ujian (contoh: UTS Matematika 8B)</li>
                    <li>Tanggal Ujian</li>
                    <li>Mata Pelajaran & Kelas</li>
                    <li>Jumlah Soal Aktif (1-60 soal)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Input Kunci Jawaban</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Masukkan kunci jawaban untuk setiap soal (A, B, C, D, atau E).
                </p>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-2">
                    <li>Pastikan kunci jawaban sesuai dengan jumlah soal aktif</li>
                    <li>Periksa kembali sebelum menyimpan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Upload LJK Siswa</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Upload lembar jawaban siswa yang sudah di-scan dalam format PDF atau JPG.
                </p>
                <div className="bg-green-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Persyaratan File:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-2">
                      <li>Format: PDF atau JPG/JPEG</li>
                      <li>Ukuran maksimal: 10MB</li>
                      <li>Scan dengan kualitas baik (300 DPI)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-orange-600">4</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">Lihat Hasil & Statistik</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Sistem akan otomatis menampilkan hasil pemeriksaan dengan visualisasi lengkap.
                </p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Informasi yang ditampilkan:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-2">
                    <li><span className="text-green-600 font-medium">Hijau</span>: Jawaban benar</li>
                    <li><span className="text-red-600 font-medium">Merah</span>: Jawaban salah</li>
                    <li><span className="text-orange-600 font-medium">Orange</span>: Tidak dijawab</li>
                    <li>Skor, persentase, dan predikat (A-E)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-pink-600">5</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-5 h-5 text-pink-600" />
                  <h3 className="font-semibold text-gray-900">Export Hasil ke Excel</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Download hasil ujian dalam format Excel untuk dokumentasi.
                </p>
                <div className="bg-pink-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">File Excel berisi:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-2">
                    <li>Ringkasan: Info ujian dan statistik</li>
                    <li>Nilai Siswa: Daftar nilai semua siswa</li>
                    <li>Analisis Soal: Tingkat kesulitan per soal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips & Important Notes */}
        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Tips Penggunaan</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Gunakan LJK template SMPN 1 Darangdan untuk hasil optimal</li>
                  <li>• Scan LJK dengan pencahayaan cukup dan tidak miring</li>
                  <li>• Pastikan bubble terisi dengan pensil 2B yang gelap</li>
                  <li>• Hindari lipatan atau noda pada area jawaban</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Catatan Penting</h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li>• Sistem mendeteksi bubble dengan intensitas &lt; 150 sebagai terisi</li>
                  <li>• Hanya soal 1-60 yang dapat diproses (3 kolom × 20 soal)</li>
                  <li>• ROI sudah dikonfigurasi untuk template sekolah</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    </div>
  );
}
