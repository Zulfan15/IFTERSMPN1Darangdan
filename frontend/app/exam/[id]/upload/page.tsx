'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { processLJK } from '@/lib/api';
import FileUploader from '@/components/FileUploader';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

interface UploadStatus {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

export default function UploadLJKPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setUploadStatuses(
      selectedFiles.map((file) => ({
        file,
        status: 'pending',
        progress: 0,
      }))
    );
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Update status to processing
      setUploadStatuses((prev) =>
        prev.map((status, idx) =>
          idx === i ? { ...status, status: 'processing', progress: 50 } : status
        )
      );

      try {
        // Extract student info from filename if possible
        const filename = file.name.replace(/\.(jpg|jpeg|png)$/i, '');
        const studentName = filename;

        const result = await processLJK(examId, file, studentName);

        // Update status to success
        setUploadStatuses((prev) =>
          prev.map((status, idx) =>
            idx === i
              ? { ...status, status: 'success', progress: 100, result }
              : status
          )
        );
      } catch (error: any) {
        // Update status to error
        setUploadStatuses((prev) =>
          prev.map((status, idx) =>
            idx === i
              ? {
                  ...status,
                  status: 'error',
                  progress: 0,
                  error: error.response?.data?.detail || 'Gagal memproses LJK',
                }
              : status
          )
        );
      }
    }

    setProcessing(false);
  };

  const successCount = uploadStatuses.filter((s) => s.status === 'success').length;
  const errorCount = uploadStatuses.filter((s) => s.status === 'error').length;
  const allProcessed = uploadStatuses.length > 0 && 
    uploadStatuses.every((s) => s.status === 'success' || s.status === 'error');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                <h1 className="text-xl font-bold text-gray-900">Upload LJK</h1>
                <p className="text-sm text-gray-500">
                  Upload dan proses lembar jawaban siswa
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Uploader */}
        {uploadStatuses.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <FileUploader onFilesSelected={handleFilesSelected} />
          </div>
        )}

        {/* Process Button */}
        {files.length > 0 && !processing && !allProcessed && (
          <div className="mb-6">
            <button
              onClick={processFiles}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Mulai Proses {files.length} LJK
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploadStatuses.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">
                Status Pemrosesan
              </h2>
              <div className="text-sm text-gray-500">
                {successCount} berhasil • {errorCount} gagal • {files.length} total
              </div>
            </div>

            <div className="space-y-3">
              {uploadStatuses.map((status, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      {status.status === 'pending' && (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                      {status.status === 'processing' && (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}
                      {status.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {status.status === 'error' && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium text-gray-900 truncate">
                        {status.file.name}
                      </span>
                    </div>
                    <div className="text-right">
                      {status.status === 'success' && status.result && (
                        <span className="text-sm font-semibold text-green-600">
                          {status.result.score.percentage.toFixed(0)}%
                        </span>
                      )}
                      {status.status === 'processing' && (
                        <span className="text-sm text-blue-600">
                          {status.progress}%
                        </span>
                      )}
                    </div>
                  </div>

                  {status.status === 'processing' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`bg-blue-600 h-1.5 rounded-full transition-all ${status.progress === 50 ? 'w-1/2' : 'w-full'}`}
                      />
                    </div>
                  )}

                  {status.status === 'success' && status.result && (
                    <div className="text-sm text-gray-600 mt-2">
                      Benar: {status.result.score.correct} • Salah:{' '}
                      {status.result.score.wrong} • Kosong:{' '}
                      {status.result.score.unanswered}
                    </div>
                  )}

                  {status.status === 'error' && (
                    <div className="text-sm text-red-600 mt-2">
                      {status.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {allProcessed && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setFiles([]);
                    setUploadStatuses([]);
                  }}
                  className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Upload Lagi
                </button>
                <Link
                  href={`/exam/${examId}/results`}
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                >
                  Lihat Semua Hasil →
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
