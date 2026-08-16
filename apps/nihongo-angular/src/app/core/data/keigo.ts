export const KEIGO_ITEMS = [
  {
    plain: '行く',
    sonkei: 'いらっしゃる',
    kenjō: 'まいる',
    vi: 'đi',
  },
  {
    plain: '来る',
    sonkei: 'いらっしゃる',
    kenjō: 'まいる',
    vi: 'đến',
  },
  {
    plain: 'いる',
    sonkei: 'いらっしゃる',
    kenjō: 'おる',
    vi: 'ở / có (người)',
  },
  {
    plain: 'する',
    sonkei: 'なさる',
    kenjō: 'いたす',
    vi: 'làm',
  },
  {
    plain: '食べる',
    sonkei: '召し上がる',
    kenjō: 'いただく',
    vi: 'ăn',
  },
  {
    plain: '飲む',
    sonkei: '召し上がる',
    kenjō: 'いただく',
    vi: 'uống',
  },
  {
    plain: '言う',
    sonkei: 'おっしゃる',
    kenjō: '申す',
    vi: 'nói',
  },
  {
    plain: '見る',
    sonkei: 'ご覧になる',
    kenjō: '拝見する',
    vi: 'xem',
  },
  {
    plain: '知る',
    sonkei: 'ご存じだ',
    kenjō: '存じる',
    vi: 'biết',
  },
  {
    plain: 'もらう',
    sonkei: 'くださる',
    kenjō: 'いただく',
    vi: 'nhận',
  },
] as const;

export const KEIGO_LEVELS = [
  { id: 'da', label: 'だ・である', example: '学生だ', vi: 'Thân mật / văn viết' },
  { id: 'desu', label: 'です・ます', example: '学生です', vi: 'Lịch sự (丁寧語)' },
  { id: 'sonkei', label: '尊敬語', example: 'いらっしゃいます', vi: 'Tôn trọng người nghe/người khác' },
  { id: 'kenjo', label: '謙譲語', example: 'まいります', vi: 'Hạ mình (nói về mình)' },
] as const;
