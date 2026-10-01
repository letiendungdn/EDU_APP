'use client';

import {
  isIrregularLanguage,
  personOf,
  type CountryPeopleLanguage,
} from '../data/country-people-language';
import { countryFlagEmoji } from '../utils/countryFlag';
import { playAudio } from '../utils/speech';

function Word({ ja, kana, romaji, strong }: { ja: string; kana: string; romaji: string; strong?: boolean }) {
  return (
    <button
      type="button"
      className={`cpl-word${strong ? ' cpl-word--irregular' : ''}`}
      onClick={() => playAudio(kana)}
      title="Bấm để nghe"
    >
      <span className="cpl-ja japanese-text">{ja}</span>
      {kana !== ja && <span className="cpl-kana japanese-text">{kana}</span>}
      <span className="cpl-romaji">{romaji}</span>
    </button>
  );
}

/** Bảng 国・人・語 — mỗi ô bấm để nghe; ngôn ngữ in đậm là ngoại lệ (không phải tên nước + 語). */
export default function CountryPeopleTable({ rows }: { rows: CountryPeopleLanguage[] }) {
  return (
    <div className="cpl-table-wrap">
      <table className="cpl-table">
        <thead>
          <tr>
            <th scope="col">Nước</th>
            <th scope="col">国 <small>Tên nước</small></th>
            <th scope="col">人 <small>Người</small></th>
            <th scope="col">語 <small>Ngôn ngữ</small></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const person = personOf(c);
            return (
              <tr key={c.code}>
                <th scope="row" className="cpl-vi">
                  <span aria-hidden>{countryFlagEmoji(c.code)}</span> {c.vi}
                </th>
                <td><Word ja={c.ja} kana={c.kana} romaji={c.romaji} /></td>
                <td><Word {...person} /></td>
                <td>
                  <div className="cpl-langs">
                    {c.languages.map((l) => (
                      <Word key={l.ja} {...l} strong={isIrregularLanguage(c, l)} />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
