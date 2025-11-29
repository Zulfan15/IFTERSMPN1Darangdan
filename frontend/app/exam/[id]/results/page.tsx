'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getExamResults, getExamStatistics, getExam, type Result, type Statistics, type Exam, api } from '@/lib/api';
import { formatDate, getGrade, getGradeLabel, downloadFile } from '@/lib/utils';
import { ArrowLeft, Download, TrendingUp, TrendingDown, AlertTriangle, Image as ImageIcon, X, Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const ITEMS_PER_PAGE = 15;

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

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterScoreMin, setFilterScoreMin] = useState('');
  const [filterScoreMax, setFilterScoreMax] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; result: Result | null }>({
    show: false,
    result: null,
  });
  const [deleting, setDeleting] = useState(false);

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

  // Filtered and sorted results
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const studentName = result.student_name || result.student_number || '';
      const matchesSearch = searchQuery === '' || 
        studentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const grade = getGrade(result.score?.percentage || 0);
      const matchesGrade = filterGrade === '' || grade === filterGrade;

      const percentage = result.score?.percentage || 0;
      const matchesMinScore = filterScoreMin === '' || percentage >= parseFloat(filterScoreMin);
      const matchesMaxScore = filterScoreMax === '' || percentage <= parseFloat(filterScoreMax);

      return matchesSearch && matchesGrade && matchesMinScore && matchesMaxScore;
    });
  }, [results, searchQuery, filterGrade, filterScoreMin, filterScoreMax]);

  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
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
  }, [filteredResults, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedResults.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedResults, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterGrade, filterScoreMin, filterScoreMax]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterGrade('');
    setFilterScoreMin('');
    setFilterScoreMax('');
  };

  const hasActiveFilters = searchQuery || filterGrade || filterScoreMin || filterScoreMax;

  // Delete handlers
  const handleDeleteClick = (result: Result) => {
    setDeleteModal({ show: true, result });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.result) return;
    
    setDeleting(true);
    try {
      await api.delete(`/api/results/${deleteModal.result.result_id}`);
      setResults(prev => prev.filter(r => r.result_id !== deleteModal.result!.result_id));
      setDeleteModal({ show: false, result: null });
      // Reload statistics
      const statsData = await getExamStatistics(examId);
      setStatistics(statsData);
    } catch (error) {
      console.error('Failed to delete result:', error);
      alert('Gagal menghapus hasil');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat hasil...</p>
        </div>
      </div>
    );
  }

  if (!exam || results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={`/exam/${examId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </Link>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/exam/${examId}`}
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
                  <h1 className="text-xl font-bold text-gray-900">
                    Hasil: {exam.title}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {formatDate(exam.date)} • {exam.subject} • {exam.class}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rata-rata</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(statistics.average_score ?? 0).toFixed(1)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                dari 100
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Tertinggi</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {(statistics.highest_score ?? 0).toFixed(0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Maksimal
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Terendah</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {(statistics.lowest_score ?? 0).toFixed(0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <TrendingDown className="w-3 h-3 inline mr-1" />
                Minimal
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Kelulusan</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {(statistics.passing_rate ?? 0).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round((statistics.passing_rate ?? 0) * results.length / 100)} dari {results.length} siswa
              </p>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Daftar Nilai ({filteredResults.length} dari {results.length} siswa)
              </h2>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  title="Urutkan berdasarkan"
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'score')}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="score">Nilai</option>
                  <option value="name">Nama</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title="Ubah urutan"
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap gap-3">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Grade Filter */}
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                title="Filter berdasarkan nilai"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Nilai</option>
                <option value="A">A (90-100)</option>
                <option value="B">B (80-89)</option>
                <option value="C">C (70-79)</option>
                <option value="D">D (60-69)</option>
                <option value="E">E (&lt;60)</option>
              </select>

              {/* Score Range */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filterScoreMin}
                  onChange={(e) => setFilterScoreMin(e.target.value)}
                  min="0"
                  max="100"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filterScoreMax}
                  onChange={(e) => setFilterScoreMax(e.target.value)}
                  min="0"
                  max="100"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-800 font-medium mb-1">Tidak ada hasil</h3>
              <p className="text-sm text-gray-500 mb-4">Coba ubah filter pencarian</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nama Siswa
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Benar
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Salah
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Kosong
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Skor
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Nilai
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedResults.map((result, index) => (
                      <tr key={result.result_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {result.student_name || result.student_number || 'Tanpa Nama'}
                          </div>
                          {result.student_number && result.student_name && (
                            <div className="text-xs text-gray-500">
                              {result.student_number}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                            {result.score.correct}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            {result.score.wrong}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {result.score.unanswered}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                          {result.score?.total_points?.toFixed(1) || '0.0'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-base font-bold text-gray-900">
                            {getGrade(result.score?.percentage || 0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.score?.percentage?.toFixed(0) || '0'}%
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedImage({
                                original: `http://localhost:8000${result.image_path}`,
                                processed: `http://localhost:8000${result.processed_image_path}`,
                                student: result.student_name || result.student_number || 'Tanpa Nama'
                              })}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                              title="Lihat LJK"
                            >
                              <ImageIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(result)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                              title="Hapus hasil"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedResults.length)} dari {sortedResults.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Halaman sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Halaman berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Question Analysis */}
        {statistics && statistics.question_analysis && statistics.question_analysis.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">
              Analisis Per Soal
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {statistics.question_analysis.slice(0, 12).map((qa) => (
                <div
                  key={qa.question_number}
                  className={`p-3 rounded-lg border ${
                    qa.difficulty === 'Sulit'
                      ? 'border-red-200 bg-red-50'
                      : qa.difficulty === 'Sedang'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">
                      Soal {qa.question_number + 1}
                    </span>
                    {qa.difficulty === 'Sulit' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Kunci: <span className="font-medium">
                      {['A', 'B', 'C', 'D', 'E'][qa.correct_answer]}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-green-600">Benar:</span>
                      <span className="font-medium">{qa.correct_count || 0} ({qa.correct_percentage?.toFixed(0) || '0'}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Salah:</span>
                      <span className="font-medium">{qa.wrong_count || 0}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
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
            className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">
                LJK: {selectedImage.student}
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                title="Tutup"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Images */}
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Keterangan:</span><br />
                    <span className="text-green-600">Hijau</span> = Benar • 
                    <span className="text-red-600"> Merah</span> = Salah • 
                    <span className="text-orange-600"> Orange</span> = Kosong
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hapus Hasil</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              Apakah Anda yakin ingin menghapus hasil ujian ini?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-medium text-gray-900">
                {deleteModal.result.student_name || deleteModal.result.student_number || 'Tanpa Nama'}
              </p>
              <p className="text-sm text-gray-500">
                Nilai: {deleteModal.result.score?.percentage?.toFixed(0) || 0}% • 
                Benar: {deleteModal.result.score.correct} • 
                Salah: {deleteModal.result.score.wrong}
              </p>
            </div>
            <p className="text-sm text-red-600 mb-6">
              ⚠️ Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, result: null })}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
