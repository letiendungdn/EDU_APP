/** OpenMoji SVG — ổn định, miễn phí */
function om(code: string) {
  return `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@15.0.0/color/svg/${code.toUpperCase()}.svg`;
}

function omFlag(code: string) {
  return om(code.replace(/-/g, '-'));
}

export const PICTURE_IMAGES = {
  apple: om('1F34E'),
  banana: om('1F34C'),
  orange: om('1F34A'),
  book: om('1F4D6'),
  dictionary: om('1F4DA'),
  magazine: om('1F4D1'),
  newspaper: om('1F4F0'),
  notebook: om('1F4D3'),
  pen: om('1F58A'),
  ballpen: om('1F58A'),
  key: om('1F511'),
  clock: om('23F0'),
  umbrella: om('2602'),
  bag: om('1F392'),
  backpack: om('1F392'),
  cd: om('1F4BF'),
  tv: om('1F4FA'),
  radio: om('1F4FB'),
  camera: om('1F4F7'),
  computer: om('1F4BB'),
  desk: om('1F4BC'),
  chair: om('1FA91'),
  chocolate: om('1F36B'),
  gift: om('1F381'),
  phone: om('1F4DE'),
  mobile: om('1F4F1'),
  car: om('1F697'),
  cat: om('1F431'),
  dog: om('1F436'),
  bird: om('1F426'),
  horse: om('1F434'),
  cow: om('1F404'),
  pig: om('1F416'),
  chicken: om('1F414'),
  fish: om('1F41F'),
  coffee: om('2615'),
  tea: om('1F375'),
  beer: om('1F37A'),
  wine: om('1F377'),
  milk: om('1F95B'),
  egg: om('1F373'),
  vegetable: om('1F966'),
  rice: om('1F35A'),
  bread: om('1F35E'),
  meat: om('1F969'),
  food: om('1F372'),
  flower: om('1F33A'),
  tree: om('1F333'),
  mountain: om('26F0'),
  sea: om('1F30A'),
  rain: om('1F327'),
  snow: om('2744'),
  sun: om('2600'),
  moon: om('1F319'),
  cloud: om('2601'),
  fire: om('1F525'),
  friend: om('1F46B'),
  greeting: om('1F44B'),
  happy: om('1F604'),
  hospital: om('1F3E5'),
  house: om('1F3E0'),
  room: om('1F6CF'),
  bed: om('1F6CF'),
  bathroom: om('1F6BF'),
  toilet: om('1F6BD'),
  office: om('1F3E2'),
  company: om('1F3E2'),
  bank: om('1F3E6'),
  post: om('1F3E4'),
  library: om('1F4DA'),
  museum: om('1F3DB'),
  shop: om('1F3EA'),
  department: om('1F6D2'),
  restaurant: om('1F374'),
  cafeteria: om('1F37D'),
  classroom: om('1F3EB'),
  school: om('1F3EB'),
  elevator: om('1F6D7'),
  escalator: om('1FA97'),
  vending: om('1F3EA'),
  passport: om('1F6C2'),
  plane: om('2708'),
  train: om('1F686'),
  travel: om('1F9F3'),
  water: om('1F4A7'),
  movie: om('1F3AC'),
  exam: om('1F4DD'),
  work: om('1F4BC'),
  study: om('1F4DA'),
  sleep: om('1F634'),
  wake: om('1F31E'),
  cigarette: om('1F6AC'),
  shoes: om('1F45F'),
  tie: om('1F454'),
  money: om('1F4B0'),
  yen: om('1F4B4'),
  doctor: om('2695'),
  student: om('1F393'),
  engineer: om('1F477'),
  researcher: om('1F52C'),
  teacher: om('1F468'),
  card: om('1F4B3'),
  namecard: om('1F4BC'),
  tape: om('1F4FC'),
  cassette: om('1F4FC'),
  language: om('1F4AC'),
  globe: om('1F30D'),
  stairs: om('1FA9C'),
  lobby: om('1F3E8'),
  meeting: om('1F465'),
  reception: om('1F4CB'),
  country: om('1F30D'),
  electricity: om('26A1'),
  bus: om('1F68C'),
  taxi: om('1F695'),
  bicycle: om('1F6B2'),
  ship: om('1F6A2'),
  supermarket: om('1F6D2'),
  chopsticks: om('1F962'),
  spoon: om('1F944'),
  knife: om('1F52A'),
  fork: om('1F374'),
  scissors: om('2702'),
  letter: om('2709'),
  photo: om('1F5BC'),
  video: om('1F4FD'),
  garden: om('1F33B'),
  tennis: om('1F3BE'),
  soccer: om('26BD'),
  baseball: om('26BE'),
  birthday: om('1F382'),
  christmas: om('1F384'),
  family: om('1F46A'),
  father: om('1F468'),
  mother: om('1F469'),
  shirt: om('1F455'),
  ticket: om('1F3AB'),
  luggage: om('1F9F3'),
  paper: om('1F4C4'),
  eraser: om('1F58A'),
  stapler: om('1F587'),
  tapeOffice: om('1F4CE'),
  fax: om('1F4E0'),
  email: om('1F4E7'),
  sake: om('1F377'),
  cake: om('1F370'),
  park: om('1F3DE'),
  castle: om('1F3F0'),
  temple: om('26E9'),
  lake: om('1F3DE'),
  city: om('1F3D9'),
  sport: om('26BD'),
  dormitory: om('1F3E8'),
  calendar: om('1F4C5'),
  morning: om('1F305'),
  evening: om('1F319'),
  noon: om('2600'),
  hot: om('1F321'),
  cold: om('2744'),
  red: om('1F534'),
  blue: om('1F535'),
  white: om('26AA'),
  black: om('26AB'),
  green: om('1F7E2'),
  yellow: om('1F7E1'),
  walking: om('1F6B6'),
  swimming: om('1F3CA'),
  music: om('1F3B5'),
  guitar: om('1F3B8'),
  piano: om('1F3B9'),
  hotel: om('1F3E8'),
  police: om('1F46E'),
  medicine: om('1F48A'),
  hat: om('1F452'),
  glasses: om('1F453'),
  watch: om('231A'),
  cherry: om('1F338'),
  sushi: om('1F363'),
  ramen: om('1F35C'),
  pizza: om('1F355'),
  hamburger: om('1F354'),
  candy: om('1F36C'),
  icecream: om('1F366'),
  hotspring: om('2668'),
  grape: om('1F347'),
  strawberry: om('1F353'),
  watermelon: om('1F349'),
  melon: om('1F348'),
  curry: om('1F35B'),
  bento: om('1F371'),
  onigiri: om('1F359'),
  tempura: om('1F364'),
  yakisoba: om('1F35C'),
  udon: om('1F35C'),
  soba: om('1F35C'),
  comb: om('1FAA5'),
  skirt: om('1F457'),
  coat: om('1F9E5'),
  sweater: om('1F9E5'),
  swimsuit: om('1F3CA'),
  refrigerator: om('1F9CA'),
  washing: om('1F9FA'),
  vacuum: om('1F9F9'),
  aircon: om('2744'),
  kotatsu: om('1F525'),
  wind: om('1F32C'),
  fog: om('1F32B'),
  thunder: om('26A1'),
  rainbow: om('1F308'),
  head: om('1F9D1'),
  face: om('1F600'),
  eye: om('1F441'),
  ear: om('1F442'),
  nose: om('1F443'),
  mouth: om('1F444'),
  body: om('1F9CD'),
  finger: om('270B'),
  boss: om('1F454'),
  subway: om('1F687'),
  bullettrain: om('1F685'),
  ferry: om('26F4'),
  ropeway: om('1F6A0'),
  convenience: om('1F3EA'),
  cafe: om('2615'),
  building: om('1F3D9'),
  box: om('1F4E6'),
  switch: om('1F50C'),
  table: om('1FA91'),
  husband: om('1F468'),
  wife: om('1F469'),
  kabuki: om('1F3AD'),
  disney: om('1F3F0'),
  chili: om('1F336'),
  fishsauce: om('1F41F'),
  shrine: om('26E9'),
  station: om('1F689'),
  airport: om('1F6EB'),
  bridge: om('1F309'),
  map: om('1F5FA'),
  atm: om('1F3E7'),
  wallet: om('1F45B'),
  stamp: om('1F4EF'),
  package: om('1F4E6'),
  delivery: om('1F69A'),
  factory: om('1F3ED'),
  farm: om('1F33E'),
  elephant: om('1F418'),
  lion: om('1F981'),
  tiger: om('1F405'),
  bear: om('1F43B'),
  rabbit: om('1F430'),
  monkey: om('1F412'),
  panda: om('1F43C'),
  duck: om('1F986'),
  sheep: om('1F411'),
  bee: om('1F41D'),
  butterfly: om('1F98B'),
  baby: om('1F476'),
  child: om('1F9D2'),
  party: om('1F973'),
  tooth: om('1F9B7'),
  hand: om('270B'),
  foot: om('1F9B6'),
  heart: om('2764'),
  cooking: om('1F373'),
  cleaning: om('1F9F9'),
  skiing: om('26F7'),
  camping: om('26FA'),
  fishing: om('1F3A3'),
  golf: om('26F3'),
  volleyball: om('1F3D0'),
  basketball: om('1F3C0'),
  running: om('1F3C3'),
  yoga: om('1F9D8'),
  painting: om('1F3A8'),
  dance: om('1F483'),
  karaoke: om('1F3A4'),
  game: om('1F3AE'),
  puzzle: om('1F9E9'),
  robot: om('1F916'),
  rocket: om('1F680'),
  satellite: om('1F6F0'),
  microscope: om('1F52C'),
  telescope: om('1F52D'),
  lightbulb: om('1F4A1'),
  battery: om('1F50B'),
  plug: om('1F50C'),
  hammer: om('1F528'),
  wrench: om('1F527'),
  ladder: om('1FA9C'),
  bucket: om('1FAA3'),
  broom: om('1F9F9'),
  soap: om('1F9FC'),
  towel: om('1F9FB'),
  pillow: om('1F6CC'),
  blanket: om('1F6CF'),
  curtain: om('1FA9E'),
  door: om('1F6AA'),
  window: om('1FA9F'),
  fence: om('1F6A7'),
  trash: om('1F5D1'),
  recycling: om('267B'),
  europe: om('1F30D'),
  mexico: omFlag('1F1F2-1F1FD'),
  spain: omFlag('1F1EA-1F1F8'),
  australia: omFlag('1F1E6-1F1FA'),
  canada: omFlag('1F1E8-1F1E6'),
  russia: omFlag('1F1F7-1F1FA'),
  singapore: omFlag('1F1F8-1F1EC'),
  malaysia: omFlag('1F1F2-1F1FE'),
  philippines: omFlag('1F1F5-1F1ED'),
  // Flags
  usa: omFlag('1F1FA-1F1F8'),
  uk: omFlag('1F1EC-1F1E7'),
  india: omFlag('1F1EE-1F1F3'),
  indonesia: omFlag('1F1EE-1F1E9'),
  korea: omFlag('1F1F0-1F1F7'),
  thailand: omFlag('1F1F9-1F1ED'),
  china: omFlag('1F1E8-1F1F3'),
  germany: omFlag('1F1E9-1F1EA'),
  japan: omFlag('1F1EF-1F1F5'),
  brazil: omFlag('1F1E7-1F1F7'),
  france: omFlag('1F1EB-1F1F7'),
  italy: omFlag('1F1EE-1F1F9'),
  switzerland: omFlag('1F1E8-1F1ED'),
  vietnam: omFlag('1F1FB-1F1F3'),
} as const;

