'use client';

import { useState } from 'react';
import { playAudio } from '../utils/speech';
import type { JapanesePronunciationRulesPayload } from '../types/reference';
import './PronunciationRulesPanel.css';

interface PronunciationRulesPanelProps {
  data: JapanesePronunciationRulesPayload;
}

export default function PronunciationRulesPanel({ data }: PronunciationRulesPanelProps) {
  const [openId, setOpenId] = useState<string>(data.sections[0]?.id ?? '');

  return (
    <div className="pronunciation-rules">
      <p className="pronunciation-rules-intro glass-panel">{data.intro}</p>

      <div className="pronunciation-rules-tips glass-panel">
        <h3 className="pronunciation-rules-tips-title">Lưu ý cho người Việt</h3>
        <ul>
          {data.tipsForVietnamese.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="pronunciation-rules-sections">
        {data.sections.map((section) => {
          const isOpen = openId === section.id;
          return (
            <div key={section.id} className="pronunciation-rules-section glass-panel">
              <button
                type="button"
                className="pronunciation-rules-section-header"
                onClick={() => setOpenId(isOpen ? '' : section.id)}
                aria-expanded={isOpen}
              >
                <span className="pronunciation-rules-section-title">{section.title}</span>
                <span className="pronunciation-rules-section-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="pronunciation-rules-section-body">
                  <p className="pronunciation-rules-summary">{section.summary}</p>
                  <ul className="pronunciation-rules-points">
                    {section.points.map((point, idx) => (
                      <li key={idx}>
                        {point.label && (
                          <span className="pronunciation-rules-point-label">{point.label}</span>
                        )}
                        {(point.japanese || point.romaji) && (
                          <p className="pronunciation-rules-jp-line">
                            {point.japanese && (
                              <span className="japanese-text">{point.japanese}</span>
                            )}
                            {point.romaji && (
                              <span className="pronunciation-rules-romaji">{point.romaji}</span>
                            )}
                          </p>
                        )}
                        <p>{point.explanation}</p>
                      </li>
                    ))}
                  </ul>
                  {section.examples && section.examples.length > 0 && (
                    <div className="pronunciation-rules-examples">
                      <h4>Ví dụ</h4>
                      <ul>
                        {section.examples.map((ex) => (
                          <li key={`${ex.japanese}-${ex.romaji}`}>
                            <button
                              type="button"
                              className="pronunciation-rules-example-btn"
                              onClick={() => playAudio(ex.japanese)}
                              title="Nghe mẫu"
                            >
                              🔊
                            </button>
                            <span className="japanese-text">{ex.japanese}</span>
                            <span className="pronunciation-rules-romaji">{ex.romaji}</span>
                            <span className="pronunciation-rules-meaning">— {ex.meaning}</span>
                            {ex.note && (
                              <span className="pronunciation-rules-note">({ex.note})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
