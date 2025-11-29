'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { listExams, deleteExam, type Exam } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Search, X, ChevronLeft, ChevronRight, Trash2, Menu, Plus } from 'lucide-react';
import { SkeletonCard, SkeletonTableRow, SkeletonMobileCard } from '@/components/Skeleton';
import { ToastContainer, useToast, toast } from '@/components/Toast';

const ITEMS_PER_PAGE = 10;

export default function DashboardPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; exam: Exam | null }>({
    show: false,
    exam: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await listExams();
      setExams(data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique subjects and classes for filter dropdowns
  const uniqueSubjects = useMemo(() => {
    return [...new Set(exams.map(e => e.subject))].filter(Boolean).sort();
  }, [exams]);

  const uniqueClasses = useMemo(() => {
    return [...new Set(exams.map(e => e.class))].filter(Boolean).sort();
  }, [exams]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch = searchQuery === '' || 
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.class.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = filterSubject === '' || exam.subject === filterSubject;
      const matchesClass = filterClass === '' || exam.class === filterClass;

      return matchesSearch && matchesSubject && matchesClass;
    });
  }, [exams, searchQuery, filterSubject, filterClass]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const paginatedExams = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExams.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredExams, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSubject, filterClass]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterSubject('');
    setFilterClass('');
  };

  const hasActiveFilters = searchQuery || filterSubject || filterClass;

  // Delete handlers
  const handleDeleteClick = (exam: Exam) => {
    setDeleteModal({ show: true, exam });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.exam) return;
    
    setDeleting(true);
    try {
      await deleteExam(deleteModal.exam.exam_id);
      setExams(prev => prev.filter(e => e.exam_id !== deleteModal.exam!.exam_id));
      setDeleteModal({ show: false, exam: null });
    } catch (error) {
      console.error('Failed to delete exam:', error);
      alert('Gagal menghapus ujian');
    } finally {
      setDeleting(false);
    }
  };

  const totalStudents = exams.reduce((acc, exam) => acc + (exam.active_questions || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/Logo.jpg"
                alt="Logo"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  LJK Grading System
                </h1>
                <p className="text-sm text-gray-500">
                  SMPN 1 Darangdan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/exam/new"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Buat Ujian
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Ujian</p>
            <p className="text-2xl font-semibold text-gray-800">{exams.length}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Soal Aktif</p>
            <p className="text-2xl font-semibold text-gray-800">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="text-2xl font-semibold text-green-600">Online</p>
          </div>
        </div>

        {/* Exam List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Daftar Ujian</h2>
              <span className="text-sm text-gray-500">
                {filteredExams.length} dari {exams.length} ujian
              </span>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap gap-3">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari ujian..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Subject Filter */}
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                title="Filter berdasarkan mata pelajaran"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
              >
                <option value="">Semua Mapel</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>

              {/* Class Filter */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                title="Filter berdasarkan kelas"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
              >
                <option value="">Semua Kelas</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>

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

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-gray-500">Memuat...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-gray-800 font-medium mb-1">Belum ada ujian</h3>
              <p className="text-sm text-gray-500 mb-4">Buat ujian pertama Anda</p>
              <Link
                href="/exam/new"
                className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buat Ujian
              </Link>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-800 font-medium mb-1">Tidak ada hasil</h3>
              <p className="text-sm text-gray-500 mb-4">Coba ubah kata kunci atau filter pencarian</p>
              <button
                onClick={clearFilters}
                className="inline-block px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Ujian
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mata Pelajaran
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah Soal
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedExams.map((exam) => (
                      <tr key={exam.exam_id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <Link 
                            href={`/exam/${exam.exam_id}`}
                            className="text-gray-800 font-medium hover:text-blue-600"
                          >
                            {exam.title}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {exam.subject}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {exam.class}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {exam.active_questions} soal
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-sm">
                          {formatDate(exam.date)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/exam/${exam.exam_id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Detail
                            </Link>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleDeleteClick(exam)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Hapus
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
                    Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredExams.length)} dari {filteredExams.length}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                    ))}
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

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Link
            href="/exam/new"
            className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Buat Ujian Baru</h3>
                <p className="text-sm text-gray-500">Upload kunci jawaban dan mulai koreksi</p>
              </div>
            </div>
          </Link>

          <Link
            href="/help"
            className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Panduan</h3>
                <p className="text-sm text-gray-500">Cara menggunakan sistem</p>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 SMPN 1 Darangdan - LJK Grading System
          </p>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.exam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hapus Ujian</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              Apakah Anda yakin ingin menghapus ujian ini?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-medium text-gray-900">{deleteModal.exam.title}</p>
              <p className="text-sm text-gray-500">
                {deleteModal.exam.subject} • {deleteModal.exam.class} • {deleteModal.exam.active_questions} soal
              </p>
            </div>
            <p className="text-sm text-red-600 mb-6">
              ⚠️ Semua data hasil ujian juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, exam: null })}
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
