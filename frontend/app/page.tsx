'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listExams, type Exam } from '@/lib/api';
import { formatDate, getGrade } from '@/lib/utils';
import { BookOpen, Plus, Users, TrendingUp, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

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

  const recentExams = exams.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard Pemeriksaan LJK
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  🏫 Sistem Pemeriksaan Otomatis - SMPN 1 Darangdan
                </p>
              </div>
            </div>
            <Link
              href="/exam/new"
              className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Buat Ujian Baru
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Ujian</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mt-2">
                  {exams.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ujian tersedia</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Siswa</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mt-2">
                  {exams.reduce((acc, exam) => acc + (exam.active_questions || 0), 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">LJK diproses</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status Sistem</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mt-2">
                  ✓ Aktif
                </p>
                <p className="text-xs text-gray-500 mt-1">Siap digunakan</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Exams */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📚 Ujian Terbaru
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Memuat data...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Belum Ada Ujian
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Mulai dengan membuat ujian baru untuk sistem pemeriksaan LJK otomatis
              </p>
              <Link
                href="/exam/new"
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Buat Ujian Pertama
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentExams.map((exam, index) => (
                <Link
                  key={exam.exam_id}
                  href={`/exam/${exam.exam_id}`}
                  className="group block px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {exam.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center bg-white px-2 py-1 rounded-lg shadow-sm">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                            {formatDate(exam.date)}
                          </span>
                          <span className="flex items-center bg-white px-2 py-1 rounded-lg shadow-sm">
                            <span className="text-purple-500 mr-1.5">📘</span>
                            {exam.subject}
                          </span>
                          <span className="flex items-center bg-white px-2 py-1 rounded-lg shadow-sm">
                            <span className="text-green-500 mr-1.5">🎓</span>
                            {exam.class}
                          </span>
                          <span className="flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-lg shadow-sm font-medium">
                            <span className="mr-1.5">📝</span>
                            {exam.active_questions} soal
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        ✓ Siap
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {exams.length > 5 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Link
                href="/exams"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Lihat Semua Ujian →
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-8 text-white overflow-hidden hover:shadow-3xl hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Mulai Pemeriksaan</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Buat ujian baru dan upload LJK untuk pemeriksaan otomatis dengan teknologi Computer Vision
              </p>
              <Link
                href="/exam/new"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl group-hover:scale-105"
              >
                Buat Ujian Baru →
              </Link>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-8 text-white overflow-hidden hover:shadow-3xl hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Panduan Penggunaan</h3>
              <p className="text-purple-100 mb-6 leading-relaxed">
                Pelajari cara menggunakan sistem pemeriksaan LJK otomatis dengan mudah dan cepat
              </p>
              <a
                href="/help"
                className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl group-hover:scale-105"
              >
                Lihat Panduan →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
