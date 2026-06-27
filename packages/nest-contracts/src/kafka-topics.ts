export const KafkaTopics = {
  EXAM_SUBMITTED: 'edu.exam.submitted',
  EXAM_SCORED: 'edu.exam.scored',
  VOCAB_REVIEWED: 'edu.vocab.reviewed',
  PAYMENT_SUCCEEDED: 'edu.payment.succeeded',
  SESSION_COMPLETED: 'edu.session.completed',
} as const;

export interface ExamSubmittedEvent {
  examId: string;
  userId: number;
  level: string;
  answers: Record<string, string>;
  submittedAt: string;
}

export interface PaymentSucceededEvent {
  paymentId: number;
  userId: number;
  amountCents: number;
  type: 'subscription' | 'session';
  referenceId: string;
  paidAt: string;
}

export interface SessionCompletedEvent {
  sessionId: number;
  learnerId: number;
  coachId: number;
  durationMin: number;
  completedAt: string;
}