export type PictureImageKey = keyof typeof PICTURE_IMAGES;

const EN_WORD_MAP: Record<string, PictureImageKey> = {
  hello: 'greeting', goodbye: 'greeting', house: 'house', water: 'water',
  eat: 'food', book: 'book', friend: 'friend', happy: 'happy', work: 'work',
  school: 'school', journey: 'travel', passport: 'passport',
  recommend: 'restaurant', negotiate: 'office', efficient: 'office', popular: 'happy',
  describe: 'book', approximately: 'money',
};

const ROMAJI_MAP: Record<string, PictureImageKey> = {
  amerika: 'usa', igirisu: 'uk', indo: 'india', indoneshia: 'indonesia',
  kankoku: 'korea', tai: 'thailand', chuugoku: 'china', doitsu: 'germany',
  nihon: 'japan', burajiru: 'brazil', furansu: 'france', itaria: 'italy',
  suisu: 'switzerland', betonamu: 'vietnam', eigo: 'language', nihongo: 'language',
  hon: 'book', jisho: 'dictionary', zasshi: 'magazine', shinbun: 'newspaper',
  nooto: 'notebook', techou: 'notebook', meishi: 'namecard', kaado: 'card',
  enpitsu: 'pen', boorupen: 'ballpen', sharppenshiru: 'pen', kagi: 'key',
  tokei: 'clock', kasa: 'umbrella', kaban: 'bag', terebi: 'tv', rajio: 'radio',
  kamera: 'camera', konpyuutaa: 'computer', kuruma: 'car', tsukue: 'desk',
  isu: 'chair', chokoreeto: 'chocolate', koohii: 'coffee', miyage: 'gift',
  denki: 'electricity', gakusei: 'student', isha: 'doctor', kenkyuusha: 'researcher',
  enjinia: 'engineer', daigaku: 'school', byouin: 'hospital', kaishain: 'company',
  ginkouin: 'bank', kyoushitsu: 'classroom', shokudou: 'cafeteria', jimusho: 'office',
  kaigishitsu: 'meeting', uketsuke: 'reception', robi: 'lobby', heya: 'room',
  kaidan: 'stairs', erebeetaa: 'elevator', esukareetaa: 'escalator',
  jidouhanbaiki: 'vending', denwa: 'phone', kaisha: 'company', uchi: 'house',
  kutsu: 'shoes', nekuwai: 'tie', wain: 'wine', gin: 'bank', ginkou: 'bank',
  yuubinkyoku: 'post', toshokan: 'library', bijutsukan: 'museum', depaato: 'department',
  eiga: 'movie', shiken: 'exam', tabako: 'cigarette', okimasu: 'wake',
  nemasu: 'sleep', hatarakimasu: 'work', yasumimasu: 'sleep', benkyoushimasu: 'study',
  pan: 'bread', gohan: 'rice', sakana: 'fish', niku: 'meat',
  ringo: 'apple', mizu: 'water', ie: 'house', inu: 'dog', neko: 'cat',
  hana: 'flower', yama: 'mountain', umi: 'sea', ki: 'tree', ame: 'rain',
  yuki: 'snow', tsuki: 'moon', kumo: 'cloud',
  // Transport
  basu: 'bus', takushii: 'taxi', jitensha: 'bicycle', fune: 'ship',
  supa: 'supermarket', supaa: 'supermarket',
  // Cities / countries
  nyuyoku: 'usa', pekin: 'china', rosanzerusu: 'usa', rondon: 'uk',
  jakaruta: 'indonesia', bankoku: 'thailand', berurin: 'germany',
  shanhai: 'china', mekishiko: 'mexico', supain: 'spain', yoroppa: 'europe',
  // Time
  getsuyobi: 'calendar', kayobi: 'calendar', suiyobi: 'calendar',
  mokuyobi: 'calendar', kinyobi: 'calendar', doyobi: 'calendar',
  nichiyobi: 'calendar', asa: 'morning', hiru: 'noon', ban: 'evening',
  yoru: 'evening', konban: 'evening', kesa: 'morning', kyo: 'calendar',
  kino: 'calendar', ashita: 'calendar',
  // Food / items
  sake: 'sake', tegami: 'letter', shashin: 'photo', bideo: 'video',
  mise: 'shop', niwa: 'garden', shukudai: 'study', tenisu: 'tennis',
  sakka: 'soccer', hashi: 'chopsticks', supun: 'spoon', naifu: 'knife',
  foku: 'fork', hasami: 'scissors', kami: 'paper', shatsu: 'shirt',
  nimotsu: 'luggage', kippu: 'ticket', keshigomu: 'eraser',
  hotchikisu: 'stapler', seroteepu: 'tapeOffice', keitai: 'mobile',
  meeru: 'email', fakkusu: 'fax', tanjobi: 'birthday',
  kurisumasu: 'christmas', kazoku: 'family', chichi: 'father',
  haha: 'mother', otousan: 'father', okaasan: 'mother',
  ryokou: 'travel', resutoran: 'restaurant', machi: 'city',
  tabemono: 'food', ryoo: 'dormitory', seikatsu: 'house',
  shigoto: 'work', nomimono: 'tea', ryouri: 'food',
  supootsu: 'sport', yakyuu: 'baseball', biwako: 'lake',
  narukouen: 'park', kinkakuji: 'temple', osakajou: 'castle',
  kaigi: 'meeting', tepurekoda: 'cassette', cd: 'cd',
  // Adjectives → color/temp
  akai: 'red', aoi: 'blue', shiroi: 'white', kuroi: 'black',
  atsui: 'hot', samui: 'cold', tsumetai: 'cold',
  oishii: 'food', tanoshii: 'happy',
  // Body
  te: 'hand', ashi: 'foot',
  // Actions (visual)
  tabemasu: 'food', nomimasu: 'tea', yomimasu: 'book',
  kakimasu: 'pen', kaimasu: 'shop', mimasu: 'movie',
  kikimasu: 'music', aruite: 'walking', oyogimasu: 'swimming',
  hashirimasu: 'running', utaimasu: 'music', odorimasu: 'dance',
  e: 'painting',
  // L9-15
  karaoke: 'karaoke', kodomo: 'child', denchi: 'battery', hako: 'box',
  suicchi: 'switch', teeburu: 'table', doa: 'door', mado: 'window',
  biru: 'building', konbini: 'convenience', kissaten: 'cafe', noriba: 'station',
  kabuki: 'kabuki', reizouko: 'refrigerator', sentakuki: 'washing',
  soujiki: 'vacuum', eakon: 'aircon', kotatsu: 'kotatsu', makura: 'pillow',
  kaze: 'wind', kiri: 'fog', kaminari: 'thunder', niji: 'rainbow',
  kouen: 'park', sakura: 'cherry', yasai: 'vegetable', budou: 'grape',
  ichigo: 'strawberry', suika: 'watermelon', meron: 'melon', karee: 'curry',
  udon: 'udon', soba: 'soba', onigiri: 'onigiri', obentou: 'bento',
  tenpura: 'tempura', chikatetsu: 'subway', shinkansen: 'bullettrain',
  ferii: 'ferry', roopuwei: 'ropeway', keisatsu: 'police', kusuri: 'medicine',
  shachou: 'boss', mizugi: 'swimsuit', fuku: 'shirt', sukaato: 'skirt',
  kooto: 'coat', seetaa: 'sweater', boushi: 'hat', megane: 'glasses',
  saifu: 'wallet', taoru: 'towel', sekken: 'soap', shanpuu: 'soap',
};

