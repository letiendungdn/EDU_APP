// Bổ sung từ vựng N3 đợt 5 — phần còn lại chưa dùng của nguồn OpenJLPT sau khi lọc
// trùng 3 lớp (kana chính xác, gốc kanji — bắt cặp thể từ điển/thể ます của cùng một
// từ như 唸る/唸ります, suy đoán thể ます cho động từ dạng từ điển) + loại các mục có
// field "reading" bị hỏng trong nguồn (chứa chú thích loại từ thay vì âm đọc thật,
// dẫn đến nghĩa bị gán nhầm sang từ đồng âm khác — vd "うん"→gán nhầm nghĩa "vận may").
// Sau khi lọc, phần lớn động từ/danh từ kanji trong danh sách 276 "từ thiếu" ban đầu
// hóa ra đã có sẵn dưới dạng ます — chỉ còn 31 từ (chủ yếu từ mượn/thán từ) thực sự mới.
// lessonNumber 355-356.
import type { JlptVocabUnit } from './jlpt-vocab.data';

export const JLPT_VOCAB_BOOST5_N3: JlptVocabUnit[] = [
  {
    lessonNumber: 355,
    jlptLevel: 'N3',
    words: [
      { kana: 'ありがとう', romaji: 'arigatou', meaning: 'cảm ơn', partOfSpeech: 'thán từ' },
      { kana: 'いらっしゃい', romaji: 'irasshai', meaning: 'chào mừng (nói với khách đến)', partOfSpeech: 'thán từ' },
      { kana: 'おめでとう', romaji: 'omedetou', meaning: 'chúc mừng!', partOfSpeech: 'thán từ' },
      { kana: 'カー', romaji: 'kaa', meaning: 'xe hơi (car)', partOfSpeech: 'danh từ' },
      { kana: 'キャプテン', romaji: 'kyaputen', meaning: 'đội trưởng, thuyền trưởng', partOfSpeech: 'danh từ' },
      { kana: 'キロ', romaji: 'kiro', meaning: 'ki-lô (viết tắt km/kg)', partOfSpeech: 'danh từ' },
      { kana: 'グランド', romaji: 'gurando', meaning: 'sân vận động lớn', partOfSpeech: 'danh từ' },
      { kana: 'こんにちは', romaji: 'konnichiha', meaning: 'xin chào (ban ngày)', partOfSpeech: 'thán từ' },
      { kanji: '仕舞う', kana: 'しまう', romaji: 'shimau', meaning: 'cất đi; (bổ trợ) làm xong hẳn', partOfSpeech: 'động từ nhóm 1' },
      { kana: 'スープ', romaji: 'suupu', meaning: 'súp', partOfSpeech: 'danh từ' },
      { kana: 'スター', romaji: 'sutaa', meaning: 'ngôi sao (nổi tiếng)', partOfSpeech: 'danh từ' },
      { kana: 'スタンド', romaji: 'sutando', meaning: 'giá đỡ, quầy hàng, khán đài', partOfSpeech: 'danh từ' },
      { kana: 'センター', romaji: 'sentaa', meaning: 'trung tâm', partOfSpeech: 'danh từ' },
      { kana: 'ダイヤ', romaji: 'daiya', meaning: 'kim cương; lịch trình tàu', partOfSpeech: 'danh từ' },
      { kana: 'たっぷり', romaji: 'tappuri', meaning: 'đầy đủ, dư dả', partOfSpeech: 'phó từ' },
      { kana: 'チーズ', romaji: 'chiizu', meaning: 'phô mai', partOfSpeech: 'danh từ' },
    ],
  },
  {
    lessonNumber: 356,
    jlptLevel: 'N3',
    words: [
      { kana: 'トップ', romaji: 'toppu', meaning: 'đứng đầu, hàng đầu', partOfSpeech: 'danh từ' },
      { kana: 'どんな', romaji: 'donna', meaning: 'loại nào, như thế nào', partOfSpeech: 'từ hạn định' },
      { kana: 'ノック', romaji: 'nokku', meaning: 'gõ cửa', partOfSpeech: 'danh từ, động từ する' },
      { kana: 'パーセント', romaji: 'paasento', meaning: 'phần trăm', partOfSpeech: 'danh từ' },
      { kana: 'パイプ', romaji: 'paipu', meaning: 'ống, tẩu thuốc', partOfSpeech: 'danh từ' },
      { kana: 'パイロット', romaji: 'pairotto', meaning: 'phi công', partOfSpeech: 'danh từ' },
      { kana: 'パス', romaji: 'pasu', meaning: 'đường đi, chuyền bóng, vượt qua', partOfSpeech: 'danh từ, động từ する' },
      { kana: 'バン', romaji: 'ban', meaning: 'xe van', partOfSpeech: 'danh từ' },
      { kana: 'ピン', romaji: 'pin', meaning: 'cái ghim', partOfSpeech: 'danh từ' },
      { kana: 'プラス', romaji: 'purasu', meaning: 'cộng, dấu cộng; tích cực', partOfSpeech: 'danh từ, động từ する' },
      { kana: 'ボーイ', romaji: 'boui', meaning: 'cậu bé; nhân viên phục vụ nam', partOfSpeech: 'danh từ' },
      { kana: 'ボート', romaji: 'booto', meaning: 'thuyền, xuồng', partOfSpeech: 'danh từ' },
      { kana: 'マーケット', romaji: 'maaketto', meaning: 'chợ, thị trường', partOfSpeech: 'danh từ' },
      { kana: 'ママ', romaji: 'mama', meaning: 'mẹ (cách gọi thân mật)', partOfSpeech: 'danh từ' },
      { kana: 'より', romaji: 'yori', meaning: 'hơn (so sánh)', partOfSpeech: 'trợ từ' },
      { kana: 'よると', romaji: 'yoruto', meaning: 'theo như, dựa theo', partOfSpeech: 'cụm từ' },
    ],
  },
];
