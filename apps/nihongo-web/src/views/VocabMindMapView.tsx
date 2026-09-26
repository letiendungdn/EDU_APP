'use client';

import Link from 'next/link';
import JlptMindMapShell from '../components/JlptMindMapShell';
import { VOCAB_MIND_MAP } from '../data/vocab-mind-map';
import { useMindMapLevels } from '../hooks/useMindMapLevels';
import { useAuth } from '../hooks/useAuth';

export default function VocabMindMapView() {
  const { isAdmin } = useAuth();
  const { maps, loading } = useMindMapLevels('VOCAB', VOCAB_MIND_MAP);

  return (
    <JlptMindMapShell
      title="Sơ đồ tư duy từ vựng"
      subtitle="JLPT N5 → N1 · nhánh chủ đề → từ tiêu biểu · mở bài học tương ứng"
      maps={maps}
      lessonPath="/vocab"
      loading={loading}
      kind="VOCAB"
      headerLinks={
        <>
          <Link href="/vocab" className="btn btn-outline">
            Flashcard từ vựng
          </Link>
          <Link href="/kanji/mindmap" className="btn btn-outline">
            Sơ đồ kanji
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