const VI_PHRASE_MAP: [string, PictureImageKey][] = [
  ['hộ chiếu', 'passport'], ['trường đại học', 'school'], ['trường học', 'school'],
  ['lớp học', 'classroom'], ['phòng học', 'classroom'], ['ngôi nhà', 'house'],
  ['nhà ăn', 'cafeteria'], ['nhà hàng', 'restaurant'], ['bệnh viện', 'hospital'],
  ['máy bay', 'plane'], ['tàu hỏa', 'train'], ['tàu điện', 'train'],
  ['xe hơi', 'car'], ['xe ô tô', 'car'], ['quyển sách', 'book'], ['cuốn sách', 'book'],
  ['từ điển', 'dictionary'], ['tạp chí', 'magazine'], ['báo', 'newspaper'],
  ['sổ tay', 'notebook'], ['danh thiếp', 'namecard'], ['bút chì', 'pen'],
  ['bút bi', 'ballpen'], ['chìa khoá', 'key'], ['chìa khóa', 'key'],
  ['đồng hồ', 'clock'], ['cái dù', 'umbrella'], ['cái cặp', 'bag'],
  ['máy vi tính', 'computer'], ['máy chụp hình', 'camera'], ['máy điện thoại', 'phone'],
  ['điện thoại', 'phone'], ['cà phê', 'coffee'], ['bạn bè', 'friend'],
  ['ăn sáng', 'food'], ['thuốc lá', 'cigarette'], ['thang máy', 'elevator'],
  ['thang cuốn', 'escalator'], ['vending machine', 'vending'], ['bưu điện', 'post'],
  ['thư viện', 'library'], ['bảo tàng', 'museum'], ['cửa hàng bách hóa', 'department'],
  ['phim', 'movie'], ['bài kiểm tra', 'exam'], ['bác sĩ', 'doctor'],
  ['sinh viên', 'student'], ['học sinh', 'student'], ['kỹ sư', 'engineer'],
  ['nghiên cứu sinh', 'researcher'], ['giáo viên', 'teacher'], ['công ty', 'company'],
  ['văn phòng', 'office'], ['ngân hàng', 'bank'], ['căn phòng', 'room'],
  ['cầu thang', 'stairs'], ['phòng họp', 'meeting'], ['giầy', 'shoes'],
  ['cà vạt', 'tie'], ['rượu vang', 'wine'], ['tiền', 'money'], ['yen', 'yen'],
  ['nước', 'water'], ['sách', 'book'], ['chó', 'dog'], ['mèo', 'cat'],
  ['táo', 'apple'], ['cá', 'fish'], ['thịt', 'meat'], ['hoa', 'flower'],
  ['cây', 'tree'], ['núi', 'mountain'], ['biển', 'sea'], ['mưa', 'rain'],
  ['tuyết', 'snow'], ['mặt trời', 'sun'], ['mặt trăng', 'moon'], ['bánh mì', 'bread'],
  ['cơm', 'rice'], ['trà', 'tea'], ['bia', 'beer'], ['sữa', 'milk'],
  ['trứng', 'egg'], ['rau', 'vegetable'], ['chuối', 'banana'], ['cam', 'orange'],
  ['gà', 'chicken'], ['bò', 'cow'], ['heo', 'pig'], ['ngựa', 'horse'],
  ['chim', 'bird'], ['ngủ', 'sleep'], ['làm việc', 'work'], ['học tập', 'study'],
  ['thức dậy', 'wake'], ['quà', 'gift'], ['souvenir', 'gift'],
  ['mỹ', 'usa'], ['nước anh', 'uk'], ['ấn độ', 'india'],
  ['hàn quốc', 'korea'], ['thái lan', 'thailand'], ['trung quốc', 'china'],
  ['đức', 'germany'], ['nhật bản', 'japan'], ['brazil', 'brazil'], ['pháp', 'france'],
  ['italy', 'italy'], ['thụy sĩ', 'switzerland'], ['việt nam', 'vietnam'],
  ['tiếng anh', 'language'], ['tiếng nhật', 'language'], ['điện', 'electricity'],
  ['giường', 'bed'], ['nhà vệ sinh', 'toilet'], ['tắm', 'bathroom'],
  // Transport
  ['xe buýt', 'bus'], ['xe đạp', 'bicycle'], ['taxi', 'taxi'],
  ['thuyền', 'ship'], ['tàu thủy', 'ship'], ['siêu thị', 'supermarket'],
  ['ga ', 'station'], ['nhà ga', 'station'], ['sân bay', 'airport'],
  ['đi bộ', 'walking'], ['bơi', 'swimming'], ['chạy', 'running'],
  // Utensils & office
  ['đũa', 'chopsticks'], ['muỗng', 'spoon'], ['thìa', 'spoon'],
  ['nĩa', 'fork'], ['kéo', 'scissors'], ['băng keo', 'tapeOffice'],
  ['cái dập ghim', 'stapler'], ['cái bấm lỗ', 'stapler'],
  ['tẩy', 'eraser'], ['giấy', 'paper'], ['thư', 'letter'],
  ['e-mail', 'email'], ['máy fax', 'fax'], ['máy đánh chữ', 'computer'],
  ['điện thoại di động', 'mobile'], ['di động', 'mobile'],
  // Media & places
  ['ảnh', 'photo'], ['bức ảnh', 'photo'], ['video', 'video'],
  ['băng video', 'video'], ['cửa hàng', 'shop'], ['của tiệm', 'shop'],
  ['vườn', 'garden'], ['công viên', 'park'], ['lâu đài', 'castle'],
  ['chùa', 'temple'], ['hồ ', 'lake'], ['thành phố', 'city'],
  ['ký túc xá', 'dormitory'], ['khách sạn', 'hotel'],
  // Sports & hobbies
  ['quần vợt', 'tennis'], ['đá bóng', 'soccer'], ['bóng chày', 'baseball'],
  ['bóng rổ', 'basketball'], ['bóng chuyền', 'volleyball'],
  ['golf', 'golf'], ['trượt tuyết', 'skiing'], ['câu cá', 'fishing'],
  ['thể thao', 'sport'], ['nhạc', 'music'], ['đàn guitar', 'guitar'],
  ['đàn piano', 'piano'], ['hát', 'music'], ['nhảy', 'dance'],
  ['vẽ', 'painting'], ['game', 'game'], ['trò chơi', 'game'],
  // Family & events
  ['sinh nhật', 'birthday'], ['lễ noel', 'christmas'], ['noel', 'christmas'],
  ['gia đình', 'family'], ['bố', 'father'], ['cha ', 'father'],
  ['mẹ', 'mother'], ['con trai', 'child'], ['con gái', 'child'],
  ['em bé', 'baby'], ['trẻ em', 'child'],
  // Clothing & items
  ['áo sơ mi', 'shirt'], ['mũ', 'hat'], ['kính', 'glasses'],
  ['đồng hồ đeo tay', 'watch'], ['vé', 'ticket'], ['hành lí', 'luggage'],
  ['hành lý', 'luggage'], ['ví', 'wallet'], ['tem', 'stamp'],
  ['bưu kiện', 'package'], ['giao hàng', 'delivery'],
  // Food & drink
  ['rượu sake', 'sake'], ['sake', 'sake'], ['thức ăn', 'food'],
  ['món ăn', 'food'], ['đồ uống', 'tea'], ['ngon', 'food'],
  ['bánh kem', 'cake'], ['kẹo', 'candy'], ['kem', 'icecream'],
  ['sushi', 'sushi'], ['mì', 'ramen'], ['pizza', 'pizza'],
  ['hamburger', 'hamburger'], ['suối nước nóng', 'hotspring'],
  ['onsen', 'hotspring'],
  // Time
  ['thứ hai', 'calendar'], ['thứ ba', 'calendar'], ['thứ tư', 'calendar'],
  ['thứ năm', 'calendar'], ['thứ sáu', 'calendar'], ['thứ bảy', 'calendar'],
  ['chủ nhật', 'calendar'], ['buổi sáng', 'morning'], ['sáng', 'morning'],
  ['trưa', 'noon'], ['buổi chiều', 'evening'], ['tối', 'evening'],
  ['hôm nay', 'calendar'], ['hôm qua', 'calendar'], ['ngày mai', 'calendar'],
  ['nghỉ trưa', 'sleep'], ['họp', 'meeting'], ['cuộc họp', 'meeting'],
  // Colors & weather
  ['màu đỏ', 'red'], ['màu xanh', 'blue'], ['trắng', 'white'],
  ['đen', 'black'], ['vàng', 'yellow'], ['xanh lá', 'green'],
  ['nóng', 'hot'], ['lạnh', 'cold'], ['buốt', 'cold'],
  // Animals
  ['voi', 'elephant'], ['sư tử', 'lion'], ['hổ', 'tiger'],
  ['gấu', 'bear'], ['thỏ', 'rabbit'], ['khỉ', 'monkey'],
  ['gấu trúc', 'panda'], ['vịt', 'duck'], ['cừu', 'sheep'],
  ['ong', 'bee'], ['bướm', 'butterfly'],
  // Body
  ['tay', 'hand'], ['chân', 'foot'], ['răng', 'tooth'], ['tim', 'heart'],
  // Work & study
  ['bài tập', 'study'], ['bài tập về nhà', 'study'], ['du lịch', 'travel'],
  ['châu âu', 'europe'], ['cd', 'cd'], ['máy casset', 'cassette'],
  ['compact disc', 'cd'], ['bưu thiếp', 'letter'],
  // Countries / cities
  ['new york', 'usa'], ['beijing', 'china'], ['thượng hải', 'china'],
  ['los angeles', 'usa'], ['london', 'uk'], ['jakarta', 'indonesia'],
  ['bangkok', 'thailand'], ['berlin', 'germany'], ['mexico', 'mexico'],
  ['spain', 'spain'], ['tây ban nha', 'spain'],
  // L9-15 extra
  ['karaoke', 'karaoke'], ['kịch kabuki', 'kabuki'], ['con cái', 'child'],
  ['vợ', 'wife'], ['chồng', 'husband'], ['cục pin', 'battery'],
  ['cái hộp', 'box'], ['công tắc', 'switch'], ['bàn', 'table'],
  ['cửa sổ', 'window'], ['toà nhà', 'building'], ['atm', 'atm'],
  ['convenience store', 'convenience'], ['quán caffee', 'cafe'],
  ['quán giải khát', 'cafe'], ['bến xe', 'station'],
  ['disneyland', 'disney'], ['tương ớt', 'chili'], ['nam pla', 'fishsauce'],
  ['tủ lạnh', 'refrigerator'], ['máy giặt', 'washing'], ['máy hút bụi', 'vacuum'],
  ['điều hòa', 'aircon'], ['gối', 'pillow'], ['chăn', 'blanket'],
  ['rèm', 'curtain'], ['gió', 'wind'], ['sương mù', 'fog'],
  ['sét', 'thunder'], ['cầu vồng', 'rainbow'], ['hoa anh đào', 'cherry'],
  ['quần áo', 'shirt'], ['váy', 'skirt'], ['áo khoác', 'coat'],
  ['áo len', 'sweater'], ['tất', 'shoes'], ['xà phòng', 'soap'],
  ['dầu gội', 'soap'], ['đồ bơi', 'swimsuit'], ['tàu điện ngầm', 'subway'],
  ['shinkansen', 'bullettrain'], ['phim ferry', 'ferry'],
  ['nho', 'grape'], ['dâu tây', 'strawberry'], ['dưa hấu', 'watermelon'],
  ['dưa gang', 'melon'], ['cà ri', 'curry'], ['mì udon', 'udon'],
  ['mì soba', 'soba'], ['cơm nắm', 'onigiri'], ['hộp cơm', 'bento'],
  ['tempura', 'tempura'], ['thuốc', 'medicine'], ['cảnh sát', 'police'],
  ['giám đốc', 'boss'], ['mắt', 'eye'], ['cái tai', 'ear'], ['mũi', 'nose'],
  ['miệng', 'mouth'], ['ngón tay', 'finger'], ['cơ thể', 'body'],
];

