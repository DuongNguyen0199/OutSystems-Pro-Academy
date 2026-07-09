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
}

export interface Course {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  tags: { text: string; color: 'blue' | 'green' | 'orange' | 'purple' }[];
  description: string;
  imageUrl: string;
  previewQuestions: Question[];
  mockExam: MockExamQuestion[];
}
