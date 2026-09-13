// Bổ sung từ vựng N1 đợt 5 — phần còn lại chưa dùng của nguồn OpenJLPT sau khi lọc
// trùng 3 lớp (kana, gốc kanji, suy đoán thể ます). Sau khi lọc, phần lớn "từ thiếu"
// hóa ra là kanji cổ/hiếm hoặc trùng dạng khác đã có (vd お早う=おはよう đã thêm ở N2,
// 天皇/すめらぎ trùng nghĩa với 天皇/てんのう đã có) — chỉ còn ~23 từ thực sự mới,
// cho thấy nguồn N1 gần như đã khai thác hết. lessonNumber 1039.
import type { JlptVocabUnit } from './jlpt-vocab.data';

export const JLPT_VOCAB_BOOST5_N1: JlptVocabUnit[] = [
  {
    lessonNumber: 1039,
    jlptLevel: 'N1',
    words: [
      { kana: 'アップ', romaji: 'appu', meaning: 'nâng lên, cải thiện', partOfSpeech: 'danh từ, động từ する' },
      { kana: 'アラブ', romaji: 'arabu', meaning: 'Ả Rập', partOfSpeech: 'danh từ' },
      { kana: 'アワー', romaji: 'awaa', meaning: 'giờ, khung giờ (như ラッシュアワー)', partOfSpeech: 'danh từ' },
      { kana: 'イエス', romaji: 'iesu', meaning: 'Chúa Giê-su', partOfSpeech: 'danh từ' },
      { kana: 'えい', romaji: 'ei', meaning: 'cá đuối', partOfSpeech: 'danh từ' },
      { kana: 'オーケー', romaji: 'ookee', meaning: 'đồng ý, ổn', partOfSpeech: 'thán từ' },
      { kana: 'オープン', romaji: 'oopun', meaning: 'mở, khai trương', partOfSpeech: 'danh từ, tính từ na, động từ する' },
      { kana: 'オレンジ', romaji: 'orenji', meaning: 'quả cam, màu cam', partOfSpeech: 'danh từ' },
      { kana: 'がる', romaji: 'garu', meaning: 'hậu tố: tỏ ra có vẻ, cảm thấy (như 寒がる)', partOfSpeech: 'tiếp vĩ ngữ' },
      { kana: 'クラブ', romaji: 'kurabu', meaning: 'câu lạc bộ', partOfSpeech: 'danh từ' },
      { kana: 'グラフ', romaji: 'gurafu', meaning: 'biểu đồ', partOfSpeech: 'danh từ' },
      { kana: 'サンキュー', romaji: 'sankyuu', meaning: 'cảm ơn (thân mật)', partOfSpeech: 'thán từ' },
      { kana: 'サンタクロース', romaji: 'santakuroosu', meaning: 'Ông già Noel', partOfSpeech: 'danh từ' },
      { kana: 'セックス', romaji: 'sekkusu', meaning: 'quan hệ tình dục, giới tính', partOfSpeech: 'danh từ' },
      { kana: 'タイム', romaji: 'taimu', meaning: 'thời gian; hết giờ (thể thao)', partOfSpeech: 'danh từ' },
      { kana: 'ダンプ', romaji: 'danpu', meaning: 'xe ben (xe tải đổ)', partOfSpeech: 'danh từ' },
      { kana: 'ドライブイン', romaji: 'doraibuin', meaning: 'quán ven đường cho xe hơi ghé', partOfSpeech: 'danh từ' },
      { kana: 'ニュー', romaji: 'nyuu', meaning: 'mới (tiếp đầu ngữ)', partOfSpeech: 'tiếp đầu ngữ' },
      { kana: 'バー', romaji: 'baa', meaning: 'quán bar', partOfSpeech: 'danh từ' },
      { kana: 'ファン', romaji: 'fan', meaning: 'người hâm mộ', partOfSpeech: 'danh từ' },
      { kana: 'ポーズ', romaji: 'poozu', meaning: 'tạm dừng; tư thế tạo dáng', partOfSpeech: 'danh từ' },
      { kana: 'ミュージック', romaji: 'myuujikku', meaning: 'âm nhạc', partOfSpeech: 'danh từ' },
      { kana: 'ヤング', romaji: 'yangu', meaning: 'trẻ, thuộc giới trẻ', partOfSpeech: 'danh từ, tính từ na' },
    ],
  },
];
