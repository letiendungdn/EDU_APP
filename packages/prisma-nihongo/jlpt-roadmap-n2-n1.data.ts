/** Dữ liệu lộ trình JLPT N2 & N1 — bổ sung cho N5–N3 đã có trong DB. */

export type RoadmapExamSection = { name: string; points: number; time: string };
export type RoadmapMaterial = {
  title: string;
  description: string;
  scope: string;
  inAppPath?: string;
  inAppLabel?: string;
  externalUrl?: string;
  externalLabel?: string;
};
export type RoadmapTask = {
  externalKey: string;
  text: string;
  inAppPath?: string;
  inAppLabel?: string;
  externalUrl?: string;
  externalLabel?: string;
};
export type RoadmapPhase = {
  externalKey: string;
  title: string;
  subtitle: string;
  tasks: RoadmapTask[];
};
export type RoadmapLevelDef = {
  externalKey: string;
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
  sortOrder: number;
  examSections: RoadmapExamSection[];
  materials: RoadmapMaterial[];
  phases: RoadmapPhase[];
};

export const JLPT_ROADMAP_N2_N1: RoadmapLevelDef[] = [
  {
    externalKey: 'n2',
    label: 'JLPT N2',
    badge: 'Trung cao cấp',
    color: '#f97316',
    duration: '9–12 tháng (sau N3)',
    vocabTarget: '~6.000 từ (gồm N5–N3)',
    kanjiTarget: '~1.000 chữ (gồm N5–N3)',
    grammarTarget: '~500 mẫu (gồm N5–N3)',
    vocabIncrement: '+2.250 từ mới',
    kanjiIncrement: '+350 chữ mới',
    grammarIncrement: '+150 mẫu mới',
    passScore: '90/180 điểm',
    summary:
      'N2 là cấp độ trung cao — đủ để làm việc, đọc báo đơn giản, hiểu hội thoại hàng ngày và văn viết thông thường.',
    sortOrder: 3,
    examSections: [
      { name: 'Từ vựng', points: 60, time: '30 phút' },
      { name: 'Ngữ pháp & Đọc', points: 60, time: '70 phút' },
      { name: 'Nghe', points: 60, time: '50 phút' },
    ],
    materials: [
      {
        title: 'Minna no Nihongo II',
        description: 'Giáo trình chính giai đoạn N2 — từ vựng, ngữ pháp nâng cao.',
        scope: 'Bài 33 → 50',
        inAppPath: '/vocab',
        inAppLabel: 'Từ vựng Minna II',
      },
      {
        title: 'Shin Kanzen Master N2 (新完全マスター)',
        description: 'Bộ luyện thi chuyên sâu N2 — ngữ pháp, từ vựng, đọc, nghe.',
        scope: 'Toàn bộ 4 kỹ năng · 3–4 tháng trước kỳ thi',
        externalUrl: 'https://jlpt.jp/e/samples/forlearners.html',
        externalLabel: 'Đề mẫu JLPT',
      },
      {
        title: 'Nihongo Sō-Matome N2',
        description: 'Ôn N2 theo ngày — gọn, dễ lập kế hoạch 8–10 tuần.',
        scope: '文法 · 語彙 · 読解 · 聴解',
        inAppPath: '/grammar',
        inAppLabel: 'Ngữ pháp trong app',
      },
      {
        title: 'Kanji & từ vựng N2 trong app',
        description: 'Bộ kanji và từ vựng JLPT N2 đã gắn tag — lọc theo cấp độ.',
        scope: 'Lọc JLPT N2 trên trang Kanji / Từ vựng',
        inAppPath: '/kanji',
        inAppLabel: 'Kanji N2',
      },
      {
        title: 'Đề thử & thi thử',
        description: 'Làm đề có giới hạn thời gian — phân tích lỗi sau mỗi đề.',
        scope: '6–10 đề trước kỳ thi',
        inAppPath: '/mock-exam',
        inAppLabel: 'Thi thử trong app',
        externalUrl: 'https://jlpt.jp/e/samples/forlearners.html',
        externalLabel: 'Đề mẫu JLPT',
      },
    ],
    phases: [
      {
        externalKey: 'n2-phase-1',
        title: 'Giai đoạn 1 · Tháng 1–4',
        subtitle: 'Minna II Bài 33–40 + từ vựng N2',
        tasks: [
          {
            externalKey: 'n2-t1',
            text: 'Học Minna Bài 33–40 — ngữ pháp trung cao (～わけ, ～ばかり, ～はず)',
            inAppPath: '/grammar',
            inAppLabel: 'Ngữ pháp',
          },
          {
            externalKey: 'n2-t2',
            text: 'Học 25–30 từ mới/ngày — lọc JLPT N2 trong app',
            inAppPath: '/vocab',
            inAppLabel: 'Từ vựng N2',
          },
          {
            externalKey: 'n2-t3',
            text: 'Kanji N2 — 10–15 chữ/ngày, ôn bằng flashcard',
            inAppPath: '/kanji',
            inAppLabel: 'Kanji N2',
          },
        ],
      },
      {
        externalKey: 'n2-phase-2',
        title: 'Giai đoạn 2 · Tháng 5–8',
        subtitle: 'Minna II Bài 41–50 + đọc & nghe',
        tasks: [
          {
            externalKey: 'n2-t4',
            text: 'Hoàn thành Minna Bài 41–50 — từ vựng & ngữ pháp',
            inAppPath: '/vocab',
            inAppLabel: 'Từ vựng',
          },
          {
            externalKey: 'n2-t5',
            text: 'Đọc 1 bài đọc N2/ngày (Shin Kanzen đọc, Sou Matome 読解)',
          },
          {
            externalKey: 'n2-t6',
            text: 'Nghe N2 mỗi ngày 20–30 phút — drama, podcast có script',
            inAppPath: '/daily-listening',
            inAppLabel: 'Nghe mỗi ngày',
          },
        ],
      },
      {
        externalKey: 'n2-phase-3',
        title: 'Giai đoạn 3 · Tháng 9–12',
        subtitle: 'Luyện đề & chiến thuật làm bài',
        tasks: [
          {
            externalKey: 'n2-t7',
            text: 'Làm 8–10 đề JLPT N2 có giới hạn thời gian',
            inAppPath: '/mock-exam',
            inAppLabel: 'Thi thử',
            externalUrl: 'https://jlpt.jp/e/samples/forlearners.html',
            externalLabel: 'Đề mẫu JLPT',
          },
          {
            externalKey: 'n2-t8',
            text: 'Phân loại lỗi: từ vựng / ngữ pháp / đọc / nghe — ôn theo nhóm yếu',
            inAppPath: '/vocab-review',
            inAppLabel: 'Bảng từ sai',
          },
          {
            externalKey: 'n2-t9',
            text: 'Ôn kanji N2 — flashcard toàn bộ ~350 chữ mới so với N3',
            inAppPath: '/kanji',
            inAppLabel: 'Ôn Kanji',
          },
        ],
      },
    ],
  },
  {
    externalKey: 'n1',
    label: 'JLPT N1',
    badge: 'Cao cấp',
    color: '#ef4444',
    duration: '12–18 tháng (sau N2)',
    vocabTarget: '~9.700 từ (gồm N5–N2)',
    kanjiTarget: '~2.136 chữ (gồm N5–N2)',
    grammarTarget: '~650 mẫu (gồm N5–N2)',
    vocabIncrement: '+3.700 từ mới',
    kanjiIncrement: '+1.136 chữ mới',
    grammarIncrement: '+150 mẫu mới',
    passScore: '100/180 điểm',
    summary:
      'N1 là cấp cao nhất — hiểu tin tức, văn học, hội thoại trang trọng; đủ để học tập và làm việc chuyên sâu bằng tiếng Nhật.',
    sortOrder: 4,
    examSections: [
      { name: 'Từ vựng', points: 60, time: '30 phút' },
      { name: 'Ngữ pháp & Đọc', points: 60, time: '80 phút' },
      { name: 'Nghe', points: 60, time: '60 phút' },
    ],
    materials: [
      {
        title: 'Shin Kanzen Master N1 (新完全マスター)',
        description: 'Bộ luyện thi chuẩn N1 — ngữ pháp, từ vựng, đọc, nghe.',
        scope: 'Toàn bộ 4 kỹ năng · 4–6 tháng trước kỳ thi',
        externalUrl: 'https://jlpt.jp/e/samples/forlearners.html',
        externalLabel: 'Đề mẫu JLPT',
      },
      {
        title: 'Nihongo Sō-Matome N1',
        description: 'Ôn N1 theo ngày — phù hợp lập kế hoạch dài hạn.',
        scope: '文法 · 語彙 · 読解 · 聴解',
      },
      {
        title: 'Từ vựng & kanji N1 trong app',
        description: 'Bộ nội dung JLPT N1 — lọc theo tag cấp độ trên Kanji / Từ vựng / Ngữ pháp.',
        scope: 'Lọc JLPT N1',
        inAppPath: '/vocab',
        inAppLabel: 'Từ vựng N1',
      },
      {
        title: 'Đọc văn bản thật',
        description: 'NHK News Web Easy, báo Mainichi, sách Aozora Bunko — nâng cao đọc hiểu.',
        scope: '1 bài đọc dài/ngày · 3 tháng cuối',
        externalUrl: 'https://www3.nhk.or.jp/news/easy/',
        externalLabel: 'NHK News Web Easy',
      },
      {
        title: 'Đề thử & thi thử N1',
        description: 'Làm đề full 3 phần — rèn quản lý thời gian và độ bền tập trung.',
        scope: '10–15 đề trước kỳ thi',
        inAppPath: '/mock-exam',
        inAppLabel: 'Thi thử trong app',
        externalUrl: 'https://jlpt.jp/e/samples/forlearners.html',
        externalLabel: 'Đề mẫu JLPT',
      },
    ],
    phases: [
      {
        externalKey: 'n1-phase-1',
        title: 'Giai đoạn 1 · Tháng 1–6',
        subtitle: 'Từ vựng & ngữ pháp N1 + kính ngữ',
        tasks: [
          {
            externalKey: 'n1-t1',
            text: 'Học 30–40 từ mới/ngày — lọc JLPT N1, ghi chú collocations',
            inAppPath: '/vocab',
            inAppLabel: 'Từ vựng N1',
          },
          {
            externalKey: 'n1-t2',
            text: 'Ngữ pháp N1 — ～に至るまで, ～をもって, ～に即して… (Shin Kanzen 文法)',
            inAppPath: '/grammar',
            inAppLabel: 'Ngữ pháp N1',
          },
          {
            externalKey: 'n1-t3',
            text: 'Kanji N1 — 15–20 chữ/ngày, chú ý đọc on/kun hiếm gặp',
            inAppPath: '/kanji',
            inAppLabel: 'Kanji N1',
          },
        ],
      },
      {
        externalKey: 'n1-phase-2',
        title: 'Giai đoạn 2 · Tháng 7–12',
        subtitle: 'Đọc dài & nghe nâng cao',
        tasks: [
          {
            externalKey: 'n1-t4',
            text: 'Đọc 1 bài văn dài N1/ngày — phân tích cấu trúc câu phức',
          },
          {
            externalKey: 'n1-t5',
            text: 'Nghe N1 — tin tức, phỏng vấn, hội thoại trang trọng 30 phút/ngày',
            inAppPath: '/daily-listening',
            inAppLabel: 'Nghe mỗi ngày',
          },
          {
            externalKey: 'n1-t6',
            text: 'Luyện kính ngữ (keigo) — 尊敬語 · 謙譲語 · 丁寧語 trong hội thoại công việc',
            inAppPath: '/conversation',
            inAppLabel: 'Hội thoại',
          },
        ],
      },
      {
        externalKey: 'n1-phase-3',
        title: 'Giai đoạn 3 · Tháng 13–18',
        subtitle: 'Đề thi & hoàn thiện',
        tasks: [
          {
            externalKey: 'n1-t7',
            text: 'Làm 10–15 đề JLPT N1 full 3 phần có giới hạn thời gian',
            inAppPath: '/mock-exam',
            inAppLabel: 'Thi thử',
            externalUrl: 'https://jlpt.jp/e/samples/forlearners.html',
            externalLabel: 'Đề mẫu JLPT',
          },
          {
            externalKey: 'n1-t8',
            text: 'Phân tích lỗi chi tiết — tạo danh sách từ/ngữ pháp hay nhầm',
            inAppPath: '/vocab-review',
            inAppLabel: 'Bảng từ sai',
          },
          {
            externalKey: 'n1-t9',
            text: 'Ôn tổng hợp kanji N1 — flashcard ~1.100 chữ mới so với N2',
            inAppPath: '/kanji',
            inAppLabel: 'Ôn Kanji',
          },
        ],
      },
    ],
  },
];
