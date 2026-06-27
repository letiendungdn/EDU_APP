const RESULT_KEY = 'nihongo-mock-exam-result';

export interface MockExamSection {
  id: string;
  name: string;
  count: number;
}

export interface MockExamQuestion {
  id: string;
  sectionId: string;
  sectionName: string;
  type: 'multiple_choice' | 'fill_in_blank' | 'listening';
  question: string;
  options?: string[];
  audioText?: string;
  lessonNumber?: number;
}

export interface MockExamSession {
  examId: string;
  level: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  sections: MockExamSection[];
  questions: MockExamQuestion[];
}

export interface MockExamReviewItem extends MockExamQuestion {
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface MockExamResult {
  examId: string;
  level: string;
  title: string;
  correctCount: number;
  total: number;
  percent: number;
  passThreshold: number;
  passed: boolean;
  sectionScores: Array<{
    sectionId: string;
    sectionName: string;
    correct: number;
    total: number;
  }>;
  review: MockExamReviewItem[];
  submittedAt?: string;
}

export function saveMockExamResult(result: MockExamResult): void {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadMockExamResult(): MockExamResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as MockExamResult) : null;
  } catch {
    return null;
  }
}

export function clearMockExamResult(): void {
  sessionStorage.removeItem(RESULT_KEY);
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
