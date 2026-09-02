export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Lesson {
  id: number;
  lessonNumber: number;
  title: string | null;
  _count?: { vocabularies?: number; grammars?: number; exercises?: number };
}

export interface Vocabulary {
  id: number;
  kanji: string | null;
  kana: string;
  romaji: string;
  meaning: string;
  lessonId?: number;
  partOfSpeech?: string | null;
  imageUrl?: string | null;
  pitchAccent?: string | null;
  exampleJa?: string | null;
  exampleKana?: string | null;
  exampleVi?: string | null;
}

export type VocabularyWithLesson = Vocabulary & { lessonNumber: number };

export interface GrammarExample {
  id: number;
  jp: string;
  romaji: string;
  en: string | null;
  vi: string | null;
}

export interface Grammar {
  id: number;
  pattern: string;
  meaning: string;
  explanation: string | null;
  lessonId: number;
  examples?: GrammarExample[];
}

export interface Exercise {
  id: number;
  type: 'multiple_choice' | 'fill_in_blank' | string;
  question: string;
  options: string[] | string | null;
  answer: string;
  lessonId: number;
}

export interface KanjiLesson {
  id: number;
  lessonNumber: number;
  title: string | null;
  jlptLevel: string | null;
  _count?: { entries: number };
}

export interface KanjiEntry {
  id: number;
  character: string;
  hanViet: string | null;
  onyomi: string | null;
  kunyomi: string | null;
  meaningVi: string;
  jlptLevel?: string | null;
  mnemonicJp?: string | null;
  mnemonicVi?: string | null;
  imageUrl?: string | null;
  lesson?: { lessonNumber: number; title: string | null; jlptLevel: string | null };
  vocabularies?: Array<{
    id: number;
    word: string;
    reading: string;
    meaningVi: string;
    exampleJa?: string | null;
    exampleKana?: string | null;
    exampleVi?: string | null;
  }>;
}

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export const JLPT_LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export interface ListeningPlaylistItem {
  id: string;
  type: 'vocab' | 'sentence';
  speakText: string;
  display: string;
  meaning: string;
  lessonNumber: number;
}

export interface ListeningPlaylist {
  items: ListeningPlaylistItem[];
  total: number;
}

export interface MockExamTemplate {
  level: string;
  title: string;
  description: string;
  durationMinutes: number;
  questionCount: number;
}

export interface JlptAnnouncement {
  title: string;
  url: string;
  updatedAt: string | null;
  examDate: string;
  kind: 'exam' | 'registration' | 'fee' | 'other';
}

export interface JlptDaNangSchedule {
  source: string;
  fetchedAt: string;
  organizer: {
    name: string;
    shortName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    announcementsUrl: string;
    registrationPortal?: string;
  };
  fees: { formFee: string; examFee: string; note: string };
  venues: Array<{ address: string; district: string; levels: string; note?: string }>;
  examDay: Array<{ levels: string; arriveAt: string; startAt: string; venue: string }>;
  briefing: string;
  announcements: JlptAnnouncement[];
}

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: 'USER' | 'TEACHER' | 'ADMIN';
  avatarUrl?: string | null;
  nativeLanguage?: string | null;
  targetJlptLevel?: string | null;
  studyGoalMinutes?: number | null;
  hasPassword?: boolean;
  isGoogleLinked?: boolean;
  isKeycloakLinked?: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string | null;
  nativeLanguage?: string;
  targetJlptLevel?: string | null;
  studyGoalMinutes?: number;
}

export interface ReadingPassageSummary {
  id: number;
  title: string;
  jlptLevel: string | null;
  estimatedMin: number;
  sortOrder: number;
  _count: { questions: number };
}

export interface ReadingQuestion {
  id: number;
  question: string;
  answer: string;
  explanation: string | null;
  sortOrder: number;
  options: { id: number; text: string; sortOrder: number }[];
}

export interface ReadingPassage {
  id: number;
  title: string;
  content: string;
  jlptLevel: string | null;
  source: string | null;
  estimatedMin: number;
  questions: ReadingQuestion[];
}

