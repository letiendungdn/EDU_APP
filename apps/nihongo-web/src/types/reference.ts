export interface KanaCell {
  kana: string;
  romaji: string;
}

export interface KanaSection {
  id: string;
  title: string;
  subtitle?: string;
  columns?: number;
  rows: KanaCell[][];
}

export interface KanaChartsPayload {
  hiraganaSections: KanaSection[];
  katakanaSections: KanaSection[];
}

export interface KanaChartItem {
  speakText: string;
  display: string;
  romaji: string;
  hint: string;
}

export interface CounterItem {
  n: number | string;
  kana: string;
  romaji: string;
  vi: string;
  kanji?: string;
}

export interface CounterCategory {
  id: string;
  label: string;
  hint: string;
  items: CounterItem[];
}

export interface JapaneseCountersPayload {
  categories: CounterCategory[];
}

export interface PodcastItem {
  id: string;
  title: string;
  desc: string;
  url: string;
  level: string;
}

export interface ListeningPreset {
  id: string;
  label: string;
  lessonFrom: number;
  lessonTo: number;
}

export interface DailyListeningPayload {
  goalMinutes: number;
  podcasts: PodcastItem[];
  presets: ListeningPreset[];
}

export interface InAppLink {
  to: string;
  label: string;
}

export interface ExternalLink {
  url: string;
  label: string;
}

export interface RoadmapTask {
  id: string;
  text: string;
  inApp?: InAppLink;
  external?: ExternalLink;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  subtitle: string;
  tasks: RoadmapTask[];
}

export interface ExamSection {
  name: string;
  points: number;
  time: string;
}

export interface RoadmapMaterial {
  title: string;
  desc: string;
  inApp?: InAppLink;
  external?: ExternalLink;
  scope: string;
}

export interface JlptLevelRoadmap {
  id: string;
  label: string;
  badge: string;
  color: string;
  duration: string;
  vocabTarget: string;
  kanjiTarget: string;
  passScore: string;
  summary: string;
  examSections: ExamSection[];
  materials: RoadmapMaterial[];
  phases: RoadmapPhase[];
}

export interface JlptRoadmapPayload {
  levels: JlptLevelRoadmap[];
  studyTips: string[];
  examScheduleNote: string;
}

export type JlptSessionStatus =
  | 'registration_open'
  | 'registration_closed'
  | 'upcoming'
  | 'past';

export interface JlptExamSession {
  id: string;
  label: string;
  examDate: string;
  registrationPeriod: string;
  status: JlptSessionStatus;
  statusLabel: string;
  announcementUrl?: string;
}

export interface JlptVenue {
  address: string;
  district: string;
  levels: string;
  note?: string;
}

export interface JlptExamDaySlot {
  levels: string;
  arriveAt: string;
  startAt: string;
  venue: string;
}

export interface JlptDaNangSchedulePayload {
  organizer: {
    name: string;
    shortName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    announcementsUrl: string;
  };
  fees: {
    formFee: string;
    examFee: string;
    note: string;
  };
  sessions: JlptExamSession[];
  venues: JlptVenue[];
  examDay: JlptExamDaySlot[];
  briefing: string;
}

export interface ReferenceMeta {
  slug: string;
  title: string | null;
  updatedAt: string;
}
