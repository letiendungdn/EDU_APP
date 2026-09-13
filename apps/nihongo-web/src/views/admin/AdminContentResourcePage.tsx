'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  createLesson,
  deleteAdminExamResult,
  deleteLesson,
  fetchAdminExamResults,
  fetchAdminUsers,
  fetchLessons,
  updateAdminUserRole,
  updateLesson,
  type AdminExamResult,
} from '../../api';
import { useAuth } from '../../hooks/useAuth';
import type { AdminUserSummary, Lesson } from '../../types/api';
import AdminVocabByLessonView from './AdminVocabByLessonView';
import AdminGrammarByLessonView from './AdminGrammarByLessonView';
import AdminExercisesByLessonView from './AdminExercisesByLessonView';
import AdminKanjiByLessonView from './AdminKanjiByLessonView';
import AdminKanjiLessonsView from './AdminKanjiLessonsView';
import AdminReadingView from './AdminReadingView';
import AdminMockExamsView from './AdminMockExamsView';
import {
  ADMIN_CONTENT_RESOURCES,
  getAdminResourceMeta,
  isAdminContentResource,
  type AdminContentResource,
} from '../../config/adminResources';
import '../admin/AdminPages.css';

export { ADMIN_CONTENT_RESOURCES };
export type { AdminContentResource };

function isResource(value: string): value is AdminContentResource {
  return isAdminContentResource(value);
}

function PanelShell({
  resource,
  children,
}: {
  resource: AdminContentResource;
  children: React.ReactNode;
}) {
  const meta = getAdminResourceMeta(resource);
  return (
    <div className="admin-content-page">
      <div className="admin-content-header">
        <Link href="/admin" className="admin-content-back">
          ← Dashboard
        </Link>
        <h1>
          <span aria-hidden>{meta?.icon}</span> {meta?.title}
        </h1>
        <p>{meta?.hint}</p>
      </div>
      {children}
    </div>
  );
}

