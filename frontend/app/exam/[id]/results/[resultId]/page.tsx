'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  MinusCircle,
  Download,
  Printer
} from 'lucide-react';

interface Score {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  percentage: number;
}

interface AnswerDetail {
  question_num: number;
  answer_key: string;
  student_answer: string;
  is_correct: boolean;
  points: number;
}

interface Result {
  result_id: string;
  exam_id: string;
  student_name?: string;
  student_number?: string;
  answers: { [key: string]: number };
  unanswered: number[];
  score: Score;
  details: AnswerDetail[];
  image_path: string;
  processed_image_path: string;
  processed_at: string;
}

interface Exam {
  exam_id: string;
  title: string;
  date: string;
  subject: string;
  class: string;
  active_questions: number;
}

export default function ResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const resultId = params.resultId as string;

  const [result, setResult] = useState<Result | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<'original' | 'processed'>('processed');
  const [imageError, setImageError] = useState({ original: false, processed: false });

  useEffect(() => {
    if (examId && resultId) {
      fetchData();
    }
  }, [examId, resultId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch exam details
      const examRes = await fetch(`http://localhost:8000/api/exams/${examId}`);
      if (examRes.ok) {
        const examData = await examRes.json();
        setExam(examData);
      }

      // Fetch all results to find this specific one
      const resultsRes = await fetch(`http://localhost:8000/api/exams/${examId}/results`);
      if (resultsRes.ok) {
        const results = await resultsRes.json();
        const foundResult = results.find((r: Result) => r.result_id === resultId);
        if (foundResult) {
          setResult(foundResult);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'E';
  };

  const openImageModal = (imageType: 'original' | 'processed') => {
    setCurrentImage(imageType);
    setImageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail hasil...</p>
        </div>
      </div>
    );
  }

  if (!result || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hasil Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Hasil ujian yang Anda cari tidak ditemukan.</p>
          <Link
            href={`/exam/${examId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Ujian
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/exam/${examId}/results`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {result.student_name || result.student_number || 'Siswa'}
                </h1>
                <p className="text-sm text-gray-500">
                  {exam.title} • {exam.subject}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Nilai</span>
              <span className={`text-xl font-bold ${
                result.score.percentage >= 75 ? 'text-green-600' : 
                result.score.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getGrade(result.score.percentage)}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {result.score.percentage.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 mt-1">dari 100</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Benar</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{result.score.correct}</p>
            <p className="text-sm text-gray-500 mt-1">
              {((result.score.correct / result.score.total) * 100).toFixed(0)}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-2">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Salah</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{result.score.wrong}</p>
            <p className="text-sm text-gray-500 mt-1">
              {((result.score.wrong / result.score.total) * 100).toFixed(0)}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-2">
              <MinusCircle className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Kosong</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{result.score.unanswered}</p>
            <p className="text-sm text-gray-500 mt-1">
              {((result.score.unanswered / result.score.total) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Images - Only show if at least one image loads successfully */}
        {(!imageError.original || !imageError.processed) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {!imageError.original && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gambar Original</h3>
                <div 
                  className="relative border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => openImageModal('original')}
                >
                  <img
                    src={`http://localhost:8000/${result.image_path}`}
                    alt="Original LJK"
                    className="w-full h-auto"
                    onError={() => setImageError(prev => ({ ...prev, original: true }))}
                  />
                </div>
              </div>
            )}

            {!imageError.processed && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hasil Pemeriksaan</h3>
                <div 
                  className="relative border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => openImageModal('processed')}
                >
                  <img
                    src={`http://localhost:8000/${result.processed_image_path}`}
                    alt="Processed LJK"
                    className="w-full h-auto"
                    onError={() => setImageError(prev => ({ ...prev, processed: true }))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Answer Details */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Jawaban</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {result.details.map((detail) => (
              <div
                key={detail.question_num}
                className={`p-3 rounded-lg border-2 ${
                  detail.is_correct
                    ? 'border-green-200 bg-green-50'
                    : detail.student_answer === '-'
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">
                    No. {detail.question_num}
                  </span>
                  {detail.is_correct ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : detail.student_answer === '-' ? (
                    <MinusCircle className="w-4 h-4 text-orange-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  <p>Kunci: <span className="font-bold">{detail.answer_key}</span></p>
                  <p>Jawaban: <span className="font-bold">{detail.student_answer}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {imageModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              ✕ Tutup
            </button>
            <img
              src={currentImage === 'original' 
                ? `http://localhost:8000/${result.image_path}`
                : `http://localhost:8000/${result.processed_image_path}`
              }
              alt={currentImage === 'original' ? 'Original LJK' : 'Processed LJK'}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
