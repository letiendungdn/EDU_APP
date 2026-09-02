/**
 * Generates jlpt-kanji-gap-fill.data.ts from OpenJLPT + KanjiDictVN sources.
 * Run: node scripts/build-jlpt-kanji-gap-fill.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const tmp = path.join(__dirname, '_tmp');

const KATA_TO_HIRA = Object.fromEntries(
  [...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
   ...'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴァィゥェォャュョッー'].map((k, i) => [
    k,
    'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'[
      i
    ] ??
      ({ ガ: 'が', ギ: 'ぎ', グ: 'ぐ', ゲ: 'げ', ゴ: 'ご', ザ: 'ざ', ジ: 'じ', ズ: 'ず', ゼ: 'ぜ', ゾ: 'ぞ', ダ: 'だ', ヂ: 'ぢ', ヅ: 'づ', デ: 'で', ド: 'ど', バ: 'ば', ビ: 'び', ブ: 'ぶ', ベ: 'べ', ボ: 'ぼ', パ: 'ぱ', ピ: 'ぴ', プ: 'ぷ', ペ: 'ぺ', ポ: 'ぽ', ヴ: 'ゔ', ァ: 'ぁ', ィ: 'ぃ', ゥ: 'ぅ', ェ: 'ぇ', ォ: 'ぉ', ャ: 'ゃ', ュ: 'ゅ', ョ: 'ょ', ッ: 'っ', ー: 'ー' }[k] ??
        k),
  ]),
);

function kataToHira(s) {
  let out = '';
  for (const ch of s) out += KATA_TO_HIRA[ch] ?? ch;
  return out;
}

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(tmp, name), 'utf8'));
}

function loadExisting() {
  const chars = new Set();
  const meta = new Map();
  for (const f of ['jlpt-kanji.data.ts', 'jlpt-kanji-expand.data.ts']) {
    const text = fs.readFileSync(path.join(root, f), 'utf8');
    const re =
      /\{\s*character:\s*'([^']+)',\s*hanViet:\s*'([^']+)'(?:,\s*onyomi:\s*'([^']*)')?(?:,\s*kunyomi:\s*'([^']*)')?,\s*meaningVi:\s*'([^']*)'(?:,\s*strokeCount:\s*(\d+))?\s*\}/g;
    let m;
    while ((m = re.exec(text))) {
      chars.add(m[1]);
      if (!meta.has(m[1])) {
        meta.set(m[1], {
          hanViet: m[2],
          onyomi: m[3] || undefined,
          kunyomi: m[4] || undefined,
          meaningVi: m[5],
          strokeCount: m[6] ? Number(m[6]) : undefined,
        });
      }
    }
  }
  return { chars, meta };
}

function loadVnDict() {
  const map = new Map();
  for (const f of ['kanji_bank_1.json', 'kanji_bank_2.json']) {
    const rows = loadJson(f);
    for (const row of rows) {
      const [character, hanVietRaw, , , meanings] = row;
      if (!character || map.has(character)) continue;
      const hvMatch = hanVietRaw?.match(/\[([^\]]+)\]/);
      const hv = (hvMatch?.[1] ?? hanVietRaw?.split(/\s+/)[0] ?? '').trim();
      const meaningVi = (meanings?.[0] ?? '')
        .replace(/^\[[^\]]+\]\s*/, '')
        .trim();
      map.set(character, {
        hanViet: hv ? hv.normalize('NFC').toUpperCase() : undefined,
        meaningVi: meaningVi || undefined,
        strokeCount: row[5]?.Strokes ? Number(row[5].Strokes) : undefined,
      });
    }
  }
  return map;
}

function byFreq(arr) {
  return [...arr].sort((a, b) => (a.freq ?? 9999) - (b.freq ?? 9999));
}