const KANA_MAP: Record<string, PictureImageKey> = {
  みず: 'water', いえ: 'house', うち: 'house', ほん: 'book', くるま: 'car',
  がっこう: 'school', だいがく: 'school', びょういん: 'hospital', 学校: 'school',
  大学: 'school', 病院: 'hospital', 本: 'book', 水: 'water', 車: 'car',
  犬: 'dog', 猫: 'cat', りんご: 'apple', コーヒー: 'coffee', パン: 'bread',
  ごはん: 'rice', えき: 'train', 駅: 'train', ひこうき: 'plane', 飛行機: 'plane',
  さかな: 'fish', 魚: 'fish', はな: 'flower', 花: 'flower', やま: 'mountain',
  山: 'mountain', うみ: 'sea', 海: 'sea', き: 'tree', 木: 'tree', にく: 'meat',
  肉: 'meat', あめ: 'rain', 雨: 'rain', ゆき: 'snow', 雪: 'snow', ひ: 'sun',
  日: 'sun', つき: 'moon', 月: 'moon', くも: 'cloud', 雲: 'cloud', 火: 'fire',
  じしょ: 'dictionary', 辞書: 'dictionary', ざっし: 'magazine', 雑誌: 'magazine',
  しんぶん: 'newspaper', 新聞: 'newspaper', ノート: 'notebook', てちょう: 'notebook',
  手帳: 'notebook', めいし: 'namecard', 名刺: 'namecard', カード: 'card',
  えんぴつ: 'pen', 鉛筆: 'pen', ボールペン: 'ballpen', かぎ: 'key', 鍵: 'key',
  とけい: 'clock', 時計: 'clock', かさ: 'umbrella', 傘: 'umbrella', かばん: 'bag',
  鞄: 'bag', テレビ: 'tv', ラジオ: 'radio', カメラ: 'camera', コンピューター: 'computer',
  つくえ: 'desk', 机: 'desk', いす: 'chair', 椅子: 'chair', チョコレート: 'chocolate',
  みやげ: 'gift', 土産: 'gift', がくせい: 'student', 学生: 'student', いしゃ: 'doctor',
  医者: 'doctor', けんきゅうしゃ: 'researcher', 研究者: 'researcher',
  エンジニア: 'engineer', かいしゃいん: 'company', 会社員: 'company', ぎんこういん: 'bank',
  銀行員: 'bank', きょうしつ: 'classroom', 教室: 'classroom', しょくどう: 'cafeteria',
  食堂: 'cafeteria', じむしょ: 'office', 事務所: 'office', かいぎしつ: 'meeting',
  会議室: 'meeting', うけつけ: 'reception', ロビー: 'lobby', へや: 'room', 部屋: 'room',
  かいだん: 'stairs', 階段: 'stairs', エレベーター: 'elevator', エスカレーター: 'escalator',
  じどうはんばいき: 'vending', でんわ: 'phone', 電話: 'phone', かいしゃ: 'company',
  会社: 'company', くつ: 'shoes', 靴: 'shoes', ネクタイ: 'tie', ワイン: 'wine',
  ぎんこう: 'bank', 銀行: 'bank', ゆうびんきょく: 'post', 郵便局: 'post',
  としょかん: 'library', 図書館: 'library', びじゅつかん: 'museum', 美術館: 'museum',
  デパート: 'department', えいが: 'movie', 映画: 'movie', しけん: 'exam', 試験: 'exam',
  たばこ: 'cigarette', 煙草: 'cigarette', じどうしゃ: 'car', 自動車: 'car',
  アメリカ: 'usa', イギリス: 'uk', インド: 'india', インドネシア: 'indonesia',
  かんこく: 'korea', 韓国: 'korea', タイ: 'thailand', ちゅうごく: 'china', 中国: 'china',
  ドイツ: 'germany', にほん: 'japan', 日本: 'japan', ブラジル: 'brazil',
  フランス: 'france', イタリア: 'italy', スイス: 'switzerland', えいご: 'language',
  英語: 'language', にほんご: 'language', 日本語: 'language', でんき: 'electricity',
  電気: 'electricity', おちゃ: 'tea', 茶: 'tea', ビール: 'beer', ミルク: 'milk',
  たまご: 'egg', 卵: 'egg', バナナ: 'banana', オレンジ: 'orange', とり: 'chicken',
  鳥: 'chicken', うし: 'cow', 牛: 'cow', ぶた: 'pig', 豚: 'pig', うま: 'horse',
  馬: 'horse', ベッド: 'bed', トイレ: 'toilet', シャワー: 'bathroom',
  // Transport
  バス: 'bus', タクシー: 'taxi', 自転車: 'bicycle', じてんしゃ: 'bicycle',
  ふね: 'ship', 船: 'ship', スーパー: 'supermarket',
  // Cities
  ニューヨーク: 'usa', ペキン: 'china', ロンドン: 'uk', ロサンゼルス: 'usa',
  ジャカルタ: 'indonesia', バンコク: 'thailand', ベルリン: 'germany',
  シャンハイ: 'china', メキシコ: 'mexico', スパイン: 'spain', ヨーロッパ: 'europe',
  // Time
  げつようび: 'calendar', 月曜日: 'calendar', かようび: 'calendar', 火曜日: 'calendar',
  すいようび: 'calendar', 水曜日: 'calendar', もくようび: 'calendar', 木曜日: 'calendar',
  きんようび: 'calendar', 金曜日: 'calendar', どようび: 'calendar', 土曜日: 'calendar',
  にちようび: 'calendar', 日曜日: 'calendar', あさ: 'morning', 朝: 'morning',
  ひる: 'noon', 昼: 'noon', ばん: 'evening', 夜: 'evening', よる: 'evening',
  こんばん: 'evening', けさ: 'morning', きょう: 'calendar', 今日: 'calendar',
  きのう: 'calendar', 昨日: 'calendar', あした: 'calendar', 明日: 'calendar',
  // Items
  CD: 'cd', さけ: 'sake', 酒: 'sake', てがみ: 'letter', 手紙: 'letter',
  しゃしん: 'photo', 写真: 'photo', ビデオ: 'video', みせ: 'shop', 店: 'shop',
  にわ: 'garden', 庭: 'garden', しゅくだい: 'study', 宿題: 'study',
  テニス: 'tennis', サッカー: 'soccer', はし: 'chopsticks', 箸: 'chopsticks',
  スプーン: 'spoon', ナイフ: 'knife', フォーク: 'fork', はさみ: 'scissors',
  かみ: 'paper', 紙: 'paper', シャツ: 'shirt', にもつ: 'luggage', 荷物: 'luggage',
  きっぷ: 'ticket', 切符: 'ticket', けしゴマ: 'eraser', 消しゴム: 'eraser',
  ホッチキス: 'stapler', セロテープ: 'tapeOffice', ケータイ: 'mobile',
  メール: 'email', ファクス: 'fax', たんじょうび: 'birthday', 誕生日: 'birthday',
  クリスマス: 'christmas', かぞく: 'family', 家族: 'family',
  ちち: 'father', 父: 'father', はは: 'mother', 母: 'mother',
  おとうさん: 'father', おかあさん: 'mother', りょこう: 'travel', 旅行: 'travel',
  レストラン: 'restaurant', まち: 'city', 町: 'city', たべもの: 'food',
  食べ物: 'food', りょう: 'dormitory', 寮: 'dormitory', スポーツ: 'sport',
  やきゅう: 'baseball', 野球: 'baseball', びわこ: 'lake', 琵琶湖: 'lake',
  ならこうえん: 'park', 奈良公園: 'park', きんかくじ: 'temple', 金閣寺: 'temple',
  おおさかじょう: 'castle', 大阪城: 'castle', かいぎ: 'meeting', 会議: 'meeting',
  テープレコーダー: 'cassette', ワープロ: 'computer',
  // Colors / adjectives
  あかい: 'red', 赤い: 'red', あおい: 'blue', 青い: 'blue',
  しろい: 'white', 白い: 'white', くろい: 'black', 黒い: 'black',
  あつい: 'hot', 暑い: 'hot', さむい: 'cold', 寒い: 'cold',
  つめたい: 'cold', 冷たい: 'cold', おいしい: 'food', 美味しい: 'food',
  // Body
  て: 'hand', 手: 'hand', あし: 'foot', 足: 'foot',
  // Animals extra
  ぞう: 'elephant', 象: 'elephant', ライオン: 'lion', とら: 'tiger', 虎: 'tiger',
  くま: 'bear', 熊: 'bear', うさぎ: 'rabbit', 兎: 'rabbit',
  さる: 'monkey', 猿: 'monkey', パンダ: 'panda', かも: 'duck', 鴨: 'duck',
  ひつじ: 'sheep', 羊: 'sheep', はち: 'bee', 蜂: 'bee', ちょう: 'butterfly', 蝶: 'butterfly',
  // Food
  すし: 'sushi', 寿司: 'sushi', ラーメン: 'ramen', ピザ: 'pizza',
  ハンバーガー: 'hamburger', ケーキ: 'cake', キャンディ: 'candy',
  アイスクリーム: 'icecream', 温泉: 'hotspring',
  // People & places L9-10
  カラオケ: 'karaoke', こども: 'child', 子供: 'child',
  おくさん: 'mother', つま: 'mother', 妻: 'mother',
  ごしゅじん: 'father', しゅじん: 'father', 夫: 'father',
  でんち: 'battery', 電池: 'battery', はこ: 'package', 箱: 'package',
  スイッチ: 'plug', テーブル: 'desk', ドア: 'door', まど: 'window', 窓: 'window',
  ビル: 'city', ATM: 'atm', コンビニ: 'shop', きっさてん: 'coffee',
  喫茶店: 'coffee', のりば: 'station', 乗り場: 'station',
  かぶき: 'kabuki', 歌舞伎: 'kabuki',
  // Clothing L11+
  ズボン: 'shirt', パンツ: 'shirt', スカート: 'skirt', コート: 'coat',
  セーター: 'sweater', くつした: 'shoes', 靴下: 'shoes', ぼうし: 'hat', 帽子: 'hat',
  めがね: 'glasses', 眼鏡: 'glasses', さいふ: 'wallet', 財布: 'wallet',
  タオル: 'towel', せっけん: 'soap', 石鹸: 'soap',
  シャンプー: 'soap', みずぎ: 'swimsuit', 水着: 'swimsuit',
  ふく: 'shirt', 服: 'shirt',
  // Home L12+
  れいぞうこ: 'refrigerator', 冷蔵庫: 'refrigerator', だいどころ: 'cooking', 台所: 'cooking',
  せんたくき: 'washing', 洗濯機: 'washing', そうじき: 'vacuum', 掃除機: 'vacuum',
  エアコン: 'aircon', こたつ: 'kotatsu', ふとん: 'blanket', 布団: 'blanket',
  まくら: 'pillow', 枕: 'pillow', カーテン: 'curtain',
  // Nature L12+
  かぜ: 'wind', 風: 'wind', きり: 'fog', 霧: 'fog',
  かみなり: 'thunder', 雷: 'thunder', にじ: 'rainbow', 虹: 'rainbow',
  こうえん: 'park', 公園: 'park', さくら: 'cherry', 桜: 'cherry',
  // Body L11+ (kanji disambiguates はな flower vs 鼻 nose)
  あたま: 'head', 頭: 'head', かお: 'face', 顔: 'face',
  め: 'eye', 目: 'eye', みみ: 'ear', 耳: 'ear',
  鼻: 'nose', くち: 'mouth', 口: 'mouth',
  からだ: 'body', 体: 'body', ゆび: 'finger', 指: 'finger',
  // Jobs L13+
  しゃちょう: 'boss', 社長: 'boss',
  けいさつ: 'police', 警察: 'police',
  や: 'medicine', 薬: 'medicine', くすり: 'medicine',
  // Transport L14+
  ちかてつ: 'subway', 地下鉄: 'subway', しんかんせん: 'bullettrain', 新幹線: 'bullettrain',
  フェリー: 'ferry', ロープウェイ: 'ropeway',
  // Food L15+
  やさい: 'vegetable', 野菜: 'vegetable', くだもの: 'apple', 果物: 'apple',
  みかん: 'orange', 蜜柑: 'orange',
  ぶどう: 'grape', 葡萄: 'grape', いちご: 'strawberry', 苺: 'strawberry',
  スイカ: 'watermelon', 西瓜: 'watermelon', メロン: 'melon',
  カレー: 'curry', カレーライス: 'rice', うどん: 'udon', そば: 'soba',
  やきとり: 'chicken', 焼き鳥: 'chicken', てんぷら: 'tempura', 天ぷら: 'tempura',
  おにぎり: 'onigiri', おべんとう: 'bento', お弁当: 'bento',
};

