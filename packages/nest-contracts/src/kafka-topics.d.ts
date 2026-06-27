export declare const KafkaTopics: {
    readonly EXAM_SUBMITTED: "edu.exam.submitted";
    readonly EXAM_SCORED: "edu.exam.scored";
    readonly VOCAB_REVIEWED: "edu.vocab.reviewed";
    readonly PAYMENT_SUCCEEDED: "edu.payment.succeeded";
    readonly SESSION_COMPLETED: "edu.session.completed";
};
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