function pickKanji() {
  const data = {
    n3: loadJson('n3.json'),
    n2: loadJson('n2.json'),
    n1: loadJson('n1.json'),
    n4: loadJson('n4.json'),
  };
  const { chars: existing } = loadExisting();
  const used = new Set();

  const n3pick = byFreq(data.n3.filter((k) => !existing.has(k.character))).slice(0, 138);
  n3pick.forEach((k) => used.add(k.character));

  let n2pick = byFreq(
    data.n2.filter((k) => !existing.has(k.character) && !used.has(k.character)),
  ).slice(0, 308);
  if (n2pick.length < 308) {
    const extra = byFreq(
      data.n3.filter(
        (k) =>
          !existing.has(k.character) &&
          !used.has(k.character) &&
          !n3pick.some((x) => x.character === k.character),
      ),
    );
    n2pick = [...n2pick, ...extra].slice(0, 308);
  }
  n2pick.forEach((k) => used.add(k.character));

  let n1pick = byFreq(
    data.n1.filter((k) => !existing.has(k.character) && !used.has(k.character)),
  ).slice(0, 1275);
  if (n1pick.length < 1275) {
    const pool = byFreq(
      [...data.n1, ...data.n2, ...data.n3, ...data.n4].filter(
        (k) =>
          !existing.has(k.character) &&
          !used.has(k.character) &&
          !n1pick.some((x) => x.character === k.character),
      ),
    );
    n1pick = [...n1pick, ...pool].slice(0, 1275);
  }

  return { N3: n3pick, N2: n2pick, N1: n1pick };
}