function expandTextKeys(text: string | null | undefined): string[] {
  if (!text) return [];
  const raw = text
    .replace(/\s+/g, '')
    .replace(/（.*?）/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/［.*?］/g, '');
  const parts = raw.split(/[／/／]/).filter(Boolean);
  return [...new Set([raw, ...parts])];
}

function viPhraseMatches(meaning: string, phrase: string): boolean {
  const m = meaning.toLowerCase();
  const p = phrase.toLowerCase();
  let idx = m.indexOf(p);
  while (idx !== -1) {
    const beforeOk = idx === 0 || /[\s,;.(]/.test(m[idx - 1]!);
    const afterIdx = idx + p.length;
    const afterOk = afterIdx >= m.length || /[\s,;.)]/.test(m[afterIdx]!);
    if (beforeOk && afterOk) return true;
    idx = m.indexOf(p, idx + 1);
  }
  return false;
}

export function isPictureEligible(input: {
  kana?: string | null;
  kanji?: string | null;
  meaning?: string | null;
}): boolean {
  const kana = input.kana?.trim() ?? '';
  const kanji = input.kanji?.trim() ?? '';
  const meaning = input.meaning?.toLowerCase() ?? '';

  if (/^[～~\-－]/.test(kana) || /^[～~\-－]/.test(kanji)) return false;
  if (meaning.includes('giả định') || meaning.includes('hậu tố')) return false;
  if (/^[～~]/.test(kana.replace(/\s/g, '')) && kana.length <= 8) return false;

  return true;
}

function normalizeStoredImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes('upload.wikimedia.org')) return null;
  return url;
}

function normalizeRomaji(romaji: string): string {
  return romaji
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/ou/g, 'u')
    .replace(/uu/g, 'u');
}

export function resolveVocabImage(input: {
  word?: string | null;
  meaning?: string | null;
  kana?: string | null;
  kanji?: string | null;
  imageUrl?: string | null;
}): string | null {
  if (!isPictureEligible(input)) return null;

  const stored = normalizeStoredImageUrl(input.imageUrl);
  if (stored) return stored;

  const word = input.word?.trim().toLowerCase();
  if (word && EN_WORD_MAP[word]) return PICTURE_IMAGES[EN_WORD_MAP[word]];

  const romajiKey = normalizeRomaji(input.word ?? '');
  if (romajiKey && ROMAJI_MAP[romajiKey]) return PICTURE_IMAGES[ROMAJI_MAP[romajiKey]];

  for (const kanaKey of expandTextKeys(input.kana)) {
    if (KANA_MAP[kanaKey]) return PICTURE_IMAGES[KANA_MAP[kanaKey]];
  }

  for (const kanjiKey of expandTextKeys(input.kanji)) {
    if (KANA_MAP[kanjiKey]) return PICTURE_IMAGES[KANA_MAP[kanjiKey]];
  }

  const meaning = input.meaning ?? '';
  for (const [phrase, key] of VI_PHRASE_MAP) {
    if (viPhraseMatches(meaning, phrase)) return PICTURE_IMAGES[key];
  }

  return null;
}

export function hasVocabImage(input: Parameters<typeof resolveVocabImage>[0]): boolean {
  return resolveVocabImage(input) !== null;
}
