'use client';

import Link from 'next/link';

const features = [
  {
    to: '/kana',
    icon: 'あ',
    title: 'Kana Alphabet',
    desc: 'Learn the foundation of Japanese writing system with interactive Hiragana and Katakana charts.',
  },
  {
    to: '/vocab',
    icon: '単語',
    title: 'Vocabulary',
    desc: 'Memorize essential Minna no Nihongo words with our dynamic flashcards and native audio.',
  },
  {
    to: '/grammar',
    icon: '文法',
    title: 'Grammar Notes',
    desc: 'Understand sentence structures and patterns with clear explanations and audio examples.',
  },
  {
    to: '/kanji',
    icon: '漢',
    title: 'Kanji Look & Learn',
    desc: '512 kanji với hình minh họa, gợi nhớ và từ vựng đi kèm theo 32 bài học.',
  },
  {
    to: '/counters',
    icon: '①',
    title: 'Đếm số & thứ tự',
    desc: 'Số cơ bản 0–万, cách đếm đồ vật, người, ngày tháng, tuổi và thứ hạng.',
  },
  {
    to: '/vocab-review',
    icon: '📝',
    title: 'Bảng từ sai',
    desc: 'Tự lưu từ làm sai từ Quiz — ôn 20 từ mỗi ngày bằng flashcard.',
  },
  {
    to: '/daily-listening',
    icon: '🎧',
    title: 'Nghe mỗi ngày',
    desc: '15 phút/ngày với audio Minna (từ + câu mẫu) hoặc podcast N5 có gợi ý.',
  },
  {
    to: '/pronunciation',
    icon: '🎤',
    title: 'Luyện phát âm',
    desc: 'Flashcard nghe mẫu, ghi âm giọng bạn và nghe lại để so sánh — Kana & từ vựng Minna.',
  },
  {
    to: '/jlpt',
    icon: '🎯',
    title: 'Lộ trình JLPT',
    desc: 'Roadmap N5 → N4 → N3 với Minna, KLL, Shin Kanzen, Sō-Matome và đề Choukai/Dokkai.',
  },
  {
    to: '/mock-exam',
    icon: '📋',
    title: 'Thi thử JLPT',
    desc: 'Đề thi N5 & N4 có giới hạn thời gian, nộp bài và xem đáp án chi tiết.',
  },
  {
    to: '/quiz',
    icon: '✏️',
    title: 'Quiz & Practice',
    desc: 'Test your knowledge with multiple choice and fill-in-the-blank exercises for each lesson.',
  },
];

export default function HomePage() {
  return (
    <div className="container home-hero">
      <h1 className="home-title">
        Master <span>Japanese</span> Faster
      </h1>
      <p className="home-subtitle">
        Interactive lessons, beautiful flashcards, grammar notes, and effective quizzes designed
        to help you learn Japanese from zero.
      </p>

      <Link href="/kana" className="btn btn-primary">
        Start Learning
      </Link>

      <div className="feature-cards">
        {features.map((feature) => (
          <Link key={feature.to} href={feature.to} className="glass-panel feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