const EN_VI = {
  politics: 'chính trị',
  government: 'chính phủ',
  deliberation: 'bàn bạc',
  consultation: 'tham vấn',
  debate: 'tranh luận',
  people: 'dân chúng',
  nation: 'quốc gia',
  country: 'đất nước',
  power: 'quyền lực',
  right: 'quyền lợi',
  law: 'pháp luật',
  rule: 'quy tắc',
  change: 'thay đổi',
  move: 'di chuyển',
  go: 'đi',
  come: 'đến',
  see: 'nhìn',
  hear: 'nghe',
  say: 'nói',
  think: 'suy nghĩ',
  know: 'biết',
  work: 'làm việc',
  study: 'học',
  teach: 'dạy',
  write: 'viết',
  read: 'đọc',
  buy: 'mua',
  sell: 'bán',
  eat: 'ăn',
  drink: 'uống',
  water: 'nước',
  fire: 'lửa',
  tree: 'cây',
  mountain: 'núi',
  river: 'sông',
  sea: 'biển',
  sky: 'trời',
  earth: 'đất',
  person: 'người',
  child: 'trẻ em',
  woman: 'phụ nữ',
  man: 'đàn ông',
  friend: 'bạn',
  family: 'gia đình',
  house: 'nhà',
  room: 'phòng',
  door: 'cửa',
  road: 'đường',
  car: 'xe',
  train: 'tàu',
  time: 'thời gian',
  day: 'ngày',
  month: 'tháng',
  year: 'năm',
  morning: 'buổi sáng',
  evening: 'buổi tối',
  big: 'lớn',
  small: 'nhỏ',
  long: 'dài',
  short: 'ngắn',
  high: 'cao',
  low: 'thấp',
  new: 'mới',
  old: 'cũ',
  good: 'tốt',
  bad: 'xấu',
  hot: 'nóng',
  cold: 'lạnh',
  fast: 'nhanh',
  slow: 'chậm',
  strong: 'mạnh',
  weak: 'yếu',
  happy: 'vui',
  sad: 'buồn',
  love: 'yêu',
  hate: 'ghét',
  life: 'cuộc sống',
  death: 'cái chết',
  health: 'sức khỏe',
  disease: 'bệnh tật',
  money: 'tiền',
  price: 'giá',
  company: 'công ty',
  business: 'kinh doanh',
  market: 'thị trường',
  product: 'sản phẩm',
  production: 'sản xuất',
  technology: 'công nghệ',
  science: 'khoa học',
  art: 'nghệ thuật',
  culture: 'văn hóa',
  history: 'lịch sử',
  society: 'xã hội',
  nature: 'thiên nhiên',
  environment: 'môi trường',
  war: 'chiến tranh',
  peace: 'hòa bình',
  danger: 'nguy hiểm',
  safe: 'an toàn',
  true: 'đúng',
  false: 'sai',
  reason: 'lý do',
  result: 'kết quả',
  method: 'phương pháp',
  problem: 'vấn đề',
  answer: 'câu trả lời',
  question: 'câu hỏi',
  idea: 'ý tưởng',
  plan: 'kế hoạch',
  hope: 'hy vọng',
  fear: 'sợ hãi',
  effort: 'nỗ lực',
  success: 'thành công',
  failure: 'thất bại',
  begin: 'bắt đầu',
  end: 'kết thúc',
  increase: 'tăng',
  decrease: 'giảm',
  open: 'mở',
  close: 'đóng',
  inside: 'bên trong',
  outside: 'bên ngoài',
  above: 'phía trên',
  below: 'phía dưới',
  before: 'trước',
  after: 'sau',
  east: 'đông',
  west: 'tây',
  south: 'nam',
  north: 'bắc',
  center: 'trung tâm',
  part: 'phần',
  whole: 'toàn bộ',
  same: 'giống nhau',
  different: 'khác nhau',
  important: 'quan trọng',
  necessary: 'cần thiết',
  possible: 'có thể',
  impossible: 'không thể',
  special: 'đặc biệt',
  general: 'chung',
  public: 'công cộng',
  private: 'riêng tư',
  official: 'chính thức',
  formal: 'trang trọng',
  real: 'thật',
  fake: 'giả',
  clear: 'rõ ràng',
  dark: 'tối',
  light: 'ánh sáng',
  color: 'màu sắc',
  shape: 'hình dạng',
  size: 'kích thước',
  number: 'số',
  amount: 'số lượng',
  degree: 'mức độ',
  level: 'cấp độ',
  position: 'vị trí',
  direction: 'hướng',
  speed: 'tốc độ',
  weight: 'trọng lượng',
  length: 'chiều dài',
  width: 'chiều rộng',
  height: 'chiều cao',
  depth: 'độ sâu',
  surface: 'bề mặt',
  material: 'vật liệu',
  tool: 'công cụ',
  machine: 'máy móc',
  energy: 'năng lượng',
  force: 'lực',
  pressure: 'áp lực',
  temperature: 'nhiệt độ',
  sound: 'âm thanh',
  voice: 'giọng nói',
  language: 'ngôn ngữ',
  word: 'từ',
  sentence: 'câu',
  book: 'sách',
  paper: 'giấy',
  picture: 'hình ảnh',
  music: 'âm nhạc',
  sport: 'thể thao',
  game: 'trò chơi',
  food: 'thức ăn',
  drink: 'đồ uống',
  clothing: 'quần áo',
  body: 'cơ thể',
  head: 'đầu',
  hand: 'tay',
  foot: 'chân',
  eye: 'mắt',
  ear: 'tai',
  mouth: 'miệng',
  heart: 'trái tim',
  blood: 'máu',
  bone: 'xương',
  skin: 'da',
  hair: 'tóc',
  plant: 'cây cối',
  flower: 'hoa',
  fruit: 'hoa quả',
  animal: 'động vật',
  bird: 'chim',
  fish: 'cá',
  insect: 'côn trùng',
  stone: 'đá',
  metal: 'kim loại',
  gold: 'vàng',
  silver: 'bạc',
  iron: 'sắt',
  wood: 'gỗ',
  glass: 'thủy tinh',
  cloth: 'vải',
  rice: 'gạo',
  meat: 'thịt',
  vegetable: 'rau',
  salt: 'muối',
  sugar: 'đường',
  oil: 'dầu',
  wind: 'gió',
  rain: 'mưa',
  snow: 'tuyết',
  cloud: 'mây',
  sun: 'mặt trời',
  moon: 'mặt trăng',
  star: 'ngôi sao',
  season: 'mùa',
  spring: 'mùa xuân',
  summer: 'mùa hè',
  autumn: 'mùa thu',
  winter: 'mùa đông',
  school: 'trường học',
  hospital: 'bệnh viện',
  office: 'văn phòng',
  factory: 'nhà máy',
  shop: 'cửa hàng',
  bank: 'ngân hàng',
  church: 'nhà thờ',
  temple: 'đền',
  park: 'công viên',
  garden: 'vườn',
  field: ' cánh đồng',
  forest: 'rừng',
  island: 'đảo',
  bridge: 'cầu',
  port: 'cảng',
  airport: 'sân bay',
  station: 'ga',
  border: 'biên giới',
  capital: 'thủ đô',
  city: 'thành phố',
  village: 'làng',
  address: 'địa chỉ',
  name: 'tên',
  age: 'tuổi',
  birth: 'sinh',
  marriage: 'kết hôn',
  parent: 'cha mẹ',
  father: 'cha',
  mother: 'mẹ',
  brother: 'anh em trai',
  sister: 'chị em gái',
  son: 'con trai',
  daughter: 'con gái',
  husband: 'chồng',
  wife: 'vợ',
  king: 'vua',
  soldier: 'binh sĩ',
  doctor: 'bác sĩ',
  teacher: 'giáo viên',
  student: 'học sinh',
  farmer: 'nông dân',
  worker: 'công nhân',
  manager: 'quản lý',
  leader: 'lãnh đạo',
  citizen: 'công dân',
  guest: 'khách',
  enemy: 'kẻ thù',
  ally: 'đồng minh',
  agreement: 'thỏa thuận',
  contract: 'hợp đồng',
  promise: 'lời hứa',
  duty: 'nghĩa vụ',
  responsibility: 'trách nhiệm',
  freedom: 'tự do',
  equality: 'bình đẳng',
  justice: 'công lý',
  crime: 'tội ác',
  punishment: 'hình phạt',
  trial: 'phiên tòa',
  evidence: 'chứng cứ',
  truth: 'sự thật',
  lie: 'lời nói dối',
  mistake: 'sai lầm',
  accident: 'tai nạn',
  disaster: 'thảm họa',
  damage: 'thiệt hại',
  repair: 'sửa chữa',
  build: 'xây dựng',
  destroy: 'phá hủy',
  create: 'tạo ra',
  destroy: 'tiêu diệt',
  use: 'sử dụng',
  need: 'cần',
  want: 'muốn',
  give: 'cho',
  receive: 'nhận',
  send: 'gửi',
  bring: 'mang',
  take: 'lấy',
  hold: 'cầm',
  put: 'đặt',
  stand: 'đứng',
  sit: 'ngồi',
  sleep: 'ngủ',
  wake: 'thức dậy',
  run: 'chạy',
  walk: 'đi bộ',
  fly: 'bay',
  swim: 'bơi',
  climb: 'leo',
  fall: 'ngã',
  rise: 'dâng lên',
  push: 'đẩy',
  pull: 'kéo',
  throw: 'ném',
  catch: 'bắt',
  hit: 'đánh',
  cut: 'cắt',
  break: 'vỡ',
  fix: 'sửa',
  join: 'nối',
  separate: 'tách',
  mix: 'trộn',
  divide: 'chia',
  compare: 'so sánh',
  choose: 'chọn',
  decide: 'quyết định',
  allow: 'cho phép',
  forbid: 'cấm',
  protect: 'bảo vệ',
  attack: 'tấn công',
  defend: 'phòng thủ',
  win: 'thắng',
  lose: 'thua',
  help: 'giúp đỡ',
  support: 'hỗ trợ',
  oppose: 'phản đối',
  agree: 'đồng ý',
  refuse: 'từ chối',
  accept: 'chấp nhận',
  reject: 'bác bỏ',
  express: 'bày tỏ',
  explain: 'giải thích',
  understand: 'hiểu',
  remember: 'nhớ',
  forget: 'quên',
  believe: 'tin',
  doubt: 'nghi ngờ',
  worry: 'lo lắng',
  enjoy: 'thích thú',
  suffer: 'chịu đựng',
  praise: 'khen ngợi',
  criticize: 'phê phán',
  respect: 'tôn trọng',
  insult: 'xúc phạm',
  apologize: 'xin lỗi',
  thank: 'cảm ơn',
  welcome: 'chào đón',
  visit: 'thăm',
  invite: 'mời',
  meet: 'gặp',
  leave: 'rời',
  return: 'trở về',
  arrive: 'đến nơi',
  depart: 'khởi hành',
  travel: 'du lịch',
  live: 'sống',
  die: 'chết',
  born: 'sinh ra',
  grow: 'lớn lên',
  develop: 'phát triển',
  improve: 'cải thiện',
  worsen: 'xấu đi',
  continue: 'tiếp tục',
  stop: 'dừng',
  wait: 'chờ',
  hurry: 'vội vàng',
  rest: 'nghỉ ngơi',
  prepare: 'chuẩn bị',
  finish: 'hoàn thành',
  attempt: 'cố gắng',
  achieve: 'đạt được',
  maintain: 'duy trì',
  manage: 'quản lý',
  organize: 'tổ chức',
  arrange: 'sắp xếp',
  collect: 'sưu tập',
  distribute: 'phân phối',
  publish: 'xuất bản',
  announce: 'công bố',
  report: 'báo cáo',
  record: 'ghi chép',
  measure: 'đo lường',
  calculate: 'tính toán',
  analyze: 'phân tích',
  investigate: 'điều tra',
  research: 'nghiên cứu',
  experiment: 'thí nghiệm',
  discover: 'khám phá',
  invent: 'phát minh',
  design: 'thiết kế',
  manufacture: 'sản xuất',
  transport: 'vận chuyển',
  export: 'xuất khẩu',
  import: 'nhập khẩu',
  trade: 'buôn bán',
  invest: 'đầu tư',
  profit: 'lợi nhuận',
  loss: 'lỗ',
  tax: 'thuế',
  salary: 'lương',
  debt: 'nợ',
  loan: 'vay',
  save: 'tiết kiệm',
  spend: 'tiêu',
  waste: 'lãng phí',
  rich: 'giàu',
  poor: 'nghèo',
  expensive: 'đắt',
  cheap: 'rẻ',
  free: 'miễn phí',
  busy: 'bận',
  idle: 'nhàn rỗi',
  easy: 'dễ',
  difficult: 'khó',
  simple: 'đơn giản',
  complex: 'phức tạp',
  correct: 'đúng',
  wrong: 'sai',
  exact: 'chính xác',
  approximate: 'xấp xỉ',
  complete: 'đầy đủ',
  incomplete: 'chưa đủ',
  empty: 'trống',
  full: 'đầy',
  thick: 'dày',
  thin: 'mỏng',
  wide: 'rộng',
  narrow: 'hẹp',
  deep: 'sâu',
  shallow: 'nông',
  heavy: 'nặng',
  light: 'nhẹ',
  hard: 'cứng',
  soft: 'mềm',
  smooth: 'nhẵn',
  rough: 'thô',
  sharp: 'sắc',
  dull: 'cùn',
  bright: 'sáng',
  dim: 'mờ',
  clean: 'sạch',
  dirty: 'bẩn',
  wet: 'ướt',
  dry: 'khô',
  warm: 'ấm',
  cool: 'mát',
  sweet: 'ngọt',
  bitter: 'đắng',
  sour: 'chua',
  spicy: 'cay',
  delicious: 'ngon',
  beautiful: 'đẹp',
  ugly: 'xấu',
  young: 'trẻ',
  ancient: 'cổ xưa',
  modern: 'hiện đại',
  future: 'tương lai',
  past: 'quá khứ',
  present: 'hiện tại',
  eternal: 'vĩnh cửu',
  temporary: 'tạm thời',
  permanent: 'vĩnh viễn',
  sudden: 'đột ngột',
  gradual: 'dần dần',
  frequent: 'thường xuyên',
  rare: 'hiếm',
  common: 'phổ biến',
  unique: 'độc đáo',
  normal: 'bình thường',
  strange: 'lạ',
  familiar: 'quen thuộc',
  foreign: 'nước ngoài',
  domestic: 'nội địa',
  international: 'quốc tế',
  local: 'địa phương',
  global: 'toàn cầu',
  national: 'quốc gia',
  regional: 'khu vực',
  urban: 'đô thị',
  rural: 'nông thôn',
  industrial: 'công nghiệp',
  agricultural: 'nông nghiệp',
  commercial: 'thương mại',
  political: 'chính trị',
  economic: 'kinh tế',
  social: 'xã hội',
  cultural: 'văn hóa',
  religious: 'tôn giáo',
  moral: 'đạo đức',
  ethical: 'luân lý',
  legal: 'hợp pháp',
  illegal: 'bất hợp pháp',
  medical: 'y tế',
  educational: 'giáo dục',
  military: 'quân sự',
  diplomatic: 'ngoại giao',
  administrative: 'hành chính',
  judicial: 'tư pháp',
  legislative: 'lập pháp',
  executive: 'hành pháp',
};

