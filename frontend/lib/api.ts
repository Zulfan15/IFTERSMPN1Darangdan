// API Client for Backend Communication
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Exam {
  exam_id: string;
  title: string;
  date: string;
  subject: string;
  class: string;
  total_questions: number;
  active_questions: number;
  answer_key: Record<number, number>;
  created_at: string;
}

export interface Result {
  result_id: string;
  exam_id: string;
  student_name?: string;
  student_number?: string;
  answers: Record<number, number>;
  unanswered: number[];
  score: {
    correct: number;
    wrong: number;
    unanswered: number;
    total_points: number;
    percentage: number;
  };
  image_path: string;
  processed_image_path: string;
  processed_at: string;
}

export interface Statistics {
  total_students: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  std_deviation: number;
  passing_rate: number;
  question_analysis: Array<{
    question_number: number;
    correct_answer: number;
    correct_count: number;
    wrong_count: number;
    empty_count: number;
    correct_percentage: number;
    difficulty: string;
  }>;
}

// API Functions

// Exams
export const createExam = async (examData: {
  title: string;
  date: string;
  subject: string;
  class: string;
  active_questions: number;
  answer_key: Record<number, number>;
}): Promise<Exam> => {
  const response = await api.post('/api/exams', examData);
  return response.data;
};

export const listExams = async (): Promise<Exam[]> => {
  const response = await api.get('/api/exams');
  return response.data;
};

export const getExam = async (examId: string): Promise<Exam> => {
  const response = await api.get(`/api/exams/${examId}`);
  return response.data;
};

export const deleteExam = async (examId: string): Promise<void> => {
  await api.delete(`/api/exams/${examId}`);
};

export const updateExam = async (
  examId: string,
  examData: {
    title: string;
    date: string;
    subject: string;
    class: string;
    active_questions: number;
    answer_key: Record<number, number>;
  }
): Promise<Exam> => {
  const response = await api.put(`/api/exams/${examId}`, examData);
  return response.data;
};

export const deleteResult = async (resultId: string): Promise<void> => {
  await api.delete(`/api/results/${resultId}`);
};

// Process LJK
export const processLJK = async (
  examId: string,
  file: File,
  studentName?: string,
  studentNumber?: string
): Promise<Result> => {
  const formData = new FormData();
  formData.append('exam_id', examId);
  formData.append('file', file);
  if (studentName) formData.append('student_name', studentName);
  if (studentNumber) formData.append('student_number', studentNumber);

  const response = await api.post('/api/process-ljk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Results
export const getResult = async (resultId: string): Promise<Result> => {
  const response = await api.get(`/api/results/${resultId}`);
  return response.data;
};

export const getExamResults = async (examId: string): Promise<Result[]> => {
  const response = await api.get(`/api/exams/${examId}/results`);
  return response.data;
};

export const getExamStatistics = async (examId: string): Promise<Statistics> => {
  const response = await api.get(`/api/exams/${examId}/statistics`);
  return response.data;
};

// Export
export const exportExcel = async (examId: string): Promise<Blob> => {
  const response = await api.get(`/api/exams/${examId}/export/excel`, {
    responseType: 'blob',
  });
  return response.data;
};

// Template
export const getTemplateStatus = async (): Promise<{
  roi_configured: boolean;
  template_path?: string;
  roi_config?: any;
}> => {
  const response = await api.get('/api/template/status');
  return response.data;
};

// Archive
export interface ArchiveFile {
  filename: string;
  size: number;
  created_date: string;
}

export const archiveExams = async (startDate: string, endDate: string) => {
  const response = await api.post(
    `/api/archive?start_date=${startDate}&end_date=${endDate}`
  );
  return response.data;
};

export const cleanupArchivedExams = async (startDate: string, endDate: string) => {
  const response = await api.delete(
    `/api/archive/cleanup?start_date=${startDate}&end_date=${endDate}`
  );
  return response.data;
};

export const listArchives = async (): Promise<{ archives: ArchiveFile[] }> => {
  const response = await api.get('/api/archive/list');
  return response.data;
};

export const getArchiveDownloadUrl = (filename: string): string => {
  return `${API_BASE_URL}/api/archive/download/${filename}`;
};
