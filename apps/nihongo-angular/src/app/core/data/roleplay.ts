export type RoleplayLine = {
  role: string;
  ja: string;
  vi: string;
};

export type RoleplayScene = {
  id: string;
  title: string;
  titleJa: string;
  desc: string;
  lines: RoleplayLine[];
};

export const ROLEPLAY_SCENES: RoleplayScene[] = [
  {
    id: 'cafe',
    title: 'Quán cà phê',
    titleJa: '喫茶店',
    desc: 'Gọi đồ uống và thanh toán.',
    lines: [
      { role: '店員', ja: 'いらっしゃいませ。', vi: 'Xin mời vào ạ.' },
      { role: 'あなた', ja: 'コーヒーを一つください。', vi: 'Cho tôi một cà phê.' },
      { role: '店員', ja: 'はい。こちらでお待ちください。', vi: 'Vâng. Xin chờ ở đây ạ.' },
      { role: '店員', ja: 'お待たせしました。コーヒーです。', vi: 'Xin lỗi đã để chờ. Đây là cà phê.' },
      { role: 'あなた', ja: 'いくらですか。', vi: 'Bao nhiêu tiền?' },
      { role: '店員', ja: '四百円です。', vi: '400 yên ạ.' },
      { role: 'あなた', ja: 'はい。どうも。', vi: 'Vâng. Cảm ơn.' },
    ],
  },
  {
    id: 'intro',
    title: 'Tự giới thiệu',
    titleJa: '自己紹介',
    desc: 'Gặp người mới, nói tên và quốc tịch.',
    lines: [
      { role: '先生', ja: '自己紹介をお願いします。', vi: 'Mời tự giới thiệu.' },
      { role: 'あなた', ja: 'はじめまして。リンと申します。', vi: 'Rất vui được gặp. Tôi tên Linh.' },
      { role: 'あなた', ja: 'ベトナムから来ました。大学生です。', vi: 'Tôi đến từ Việt Nam. Tôi là sinh viên.' },
      { role: 'あなた', ja: '趣味は音楽を聞くことです。', vi: 'Sở thích là nghe nhạc.' },
      { role: 'あなた', ja: 'どうぞよろしくお願いします。', vi: 'Rất mong được giúp đỡ.' },
      { role: '先生', ja: 'リンさん、よろしくお願いします。', vi: 'Linh, rất mong được giúp đỡ.' },
    ],
  },
  {
    id: 'station',
    title: 'Hỏi đường ở ga',
    titleJa: '駅で道を聞く',
    desc: 'Hỏi nhà vệ sinh và cửa soát vé.',
    lines: [
      { role: 'あなた', ja: 'すみません。トイレはどこですか。', vi: 'Xin lỗi, nhà vệ sinh ở đâu?' },
      { role: '駅員', ja: 'あそこで右へ行ってください。', vi: 'Đi bên phải chỗ kia.' },
      { role: 'あなた', ja: '改札はどこですか。', vi: 'Cửa soát vé ở đâu?' },
      { role: '駅員', ja: 'まっすぐ行ってください。', vi: 'Đi thẳng ạ.' },
      { role: 'あなた', ja: 'ありがとうございます。', vi: 'Cảm ơn ạ.' },
    ],
  },
];
