'use client';

import { useState } from 'react';

interface AnswerKeyGridProps {
  totalQuestions: number;
  answerKey: Record<number, number>;
  onChange: (answerKey: Record<number, number>) => void;
}

const ANSWER_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

export default function AnswerKeyGrid({
  totalQuestions,
  answerKey,
  onChange,
}: AnswerKeyGridProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 20;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswerKey = { ...answerKey, [questionIndex]: answerIndex };
    onChange(newAnswerKey);
  };

  const startQuestion = currentPage * questionsPerPage;
  const endQuestion = Math.min(startQuestion + questionsPerPage, totalQuestions);

  const getAnswerCount = () => {
    return Object.keys(answerKey).length;
  };

  const generateRandomAnswers = () => {
    const newAnswerKey: Record<number, number> = {};
    for (let i = 0; i < totalQuestions; i++) {
      newAnswerKey[i] = Math.floor(Math.random() * 5);
    }
    onChange(newAnswerKey);
  };

  const clearAllAnswers = () => {
    onChange({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🔑 Kunci Jawaban
          </h3>
          <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
              {getAnswerCount()}/{totalQuestions}
            </span>
            <span>soal telah diisi</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generateRandomAnswers}
            className="group px-4 py-2 text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-pink-200 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
          >
            <span className="inline-block group-hover:rotate-180 transition-transform duration-500">🎲</span>
            <span className="ml-2">Random (Test)</span>
          </button>
          <button
            type="button"
            onClick={clearAllAnswers}
            className="group px-4 py-2 text-sm bg-gradient-to-r from-red-100 to-orange-100 text-red-700 rounded-xl hover:from-red-200 hover:to-orange-200 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
          >
            <span className="inline-block group-hover:scale-125 transition-transform">🗑️</span>
            <span className="ml-2">Clear All</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 relative"
            style={{ width: `${(getAnswerCount() / totalQuestions) * 100}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center font-medium">
          {((getAnswerCount() / totalQuestions) * 100).toFixed(1)}% Complete
        </p>
      </div>

      {/* Answer Grid */}
      <div className="space-y-3">
        {Array.from({ length: endQuestion - startQuestion }, (_, i) => {
          const questionIndex = startQuestion + i;
          const selectedAnswer = answerKey[questionIndex];

          return (
            <div
              key={questionIndex}
              className="group flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100"
            >
              <div className="w-16 text-right">
                <span className="inline-block px-3 py-1 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-lg font-bold text-sm shadow-md">
                  {questionIndex + 1}
                </span>
              </div>
              <div className="flex gap-2">
                {ANSWER_OPTIONS.map((option, answerIndex) => (
                  <button
                    key={answerIndex}
                    type="button"
                    onClick={() => handleAnswerSelect(questionIndex, answerIndex)}
                    className={`
                      w-14 h-14 rounded-xl font-bold text-base transition-all duration-300 shadow-md
                      ${
                        selectedAnswer === answerIndex
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg scale-110 ring-4 ring-green-200'
                          : 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 border-2 border-gray-200 hover:border-blue-300 hover:scale-105'
                      }
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {selectedAnswer !== undefined && (
                <span className="ml-3 flex items-center gap-2 text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-lg animate-fadeInUp">
                  <span className="text-xl">✓</span>
                  <span>{ANSWER_OPTIONS[selectedAnswer]}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Soal {startQuestion + 1}-{endQuestion} dari {totalQuestions}
            <span className="ml-2 text-gray-400">
              (Halaman {currentPage + 1}/{totalPages})
            </span>
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-3xl flex-shrink-0 animate-float">💡</span>
          <div>
            <p className="text-sm text-blue-900 font-medium leading-relaxed">
              <strong className="text-blue-700">Tips:</strong> Pastikan semua soal sudah diisi sebelum menyimpan. 
              Gunakan tombol "Random" untuk testing cepat, atau input manual sesuai kunci jawaban ujian yang sebenarnya.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Klik tombol A, B, C, D, atau E untuk setiap nomor soal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