function sanitizeText(s) {
  return String(s)
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/'/g, "\\'")
    .trim()
    .slice(0, 120);
}

function translateMeanings(meanings) {
  if (!meanings?.length) return 'kanji';
  const parts = meanings.slice(0, 3).map((m) => {
    const key = m.toLowerCase().replace(/[^a-z ]/g, '').trim();
    return EN_VI[key] ?? m.toLowerCase();
  });
  return sanitizeText(parts.join('; '));
}

function toEntry(k, vnDict, seedMeta) {
  const vn = vnDict.get(k.character);
  const seed = seedMeta.get(k.character);
  const onyomi = k.onyomi?.length
    ? k.onyomi.map((x) => kataToHira(x)).join(', ')
    : undefined;
  const kunyomi = k.kunyomi?.length ? k.kunyomi.join(', ') : undefined;
  const hanViet = sanitizeText(seed?.hanViet ?? vn?.hanViet ?? k.character).toUpperCase();
  const meaningVi = sanitizeText(
    seed?.meaningVi ?? vn?.meaningVi ?? translateMeanings(k.meanings),
  );
  const strokeCount = k.strokes ?? vn?.strokeCount ?? seed?.strokeCount;
  const entry = {
    character: k.character,
    hanViet,
    meaningVi,
  };
  if (onyomi) entry.onyomi = sanitizeText(onyomi);
  if (kunyomi) entry.kunyomi = sanitizeText(kunyomi);
  if (strokeCount) entry.strokeCount = strokeCount;
  return entry;
}

