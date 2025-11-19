'use client';

import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  CheckCircle, 
  Users,
  BarChart3,
  Download,
  Settings,
  BookOpen,
  AlertCircle
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panduan Penggunaan</h1>
              <p className="text-sm text-gray-500">Sistem Pemeriksaan LJK Otomatis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-start space-x-4">
            <BookOpen className="w-12 h-12 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Selamat Datang!</h2>
              <p className="text-blue-100 leading-relaxed">
                Sistem LJK Grading menggunakan teknologi Computer Vision untuk memeriksa
                lembar jawaban siswa secara otomatis. Ikuti panduan berikut untuk memulai.
              </p>
            </div>
          </div>
        </div>

        {/* Step by Step Guide */}
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Buat Ujian Baru</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Klik tombol <strong>"Buat Ujian Baru"</strong> di halaman utama untuk membuat ujian.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-700"><strong>Isi informasi ujian:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Nama Ujian (contoh: UTS Matematika 8B)</li>
                    <li>Tanggal Ujian</li>
                    <li>Mata Pelajaran</li>
                    <li>Kelas</li>
                    <li>Jumlah Soal Aktif (1-60 soal)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Input Kunci Jawaban</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Masukkan kunci jawaban untuk setiap soal (A, B, C, D, atau E).
                </p>
                <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-700"><strong>Tips:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Pastikan kunci jawaban sesuai dengan jumlah soal aktif</li>
                    <li>Periksa kembali sebelum menyimpan</li>
                    <li>Sistem akan menampilkan grid untuk memudahkan input</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-green-600">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Upload className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Upload LJK Siswa</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Upload lembar jawaban siswa yang sudah di-scan dalam format PDF atau JPG.
                </p>
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Persyaratan File:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                      <li>Format: PDF atau JPG/JPEG</li>
                      <li>Ukuran maksimal: 10MB</li>
                      <li>Scan dengan kualitas baik (300 DPI)</li>
                      <li>LJK harus jelas dan tidak terlipat</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Cara Upload:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                      <li>Klik tombol "Upload LJK" di halaman ujian</li>
                      <li>Isi nama dan nomor induk siswa (opsional)</li>
                      <li>Drag & drop file atau klik untuk browse</li>
                      <li>Tunggu proses pemeriksaan otomatis selesai</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-orange-600">4</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                  <h3 className="text-xl font-bold text-gray-900">Lihat Hasil & Statistik</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Sistem akan otomatis menampilkan hasil pemeriksaan dengan visualisasi lengkap.
                </p>
                <div className="bg-orange-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-700"><strong>Informasi yang ditampilkan:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li><span className="text-green-600 font-semibold">Hijau</span>: Jawaban benar</li>
                    <li><span className="text-red-600 font-semibold">Merah</span>: Jawaban salah</li>
                    <li><span className="text-orange-600 font-semibold">Orange</span>: Tidak dijawab</li>
                    <li>Skor, persentase, dan predikat (A-E)</li>
                    <li>Gambar LJK dengan marking otomatis</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-pink-600">5</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Download className="w-6 h-6 text-pink-600" />
                  <h3 className="text-xl font-bold text-gray-900">Export Hasil ke Excel</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Download hasil ujian dalam format Excel untuk dokumentasi atau analisis lebih lanjut.
                </p>
                <div className="bg-pink-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-700"><strong>File Excel berisi:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Sheet Ringkasan: Info ujian dan statistik</li>
                    <li>Sheet Nilai Siswa: Daftar nilai semua siswa</li>
                    <li>Sheet Detail Per Soal: Jawaban siswa vs kunci</li>
                    <li>Sheet Analisis Soal: Tingkat kesulitan per soal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips & Important Notes */}
        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Settings className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">Tips Penggunaan</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>✓ Gunakan LJK template SMPN 1 Darangdan untuk hasil optimal</li>
                  <li>✓ Scan LJK dengan pencahayaan yang cukup dan tidak miring</li>
                  <li>✓ Pastikan bubble terisi dengan pensil 2B yang gelap</li>
                  <li>✓ Hindari lipatan atau noda pada area jawaban</li>
                  <li>✓ Upload file PDF untuk otomatis convert ke format yang sesuai</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-yellow-900 mb-2">Catatan Penting</h3>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li>• Sistem mendeteksi bubble dengan intensitas &lt; 150 sebagai terisi</li>
                  <li>• Hanya soal 1-60 yang dapat diproses (3 kolom × 20 soal)</li>
                  <li>• ROI (Region of Interest) sudah dikonfigurasi untuk template sekolah</li>
                  <li>• Hasil dapat dihapus dari halaman detail ujian jika diperlukan</li>
                  <li>• Data ujian tersimpan lokal dalam format JSON</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    </div>
  );
}
