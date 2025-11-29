'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getExam, getExamResults, deleteExam, type Exam, type Result } from '@/lib/api';
import { formatDate, getGrade } from '@/lib/utils';
import { ArrowLeft, Upload, Users, FileText, Download, Trash2, Calendar, BookOpen, Pencil } from 'lucide-react';

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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
                  <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(exam.date)}</span>
                    <span className="text-gray-300">•</span>
                    <span>{exam.subject}</span>
                    <span className="text-gray-300">•</span>
                    <span>{exam.class}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/exam/${examId}/edit`}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Jumlah Soal</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {exam.active_questions}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Siswa</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {results.length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Rata-rata</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {averageScore.toFixed(1)}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  ✓ Aktif
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href={`/exam/${examId}/upload`}
            className="bg-white border-2 border-blue-200 rounded-lg p-5 hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Upload LJK</h3>
                <p className="text-sm text-gray-500">
                  Upload lembar jawaban siswa
                </p>
              </div>
            </div>
          </Link>

          <Link
            href={`/exam/${examId}/results`}
            className="bg-white border-2 border-green-200 rounded-lg p-5 hover:border-green-400 hover:bg-green-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lihat Hasil</h3>
                <p className="text-sm text-gray-500">
                  Lihat hasil dan statistik ujian
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => {
              window.open(`http://localhost:8000/api/exams/${examId}/export/excel`, '_blank');
            }}
            className="bg-white border-2 border-purple-200 rounded-lg p-5 hover:border-purple-400 hover:bg-purple-50 transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Export Excel</h3>
                <p className="text-sm text-gray-500">
                  Download hasil dalam Excel
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Hasil Terbaru ({results.length} siswa)
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {results.slice(0, 10).map((result) => (
                <Link
                  key={result.result_id}
                  href={`/exam/${examId}/results/${result.result_id}`}
                  className="block px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {result.student_name || result.student_number || 'Siswa Tanpa Nama'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Benar: {result.score.correct} • Salah: {result.score.wrong} • Kosong: {result.score.unanswered}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {result.score.percentage.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Nilai {getGrade(result.score.percentage)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {results.length > 10 && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
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
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">
              Belum Ada Hasil
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Upload LJK siswa untuk mulai pemeriksaan otomatis
            </p>
            <Link
              href={`/exam/${examId}/upload`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload LJK Sekarang
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
