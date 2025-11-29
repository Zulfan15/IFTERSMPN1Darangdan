'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { processLJK } from '@/lib/api';
import FileUploader from '@/components/FileUploader';
import CameraCapture from '@/components/CameraCapture';
import { ArrowLeft, CheckCircle, XCircle, Clock, Camera, Upload } from 'lucide-react';
import { ToastContainer, toast } from '@/components/Toast';

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
  const [showCamera, setShowCamera] = useState(false);
  const [uploadMode, setUploadMode] = useState<'select' | 'file' | 'camera'>('select');

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
    setUploadStatuses(prev => [
      ...prev,
      ...selectedFiles.map((file) => ({
        file,
        status: 'pending' as const,
        progress: 0,
      }))
    ]);
    setUploadMode('select');
  };

  const handleCameraCapture = (file: File) => {
    setFiles(prev => [...prev, file]);
    setUploadStatuses(prev => [
      ...prev,
      {
        file,
        status: 'pending' as const,
        progress: 0,
      }
    ]);
    toast.success(`Foto "${file.name}" berhasil diambil`);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    setUploadMode('select');
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
        {/* Upload Mode Selection */}
        {uploadMode === 'select' && uploadStatuses.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Camera Option */}
            <button
              onClick={() => setShowCamera(true)}
              className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📷 Scan dengan Kamera
                </h3>
                <p className="text-sm text-gray-500">
                  Gunakan kamera HP untuk scan LJK langsung
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Direkomendasikan
                </span>
              </div>
            </button>

            {/* File Upload Option */}
            <button
              onClick={() => setUploadMode('file')}
              className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-gray-400 hover:bg-gray-50 transition-all group"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                  <Upload className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📁 Upload File
                </h3>
                <p className="text-sm text-gray-500">
                  Upload gambar LJK dari perangkat Anda
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  JPG, PNG
                </span>
              </div>
            </button>
          </div>
        )}

        {/* File Uploader */}
        {uploadMode === 'file' && uploadStatuses.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Upload File LJK</h2>
              <button
                onClick={() => setUploadMode('select')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Kembali
              </button>
            </div>
            <FileUploader onFilesSelected={handleFilesSelected} />
          </div>
        )}

        {/* Files Queue (when files are added but not processed yet) */}
        {uploadStatuses.length > 0 && !processing && !allProcessed && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                {files.length} LJK Siap Diproses
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCamera(true)}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  <Camera className="w-4 h-4" />
                  Tambah Foto
                </button>
              </div>
            </div>
            
            {/* Preview thumbnails */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4">
              {files.map((file, idx) => (
                <div key={idx} className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setFiles(prev => prev.filter((_, i) => i !== idx));
                      setUploadStatuses(prev => prev.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    title="Hapus"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

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
                    setUploadMode('select');
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

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={handleCloseCamera}
        />
      )}

      {/* Toast */}
      <ToastContainer />
    </div>
  );
}