export interface ReadingResult {
  correct: number;
  total: number;
  percent: number;
  results: {
    questionId: number;
    correct: boolean;
    correctAnswer: string;
    explanation: string | null;
  }[];
}

export interface DictationVocab {
  id: number;
  kanji: string | null;
  kana: string;
  romaji: string;
  meaning: string;
}

export interface AnalyticsData {
  overview: {
    totalStudySeconds: number;
    totalListeningSeconds: number;
    totalCardsReviewed: number;
    masteredVocab: number;
    totalExams: number;
    passedExams: number;
  };
  studySessions: { date: string; seconds: number; cardsReviewed: number }[];
  examHistory: {
    submittedAt: string;
    percent: number;
    passed: boolean;
    level: string;
    title: string;
  }[];
  listeningHistory: { date: string; seconds: number }[];
}

export interface DailyNoteRow {
  date: string;
  content: string;
  updatedAt: string;
}

export interface DailyGoalItemRow {
  id: string;
  kind: string;
  label: string;
  done: boolean;
  target?: number;
}

export interface DailyGoalsRow {
  date: string;
  items: DailyGoalItemRow[];
  updatedAt: string;
}

export interface ReviewLogItem {
  kana: string;
  kanji?: string | null;
  meaning: string;
  lessonNumber: number;
  wrongCount: number;
  reviewStreak: number;
  mastered: boolean;
  lastReviewedAt?: string | null;
}

export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PRO' | 'PRO_ANNUAL';

export interface SubscriptionPlanConfig {
  id?: number;
  plan: SubscriptionPlan;
  label: string;
  displayName?: string;
  priceLabel: string;
  priceCents: number;
  priceUsdCents?: number;
  interval: string;
  intervalMonths?: number;
  trialDays?: number;
  features: string[];
}

export interface Subscription {
  id: number;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'PAUSED';
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentRecord {
  id: number;
  amountCents: number;
  currency: string;
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  description?: string | null;
  createdAt: string;
  refundedAt?: string | null;
  refundAmountCents?: number | null;
  subscription?: { plan: SubscriptionPlan } | null;
  session?: {
    scheduledAt: string;
    status: string;
    coach?: { user?: { name?: string | null } | null } | null;
  } | null;
}

export interface AdminStats {
  users: number;
  payments: number;
  revenueCents: number;
  activeSubscriptions: number;
}

export interface AdminUserSummary {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export interface AdminPaymentsList {
  data: PaymentRecord[];
  total: number;
}

export interface SupportMessage {
  id: number;
  content: string;
  senderRole: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface SupportThreadResponse {
  threadId: number;
  messages: SupportMessage[];
}

export interface AdminSupportThreadSummary {
  threadId: number;
  userId: number;
  userEmail: string;
  userName: string | null;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface CommunityChatUser {
  id: number;
  email: string;
  name: string | null;
  online?: boolean;
}

export interface CommunityRoomSummary {
  id: number;
  name: string;
  type: 'GROUP' | 'DIRECT';
  members: CommunityChatUser[];
  lastMessage: { content: string; createdAt?: string } | string | null;
  lastMessageAt?: string;
  unreadCount: number;
  updatedAt: string;
}

export interface GroupChatMessage {
  id: number;
  content: string;
  senderId: number;
  senderName: string | null;
  createdAt: string;
}

export interface CommunityRoomResponse {
  id: number;
  name: string;
  type: 'GROUP' | 'DIRECT';
  members: CommunityChatUser[];
  messages: GroupChatMessage[];
}

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface CreateSubscriptionResponse {
  clientSecret: string;
  subscriptionId: string;
}

export interface RefundResult {
  success: boolean;
  message: string;
}

export interface SetupIntentResponse {
  clientSecret: string;
}

export interface SrsDueCard {
  vocabId: number;
  kana: string;
  kanji: string | null;
  meaning: string;
  lessonNumber: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SrsStats {
  total: number;
  dueToday: number;
  mastered: number;
  learning: number;
}

export interface SrsReviewResult {
  interval: number;
  nextReviewAt: string;
  mastered: boolean;
}

export interface SentencePracticeFeedback {
  corrected: string;
  reading: string;
  meaning: string;
  explanation: string;
  examples: string[];
}
