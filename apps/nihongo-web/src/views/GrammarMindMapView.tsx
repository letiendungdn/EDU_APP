'use client';

import Link from 'next/link';
import JlptMindMapShell from '../components/JlptMindMapShell';
import { GRAMMAR_MIND_MAP } from '../data/grammar-mind-map';
import type { JlptMindMapLevel } from '../data/jlpt-mind-map-shared';
import { useMindMapLevels } from '../hooks/useMindMapLevels';
import { useAuth } from '../hooks/useAuth';

export default function GrammarMindMapView() {
  const { isAdmin } = useAuth();
  const { maps, loading } = useMindMapLevels(
    'GRAMMAR',
    GRAMMAR_MIND_MAP as JlptMindMapLevel[],
  );

  return (
    <JlptMindMapShell
      title="Sơ đồ tư duy ngữ pháp"
      subtitle="JLPT N5 → N1 · nhánh chủ đề → mẫu tiêu biểu · mở bài học tương ứng"
      maps={maps}
      lessonPath="/grammar"
      loading={loading}
      kind="GRAMMAR"
      headerLinks={
        <>
          <Link href="/grammar" className="btn btn-outline">
            Flashcard ngữ pháp
          </Link>
          <Link href="/vocab/mindmap" className="btn btn-outline">
            Sơ đồ từ vựng
          </Link>
          {isAdmin ? (
            <Link href="/admin/mind-maps" className="btn btn-outline">
              Sửa sơ đồ
            </Link>
          ) : null}
          <Link href="/jlpt" className="btn btn-primary">
            Lộ trình JLPT
          </Link>
        </>
      }
    />
  );
}
