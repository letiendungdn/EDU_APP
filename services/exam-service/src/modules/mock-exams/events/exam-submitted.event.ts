export interface ExamSubmittedPayload {
  examId: string;
  userId?: number;
  level: string;
  percent: number;
  passed: boolean;
  correctCount: number;
  total: number;
  submittedAt: string;
}

export class ExamSubmittedEvent {
  constructor(public readonly payload: ExamSubmittedPayload) {}
}
