'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createExam } from '@/lib/api';
import AnswerKeyGrid from '@/components/AnswerKeyGrid';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function NewExamPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    class: '',
    active_questions: 50,
  });

  const [answerKey, setAnswerKey] = useState<Record<number, number>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'active_questions' ? parseInt(value) || 0 : value,
    }));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || !formData.class) {
      setError('Mohon isi semua field yang diperlukan');
      return;
    }

    if (formData.active_questions < 1 || formData.active_questions > 180) {
      setError('Jumlah soal harus antara 1-180');
      return;
    }

    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (Object.keys(answerKey).length !== formData.active_questions) {
      setError(`Mohon isi semua ${formData.active_questions} kunci jawaban`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const exam = await createExam({
        ...formData,
        answer_key: answerKey,
      });

      router.push(`/exam/${exam.exam_id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal membuat ujian');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="group p-3 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ✨ Buat Ujian Baru
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Langkah {step} dari 2 • {step === 1 ? 'Informasi Ujian' : 'Input Kunci Jawaban'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 ${
                  step >= 1
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > 1 ? '✓' : '1'}
              </div>
              <span className={`ml-3 font-semibold transition-colors ${
                step >= 1 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Informasi Ujian
              </span>
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  step >= 2 ? 'bg-gradient-to-r from-blue-600 to-purple-600 w-full' : 'w-0'
                }`}
              />
            </div>
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 ${
                  step >= 2
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
              <span className={`ml-3 font-semibold transition-colors ${
                step >= 2 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Kunci Jawaban
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl shadow-lg animate-fadeInUp">
            <p className="text-sm text-red-800 font-medium flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Step 1: Exam Information */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/50 animate-fadeInUp">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Informasi Ujian
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Nama Ujian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Contoh: UTS Matematika Kelas 9A"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Ujian <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Contoh: Matematika"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    placeholder="Contoh: 9A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Soal Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="active_questions"
                    value={formData.active_questions}
                    onChange={handleInputChange}
                    min="1"
                    max="180"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Maksimal 180 soal
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 font-semibold text-lg"
              >
                Lanjut ke Kunci Jawaban
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Answer Key */}
        {step === 2 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/50 animate-fadeInUp">
            <AnswerKeyGrid
              totalQuestions={formData.active_questions}
              answerKey={answerKey}
              onChange={setAnswerKey}
            />

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="group px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                disabled={loading}
              >
                <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span>
                <span className="ml-2">Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || Object.keys(answerKey).length !== formData.active_questions}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold flex items-center gap-2 hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Simpan & Lanjutkan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
