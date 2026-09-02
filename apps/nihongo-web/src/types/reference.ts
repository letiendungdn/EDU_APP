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

export interface CountryNameItem {
  nameJa: string;
  kana: string;
  romaji: string;
  meaning: string;
  code: string;
}

export interface CountryNameRegion {
  id: string;
  label: string;
  items: CountryNameItem[];
}

export interface JapaneseCountryNamesPayload {
  regions: CountryNameRegion[];
}

export interface VocabSuffixItem {
  id?: number;
  groupSlug?: string;
  suffix: string;
  forms?: string[];
  kana: string;
  romaji: string;
  meaning: string;
  attachesTo: string;
  pos?: string[];
  exampleJa: string;
  exampleVi: string;
}

export interface VocabSuffixGroup {
  id: string;
  label: string;
  labelJa?: string;
  hint: string;
  items: VocabSuffixItem[];
}

export interface JapaneseVocabSuffixesPayload {
  groups: VocabSuffixGroup[];
}

export interface CreateVocabSuffixGroupInput {
  slug: string;
  label: string;
  labelJa?: string;
  hint: string;
  sortOrder?: number;
}

export interface UpdateVocabSuffixGroupInput {
  slug?: string;
  label?: string;
  labelJa?: string;
  hint?: string;
  sortOrder?: number;
}

export interface CreateVocabSuffixItemInput {
  groupSlug: string;
  suffix: string;
  forms?: string[];
  kana: string;
  romaji: string;
  meaningVi: string;
  attachesTo: string;
  pos?: string[];
  exampleJa: string;
  exampleVi: string;
  sortOrder?: number;
}

export interface UpdateVocabSuffixItemInput {
  groupSlug?: string;
  suffix?: string;
  forms?: string[];
  kana?: string;
  romaji?: string;
  meaningVi?: string;
  attachesTo?: string;
  pos?: string[];
  exampleJa?: string;
  exampleVi?: string;
  sortOrder?: number;
}

export interface HomeStat {
  value: string;
  label: string;
  suffix: string;
}

export interface HomeFeatureItem {
  href: string;
  icon: string;
  title: string;
  desc: string;
}

export interface HomeFeatureSection {
  id: string;
  title: string;
  items: HomeFeatureItem[];
}

export interface HomePagePayload {
  stats: HomeStat[];
  sections: HomeFeatureSection[];
}

export interface ConversationPhraseItem {
  ja: string;
  kana: string;
  romaji: string;
  vi: string;
  note?: string;
}

export interface ConversationIntroLine {
  ja: string;
  kana: string;
  romaji: string;
  vi: string;
  tip?: string;
}

export interface ConversationIntroSlot {
  slot: string;
  question: string;
  examples: ConversationPhraseItem[];
}

export interface ConversationPhraseGroup {
  id: string;
  label: string;
  hint: string;
  items: ConversationPhraseItem[];
}

export interface JapaneseConversationPayload {
  introScript: ConversationIntroLine[];
  introSlots: ConversationIntroSlot[];
  phraseGroups: ConversationPhraseGroup[];
}

export interface RoleplayLine {
  role: string;
  ja: string;
  vi: string;
}

export interface RoleplayScene {
  id: string;
  title: string;
  titleJa: string;
  desc: string;
  lines: RoleplayLine[];
}

export interface JapaneseRoleplayPayload {
  scenes: RoleplayScene[];
}

export interface PronunciationRulePoint {
  label?: string;
  japanese?: string;
  romaji?: string;
  explanation: string;
}

export interface PronunciationRuleExample {
  japanese: string;
  romaji: string;
  meaning: string;
  note?: string;
}

export interface PronunciationRuleSection {
  id: string;
  title: string;
  summary: string;
  points: PronunciationRulePoint[];
  examples?: PronunciationRuleExample[];
}

export interface JapanesePronunciationRulesPayload {
  intro: string;
  tipsForVietnamese: string[];
  sections: PronunciationRuleSection[];
}

export interface EnglishKatakanaPoint {
  explanation: string;
  english?: string;
  katakana?: string;
  romaji?: string;
}

export interface EnglishKatakanaMapping {
  english: string;
  katakana: string;
  romaji: string;
  note?: string;
}

export interface EnglishKatakanaExample {
  english: string;
  katakana: string;
  romaji: string;
  meaningVi: string;
  note?: string;
}

export interface EnglishKatakanaSection {
  id: string;
  title: string;
  summary: string;
  points?: EnglishKatakanaPoint[];
  mappings?: EnglishKatakanaMapping[];
  examples?: EnglishKatakanaExample[];
}

export interface EnglishKatakanaPayload {
  intro: string;
  tipsForVietnamese: string[];
  sections: EnglishKatakanaSection[];
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

export interface BookAudioItem {
  id: string;
  no?: number;
  title: string;
  url: string;
  note?: string;
  localFileCount?: number;
  localFiles?: Array<{
    id: number;
    fileName: string;
    localPath: string;
    sizeBytes?: number;
  }>;
}

export interface BookAudioSection {
  level: string;
  label: string;
  items: BookAudioItem[];
}

export interface BookAudioPayload {
  sourceUrl: string;
  publisher: string;
  sections: BookAudioSection[];
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
  grammarTarget: string;
  vocabIncrement: string;
  kanjiIncrement: string;
  grammarIncrement: string;
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
