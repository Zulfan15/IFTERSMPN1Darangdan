'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createExam } from '@/lib/api';
import AnswerKeyGrid from '@/components/AnswerKeyGrid';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
                <h1 className="text-xl font-bold text-gray-900">Buat Ujian Baru</h1>
                <p className="text-sm text-gray-500">
                  Langkah {step} dari 2 - {step === 1 ? 'Informasi Ujian' : 'Input Kunci Jawaban'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step >= 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > 1 ? '✓' : '1'}
              </div>
              <span className={`ml-2 font-medium text-sm ${
                step >= 1 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Informasi Ujian
              </span>
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded">
              <div
                className={`h-full rounded transition-all ${
                  step >= 2 ? 'bg-blue-600 w-full' : 'w-0'
                }`}
              />
            </div>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step >= 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
              <span className={`ml-2 font-medium text-sm ${
                step >= 2 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Kunci Jawaban
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Step 1: Exam Information */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Informasi Ujian
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Ujian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Contoh: UTS Matematika Kelas 9A"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Ujian <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    title="Pilih tanggal ujian"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Contoh: Matematika"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    placeholder="Contoh: 9A"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Soal Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="active_questions"
                    value={formData.active_questions}
                    onChange={handleInputChange}
                    min="1"
                    max="180"
                    title="Jumlah soal aktif"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                Lanjut ke Kunci Jawaban
                <span>→</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Answer Key */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <AnswerKeyGrid
              totalQuestions={formData.active_questions}
              answerKey={answerKey}
              onChange={setAnswerKey}
            />

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                disabled={loading}
              >
                <span>←</span>
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || Object.keys(answerKey).length !== formData.active_questions}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
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
