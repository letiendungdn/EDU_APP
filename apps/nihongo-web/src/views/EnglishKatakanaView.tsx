'use client';

import EnglishKatakanaPanel from '../components/EnglishKatakanaPanel';
import { useEnglishKatakanaQuery } from '../hooks/queries';
import './EnglishKatakanaView.css';

export default function EnglishKatakanaView() {
  const { data, isLoading } = useEnglishKatakanaQuery();

  return (
    <div className="container english-katakana-view">
      <header className="english-katakana-view-header">
        <h2 className="view-title">Tiếng Anh ↔ Katakana</h2>
        <p className="english-katakana-view-subtitle">
          6 quy luật chuyển âm giáo trình hay bỏ sót, bảng map âm, trường âm ー, âm ngắt ッ và từ
          thường gặp — có nghe mẫu.
        </p>
      </header>

      {isLoading || !data ? (
        <div className="empty-state glass-panel">
          <p>Đang tải nội dung...</p>
        </div>
      ) : (
        <EnglishKatakanaPanel data={data} />
      )}
    </div>
  );
}
