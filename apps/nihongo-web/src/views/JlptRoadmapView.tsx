'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useJlptDaNangScheduleQuery,
  useJlptDaNangStaticQuery,
  useJlptRoadmapQuery,
} from '../hooks/queries';
import type { JlptAnnouncement, JlptDaNangSchedule } from '../types/api';
import type { JlptDaNangSchedulePayload } from '../types/reference';
import './JlptRoadmapView.css';

const STORAGE_KEY = 'nihongo-jlpt-progress';

type ProgressRecord = Record<string, boolean>;

function loadProgress(): ProgressRecord {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveProgress(progress: ProgressRecord): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

const ANNOUNCEMENT_KIND_LABEL: Record<JlptAnnouncement['kind'], string> = {
  exam: 'Kỳ thi',
  registration: 'Đăng ký',
  fee: 'Lệ phí',
  other: 'Thông báo',
};

function buildFallbackSchedule(staticData: JlptDaNangSchedulePayload): JlptDaNangSchedule {
  return {
    source: 'fallback',
    fetchedAt: new Date().toISOString(),
    organizer: {
      ...staticData.organizer,
      registrationPortal: 'http://jlpt.ufl.udn.vn/',
    },
    fees: staticData.fees,
    venues: staticData.venues,
    examDay: staticData.examDay,
    briefing: staticData.briefing,
    announcements: staticData.sessions
      .filter((s) => s.announcementUrl)
      .map((s) => ({
        title: s.label,
        url: s.announcementUrl!,
        updatedAt: null,
        examDate: s.examDate.replace(/^Chủ nhật,\s*/i, '').replace(/\s*\(dự kiến\)/i, ''),
        kind: 'exam' as const,
      })),
  };
}

function formatFetchedAt(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function JlptRoadmapView() {
  const { data: roadmap, isLoading: roadmapLoading } = useJlptRoadmapQuery();
  const { data: staticSchedule } = useJlptDaNangStaticQuery();
  const jlptLevels = roadmap?.levels ?? [];
  const studyTips = roadmap?.studyTips ?? [];
  const examScheduleNote = roadmap?.examScheduleNote ?? '';

  const [activeId, setActiveId] = useState('n5');
  const [progress, setProgress] = useState(loadProgress);
  const {
    data: scheduleData,
    isLoading: scheduleLoading,
    isError: scheduleError,
    refetch: refetchSchedule,
    isFetching: scheduleFetching,
  } = useJlptDaNangScheduleQuery();

  const schedule =
    scheduleData ??
    (scheduleError && staticSchedule ? buildFallbackSchedule(staticSchedule) : null);

  const level = jlptLevels.find((l) => l.id === activeId) ?? jlptLevels[0];

  const allTaskIds = useMemo(
    () => level?.phases.flatMap((p) => p.tasks.map((t) => t.id)) ?? [],
    [level],
  );

  const doneCount = allTaskIds.filter((id) => progress[id]).length;
  const progressPct = allTaskIds.length
    ? Math.round((doneCount / allTaskIds.length) * 100)
    : 0;

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const toggleTask = (taskId: string) => {
    setProgress((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  if (roadmapLoading || !level) {
    return (
      <div className="container jlpt-roadmap">
        <p style={{ textAlign: 'center', padding: '2rem' }}>Đang tải lộ trình JLPT...</p>
      </div>
    );
  }

  return (
    <div className="container jlpt-roadmap">
      <header className="jlpt-header">
        <h2 className="view-title">Lộ trình luyện thi JLPT</h2>
        <p className="jlpt-subtitle">
          Lộ trình gắn Minna, Kanji KLL trong app — kèm sách luyện thi N5: Shin Nihongo no Kiso,
          Shin Kanzen Master, Sō-Matome (文法 · 語彙 · 漢字) và đề Choukai / Dokkai.
        </p>

        <div className="jlpt-level-tabs">
          {jlptLevels.map((lv) => (
            <button
              key={lv.id}
              type="button"
              className={`jlpt-level-tab ${activeId === lv.id ? 'active' : ''}`}
              style={{ '--level-color': lv.color } as React.CSSProperties}
              onClick={() => setActiveId(lv.id)}
            >
              <span className="jlpt-level-label">{lv.label}</span>
              <span className="jlpt-level-badge">{lv.badge}</span>
            </button>
          ))}
        </div>
      </header>

      <section className="jlpt-section jlpt-schedule glass-panel">
        <div className="jlpt-schedule-toolbar">
          <h3>📍 Lịch thi JLPT tại Đà Nẵng</h3>
          {schedule && (
            <div className="jlpt-sync-meta">
              <span
                className={`jlpt-sync-badge ${schedule.source === 'live' ? 'live' : 'fallback'}`}
              >
                {schedule.source === 'live' ? 'Đồng bộ UFL' : 'Dữ liệu dự phòng'}
              </span>
              <span className="jlpt-sync-time">
                Cập nhật: {formatFetchedAt(schedule.fetchedAt)}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => refetchSchedule()}
                disabled={scheduleFetching}
              >
                {scheduleFetching ? 'Đang tải…' : 'Làm mới'}
              </button>
            </div>
          )}
        </div>

        <p className="jlpt-schedule-intro">
          Điểm thi do{' '}
          <strong>{schedule?.organizer.shortName ?? staticSchedule?.organizer.shortName}</strong> tổ chức
          — 2 kỳ/năm (tháng 7 & 12). Thông báo JLPT được tự động lấy từ website UFL (không có API
          chính thức).
        </p>

        {scheduleLoading && !schedule && (
          <p className="jlpt-schedule-loading">Đang đồng bộ thông báo từ UFL…</p>
        )}

        {schedule && schedule.announcements.length > 0 && (
          <div className="jlpt-announcements">
            <h4>Thông báo JLPT mới nhất</h4>
            <ul className="jlpt-announcement-list">
              {schedule.announcements.map((item) => (
                <li key={item.url} className={`jlpt-announcement jlpt-announcement-${item.kind}`}>
                  <div className="jlpt-announcement-head">
                    <span className="jlpt-announcement-kind">
                      {ANNOUNCEMENT_KIND_LABEL[item.kind]}
                    </span>
                    {item.examDate && (
                      <span className="jlpt-announcement-date">Ngày thi: {item.examDate}</span>
                    )}
                  </div>
                  <a href={item.url} target="_blank" rel="noreferrer" className="jlpt-announcement-title">
                    {item.title}
                  </a>
                  {item.updatedAt && (
                    <span className="jlpt-announcement-updated">Cập nhật: {item.updatedAt}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {schedule && (
          <div className="jlpt-schedule-grid">
            <div className="jlpt-schedule-block">
              <h4>Địa điểm thi theo cấp độ</h4>
              <ul className="jlpt-venue-list">
                {schedule.venues.map((venue) => (
                  <li key={venue.address}>
                    <strong>{venue.levels}</strong>
                    <span>
                      {venue.address}, {venue.district}
                    </span>
                    {venue.note && <small>{venue.note}</small>}
                  </li>
                ))}
              </ul>
            </div>

            <div className="jlpt-schedule-block">
              <h4>Giờ thi trong ngày</h4>
              <ul className="jlpt-examday-list">
                {schedule.examDay.map((slot) => (
                  <li key={`${slot.levels}-${slot.venue}`}>
                    <strong>{slot.levels}</strong>
                    <span>
                      Có mặt {slot.arriveAt} · Thi {slot.startAt}
                    </span>
                    <small>{slot.venue}</small>
                  </li>
                ))}
              </ul>
              <p className="jlpt-briefing-note">{schedule.briefing}</p>
            </div>

            <div className="jlpt-schedule-block">
              <h4>Lệ phí & liên hệ</h4>
              <ul className="jlpt-fee-list">
                <li>
                  <span>Hồ sơ</span>
                  <strong>{schedule.fees.formFee}</strong>
                </li>
                <li>
                  <span>Lệ phí thi</span>
                  <strong>{schedule.fees.examFee}</strong>
                </li>
              </ul>
              <p className="jlpt-fee-note">{schedule.fees.note}</p>
              <address className="jlpt-contact">
                <span>{schedule.organizer.address}</span>
                <a href={`tel:${schedule.organizer.phone.replace(/\s/g, '')}`}>
                  {schedule.organizer.phone}
                </a>
                <a href={`mailto:${schedule.organizer.email}`}>{schedule.organizer.email}</a>
              </address>
            </div>
          </div>
        )}

        <div className="jlpt-schedule-actions">
          <a
            href={schedule?.organizer.website ?? staticSchedule?.organizer.website}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline jlpt-official-link"
          >
            Website UFL ↗
          </a>
          <a
            href={schedule?.organizer.registrationPortal ?? 'http://jlpt.ufl.udn.vn/'}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline jlpt-official-link"
          >
            Cổng đăng ký JLPT ↗
          </a>
        </div>
      </section>

      <section className="jlpt-overview glass-panel">
        <div className="jlpt-overview-top">
          <div>
            <h3>{level.label} — {level.badge}</h3>
            <p>{level.summary}</p>
          </div>
          <div className="jlpt-progress-ring" style={{ '--pct': progressPct, '--color': level.color } as React.CSSProperties}>
            <span>{progressPct}%</span>
            <small>hoàn thành</small>
          </div>
        </div>

        <div className="jlpt-stats">
          <div><strong>Thời gian</strong><span>{level.duration}</span></div>
          <div><strong>Từ vựng</strong><span>{level.vocabTarget}</span></div>
          <div><strong>Kanji</strong><span>{level.kanjiTarget}</span></div>
          <div><strong>Điểm đạt</strong><span>{level.passScore}</span></div>
        </div>

        <div className="jlpt-exam-grid">
          {level.examSections.map((sec) => (
            <div key={sec.name} className="jlpt-exam-card">
              <span className="jlpt-exam-name">{sec.name}</span>
              <span>{sec.points} điểm · {sec.time}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="jlpt-section">
        <h3>📚 Tài liệu & sách luyện thi</h3>
        <div className="jlpt-materials">
          {level.materials.map((mat) => (
            <article key={mat.title} className="jlpt-material-card glass-panel">
              <h4>{mat.title}</h4>
              <p>{mat.desc}</p>
              <span className="jlpt-scope">{mat.scope}</span>
              <div className="jlpt-material-links">
                {mat.inApp && (
                  <Link href={mat.inApp.to} className="btn btn-sm btn-primary">
                    {mat.inApp.label}
                  </Link>
                )}
                {'external' in mat && mat.external && (
                  <a
                    href={mat.external.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    {mat.external.label} ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="jlpt-section">
        <h3>🗓️ Lộ trình theo giai đoạn</h3>
        <div className="jlpt-timeline">
          {level.phases.map((phase, index) => (
            <article key={phase.id} className="jlpt-phase glass-panel">
              <div className="jlpt-phase-marker" style={{ background: level.color } as React.CSSProperties}>
                {index + 1}
              </div>
              <div className="jlpt-phase-body">
                <h4>{phase.title}</h4>
                <p className="jlpt-phase-sub">{phase.subtitle}</p>
                <ul className="jlpt-task-list">
                  {phase.tasks.map((task) => (
                    <li key={task.id} className={progress[task.id] ? 'done' : ''}>
                      <label className="jlpt-task-label">
                        <input
                          type="checkbox"
                          checked={!!progress[task.id]}
                          onChange={() => toggleTask(task.id)}
                        />
                        <span>{task.text}</span>
                      </label>
                      <div className="jlpt-task-actions">
                        {task.inApp && (
                          <Link href={task.inApp.to} className="jlpt-task-link">
                            {task.inApp.label}
                          </Link>
                        )}
                        {'external' in task && task.external && (
                          <a
                            href={task.external.url}
                            target="_blank"
                            rel="noreferrer"
                            className="jlpt-task-link external"
                          >
                            {task.external.label} ↗
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="jlpt-section jlpt-tips glass-panel">
        <h3>💡 Mẹo luyện thi</h3>
        <ul>
          {studyTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="jlpt-schedule-note">{examScheduleNote}</p>
        <a
          href="https://jlpt.jp/e/index.html"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline jlpt-official-link"
        >
          Trang JLPT chính thức ↗
        </a>
      </section>
    </div>
  );
}
