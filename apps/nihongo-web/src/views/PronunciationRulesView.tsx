'use client';

import PronunciationRulesPanel from '../components/PronunciationRulesPanel';
import { useJapanesePronunciationRulesQuery } from '../hooks/queries';
import './PronunciationRulesView.css';

export default function PronunciationRulesView() {
  const { data: pronunciationRules, isLoading } = useJapanesePronunciationRulesQuery();

  return (
    <div className="container pronunciation-rules-view">
      <header className="pronunciation-rules-view-header">
        <h2 className="view-title">Quy tắc phát âm</h2>
        <p className="pronunciation-rules-view-subtitle">
          Nguyên âm, phụ âm, trường âm, âm đục, hàng âm và các quy tắc đọc thường gặp — có ví dụ
          nghe mẫu.
        </p>
      </header>

      {isLoading || !pronunciationRules ? (
        <div className="empty-state glass-panel">
          <p>Đang tải quy tắc phát âm...</p>
        </div>
      ) : (
        <PronunciationRulesPanel data={pronunciationRules} />
      )}
    </div>
  );

}
