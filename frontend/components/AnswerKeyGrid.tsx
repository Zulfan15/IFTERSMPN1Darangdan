'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Trash2 } from 'lucide-react';

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

  const progressPercentage = (getAnswerCount() / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Kunci Jawaban
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium text-blue-600">{getAnswerCount()}</span> dari {totalQuestions} soal telah diisi
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generateRandomAnswers}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
          >
            <Shuffle className="w-4 h-4" />
            Random
          </button>
          <button
            type="button"
            onClick={clearAllAnswers}
            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">
          {progressPercentage.toFixed(0)}% selesai
        </p>
      </div>

      {/* Answer Grid */}
      <div className="space-y-2">
        {Array.from({ length: endQuestion - startQuestion }, (_, i) => {
          const questionIndex = startQuestion + i;
          const selectedAnswer = answerKey[questionIndex];

          return (
            <div
              key={questionIndex}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 text-right">
                <span className="inline-block px-2.5 py-1 bg-gray-200 text-gray-700 rounded font-medium text-sm">
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
                      w-10 h-10 rounded-lg font-medium text-sm transition-all
                      ${
                        selectedAnswer === answerIndex
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {selectedAnswer !== undefined && (
                <span className="ml-2 text-sm text-green-600 font-medium">
                  ✓ {ANSWER_OPTIONS[selectedAnswer]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            Soal {startQuestion + 1}-{endQuestion} dari {totalQuestions}
            <span className="text-gray-400 ml-2">
              (Hal {currentPage + 1}/{totalPages})
            </span>
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Halaman berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Tips:</span> Klik tombol A, B, C, D, atau E untuk setiap nomor soal. 
          Pastikan semua soal sudah diisi sebelum menyimpan.
        </p>
      </div>
    </div>
  );
}