function formatEntry(e) {
  const parts = [
    `character: '${e.character}'`,
    `hanViet: '${e.hanViet}'`,
  ];
  if (e.onyomi) parts.push(`onyomi: '${e.onyomi}'`);
  if (e.kunyomi) parts.push(`kunyomi: '${e.kunyomi}'`);
  parts.push(`meaningVi: '${e.meaningVi}'`);
  if (e.strokeCount) parts.push(`strokeCount: ${e.strokeCount}`);
  return `      { ${parts.join(', ')} }`;
}

function splitLessons(entries, lessonStart, lessonEnd, level, titlePrefix) {
  const lessonCount = lessonEnd - lessonStart + 1;
  const base = Math.floor(entries.length / lessonCount);
  const extra = entries.length % lessonCount;
  const lessons = [];
  let idx = 0;
  for (let i = 0; i < lessonCount; i++) {
    const size = base + (i < extra ? 1 : 0);
    const lessonNumber = lessonStart + i;
    const chunk = entries.slice(idx, idx + size);
    idx += size;
    lessons.push({
      lessonNumber,
      jlptLevel: level,
      title: `${titlePrefix} (${i + 1})`,
      sortOrder: lessonNumber * 10,
      entries: chunk,
    });
  }
  return lessons;
}

function main() {
  const { chars: existing, meta: seedMeta } = loadExisting();
  const vnDict = loadVnDict();
  const picked = pickKanji();

  const n3entries = picked.N3.map((k) => toEntry(k, vnDict, seedMeta));
  const n2entries = picked.N2.map((k) => toEntry(k, vnDict, seedMeta));
  const n1entries = picked.N1.map((k) => toEntry(k, vnDict, seedMeta));

  const lessons = [
    ...splitLessons(n3entries, 303, 309, 'N3', 'Bài · Kanji N3 gap-fill'),
    ...splitLessons(n2entries, 410, 424, 'N2', 'Bài · Kanji N2 gap-fill'),
    ...splitLessons(n1entries, 509, 572, 'N1', 'Bài · Kanji N1 gap-fill'),
  ];

  const lines = [
    '// Kanji JLPT gap-fill — N3 (303–309), N2 (410–424), N1 (509–572).',
    '// Nguồn kanji: OpenJLPT; Hán-Việt/nghĩa: KanjiDictVN + seed hiện có.',
    '// Sinh bởi: node scripts/build-jlpt-kanji-gap-fill.mjs',
    '',
    "import type { JlptKanjiLesson } from './jlpt-kanji.data';",
    '',
    'export const JLPT_KANJI_GAP_FILL: JlptKanjiLesson[] = [',
  ];

  for (const lesson of lessons) {
    lines.push('  {');
    lines.push(`    lessonNumber: ${lesson.lessonNumber},`);
    lines.push(`    jlptLevel: '${lesson.jlptLevel}',`);
    lines.push(`    title: '${lesson.title}',`);
    lines.push(`    sortOrder: ${lesson.sortOrder},`);
    lines.push('    entries: [');
    for (const e of lesson.entries) lines.push(`${formatEntry(e)},`);
    lines.push('    ],');
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');

  const outPath = path.join(root, 'jlpt-kanji-gap-fill.data.ts');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  const summary = {
    N3: n3entries.length,
    N2: n2entries.length,
    N1: n1entries.length,
    total: n3entries.length + n2entries.length + n1entries.length,
    lessons: lessons.length,
    byLevel: {},
  };
  for (const l of lessons) {
    summary.byLevel[l.jlptLevel] = (summary.byLevel[l.jlptLevel] ?? 0) + l.entries.length;
  }
  console.log(JSON.stringify(summary, null, 2));
}

main();
