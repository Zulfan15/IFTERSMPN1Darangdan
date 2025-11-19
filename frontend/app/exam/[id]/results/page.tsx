'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getExamResults, getExamStatistics, getExam, type Result, type Statistics, type Exam } from '@/lib/api';
import { formatDate, getGrade, getGradeLabel, downloadFile } from '@/lib/utils';
import { ArrowLeft, Download, TrendingUp, TrendingDown, AlertTriangle, Image as ImageIcon, X } from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'score'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedImage, setSelectedImage] = useState<{ original: string; processed: string; student: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [examId]);

  const loadData = async () => {
    try {
      const [examData, resultsData, statsData] = await Promise.all([
        getExam(examId),
        getExamResults(examId),
        getExamStatistics(examId),
      ]);
      setExam(examData);
      setResults(resultsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/exams/${examId}/export/excel`);
      const blob = await response.blob();
      downloadFile(blob, `hasil_${exam?.title || examId}.xlsx`);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Gagal export Excel');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'score') {
      return sortOrder === 'desc'
        ? b.score.percentage - a.score.percentage
        : a.score.percentage - b.score.percentage;
    } else {
      const nameA = a.student_name || a.student_number || '';
      const nameB = b.student_name || b.student_number || '';
      return sortOrder === 'desc'
        ? nameB.localeCompare(nameA)
        : nameA.localeCompare(nameB);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat hasil...</p>
        </div>
      </div>
    );
  }

  if (!exam || results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={`/exam/${examId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xl text-gray-600">Belum ada hasil untuk ujian ini</p>
          <Link
            href={`/exam/${examId}/upload`}
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Upload LJK →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/exam/${examId}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Hasil Ujian: {exam.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {formatDate(exam.date)} • {exam.subject} • {exam.class}
                </p>
              </div>
            </div>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-500">Rata-rata Kelas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {(statistics.average_score ?? 0).toFixed(1)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                dari 100
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-500">Nilai Tertinggi</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {(statistics.highest_score ?? 0).toFixed(0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Maksimal
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-500">Nilai Terendah</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {(statistics.lowest_score ?? 0).toFixed(0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <TrendingDown className="w-3 h-3 inline mr-1" />
                Minimal
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-500">Tingkat Kelulusan</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {(statistics.passing_rate ?? 0).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round((statistics.passing_rate ?? 0) * results.length / 100)} dari {results.length} siswa
              </p>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Daftar Nilai Siswa ({results.length} siswa)
            </h2>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'score')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="score">Urutkan: Nilai</option>
                <option value="name">Urutkan: Nama</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama Siswa
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Benar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Salah
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Kosong
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Skor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Nilai
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedResults.map((result, index) => (
                  <tr key={result.result_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {result.student_name || result.student_number || 'Tanpa Nama'}
                      </div>
                      {result.student_number && result.student_name && (
                        <div className="text-xs text-gray-500">
                          {result.student_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        {result.score.correct}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        {result.score.wrong}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {result.score.unanswered}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {result.score?.total_points?.toFixed(1) || '0.0'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {getGrade(result.score?.percentage || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.score?.percentage?.toFixed(0) || '0'}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedImage({
                          original: `http://localhost:8000${result.image_path}`,
                          processed: `http://localhost:8000${result.processed_image_path}`,
                          student: result.student_name || result.student_number || 'Tanpa Nama'
                        })}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Lihat LJK
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Question Analysis */}
        {statistics && statistics.question_analysis && statistics.question_analysis.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Analisis Per Soal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.question_analysis.slice(0, 12).map((qa) => (
                <div
                  key={qa.question_number}
                  className={`p-4 rounded-lg border-2 ${
                    qa.difficulty === 'Sulit'
                      ? 'border-red-200 bg-red-50'
                      : qa.difficulty === 'Sedang'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      Soal {qa.question_number + 1}
                    </span>
                    {qa.difficulty === 'Sulit' && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Kunci: <span className="font-medium">
                      {['A', 'B', 'C', 'D', 'E'][qa.correct_answer]}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-green-600">✓ Benar:</span>
                      <span className="font-medium">{qa.correct_count || 0} ({qa.correct_percentage?.toFixed(0) || '0'}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">✗ Salah:</span>
                      <span className="font-medium">{qa.wrong_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">○ Kosong:</span>
                      <span className="font-medium">{qa.empty_count || 0}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <span className={`text-xs font-medium ${
                      qa.difficulty === 'Sulit'
                        ? 'text-red-600'
                        : qa.difficulty === 'Sedang'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {qa.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                LJK: {selectedImage.student}
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Images */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Gambar Asli</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage.original}
                    alt="Original LJK"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Processed Image */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Hasil Scanning</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage.processed}
                    alt="Processed LJK"
                    className="w-full h-auto"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">Keterangan:</span><br />
                    🟢 <span className="text-green-600 font-medium">Hijau</span> = Jawaban Benar<br />
                    🔴 <span className="text-red-600 font-medium">Merah</span> = Jawaban Salah<br />
                    🟠 <span className="text-orange-600 font-medium">Orange</span> = Tidak Dijawab
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
