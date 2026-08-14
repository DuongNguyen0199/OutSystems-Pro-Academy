export interface Question {
  id: string;
  question: string;
  answer: string;
  isFree: boolean;
}

export interface Choice {
  key: string;
  text: string;
}

export interface MockExamQuestion {
  id: string;
  question: string;
  choices: Choice[];
  correctAnswer: string;
  explanation: string;
  imageUrl?: string;
}

export interface ExamSet {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  passingScorePct: number;
  randomizeQuestions?: boolean;
  questions: MockExamQuestion[];
}

export interface Course {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  tags: { text: string; color: string }[];
  description: string;
  imageUrl: string;
  previewQuestions: Question[];
  mockExam: MockExamQuestion[];
  examSets?: ExamSet[];
  previewLimit?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'student' | 'admin';
  status: 'active' | 'banned';
}

export interface PaymentRequest {
  id: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  userEmail: string;
  courseId: string;
  status: 'active' | 'inactive' | 'used';
  failedAttempts: number;
  createdAt: string;
}

