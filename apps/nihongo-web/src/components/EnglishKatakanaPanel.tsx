'use client';

import { useEffect, useState } from 'react';
import {
  loadSpeechVoices,
  playAudio,
  SPEECH_LANG,
  speechTextFromJapanese,
} from '../utils/speech';
import type { EnglishKatakanaPayload } from '../types/reference';
import './EnglishKatakanaPanel.css';

interface EnglishKatakanaPanelProps {
  data: EnglishKatakanaPayload;
}

function speakJapanese(jp: string) {
  const text = speechTextFromJapanese(jp);
  if (text) playAudio(text, SPEECH_LANG.ja);
}

function speakEnglish(text: string) {
  const trimmed = text.trim();
  if (trimmed) playAudio(trimmed, 'en-US');
}

function speakVietnamese(text: string) {
  const trimmed = text.trim();
  if (trimmed) playAudio(trimmed, SPEECH_LANG.vi);
}

function AudioButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className="btn-audio-small english-katakana-audio"
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      🔊
    </button>
  );
}

export default function EnglishKatakanaPanel({ data }: EnglishKatakanaPanelProps) {
  const [openId, setOpenId] = useState<string>(data.sections[0]?.id ?? '');

  useEffect(() => {
    void loadSpeechVoices();
  }, []);

  return (
    <div className="english-katakana">
      <p className="english-katakana-intro glass-panel">{data.intro}</p>

      <div className="english-katakana-tips glass-panel">
        <h3 className="english-katakana-tips-title">Lưu ý cho người Việt</h3>
        <ul>
          {data.tipsForVietnamese.map((tip) => (
            <li key={tip}>
              <AudioButton onClick={() => speakVietnamese(tip)} label="Đọc gợi ý tiếng Việt" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="english-katakana-sections">
        {data.sections.map((section) => {
          const isOpen = openId === section.id;
          return (
            <div key={section.id} className="english-katakana-section glass-panel">
              <button
                type="button"
                className="english-katakana-section-header"
                onClick={() => setOpenId(isOpen ? '' : section.id)}
                aria-expanded={isOpen}
              >
                <span className="english-katakana-section-title">{section.title}</span>
                <span className="english-katakana-section-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="english-katakana-section-body">
                  <p className="english-katakana-summary">
                    <AudioButton
                      onClick={() => speakVietnamese(section.summary)}
                      label="Đọc tóm tắt tiếng Việt"
                    />
                    {section.summary}
                  </p>

                  {section.points && section.points.length > 0 && (
                    <ul className="english-katakana-points">
                      {section.points.map((point, idx) => (
                        <li key={idx}>
                          {(point.english || point.katakana) && (
                            <p className="english-katakana-pair-line">
                              {point.english && (
                                <>
                                  <AudioButton
                                    onClick={() => speakEnglish(point.english!)}
                                    label="Nghe tiếng Anh"
                                  />
                                  <span className="english-katakana-en">{point.english}</span>
                                </>
                              )}
                              {point.katakana && (
                                <>
                                  <span className="english-katakana-arrow">→</span>
                                  <AudioButton
                                    onClick={() => speakJapanese(point.katakana!)}
                                    label="Nghe katakana"
                                  />
                                  <span className="japanese-text english-katakana-kana">
                                    {point.katakana}
                                  </span>
                                </>
                              )}
                              {point.romaji && (
                                <span className="english-katakana-romaji">{point.romaji}</span>
                              )}
                            </p>
                          )}
                          <p className="english-katakana-explanation">
                            <AudioButton
                              onClick={() => speakVietnamese(point.explanation)}
                              label="Đọc giải thích tiếng Việt"
                            />
                            {point.explanation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.mappings && section.mappings.length > 0 && (
                    <div className="english-katakana-table-wrap">
                      <table className="english-katakana-table">
                        <thead>
                          <tr>
                            <th>Tiếng Anh</th>
                            <th>Katakana</th>
                            <th>Romaji</th>
                            <th>Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.mappings.map((row) => (
                            <tr key={`${row.english}-${row.katakana}`}>
                              <td>
                                <AudioButton
                                  onClick={() => speakEnglish(row.english)}
                                  label="Nghe tiếng Anh"
                                />
                                {row.english}
                              </td>
                              <td className="japanese-text">
                                <AudioButton
                                  onClick={() => speakJapanese(row.katakana)}
                                  label="Nghe katakana"
                                />
                                {row.katakana}
                              </td>
                              <td className="english-katakana-romaji">{row.romaji}</td>
                              <td className="english-katakana-note">{row.note ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.examples && section.examples.length > 0 && (
                    <div className="english-katakana-examples">
                      <h4>Ví dụ</h4>
                      <ul>
                        {section.examples.map((ex) => (
                          <li key={`${ex.english}-${ex.katakana}`}>
                            <span className="english-katakana-example-en">
                              <AudioButton
                                onClick={() => speakEnglish(ex.english)}
                                label="Nghe tiếng Anh"
                              />
                              {ex.english}
                            </span>
                            <span className="english-katakana-arrow">→</span>
                            <span className="japanese-text english-katakana-kana">
                              <AudioButton
                                onClick={() => speakJapanese(ex.katakana)}
                                label="Nghe katakana"
                              />
                              {ex.katakana}
                            </span>
                            <span className="english-katakana-romaji">{ex.romaji}</span>
                            <span className="english-katakana-meaning">— {ex.meaningVi}</span>
                            {ex.note && (
                              <span className="english-katakana-note">({ex.note})</span>
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
