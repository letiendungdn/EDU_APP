'use client';

import Link from 'next/link';
import JlptMindMapShell from '../components/JlptMindMapShell';
import { KANJI_MIND_MAP } from '../data/kanji-mind-map';
import { useMindMapLevels } from '../hooks/useMindMapLevels';
import { useAuth } from '../hooks/useAuth';

export default function KanjiMindMapView() {
  const { isAdmin } = useAuth();
  const { maps, loading } = useMindMapLevels('KANJI', KANJI_MIND_MAP);

  return (
    <JlptMindMapShell
      title="Sơ đồ tư duy kanji"
      subtitle="JLPT N5 → N1 · nhóm nghĩa → chữ tiêu biểu · mở bảng kanji theo cấp"
      maps={maps}
      lessonPath="/kanji"
      loading={loading}
      kind="KANJI"
      headerLinks={
        <>
          <Link href="/kanji/list" className="btn btn-outline">
            Bảng Kanji JLPT
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
      footnote="Mẹo: phím ← / → đổi cấp N5–N1. Mỗi chữ mở bảng kanji theo cấp tương ứng."
    />
  );
}
