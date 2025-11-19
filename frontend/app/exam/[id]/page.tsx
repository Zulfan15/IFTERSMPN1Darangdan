'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getExam, getExamResults, deleteExam, type Exam, type Result } from '@/lib/api';
import { formatDate, getGrade } from '@/lib/utils';
import { ArrowLeft, Upload, Users, FileText, Download, Trash2, Calendar, BookOpen } from 'lucide-react';

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [examId]);

  const loadData = async () => {
    try {
      const [examData, resultsData] = await Promise.all([
        getExam(examId),
        getExamResults(examId),
      ]);
      setExam(examData);
      setResults(resultsData);
    } catch (error) {
      console.error('Failed to load exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus ujian ini? Semua hasil akan terhapus.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteExam(examId);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete exam:', error);
      alert('Gagal menghapus ujian');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Ujian tidak ditemukan</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const averageScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.score.percentage, 0) / results.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(exam.date)}
                  </span>
                  <span>•</span>
                  <span>{exam.subject}</span>
                  <span>•</span>
                  <span>{exam.class}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Menghapus...' : 'Hapus Ujian'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Jumlah Soal</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {exam.active_questions}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Siswa Dikerjakan</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {results.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rata-rata</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {averageScore.toFixed(1)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ✓ Aktif
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href={`/exam/${examId}/upload`}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all"
          >
            <Upload className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-2">Upload LJK</h3>
            <p className="text-blue-100 text-sm">
              Upload dan proses lembar jawaban siswa
            </p>
          </Link>

          <Link
            href={`/exam/${examId}/results`}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all"
          >
            <FileText className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-2">Lihat Hasil</h3>
            <p className="text-green-100 text-sm">
              Lihat hasil dan statistik ujian
            </p>
          </Link>

          <button
            onClick={() => {
              window.open(`http://localhost:8000/api/exams/${examId}/export/excel`, '_blank');
            }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all text-left"
          >
            <Download className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-2">Export Excel</h3>
            <p className="text-purple-100 text-sm">
              Download hasil dalam format Excel
            </p>
          </button>
        </div>

        {/* Recent Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Hasil Terbaru ({results.length} siswa)
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {results.slice(0, 10).map((result) => (
                <Link
                  key={result.result_id}
                  href={`/exam/${examId}/results/${result.result_id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {result.student_name || result.student_number || 'Siswa Tanpa Nama'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Benar: {result.score.correct} • Salah: {result.score.wrong} • Kosong: {result.score.unanswered}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {result.score.percentage.toFixed(0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Nilai {getGrade(result.score.percentage)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {results.length > 10 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <Link
                  href={`/exam/${examId}/results`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Lihat Semua Hasil →
                </Link>
              </div>
            )}
          </div>
        )}

        {results.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum Ada Hasil
            </h3>
            <p className="text-gray-500 mb-6">
              Upload LJK siswa untuk mulai pemeriksaan otomatis
            </p>
            <Link
              href={`/exam/${examId}/upload`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload LJK Sekarang
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