function LessonsCrud() {
  const { token } = useAuth();
  const [items, setItems] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonNumber, setLessonNumber] = useState('');
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState<Lesson | null>(null);
  const [tab, setTab] = useState<'vocab' | 'grammar' | 'exercises' | 'meta'>('vocab');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchLessons());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được lessons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    const num = Number(lessonNumber);
    if (!Number.isFinite(num) || num < 1) {
      setError('lessonNumber phải ≥ 1');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (editing) {
        await updateLesson(editing.id, { lessonNumber: num, title: title || undefined }, token);
      } else {
        await createLesson({ lessonNumber: num, title: title || undefined }, token);
      }
      setEditing(null);
      setLessonNumber('');
      setTitle('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(item: Lesson) {
    if (!token) return;
    if (!confirm(`Xoá lesson #${item.lessonNumber}? Nội dung liên quan có thể bị ảnh hưởng.`)) return;
    setBusy(true);
    try {
      await deleteLesson(item.id, token);
      if (opened?.id === item.id) setOpened(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xoá thất bại');
    } finally {
      setBusy(false);
    }
  }

  function openLesson(item: Lesson, nextTab: typeof tab = 'vocab') {
    setOpened(item);
    setTab(nextTab);
    setEditing(null);
  }

  if (opened) {
    return (
      <div className="admin-lesson-workspace">
        <div className="glass-panel admin-lesson-workspace__bar">
          <button type="button" className="btn btn-nav" onClick={() => setOpened(null)}>
            ← Danh sách lessons
          </button>
          <div>
            <strong>
              #{opened.lessonNumber} · {opened.title ?? `Bài ${opened.lessonNumber}`}
            </strong>
            <div className="admin-lesson-workspace__meta">
              id={opened.id}
              {opened.jlptLevel ? ` · ${opened.jlptLevel}` : ''}
              {opened._count
                ? ` · ${opened._count.vocabularies} TV / ${opened._count.grammars} NP / ${opened._count.exercises} BT`
                : ''}
            </div>
          </div>
        </div>
        <div className="admin-lesson-tabs">
          {(
            [
              ['vocab', 'Từ vựng'],
              ['grammar', 'Ngữ pháp'],
              ['exercises', 'Bài tập'],
              ['meta', 'Sửa tiêu đề'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`admin-lesson-tab${tab === id ? ' is-active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'vocab' && (
          <AdminVocabByLessonView initialLessonNumber={opened.lessonNumber} />
        )}
        {tab === 'grammar' && (
          <AdminGrammarByLessonView initialLessonNumber={opened.lessonNumber} />
        )}
        {tab === 'exercises' && (
          <AdminExercisesByLessonView
            initialLessonId={opened.id}
            initialLessonNumber={opened.lessonNumber}
          />
        )}
        {tab === 'meta' && (
          <form
            className="glass-panel admin-content-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!token) return;
              setBusy(true);
              setError(null);
              try {
                const updated = await updateLesson(
                  opened.id,
                  {
                    lessonNumber: Number(lessonNumber) || opened.lessonNumber,
                    title: title || undefined,
                  },
                  token,
                );
                setOpened(updated);
                setEditing(null);
                await load();
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Lưu thất bại');
              } finally {
                setBusy(false);
              }
            }}
          >
            <strong>Sửa thông tin lesson</strong>
            <div className="admin-content-form-row">
              <label>
                Số bài
                <input
                  type="number"
                  min={1}
                  value={lessonNumber || String(opened.lessonNumber)}
                  onChange={(e) => setLessonNumber(e.target.value)}
                  required
                />
              </label>
              <label>
                Tiêu đề
                <input
                  value={title || (opened.title ?? '')}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bài 1"
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                Lưu
              </button>
            </div>
            {error && <p className="admin-content-error">{error}</p>}
          </form>
        )}
      </div>
    );
  }

  return (
    <>
      <form className="glass-panel admin-content-form" onSubmit={onSubmit}>
        <strong>{editing ? `Sửa meta #${editing.lessonNumber}` : 'Thêm lesson'}</strong>
        <div className="admin-content-form-row">
          <label>
            Số bài
            <input
              type="number"
              min={1}
              value={lessonNumber}
              onChange={(e) => setLessonNumber(e.target.value)}
              required
            />
          </label>
          <label>
            Tiêu đề
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Minna 1 / JLPT N5…" />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {editing ? 'Cập nhật' : 'Thêm'}
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-nav"
              onClick={() => {
                setEditing(null);
                setLessonNumber('');
                setTitle('');
              }}
            >
              Huỷ
            </button>
          )}
        </div>
      </form>
      {error && <p className="admin-content-error">{error}</p>}
      {loading ? (
        <p>Đang tải…</p>
      ) : (
        <div className="glass-panel admin-content-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bài</th>
                <th>Tiêu đề</th>
                <th>JLPT</th>
                <th>TV / NP / BT</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="admin-lesson-row">
                  <td>{item.id}</td>
                  <td>#{item.lessonNumber}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-lesson-title-btn"
                      onClick={() => openLesson(item, 'vocab')}
                      title="Mở sửa từ vựng / ngữ pháp trong bài"
                    >
                      {item.title ?? `Bài ${item.lessonNumber}`}
                    </button>
                  </td>
                  <td>{item.jlptLevel ?? '—'}</td>
                  <td>
                    {item._count
                      ? `${item._count.vocabularies}/${item._count.grammars}/${item._count.exercises}`
                      : '—'}
                  </td>
                  <td className="admin-content-actions">
                    <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => openLesson(item)}>
                      Nội dung
                    </button>
                    <button
                      type="button"
                      className="btn btn-nav btn-sm"
                      disabled={busy}
                      onClick={() => {
                        setEditing(item);
                        setLessonNumber(String(item.lessonNumber));
                        setTitle(item.title ?? '');
                      }}
                    >
                      Meta
                    </button>
                    <button type="button" className="btn btn-nav btn-sm" disabled={busy} onClick={() => void onDelete(item)}>
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-content-hint">Click tiêu đề hoặc «Nội dung» để sửa từ vựng / ngữ pháp / bài tập trong bài.</p>
        </div>
      )}
    </>
  );
}

function UsersCrud() {
  const { token } = useAuth();
  const [items, setItems] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchAdminUsers(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onRole(userId: number, role: 'USER' | 'TEACHER' | 'ADMIN') {
    if (!token) return;
    setBusyId(userId);
    try {
      await updateAdminUserRole(token, userId, role);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đổi role thất bại');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {error && <p className="admin-content-error">{error}</p>}
      {loading ? (
        <p>Đang tải…</p>
      ) : (
        <div className="glass-panel admin-content-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Tên</th>
                <th>Role</th>
                <th>Exam</th>
                <th>Tạo lúc</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.name ?? '—'}</td>
                  <td>
                    <select
                      value={u.role}
                      disabled={busyId === u.id}
                      onChange={(e) =>
                        void onRole(u.id, e.target.value as 'USER' | 'TEACHER' | 'ADMIN')
                      }
                    >
                      <option value="USER">USER</option>
                      <option value="TEACHER">TEACHER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>{u._count.examResults}</td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ExamResultsCrud() {
  const { token } = useAuth();
  const [items, setItems] = useState<AdminExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchAdminExamResults(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải exam results');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(id: number) {
    if (!token) return;
    if (!confirm(`Xoá kết quả #${id}?`)) return;
    setBusy(true);
    try {
      await deleteAdminExamResult(token, id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xoá thất bại');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {error && <p className="admin-content-error">{error}</p>}
      {loading ? (
        <p>Đang tải…</p>
      ) : (
        <div className="glass-panel admin-content-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Level</th>
                <th>Title</th>
                <th>Score</th>
                <th>Pass</th>
                <th>Nộp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.user?.email ?? '—'}</td>
                  <td>{r.level}</td>
                  <td>{r.title}</td>
                  <td>
                    {r.correctCount}/{r.total} ({Math.round(r.percent)}%)
                  </td>
                  <td>{r.passed ? '✓' : '—'}</td>
                  <td>{new Date(r.submittedAt).toLocaleString()}</td>
                  <td>
                    <button type="button" className="btn btn-nav" disabled={busy} onClick={() => void onDelete(r.id)}>
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminContentResourcePage() {
  const params = useParams<{ resource: string }>();
  const resourceParam = useMemo(() => String(params?.resource ?? ''), [params]);

  if (!isResource(resourceParam)) {
    return (
      <div style={{ padding: 28 }}>
        <p>Không có mục “{resourceParam}”.</p>
        <Link href="/admin">← Dashboard</Link>
      </div>
    );
  }

  const resource = resourceParam;

  if (resource === 'vocabularies') {
    return (
      <PanelShell resource={resource}>
        <AdminVocabByLessonView />
      </PanelShell>
    );
  }
  if (resource === 'grammars') {
    return (
      <PanelShell resource={resource}>
        <AdminGrammarByLessonView />
      </PanelShell>
    );
  }
  if (resource === 'exercises') {
    return (
      <PanelShell resource={resource}>
        <AdminExercisesByLessonView />
      </PanelShell>
    );
  }
  if (resource === 'kanjiLessons') {
    return (
      <PanelShell resource={resource}>
        <AdminKanjiLessonsView />
      </PanelShell>
    );
  }
  if (resource === 'kanjiEntries') {
    return (
      <PanelShell resource={resource}>
        <AdminKanjiByLessonView />
      </PanelShell>
    );
  }
  if (resource === 'reading') {
    return (
      <PanelShell resource={resource}>
        <AdminReadingView />
      </PanelShell>
    );
  }
  if (resource === 'mockExams') {
    return (
      <PanelShell resource={resource}>
        <AdminMockExamsView />
      </PanelShell>
    );
  }

  return (
    <PanelShell resource={resource}>
      {resource === 'lessons' && <LessonsCrud />}
      {resource === 'users' && <UsersCrud />}
      {resource === 'examResults' && <ExamResultsCrud />}
    </PanelShell>
  );
}
