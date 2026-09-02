// Ngữ pháp JLPT N3 / N2 / N1 — biên soạn best-effort cho app.
// Mỗi "unit" ánh xạ 1 Lesson (lessonNumber theo quy ước 3xx/4xx/5xx).
// Danh sách còn mở rộng: thêm phần tử vào `items` hoặc thêm unit mới.

export type JlptGrammarLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type JlptGrammarExample = {
  jp: string;
  romaji: string;
  vi: string;
};

export type JlptGrammarItem = {
  pattern: string;
  meaning: string;
  explanation?: string;
  /** casual | polite | formal | written | spoken ... */
  formalityLevel?: string;
  examples: JlptGrammarExample[];
};

export type JlptGrammarUnit = {
  lessonNumber: number;
  jlptLevel: JlptGrammarLevel;
  title: string;
  sortOrder: number;
  items: JlptGrammarItem[];
};

export const JLPT_GRAMMAR_UNITS: JlptGrammarUnit[] = [
  // ─────────────────────────────── N3 ───────────────────────────────
  {
    lessonNumber: 301,
    jlptLevel: 'N3',
    title: 'N3 · Bài 1 — Nguyên nhân, điều kiện, mục đích',
    sortOrder: 3010,
    items: [
      {
        pattern: 'V(từ điển/ない) + ように',
        meaning: 'để (làm được), sao cho ~',
        explanation:
          'Diễn tả mục đích với động từ chỉ trạng thái/khả năng (không chủ ý): できる, わかる, 聞こえる, hoặc thể phủ định. So với 「ために」 (mục đích có chủ ý).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '後ろの人にも聞こえるように、大きい声で話してください。',
            romaji: 'Ushiro no hito ni mo kikoeru yō ni, ōkii koe de hanashite kudasai.',
            vi: 'Hãy nói to để người phía sau cũng nghe được.',
          },
          {
            jp: '忘れないように、手帳に書いておきます。',
            romaji: 'Wasurenai yō ni, techō ni kaite okimasu.',
            vi: 'Tôi ghi vào sổ tay để khỏi quên.',
          },
        ],
      },
      {
        pattern: 'V(từ điển) + ようにする / ようになる',
        meaning: 'cố gắng làm ~ (thói quen) / trở nên ~ (thay đổi)',
        explanation:
          '「ようにする」: nỗ lực duy trì một thói quen. 「ようになる」: sự thay đổi dần dần về trạng thái hoặc khả năng.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '毎日野菜を食べるようにしています。',
            romaji: 'Mainichi yasai o taberu yō ni shite imasu.',
            vi: 'Tôi đang cố gắng ngày nào cũng ăn rau.',
          },
          {
            jp: '練習して、泳げるようになりました。',
            romaji: 'Renshū shite, oyogeru yō ni narimashita.',
            vi: 'Nhờ luyện tập, tôi đã bơi được.',
          },
        ],
      },
      {
        pattern: 'N + のために / V(từ điển) + ために',
        meaning: 'vì, để (mục đích có chủ ý)',
        explanation:
          'Chủ ngữ hai vế giống nhau và hành động có chủ đích. Khác 「ように」 ở chỗ động từ là động từ ý chí.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '留学のために、お金を貯めています。',
            romaji: 'Ryūgaku no tame ni, okane o tamete imasu.',
            vi: 'Tôi đang để dành tiền để đi du học.',
          },
          {
            jp: '家族のために働いています。',
            romaji: 'Kazoku no tame ni hataraite imasu.',
            vi: 'Tôi làm việc vì gia đình.',
          },
        ],
      },
      {
        pattern: 'V(た) + おかげで / N + のおかげで',
        meaning: 'nhờ có ~ (kết quả tốt)',
        explanation:
          'Chỉ nguyên nhân dẫn đến kết quả tích cực, mang sắc thái biết ơn. Trái nghĩa: 「せいで」 (kết quả xấu).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '先生のおかげで合格できました。',
            romaji: 'Sensei no okage de gōkaku dekimashita.',
            vi: 'Nhờ có thầy mà em đã đỗ.',
          },
          {
            jp: '道が空いていたおかげで、早く着いた。',
            romaji: 'Michi ga suite ita okage de, hayaku tsuita.',
            vi: 'Nhờ đường vắng nên tôi đến sớm.',
          },
        ],
      },
      {
        pattern: 'V(thể thường) + せいで / N + のせいで',
        meaning: 'tại vì ~ (kết quả xấu), do lỗi của ~',
        explanation:
          'Quy trách nhiệm cho nguyên nhân gây hậu quả xấu. 「せいか」 = "có lẽ do ~" (không chắc chắn).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '寝坊したせいで、電車に乗り遅れた。',
            romaji: 'Nebō shita sei de, densha ni noriokureta.',
            vi: 'Vì ngủ quên nên tôi lỡ tàu.',
          },
          {
            jp: '雨のせいで試合が中止になった。',
            romaji: 'Ame no sei de shiai ga chūshi ni natta.',
            vi: 'Vì mưa nên trận đấu bị hủy.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + ば + ～ほど',
        meaning: 'càng ~ thì càng ~',
        explanation:
          'Động từ: 〜ば〜ほど. Tính từ -i: 〜ければ〜いほど. Tính từ -na / danh từ: 〜なら（であれば）〜なほど.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '考えれば考えるほど、わからなくなる。',
            romaji: 'Kangaereba kangaeru hodo, wakaranaku naru.',
            vi: 'Càng nghĩ càng không hiểu.',
          },
          {
            jp: '値段が高ければ高いほど、品質がいいとは限らない。',
            romaji: 'Nedan ga takakereba takai hodo, hinshitsu ga ii to wa kagiranai.',
            vi: 'Giá càng cao không hẳn chất lượng càng tốt.',
          },
        ],
      },
      {
        pattern: 'V(た) + ら + ～た (bất ngờ)',
        meaning: 'khi ~ thì (phát hiện ra) ~',
        explanation:
          'Dùng khi làm việc gì đó rồi phát hiện một sự thật bất ngờ, ngoài dự đoán. Vế sau ở thì quá khứ.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '窓を開けたら、雪が降っていた。',
            romaji: 'Mado o aketara, yuki ga futte ita.',
            vi: 'Mở cửa sổ ra thì thấy tuyết đang rơi.',
          },
          {
            jp: '家に帰ったら、誰もいなかった。',
            romaji: 'Ie ni kaettara, dare mo inakatta.',
            vi: 'Về đến nhà thì chẳng có ai.',
          },
        ],
      },
      {
        pattern: 'N + によって / により',
        meaning: 'tùy theo ~; do ~ (bị động); bằng ~',
        explanation:
          'Nhiều nghĩa: (1) tùy vào 〜によって違う; (2) chỉ tác nhân trong câu bị động; (3) phương tiện/nguyên nhân. 「による N」 khi bổ nghĩa danh từ.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '習慣は国によって違います。',
            romaji: 'Shūkan wa kuni ni yotte chigaimasu.',
            vi: 'Phong tục khác nhau tùy theo mỗi nước.',
          },
          {
            jp: 'この橋は100年前に建設されました。地震によって壊れました。',
            romaji: 'Kono hashi wa hyaku-nen mae ni kensetsu saremashita. Jishin ni yotte kowaremashita.',
            vi: 'Cây cầu này xây 100 năm trước. Nó bị hỏng do động đất.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + かもしれない',
        meaning: 'có thể ~, có lẽ ~',
        explanation:
          'Mức độ chắc chắn thấp hơn 「でしょう / だろう」. Dạng lịch sự: かもしれません. Nói tắt: かも.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '午後から雨が降るかもしれない。',
            romaji: 'Gogo kara ame ga furu kamo shirenai.',
            vi: 'Có thể chiều nay trời mưa.',
          },
          {
            jp: '彼はもう帰ったかもしれません。',
            romaji: 'Kare wa mō kaetta kamo shiremasen.',
            vi: 'Có lẽ anh ấy đã về rồi.',
          },
        ],
      },
      {
        pattern: 'V(từ điển/ない) + ことにする / ことになる',
        meaning: 'quyết định ~ / (được) quyết định là ~',
        explanation:
          '「ことにする」: bản thân quyết định. 「ことになる」: quyết định do hoàn cảnh/người khác. 「ことになっている」: quy định, lịch trình.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '来月から日本語を習うことにしました。',
            romaji: 'Raigetsu kara nihongo o narau koto ni shimashita.',
            vi: 'Tôi quyết định từ tháng sau sẽ học tiếng Nhật.',
          },
          {
            jp: '4月に大阪へ転勤することになりました。',
            romaji: 'Shi-gatsu ni Ōsaka e tenkin suru koto ni narimashita.',
            vi: 'Tháng 4 tôi được chuyển công tác đến Osaka.',
          },
        ],
      },
      {
        pattern: 'V(た) + ばかり',
        meaning: 'vừa mới ~ xong',
        explanation:
          'Nhấn mạnh cảm giác chủ quan rằng việc vừa xảy ra, khác 「たところ」 (khách quan về thời điểm).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '日本に来たばかりで、まだ何もわかりません。',
            romaji: 'Nihon ni kita bakari de, mada nani mo wakarimasen.',
            vi: 'Tôi vừa mới đến Nhật nên chưa biết gì cả.',
          },
          {
            jp: 'さっき昼ごはんを食べたばかりです。',
            romaji: 'Sakki hirugohan o tabeta bakari desu.',
            vi: 'Tôi vừa mới ăn trưa xong.',
          },
        ],
      },
      {
        pattern: 'V(từ điển) + ところ / V(ている) + ところ / V(た) + ところ',
        meaning: 'sắp / đang / vừa mới làm ~',
        explanation:
          'Diễn tả giai đoạn của hành động theo thời gian. 〜ているところ nhấn mạnh "ngay lúc này đang".',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '今から出かけるところです。',
            romaji: 'Ima kara dekakeru tokoro desu.',
            vi: 'Tôi đang chuẩn bị ra ngoài đây.',
          },
          {
            jp: 'ちょうど今、駅に着いたところです。',
            romaji: 'Chōdo ima, eki ni tsuita tokoro desu.',
            vi: 'Tôi vừa mới đến ga xong.',
          },
        ],
      },
    ],
  },
  {
    lessonNumber: 302,
    jlptLevel: 'N3',
    title: 'N3 · Bài 2 — Truyền đạt, phỏng đoán, trạng thái',
    sortOrder: 3020,
    items: [
      {
        pattern: 'V/A/N(thể thường) + そうだ (nghe nói)',
        meaning: 'nghe nói rằng ~',
        explanation:
          'Truyền đạt thông tin nghe được. Không chia đuôi. Nguồn tin: 「〜によると」. Khác với 「そうだ」 dạng có vẻ (bỏ い/だ).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '天気予報によると、明日は台風が来るそうだ。',
            romaji: 'Tenki yohō ni yoru to, ashita wa taifū ga kuru sō da.',
            vi: 'Theo dự báo thời tiết, nghe nói mai bão đến.',
          },
          {
            jp: '田中さんは来月結婚するそうです。',
            romaji: 'Tanaka-san wa raigetsu kekkon suru sō desu.',
            vi: 'Nghe nói anh Tanaka tháng sau cưới.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ)/A + そうだ (có vẻ)',
        meaning: 'trông có vẻ ~, sắp ~',
        explanation:
          'Phán đoán từ vẻ bề ngoài. いい → よさそう, ない → なさそう. Không dùng với đặc điểm nhìn rõ ràng (きれい, 赤い).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: 'このケーキ、おいしそうですね。',
            romaji: 'Kono kēki, oishisō desu ne.',
            vi: 'Cái bánh này trông ngon nhỉ.',
          },
          {
            jp: '今にも雨が降りそうだ。',
            romaji: 'Ima ni mo ame ga furisō da.',
            vi: 'Trời như sắp mưa đến nơi.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + ようだ / みたいだ',
        meaning: 'hình như ~, có vẻ như ~ (suy đoán theo cảm nhận)',
        explanation:
          '「ようだ」 trang trọng hơn, 「みたいだ」 hội thoại. Căn cứ vào quan sát/cảm giác trực tiếp của người nói. N + のようだ / N + みたいだ.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '電気が消えている。田中さんはもう帰ったようだ。',
            romaji: 'Denki ga kiete iru. Tanaka-san wa mō kaetta yō da.',
            vi: 'Đèn tắt rồi. Hình như anh Tanaka đã về.',
          },
          {
            jp: '彼女は疲れているみたいだ。',
            romaji: 'Kanojo wa tsukarete iru mitai da.',
            vi: 'Cô ấy trông có vẻ mệt.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + らしい',
        meaning: 'nghe nói / hình như ~ (theo thông tin bên ngoài)',
        explanation:
          'Suy đoán dựa trên thông tin nghe/đọc được, trách nhiệm thông tin ít hơn. N + らしい còn nghĩa "đúng chất ~" (男らしい).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: 'ニュースによると、その事故でけが人はいなかったらしい。',
            romaji: 'Nyūsu ni yoru to, sono jiko de keganin wa inakatta rashii.',
            vi: 'Theo tin tức, hình như vụ tai nạn đó không có ai bị thương.',
          },
          {
            jp: '今日の彼はいつもより元気らしい。',
            romaji: 'Kyō no kare wa itsumo yori genki rashii.',
            vi: 'Hôm nay anh ấy có vẻ khỏe hơn mọi ngày.',
          },
        ],
      },
      {
        pattern: 'V(て) + ある',
        meaning: '(đồ vật) đã được làm sẵn và giữ nguyên trạng thái',
        explanation:
          'Tha động từ + てある: nhấn mạnh kết quả có chủ đích còn lưu lại. Khác 〜ている (tự động từ, trạng thái tự nhiên).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '壁に地図が貼ってあります。',
            romaji: 'Kabe ni chizu ga hatte arimasu.',
            vi: 'Trên tường có dán bản đồ (ai đó đã dán sẵn).',
          },
          {
            jp: '旅行の準備はもうしてあります。',
            romaji: 'Ryokō no junbi wa mō shite arimasu.',
            vi: 'Việc chuẩn bị cho chuyến đi đã làm xong sẵn rồi.',
          },
        ],
      },
      {
        pattern: 'V(て) + おく',
        meaning: 'làm sẵn ~ để chuẩn bị / cứ để nguyên ~',
        explanation:
          'Chuẩn bị trước cho tương lai, hoặc để mặc nguyên trạng thái. Nói tắt: 〜とく / 〜どく.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '客が来る前に、部屋を掃除しておきます。',
            romaji: 'Kyaku ga kuru mae ni, heya o sōji shite okimasu.',
            vi: 'Trước khi khách đến, tôi dọn phòng sẵn.',
          },
          {
            jp: 'その資料はそこに置いておいてください。',
            romaji: 'Sono shiryō wa soko ni oite oite kudasai.',
            vi: 'Cứ để tài liệu đó ở đấy giúp tôi.',
          },
        ],
      },
      {
        pattern: 'V(て) + しまう',
        meaning: 'lỡ ~ mất rồi / làm xong hẳn ~',
        explanation:
          'Sắc thái tiếc nuối, hối hận, hoặc hoàn thành trọn vẹn. Nói tắt: 〜ちゃう / 〜じゃう.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '電車に傘を忘れてしまった。',
            romaji: 'Densha ni kasa o wasurete shimatta.',
            vi: 'Tôi lỡ để quên ô trên tàu mất rồi.',
          },
          {
            jp: 'その本は一日で読んでしまいました。',
            romaji: 'Sono hon wa ichinichi de yonde shimaimashita.',
            vi: 'Cuốn sách đó tôi đọc hết trong một ngày.',
          },
        ],
      },
      {
        pattern: 'V(từ điển/ない) + ことがある',
        meaning: 'có lúc ~, thỉnh thoảng ~',
        explanation:
          'Diễn tả việc thỉnh thoảng xảy ra. Khác 「V(た)ことがある」 (đã từng ~ - kinh nghiệm).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: 'たまに朝ごはんを食べないことがある。',
            romaji: 'Tama ni asagohan o tabenai koto ga aru.',
            vi: 'Thỉnh thoảng tôi cũng có hôm không ăn sáng.',
          },
          {
            jp: '仕事で日本へ行くことがあります。',
            romaji: 'Shigoto de Nihon e iku koto ga arimasu.',
            vi: 'Có lúc tôi đi Nhật vì công việc.',
          },
        ],
      },
      {
        pattern: 'V(た) + まま / N + のまま',
        meaning: 'để nguyên trạng thái ~ mà ~',
        explanation:
          'Một trạng thái được giữ nguyên trong khi hành động khác diễn ra (thường là bất thường).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: 'エアコンをつけたまま出かけてしまった。',
            romaji: 'Eakon o tsuketa mama dekakete shimatta.',
            vi: 'Tôi ra ngoài mà quên tắt điều hòa.',
          },
          {
            jp: '靴のまま入らないでください。',
            romaji: 'Kutsu no mama hairanaide kudasai.',
            vi: 'Xin đừng đi nguyên giày vào.',
          },
        ],
      },
      {
        pattern: 'V(từ điển) + につれて / にしたがって',
        meaning: 'càng ~ thì càng ~ (biến đổi song song)',
        explanation:
          'Hai sự việc biến đổi cùng chiều theo thời gian. Dùng với danh từ chỉ sự biến hóa: 時間, 成長.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '時間がたつにつれて、痛みは消えていった。',
            romaji: 'Jikan ga tatsu ni tsurete, itami wa kiete itta.',
            vi: 'Thời gian trôi qua thì cơn đau cũng dần biến mất.',
          },
          {
            jp: '山を登るにしたがって、気温が下がってきた。',
            romaji: 'Yama o noboru ni shitagatte, kion ga sagatte kita.',
            vi: 'Càng lên núi thì nhiệt độ càng giảm.',
          },
        ],
      },
      {
        pattern: 'N + として',
        meaning: 'với tư cách là ~, coi như là ~',
        explanation:
          'Chỉ tư cách, vai trò, danh nghĩa. 「〜としては」 nhấn mạnh, 「〜としても」 kết hợp giả định.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '彼は医者として、また作家としても有名だ。',
            romaji: 'Kare wa isha to shite, mata sakka to shite mo yūmei da.',
            vi: 'Anh ấy nổi tiếng với tư cách bác sĩ, và cả nhà văn nữa.',
          },
          {
            jp: '留学生として日本に来ました。',
            romaji: 'Ryūgakusei to shite Nihon ni kimashita.',
            vi: 'Tôi đến Nhật với tư cách du học sinh.',
          },
        ],
      },
    ],
  },
  {
    lessonNumber: 303,
    jlptLevel: 'N3',
    title: 'N3 · Bài 3 — Kính ngữ, bị động, sai khiến',
    sortOrder: 3030,
    items: [
      {
        pattern: 'V(bị động) — られる / れる',
        meaning: 'bị / được ~',
        explanation:
          'Nhóm I: あ段 + れる. Nhóm II: 〜られる. する→される, くる→こられる. Có bị động trực tiếp, gián tiếp (thiệt hại), và bị động sự vật.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '弟にケーキを食べられた。',
            romaji: 'Otōto ni kēki o taberareta.',
            vi: 'Bị em trai ăn mất cái bánh.',
          },
          {
            jp: 'この寺は300年前に建てられました。',
            romaji: 'Kono tera wa sanbyaku-nen mae ni tateraremashita.',
            vi: 'Ngôi chùa này được xây dựng 300 năm trước.',
          },
        ],
      },
      {
        pattern: 'V(sai khiến) — させる / せる',
        meaning: 'bắt / cho phép ~ làm ~',
        explanation:
          'Nhóm I: あ段 + せる. Nhóm II: 〜させる. Người bị sai khiến đánh dấu bằng を (tự động từ) hoặc に (tha động từ).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '母は妹に部屋を掃除させた。',
            romaji: 'Haha wa imōto ni heya o sōji saseta.',
            vi: 'Mẹ bắt em gái dọn phòng.',
          },
          {
            jp: '子どもを公園で遊ばせた。',
            romaji: 'Kodomo o kōen de asobaseta.',
            vi: 'Tôi cho bọn trẻ chơi ở công viên.',
          },
        ],
      },
      {
        pattern: 'V(sai khiến bị động) — させられる / せられる',
        meaning: 'bị bắt phải ~ (miễn cưỡng)',
        explanation:
          'Nhóm I có thể rút gọn 〜される (trừ đuôi す). Diễn tả bị ép làm điều không muốn.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '子どものとき、毎日ピアノを練習させられた。',
            romaji: 'Kodomo no toki, mainichi piano o renshū saserareta.',
            vi: 'Hồi nhỏ tôi bị bắt tập piano mỗi ngày.',
          },
          {
            jp: '飲み会で歌を歌わされた。',
            romaji: 'Nomikai de uta o utawasareta.',
            vi: 'Ở buổi nhậu tôi bị ép hát.',
          },
        ],
      },
      {
        pattern: 'お + V(ます bỏ) + になる / ご + N + になる',
        meaning: 'tôn kính ngữ (hành động của người trên)',
        explanation:
          'Kính ngữ dạng chung. Một số động từ có dạng riêng: いらっしゃる, おっしゃる,召し上がる, ご覧になる, なさる.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '社長はもうお帰りになりました。',
            romaji: 'Shachō wa mō okaeri ni narimashita.',
            vi: 'Giám đốc đã về rồi ạ.',
          },
          {
            jp: '先生はこの本をお読みになりましたか。',
            romaji: 'Sensei wa kono hon o oyomi ni narimashita ka.',
            vi: 'Thầy đã đọc cuốn sách này chưa ạ?',
          },
        ],
      },
      {
        pattern: 'お + V(ます bỏ) + する / いたす',
        meaning: 'khiêm nhường ngữ (hành động của mình hướng tới người trên)',
        explanation:
          '「いたす」 khiêm nhường hơn. Dạng riêng: 参る, 申す/申し上げる, いただく, 拝見する, 伺う.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: 'お荷物をお持ちします。',
            romaji: 'Onimotsu o omochi shimasu.',
            vi: 'Để tôi xách hành lý giúp ạ.',
          },
          {
            jp: '後ほどこちらからご連絡いたします。',
            romaji: 'Nochihodo kochira kara gorenraku itashimasu.',
            vi: 'Lát nữa chúng tôi sẽ liên lạc lại ạ.',
          },
        ],
      },
      {
        pattern: 'V(て) + いただけませんか / くださいませんか',
        meaning: 'xin ~ có thể ~ giúp tôi được không ạ?',
        explanation:
          'Nhờ vả lịch sự. 「〜ていただけませんか」 khiêm nhường hơn 「〜てくださいませんか」. Lịch sự hơn nữa: 〜ていただけないでしょうか.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: 'すみません、写真を撮っていただけませんか。',
            romaji: 'Sumimasen, shashin o totte itadakemasen ka.',
            vi: 'Xin lỗi, anh/chị chụp ảnh giúp tôi được không ạ?',
          },
          {
            jp: 'もう少し詳しく説明していただけないでしょうか。',
            romaji: 'Mō sukoshi kuwashiku setsumei shite itadakenai deshō ka.',
            vi: 'Anh/chị có thể giải thích kỹ hơn một chút được không ạ?',
          },
        ],
      },
      {
        pattern: 'V(て) + くれる / もらう / あげる (授受)',
        meaning: 'ai đó làm cho tôi / tôi nhận được / tôi làm cho ai',
        explanation:
          'Hệ thống cho–nhận hành động. Chú ý điểm nhìn: 〜てくれる (hướng về mình), 〜てあげる (từ mình ra), 〜てもらう (mình được lợi).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '友達が引っ越しを手伝ってくれた。',
            romaji: 'Tomodachi ga hikkoshi o tetsudatte kureta.',
            vi: 'Bạn tôi đã giúp tôi chuyển nhà.',
          },
          {
            jp: '先生に作文を直してもらった。',
            romaji: 'Sensei ni sakubun o naoshite moratta.',
            vi: 'Tôi được thầy sửa bài văn cho.',
          },
        ],
      },
      {
        pattern: 'V(て) + ほしい / V(ない) でほしい',
        meaning: 'muốn ai đó làm / đừng làm ~',
        explanation:
          'Nguyện vọng về hành động của người khác. Người đó đánh dấu bằng に (hoặc が). Trang trọng: 〜ていただきたい.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '君にもっと自信を持ってほしい。',
            romaji: 'Kimi ni motto jishin o motte hoshii.',
            vi: 'Tôi muốn cậu tự tin hơn.',
          },
          {
            jp: 'ここではタバコを吸わないでほしい。',
            romaji: 'Koko de wa tabako o suwanaide hoshii.',
            vi: 'Tôi mong đừng hút thuốc ở đây.',
          },
        ],
      },
      {
        pattern: 'V(từ điển/ない) + ように言う / 伝える',
        meaning: 'bảo/nhắn (ai) rằng hãy ~',
        explanation:
          'Truyền đạt gián tiếp mệnh lệnh, yêu cầu. Cũng dùng 〜ようにお願いする, 〜ように注意する.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '田中さんに、後で電話するように伝えてください。',
            romaji: 'Tanaka-san ni, ato de denwa suru yō ni tsutaete kudasai.',
            vi: 'Nhắn anh Tanaka lát nữa gọi điện giúp tôi nhé.',
          },
          {
            jp: '医者に、お酒を飲まないように言われた。',
            romaji: 'Isha ni, osake o nomanai yō ni iwareta.',
            vi: 'Bác sĩ dặn tôi đừng uống rượu.',
          },
        ],
      },
      {
        pattern: 'V(受身/使役) trong văn viết trang trọng',
        meaning: 'kính ngữ dạng bị động — られる chỉ sự tôn kính',
        explanation:
          '「れる/られる」 còn dùng như kính ngữ nhẹ, thường trong văn nói lịch sự công sở.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '部長はもう出発されました。',
            romaji: 'Buchō wa mō shuppatsu saremashita.',
            vi: 'Trưởng phòng đã khởi hành rồi ạ.',
          },
          {
            jp: '社長はゴルフをされますか。',
            romaji: 'Shachō wa gorufu o saremasu ka.',
            vi: 'Giám đốc có chơi golf không ạ?',
          },
        ],
      },
    ],
  },
  {
    lessonNumber: 304,
    jlptLevel: 'N3',
    title: 'N3 · Bài 4 — Diễn đạt nâng cao, liên từ',
    sortOrder: 3040,
    items: [
      {
        pattern: 'V/A/N(thể thường) + のに',
        meaning: 'mặc dù ~ nhưng (bất mãn, ngoài mong đợi)',
        explanation:
          'Mang cảm xúc tiếc nuối, bất bình. N/Na + なのに. Không dùng để nêu ý định/mệnh lệnh ở vế sau.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '約束したのに、彼は来なかった。',
            romaji: 'Yakusoku shita noni, kare wa konakatta.',
            vi: 'Đã hẹn rồi mà anh ấy không đến.',
          },
          {
            jp: '日曜日なのに、仕事をしなければならない。',
            romaji: 'Nichiyōbi nanoni, shigoto o shinakereba naranai.',
            vi: 'Chủ nhật rồi mà vẫn phải đi làm.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + くせに',
        meaning: 'mặc dù ~ vậy mà (chê trách, coi thường)',
        explanation:
          'Giống 「のに」 nhưng sắc thái phê phán mạnh, hàm ý xem thường đối tượng. Chủ ngữ hai vế phải cùng người.',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: '知っているくせに、教えてくれない。',
            romaji: 'Shitte iru kuse ni, oshiete kurenai.',
            vi: 'Rõ ràng biết mà không chịu chỉ.',
          },
          {
            jp: '子どものくせに、生意気なことを言うな。',
            romaji: 'Kodomo no kuse ni, namaiki na koto o iu na.',
            vi: 'Con nít mà bày đặt nói năng hỗn.',
          },
        ],
      },
      {
        pattern: 'V(từ điển) + ばかりでなく / だけでなく',
        meaning: 'không chỉ ~ mà còn ~',
        explanation:
          'Bổ sung thông tin. Thường đi với 「〜も」 ở vế sau. Trang trọng hơn: 〜のみならず.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '彼は英語だけでなく、フランス語も話せる。',
            romaji: 'Kare wa eigo dake de naku, furansugo mo hanaseru.',
            vi: 'Anh ấy không chỉ nói được tiếng Anh mà cả tiếng Pháp.',
          },
          {
            jp: 'この店は安いばかりでなく、味もいい。',
            romaji: 'Kono mise wa yasui bakari de naku, aji mo ii.',
            vi: 'Quán này không chỉ rẻ mà còn ngon.',
          },
        ],
      },
      {
        pattern: 'V(từ điển/ない) + わけだ',
        meaning: 'hóa ra là ~, thảo nào ~',
        explanation:
          'Rút ra kết luận hợp lý từ tình huống. Khác 「わけがない」 (không thể nào), 「わけではない」 (không hẳn là).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '3年も日本にいたのか。日本語が上手なわけだ。',
            romaji: 'San-nen mo Nihon ni ita no ka. Nihongo ga jōzu na wake da.',
            vi: 'Ở Nhật những 3 năm à. Thảo nào tiếng Nhật giỏi.',
          },
          {
            jp: '窓が開いている。寒いわけだ。',
            romaji: 'Mado ga aite iru. Samui wake da.',
            vi: 'Cửa sổ mở kìa. Thảo nào lạnh.',
          },
        ],
      },
      {
        pattern: 'V(từ điển/ない) + わけにはいかない',
        meaning: 'không thể ~ được (vì lý do đạo lý/hoàn cảnh)',
        explanation:
          'Không thể làm vì ràng buộc xã hội, tâm lý. 「Vないわけにはいかない」 = buộc phải làm.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '大事な会議だから、休むわけにはいかない。',
            romaji: 'Daiji na kaigi da kara, yasumu wake ni wa ikanai.',
            vi: 'Cuộc họp quan trọng nên không thể nghỉ được.',
          },
          {
            jp: '約束したから、行かないわけにはいかない。',
            romaji: 'Yakusoku shita kara, ikanai wake ni wa ikanai.',
            vi: 'Đã hứa rồi nên không đi không được.',
          },
        ],
      },
      {
        pattern: 'V(た/ている) + ところに / ところへ / ところを',
        meaning: 'đúng lúc đang ~ thì ~',
        explanation:
          'Một việc xen vào đúng thời điểm của việc khác. 「ところを」 khi vế sau là hành động tác động lên chủ thể.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '出かけようとしたところに、電話がかかってきた。',
            romaji: 'Dekakeyō to shita tokoro ni, denwa ga kakatte kita.',
            vi: 'Đúng lúc định ra ngoài thì có điện thoại.',
          },
          {
            jp: 'サボっているところを先生に見られた。',
            romaji: 'Sabotte iru tokoro o sensei ni mirareta.',
            vi: 'Đang trốn việc thì bị thầy bắt gặp.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ) + っぱなし',
        meaning: 'cứ để ~ mãi (không xử lý)',
        explanation:
          'Trạng thái bị bỏ mặc, thường tiêu cực. 出しっぱなし, つけっぱなし, 立ちっぱなし.',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: '水を出しっぱなしにしないで。',
            romaji: 'Mizu o dashippanashi ni shinaide.',
            vi: 'Đừng để nước chảy mãi thế.',
          },
          {
            jp: '電車で1時間立ちっぱなしだった。',
            romaji: 'Densha de ichi-jikan tachippanashi datta.',
            vi: 'Tôi đứng suốt 1 tiếng trên tàu.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ) + がち',
        meaning: 'hay bị ~, có xu hướng ~ (tiêu cực)',
        explanation:
          'Khuynh hướng thường xuyên xảy ra, đa phần không mong muốn. 病気がち, 遠慮がち, 曇りがち.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '最近、残業が続いて疲れがちだ。',
            romaji: 'Saikin, zangyō ga tsuzuite tsukaregachi da.',
            vi: 'Dạo này tăng ca liên tục nên hay mệt.',
          },
          {
            jp: '彼は約束を忘れがちだ。',
            romaji: 'Kare wa yakusoku o wasuregachi da.',
            vi: 'Anh ấy hay quên hẹn.',
          },
        ],
      },
      {
        pattern: 'N + っぽい / V(ます bỏ) + っぽい',
        meaning: 'có vẻ ~, giống ~, dễ ~',
        explanation:
          'Cảm nhận chủ quan về tính chất. 子どもっぽい, 忘れっぽい, 白っぽい, 怒りっぽい.',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: 'この色は少し安っぽく見える。',
            romaji: 'Kono iro wa sukoshi yasuppoku mieru.',
            vi: 'Màu này trông hơi rẻ tiền.',
          },
          {
            jp: '年を取って、忘れっぽくなった。',
            romaji: 'Toshi o totte, wasureppoku natta.',
            vi: 'Có tuổi rồi nên đâm ra hay quên.',
          },
        ],
      },
      {
        pattern: 'V(từ điển) + 一方だ',
        meaning: 'ngày càng ~ (một chiều)',
        explanation:
          'Xu hướng biến đổi liên tục theo một hướng, thường xấu đi. 「〜一方で」 = mặt khác thì (đối lập).',
        formalityLevel: 'written',
        examples: [
          {
            jp: '物価は上がる一方だ。',
            romaji: 'Bukka wa agaru ippō da.',
            vi: 'Vật giá cứ tăng mãi.',
          },
          {
            jp: '田舎の人口は減る一方だ。',
            romaji: 'Inaka no jinkō wa heru ippō da.',
            vi: 'Dân số vùng quê ngày càng giảm.',
          },
        ],
      },
    ],
  },

  {
    lessonNumber: 305,
    jlptLevel: 'N3',
    title: 'N3 · Bài 5 — Giả định, so sánh, mức độ',
    sortOrder: 3050,
    items: [
      {
        pattern: 'V(た) + ら / なら / と / ば (ôn 4 điều kiện)',
        meaning: 'nếu ~ thì ~',
        explanation:
          '「と」: quy luật tất yếu. 「ば」: điều kiện chung, không dùng ý chí ở vế sau nếu vế trước là động từ. 「たら」: linh hoạt nhất. 「なら」: dựa trên điều người kia vừa nói.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '春になると、桜が咲きます。',
            romaji: 'Haru ni naru to, sakura ga sakimasu.',
            vi: 'Cứ đến mùa xuân là hoa anh đào nở.',
          },
          {
            jp: '日本へ行くなら、京都がおすすめです。',
            romaji: 'Nihon e iku nara, Kyōto ga osusume desu.',
            vi: 'Nếu (định) đi Nhật thì tôi khuyên nên đến Kyoto.',
          },
        ],
      },
      {
        pattern: 'たとえ + V/A/N(て) + も',
        meaning: 'cho dù ~ đi nữa thì cũng ~',
        explanation:
          'Nhấn mạnh sự nhượng bộ. 「たとえ」 đi kèm 「〜ても」 để làm rõ giả định.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: 'たとえ雨が降っても、行きます。',
            romaji: 'Tatoe ame ga futte mo, ikimasu.',
            vi: 'Cho dù trời mưa tôi cũng đi.',
          },
          {
            jp: 'たとえ高くても、必要なら買う。',
            romaji: 'Tatoe takakute mo, hitsuyō nara kau.',
            vi: 'Dù có đắt, nếu cần thì tôi vẫn mua.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + ば + ～のに / たら + ～のに',
        meaning: 'giá mà ~ thì đã ~ (tiếc nuối)',
        explanation:
          'Giả định trái thực tế kèm cảm xúc tiếc. Vế sau thường bỏ lửng: 「〜ばよかった(のに)」.',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: 'もっと早く出れば、間に合ったのに。',
            romaji: 'Motto hayaku dereba, maniatta noni.',
            vi: 'Giá mà ra sớm hơn thì đã kịp rồi.',
          },
          {
            jp: '言ってくれたらよかったのに。',
            romaji: 'Itte kuretara yokatta noni.',
            vi: 'Giá mà cậu nói với tớ thì tốt biết mấy.',
          },
        ],
      },
      {
        pattern: 'N + くらい / ぐらい',
        meaning: 'khoảng ~; đến mức ~',
        explanation:
          'Chỉ mức độ ước lượng, hoặc mức độ tối thiểu/thấp ("chỉ chừng đó thôi").',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '駅まで歩いて10分くらいです。',
            romaji: 'Eki made aruite juppun kurai desu.',
            vi: 'Đi bộ đến ga khoảng 10 phút.',
          },
          {
            jp: '自分の部屋くらい自分で掃除しなさい。',
            romaji: 'Jibun no heya kurai jibun de sōji shinasai.',
            vi: 'Ít nhất là phòng của mình thì tự dọn đi.',
          },
        ],
      },
      {
        pattern: 'N + ほど / V(từ điển) + ほど',
        meaning: 'đến mức ~; không ~ bằng ~',
        explanation:
          '「〜ほど〜ない」: so sánh, "A không bằng B". Cũng chỉ mức độ cao: 「泣きたいほど」.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '今日は昨日ほど寒くない。',
            romaji: 'Kyō wa kinō hodo samukunai.',
            vi: 'Hôm nay không lạnh bằng hôm qua.',
          },
          {
            jp: '足が痛くて、歩けないほどだ。',
            romaji: 'Ashi ga itakute, arukenai hodo da.',
            vi: 'Chân đau đến mức không đi nổi.',
          },
        ],
      },
      {
        pattern: 'N/V(từ điển) + にすぎない → ôn; V(た/ている) + ばかり + だ',
        meaning: 'toàn là ~, cứ ~ suốt',
        explanation:
          '「〜てばかりいる」: chỉ làm mỗi việc đó (chê trách). 「〜たばかり」 (vừa mới) đã học ở Bài 1.',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: '弟はゲームをしてばかりいる。',
            romaji: 'Otōto wa gēmu o shite bakari iru.',
            vi: 'Em trai tôi cứ chơi game suốt.',
          },
          {
            jp: '文句ばかり言わないで、手伝ってよ。',
            romaji: 'Monku bakari iwanaide, tetsudatte yo.',
            vi: 'Đừng có than suốt, phụ tớ đi.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ) + ながら (đối lập)',
        meaning: 'tuy ~ nhưng ~',
        explanation:
          'Ngoài nghĩa "vừa…vừa", 「ながら(も)」 còn chỉ sự đối lập. 「残念ながら」, 「知っていながら」.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '狭いながらも、楽しい我が家だ。',
            romaji: 'Semai nagara mo, tanoshii wagaya da.',
            vi: 'Tuy chật nhưng là mái nhà vui vẻ của tôi.',
          },
          {
            jp: '残念ながら、今回は不合格でした。',
            romaji: 'Zannen nagara, konkai wa fugōkaku deshita.',
            vi: 'Tiếc là lần này không đỗ.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + みたいに / みたいな N',
        meaning: 'như là ~, giống ~',
        explanation:
          'Bản hội thoại của 「〜のように / のような」. So sánh, ví von.',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: '彼は子どもみたいに泣いた。',
            romaji: 'Kare wa kodomo mitai ni naita.',
            vi: 'Anh ấy khóc như một đứa trẻ.',
          },
          {
            jp: 'あなたみたいな人になりたい。',
            romaji: 'Anata mitai na hito ni naritai.',
            vi: 'Tôi muốn trở thành người như bạn.',
          },
        ],
      },
      {
        pattern: 'V(từ điển/ない) + ようにも + V(khả năng ない)',
        meaning: 'dù muốn ~ cũng không ~ được',
        explanation:
          'Muốn làm nhưng hoàn cảnh không cho phép. 「行こうにも行けない」.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'お金がなくて、旅行しようにもできない。',
            romaji: 'Okane ga nakute, ryokō shiyō ni mo dekinai.',
            vi: 'Không có tiền nên muốn đi du lịch cũng không được.',
          },
          {
            jp: '道が混んでいて、急ごうにも急げない。',
            romaji: 'Michi ga konde ite, isogō ni mo isogenai.',
            vi: 'Đường tắc nên muốn vội cũng không vội được.',
          },
        ],
      },
      {
        pattern: 'N + からいうと / からみると / からいえば',
        meaning: 'xét về mặt ~, từ góc độ ~',
        explanation:
          'Nêu góc nhìn/tiêu chí để đánh giá. Gần với 「〜にとって」 nhưng thiên về "đứng ở lập trường đó mà nói".',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '経験からいうと、この方法が一番いい。',
            romaji: 'Keiken kara iu to, kono hōhō ga ichiban ii.',
            vi: 'Xét theo kinh nghiệm thì cách này là tốt nhất.',
          },
          {
            jp: '親からみると、子どもはいつまでも子どもだ。',
            romaji: 'Oya kara miru to, kodomo wa itsu made mo kodomo da.',
            vi: 'Dưới góc nhìn của cha mẹ, con cái mãi vẫn là con nít.',
          },
        ],
      },
      {
        pattern: 'V(た) + り + V(た) + り + する',
        meaning: 'nào là ~ nào là ~ (liệt kê hành động)',
        explanation:
          'Ôn tập N4 nhưng hay ra ở N3: liệt kê không đầy đủ các hành động. Cũng dùng cho trạng thái đối lập (泣いたり笑ったり).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '休みの日は、本を読んだり映画を見たりします。',
            romaji: 'Yasumi no hi wa, hon o yondari eiga o mitari shimasu.',
            vi: 'Ngày nghỉ tôi nào là đọc sách nào là xem phim.',
          },
          {
            jp: '値段が上がったり下がったりしている。',
            romaji: 'Nedan ga agattari sagattari shite iru.',
            vi: 'Giá cứ lúc lên lúc xuống.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────── N2 ───────────────────────────────
  {
    lessonNumber: 401,
    jlptLevel: 'N2',
    title: 'N2 · Bài 1 — Thời điểm, đồng thời, ngay khi',
    sortOrder: 4010,
    items: [
      {
        pattern: 'V(た/từ điển) + とたん(に)',
        meaning: 'ngay khoảnh khắc ~ thì (bất ngờ)',
        explanation:
          'Ngay lập tức xảy ra việc thứ hai, thường ngoài ý muốn. Vế sau ở quá khứ, không dùng cho ý chí/mệnh lệnh.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'ドアを開けたとたん、猫が飛び出してきた。',
            romaji: 'Doa o aketa totan, neko ga tobidashite kita.',
            vi: 'Vừa mở cửa ra thì con mèo lao vụt ra.',
          },
          {
            jp: '立ち上がったとたんに、めまいがした。',
            romaji: 'Tachiagatta totan ni, memai ga shita.',
            vi: 'Vừa đứng dậy thì chóng mặt.',
          },
        ],
      },
      {
        pattern: 'V(từ điển) + か + V(ない) + かのうちに',
        meaning: 'gần như đồng thời, chưa kịp ~ đã ~',
        explanation:
          'Hai việc xảy ra sát nhau đến mức khó phân biệt trước sau.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'ベルが鳴るか鳴らないかのうちに、彼は教室を出て行った。',
            romaji: 'Beru ga naru ka naranai ka no uchi ni, kare wa kyōshitsu o dete itta.',
            vi: 'Chuông gần như chưa reo anh ấy đã ra khỏi lớp.',
          },
          {
            jp: '横になるかならないかのうちに、眠ってしまった。',
            romaji: 'Yoko ni naru ka naranai ka no uchi ni, nemutte shimatta.',
            vi: 'Vừa đặt lưng xuống là ngủ luôn.',
          },
        ],
      },
      {
        pattern: 'V(た) + かと思うと / かと思ったら',
        meaning: 'vừa mới ~ đã ~ ngay (thay đổi nhanh, ngạc nhiên)',
        explanation:
          'Người nói ngạc nhiên vì hai việc trái ngược nối tiếp quá nhanh. Không dùng cho việc của bản thân, không dùng ý chí/mệnh lệnh ở vế sau.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '赤ちゃんは泣いていたかと思うと、もう笑っている。',
            romaji: 'Akachan wa naite ita ka to omou to, mō waratte iru.',
            vi: 'Em bé vừa còn khóc đã cười ngay.',
          },
          {
            jp: '空が暗くなったかと思ったら、大粒の雨が降ってきた。',
            romaji: 'Sora ga kuraku natta ka to omottara, ōtsubu no ame ga futte kita.',
            vi: 'Trời vừa tối sầm lại đã đổ mưa hạt to.',
          },
        ],
      },
      {
        pattern: 'V(từ điển) + なり',
        meaning: 'vừa ~ là ~ ngay lập tức',
        explanation:
          'Chủ thể làm ngay việc thứ hai (thường bất thường) ngay sau việc thứ nhất. Chủ ngữ hai vế cùng người, không phải bản thân người nói.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '彼は家に帰るなり、部屋に閉じこもった。',
            romaji: 'Kare wa ie ni kaeru nari, heya ni tojikomotta.',
            vi: 'Vừa về đến nhà là anh ta nhốt mình trong phòng.',
          },
          {
            jp: '知らせを聞くなり、彼女は泣き出した。',
            romaji: 'Shirase o kiku nari, kanojo wa nakidashita.',
            vi: 'Vừa nghe tin là cô ấy òa khóc.',
          },
        ],
      },
      {
        pattern: 'V(た) + きり / N + きり',
        meaning: 'kể từ khi ~ thì không ~ nữa; chỉ ~',
        explanation:
          'Sau một việc thì trạng thái đó kéo dài, không có tiếp diễn mong đợi. 「〜きり」 còn nghĩa "chỉ có, duy nhất".',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '彼とは10年前に会ったきり、連絡がない。',
            romaji: 'Kare to wa jū-nen mae ni atta kiri, renraku ga nai.',
            vi: 'Gặp anh ấy 10 năm trước rồi từ đó bặt tin.',
          },
          {
            jp: '二人きりで話したい。',
            romaji: 'Futari kiri de hanashitai.',
            vi: 'Tôi muốn nói chuyện chỉ hai người thôi.',
          },
        ],
      },
      {
        pattern: 'N + の際(に) / V(từ điển/た) + 際(に)',
        meaning: 'khi, dịp, lúc ~ (trang trọng)',
        explanation:
          'Bản trang trọng của 「とき」, hay dùng trong thông báo, chỉ dẫn. 「〜に際して」 = nhân dịp/khi bắt đầu ~.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: 'ご来店の際は、会員証をお持ちください。',
            romaji: 'Goraiten no sai wa, kaiin-shō o omochi kudasai.',
            vi: 'Khi đến cửa hàng, xin mang theo thẻ hội viên.',
          },
          {
            jp: '契約更新の際に、書類が必要です。',
            romaji: 'Keiyaku kōshin no sai ni, shorui ga hitsuyō desu.',
            vi: 'Khi gia hạn hợp đồng cần có giấy tờ.',
          },
        ],
      },
      {
        pattern: 'N + において / における N',
        meaning: 'tại, trong, ở ~ (bối cảnh trang trọng)',
        explanation:
          'Chỉ nơi chốn, lĩnh vực, thời đại trong văn viết. Tương đương 「で」 nhưng trang trọng.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '会議は本社において行われます。',
            romaji: 'Kaigi wa honsha ni oite okonawaremasu.',
            vi: 'Cuộc họp được tổ chức tại trụ sở chính.',
          },
          {
            jp: '現代社会における情報の役割は大きい。',
            romaji: 'Gendai shakai ni okeru jōhō no yakuwari wa ōkii.',
            vi: 'Vai trò của thông tin trong xã hội hiện đại là rất lớn.',
          },
        ],
      },
      {
        pattern: 'N + をはじめ(として)',
        meaning: 'tiêu biểu là ~, bắt đầu từ ~ và nhiều thứ khác',
        explanation:
          'Nêu ví dụ tiêu biểu nhất trong nhóm rồi ngụ ý còn nhiều cái khác.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '日本には、京都をはじめ、歴史的な都市が多い。',
            romaji: 'Nihon ni wa, Kyōto o hajime, rekishi-teki na toshi ga ōi.',
            vi: 'Ở Nhật, tiêu biểu như Kyoto, có nhiều thành phố lịch sử.',
          },
          {
            jp: '社長をはじめとして、全社員が式に出席した。',
            romaji: 'Shachō o hajime to shite, zen shain ga shiki ni shusseki shita.',
            vi: 'Từ giám đốc trở đi, toàn thể nhân viên dự lễ.',
          },
        ],
      },
      {
        pattern: 'N + にわたって / にわたる N',
        meaning: 'suốt, trải dài ~ (thời gian/phạm vi rộng)',
        explanation:
          'Nhấn mạnh quy mô rộng lớn về thời gian, không gian, số lần.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '工事は3年にわたって続いた。',
            romaji: 'Kōji wa san-nen ni watatte tsuzuita.',
            vi: 'Công trình kéo dài suốt 3 năm.',
          },
          {
            jp: '広い範囲にわたる調査が行われた。',
            romaji: 'Hiroi han\'i ni wataru chōsa ga okonawareta.',
            vi: 'Một cuộc điều tra trên phạm vi rộng đã được tiến hành.',
          },
        ],
      },
      {
        pattern: 'N + を通じて / を通して',
        meaning: 'thông qua ~; suốt trong ~',
        explanation:
          'Chỉ phương tiện/trung gian, hoặc chỉ toàn bộ khoảng thời gian (một năm, cả đời).',
        formalityLevel: 'written',
        examples: [
          {
            jp: '友人を通じて彼女と知り合った。',
            romaji: 'Yūjin o tsūjite kanojo to shiriatta.',
            vi: 'Tôi quen cô ấy qua một người bạn.',
          },
          {
            jp: 'この地方は一年を通して雨が多い。',
            romaji: 'Kono chihō wa ichi-nen o tōshite ame ga ōi.',
            vi: 'Vùng này mưa nhiều quanh năm.',
          },
        ],
      },
    ],
  },
  {
    lessonNumber: 402,
    jlptLevel: 'N2',
    title: 'N2 · Bài 2 — Căn cứ, lập trường, quan hệ',
    sortOrder: 4020,
    items: [
      {
        pattern: 'N + に基づいて / に基づく N',
        meaning: 'dựa trên, căn cứ vào ~',
        explanation:
          'Lấy điều gì làm cơ sở/nền tảng để thực hiện. Trang trọng, văn viết.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'この映画は実話に基づいて作られた。',
            romaji: 'Kono eiga wa jitsuwa ni motozuite tsukurareta.',
            vi: 'Bộ phim này được làm dựa trên chuyện có thật.',
          },
          {
            jp: '規則に基づいて処理します。',
            romaji: 'Kisoku ni motozuite shori shimasu.',
            vi: 'Chúng tôi xử lý căn cứ theo quy định.',
          },
        ],
      },
      {
        pattern: 'N + に応じて / に応じた N',
        meaning: 'tùy theo, tương ứng với ~',
        explanation:
          'Thay đổi linh hoạt cho phù hợp với điều kiện/tình huống.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '収入に応じて税金を払う。',
            romaji: 'Shūnyū ni ōjite zeikin o harau.',
            vi: 'Nộp thuế tùy theo thu nhập.',
          },
          {
            jp: 'お客様のご要望に応じたサービスを提供します。',
            romaji: 'Okyakusama no goyōbō ni ōjita sābisu o teikyō shimasu.',
            vi: 'Chúng tôi cung cấp dịch vụ theo yêu cầu của khách.',
          },
        ],
      },
      {
        pattern: 'N + にとって(は)',
        meaning: 'đối với ~ (mà nói)',
        explanation:
          'Nêu lập trường để đánh giá điều gì đó. Vế sau thường là tính từ đánh giá (大切, 難しい).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '私にとって家族が一番大切だ。',
            romaji: 'Watashi ni totte kazoku ga ichiban taisetsu da.',
            vi: 'Đối với tôi, gia đình là quan trọng nhất.',
          },
          {
            jp: '外国人にとって漢字は難しい。',
            romaji: 'Gaikokujin ni totte kanji wa muzukashii.',
            vi: 'Với người nước ngoài, chữ Hán rất khó.',
          },
        ],
      },
      {
        pattern: 'N + において / N + にかけては',
        meaning: 'về mặt ~, xét về ~ thì (giỏi nhất)',
        explanation:
          '「〜にかけては」 dùng để khen ai đó xuất sắc trong một lĩnh vực.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '料理にかけては、彼の右に出る者はいない。',
            romaji: 'Ryōri ni kakete wa, kare no migi ni deru mono wa inai.',
            vi: 'Về nấu ăn thì không ai qua được anh ấy.',
          },
          {
            jp: '記憶力にかけては自信がある。',
            romaji: 'Kioku-ryoku ni kakete wa jishin ga aru.',
            vi: 'Về trí nhớ thì tôi tự tin.',
          },
        ],
      },
      {
        pattern: 'N + に対して / に対する N',
        meaning: 'đối với ~, hướng về ~; trái lại',
        explanation:
          'Chỉ đối tượng của thái độ/hành động. Cũng dùng để đối chiếu hai vế tương phản.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '目上の人に対して失礼な態度を取ってはいけない。',
            romaji: 'Meue no hito ni taishite shitsurei na taido o totte wa ikenai.',
            vi: 'Không được có thái độ vô lễ với người trên.',
          },
          {
            jp: '兄は文系なのに対して、弟は理系だ。',
            romaji: 'Ani wa bunkei na no ni taishite, otōto wa rikei da.',
            vi: 'Anh học khối xã hội, còn em thì học khối tự nhiên.',
          },
        ],
      },
      {
        pattern: 'N + をめぐって / をめぐる N',
        meaning: 'xoay quanh, liên quan đến ~ (tranh luận)',
        explanation:
          'Chủ đề của tranh cãi, thảo luận, xung đột.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '遺産をめぐって兄弟が争っている。',
            romaji: 'Isan o megutte kyōdai ga arasotte iru.',
            vi: 'Anh em tranh chấp nhau vì di sản.',
          },
          {
            jp: '新しい制度をめぐる議論が続いている。',
            romaji: 'Atarashii seido o meguru giron ga tsuzuite iru.',
            vi: 'Cuộc tranh luận xoay quanh chế độ mới vẫn tiếp diễn.',
          },
        ],
      },
      {
        pattern: 'N + につけ(て) / V(từ điển) + につけ',
        meaning: 'mỗi khi ~ là lại ~ (cảm xúc tự nhiên)',
        explanation:
          'Một kích thích luôn khơi dậy một cảm xúc/suy nghĩ. Hay đi với 見る, 聞く, 考える.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'この歌を聞くにつけ、故郷を思い出す。',
            romaji: 'Kono uta o kiku ni tsuke, kokyō o omoidasu.',
            vi: 'Mỗi lần nghe bài này là tôi lại nhớ quê.',
          },
          {
            jp: '何かにつけて彼は文句を言う。',
            romaji: 'Nani ka ni tsukete kare wa monku o iu.',
            vi: 'Hễ có chuyện gì là anh ta lại than phiền.',
          },
        ],
      },
      {
        pattern: 'N + からすると / からすれば / からいって',
        meaning: 'xét từ ~, dựa vào ~ mà nói',
        explanation:
          'Nêu căn cứ để phán đoán/đánh giá. 「〜からして」 = ngay cả ~ (nêu ví dụ cực đoan).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: 'あの様子からすると、試験はうまくいかなかったようだ。',
            romaji: 'Ano yōsu kara suru to, shiken wa umaku ikanakatta yō da.',
            vi: 'Nhìn bộ dạng đó thì có vẻ thi không tốt.',
          },
          {
            jp: '経験からいって、この計画は難しい。',
            romaji: 'Keiken kara itte, kono keikaku wa muzukashii.',
            vi: 'Theo kinh nghiệm thì kế hoạch này khó.',
          },
        ],
      },
      {
        pattern: 'N + につき',
        meaning: 'do ~ (lý do, trang trọng); mỗi ~',
        explanation:
          'Thường thấy trên biển thông báo. Nghĩa thứ hai: đơn giá "mỗi đơn vị".',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '工事中につき、通行止めです。',
            romaji: 'Kōji-chū ni tsuki, tsūkōdome desu.',
            vi: 'Do đang thi công nên cấm lưu thông.',
          },
          {
            jp: 'お一人様につき、二つまでです。',
            romaji: 'Ohitorisama ni tsuki, futatsu made desu.',
            vi: 'Mỗi người tối đa hai phần.',
          },
        ],
      },
      {
        pattern: 'N + のもとで / のもとに',
        meaning: 'dưới sự ~, trong điều kiện ~',
        explanation:
          'Dưới sự chỉ đạo, ảnh hưởng, điều kiện của ai/cái gì.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '田中教授のもとで研究している。',
            romaji: 'Tanaka kyōju no moto de kenkyū shite iru.',
            vi: 'Tôi đang nghiên cứu dưới sự hướng dẫn của giáo sư Tanaka.',
          },
          {
            jp: '親の同意のもとに契約した。',
            romaji: 'Oya no dōi no moto ni keiyaku shita.',
            vi: 'Tôi ký hợp đồng với sự đồng ý của bố mẹ.',
          },
        ],
      },
    ],
  },
  {
    lessonNumber: 403,
    jlptLevel: 'N2',
    title: 'N2 · Bài 3 — Nhấn mạnh, phủ định, hạn định',
    sortOrder: 4030,
    items: [
      {
        pattern: 'V(từ điển/ない) + ざるを得ない',
        meaning: 'buộc phải ~, không thể không ~',
        explanation:
          'する → せざるを得ない. Bị hoàn cảnh ép buộc, dù không muốn. Trang trọng, văn viết.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '台風のため、旅行を中止せざるを得なかった。',
            romaji: 'Taifū no tame, ryokō o chūshi sezaru o enakatta.',
            vi: 'Vì bão nên buộc phải hủy chuyến đi.',
          },
          {
            jp: '証拠がある以上、認めざるを得ない。',
            romaji: 'Shōko ga aru ijō, mitomezaru o enai.',
            vi: 'Đã có bằng chứng thì không thể không thừa nhận.',
          },
        ],
      },
      {
        pattern: 'V(từ điển) + よりほかない / ほかはない',
        meaning: 'chỉ còn cách ~, không còn cách nào khác',
        explanation:
          'Chỉ có một lựa chọn duy nhất. Tương đương 「〜しかない」 nhưng trang trọng hơn.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '終電がないから、歩いて帰るよりほかない。',
            romaji: 'Shūden ga nai kara, aruite kaeru yori hoka nai.',
            vi: 'Hết tàu cuối rồi nên chỉ còn cách đi bộ về.',
          },
          {
            jp: 'こうなったら、あきらめるほかはない。',
            romaji: 'Kō nattara, akirameru hoka wa nai.',
            vi: 'Đến nước này thì chỉ còn cách từ bỏ.',
          },
        ],
      },
      {
        pattern: 'V(ない) + ことには',
        meaning: 'nếu không ~ thì (không thể ~)',
        explanation:
          'Điều kiện tiên quyết. Vế sau luôn mang nghĩa phủ định.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '実際に見てみないことには、何とも言えない。',
            romaji: 'Jissai ni mite minai koto ni wa, nantomo ienai.',
            vi: 'Chưa tận mắt xem thì chưa thể nói gì.',
          },
          {
            jp: '健康でないことには、いい仕事はできない。',
            romaji: 'Kenkō de nai koto ni wa, ii shigoto wa dekinai.',
            vi: 'Không khỏe mạnh thì không làm việc tốt được.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + どころか',
        meaning: 'nói gì đến ~, chứ đừng nói ~; trái lại còn ~',
        explanation:
          'Phủ định mạnh kỳ vọng, thực tế còn ngược lại hoặc kém xa.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '貯金どころか、借金がある。',
            romaji: 'Chokin dokoro ka, shakkin ga aru.',
            vi: 'Nói gì tiết kiệm, tôi còn đang nợ.',
          },
          {
            jp: '謝るどころか、彼は怒り出した。',
            romaji: 'Ayamaru dokoro ka, kare wa okoridashita.',
            vi: 'Không những không xin lỗi, anh ta còn nổi cáu.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + わけがない / はずがない',
        meaning: 'không thể nào ~, làm gì có chuyện ~',
        explanation:
          'Phủ định khả năng một cách chắc chắn dựa trên lý lẽ. Nói tắt: わけない.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: 'あんなに練習したんだから、負けるわけがない。',
            romaji: 'Anna ni renshū shita n da kara, makeru wake ga nai.',
            vi: 'Luyện tập đến thế thì không thể thua được.',
          },
          {
            jp: '彼がそんなうそをつくはずがない。',
            romaji: 'Kare ga sonna uso o tsuku hazu ga nai.',
            vi: 'Anh ấy làm gì có chuyện nói dối như vậy.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + に違いない',
        meaning: 'chắc chắn là ~, nhất định ~',
        explanation:
          'Người nói tin chắc dựa trên căn cứ. Trang trọng hơn 「はずだ」. Rất chắc: 「に決まっている」 (hội thoại).',
        formalityLevel: 'written',
        examples: [
          {
            jp: '電気がついている。誰か家にいるに違いない。',
            romaji: 'Denki ga tsuite iru. Dare ka ie ni iru ni chigainai.',
            vi: 'Đèn đang bật. Chắc chắn có người ở nhà.',
          },
          {
            jp: 'これだけ売れているのだから、いい商品に違いない。',
            romaji: 'Kore dake urete iru no da kara, ii shōhin ni chigainai.',
            vi: 'Bán chạy thế này thì chắc chắn là hàng tốt.',
          },
        ],
      },
      {
        pattern: 'N + にすぎない',
        meaning: 'chẳng qua chỉ là ~',
        explanation:
          'Đánh giá thấp, coi nhẹ mức độ/tầm quan trọng của sự việc.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'それは言い訳にすぎない。',
            romaji: 'Sore wa iiwake ni suginai.',
            vi: 'Cái đó chẳng qua chỉ là lời bào chữa.',
          },
          {
            jp: '私は事実を述べたにすぎない。',
            romaji: 'Watashi wa jijitsu o nobeta ni suginai.',
            vi: 'Tôi chỉ nêu sự thật mà thôi.',
          },
        ],
      },
      {
        pattern: 'N + にほかならない',
        meaning: 'chính là ~, không gì khác ngoài ~',
        explanation:
          'Khẳng định mạnh mẽ rằng đó chính xác là điều gì đó.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '成功したのは努力の結果にほかならない。',
            romaji: 'Seikō shita no wa doryoku no kekka ni hoka naranai.',
            vi: 'Thành công chính là kết quả của nỗ lực chứ không gì khác.',
          },
          {
            jp: 'これは彼の責任にほかならない。',
            romaji: 'Kore wa kare no sekinin ni hoka naranai.',
            vi: 'Đây chính là trách nhiệm của anh ta.',
          },
        ],
      },
      {
        pattern: 'V(からある) / N + からの + N',
        meaning: 'tận, những ~ (nhấn mạnh số lượng lớn)',
        explanation:
          '「〜からある」 (khối lượng/kích thước), 「〜からする」 (giá tiền), 「〜からいる」 (số người).',
        formalityLevel: 'written',
        examples: [
          {
            jp: '20キロからあるスーツケースを運んだ。',
            romaji: 'Nijukkiro kara aru sūtsukēsu o hakonda.',
            vi: 'Tôi khiêng cái vali nặng tới 20 cân.',
          },
          {
            jp: '会場には1万人からの人が集まった。',
            romaji: 'Kaijō ni wa ichiman-nin kara no hito ga atsumatta.',
            vi: 'Có tới cả vạn người tụ họp ở hội trường.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + と言っても',
        meaning: 'tuy nói là ~ nhưng (không nhiều như tưởng)',
        explanation:
          'Đính chính lại kỳ vọng của người nghe sau khi nêu một điều gì đó.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '料理ができると言っても、卵焼きぐらいだ。',
            romaji: 'Ryōri ga dekiru to itte mo, tamagoyaki gurai da.',
            vi: 'Nói là biết nấu ăn chứ chỉ mỗi trứng chiên thôi.',
          },
          {
            jp: '旅行と言っても、日帰りです。',
            romaji: 'Ryokō to itte mo, higaeri desu.',
            vi: 'Gọi là đi du lịch chứ đi về trong ngày.',
          },
        ],
      },
    ],
  },
  {
    lessonNumber: 404,
    jlptLevel: 'N2',
    title: 'N2 · Bài 4 — Điều kiện, nhượng bộ, đánh giá',
    sortOrder: 4040,
    items: [
      {
        pattern: 'V/A/N(thể thường) + からには /以上(は)',
        meaning: 'đã ~ thì (đương nhiên phải ~)',
        explanation:
          'Nêu tiền đề rồi rút ra kết luận về nghĩa vụ/quyết tâm. Vế sau: べきだ, なければならない, つもりだ.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '引き受けたからには、最後までやる。',
            romaji: 'Hikiuketa kara ni wa, saigo made yaru.',
            vi: 'Đã nhận rồi thì làm đến cùng.',
          },
          {
            jp: '留学する以上は、その国の言葉を身につけたい。',
            romaji: 'Ryūgaku suru ijō wa, sono kuni no kotoba o mi ni tsuketai.',
            vi: 'Đã đi du học thì muốn thạo ngôn ngữ nước đó.',
          },
        ],
      },
      {
        pattern: 'V(た) + ところで',
        meaning: 'cho dù ~ đi nữa cũng (vô ích)',
        explanation:
          'Giả định nhượng bộ, vế sau luôn tiêu cực/vô nghĩa. Thường có 「今さら」, 「いくら」.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '今から急いだところで、間に合わない。',
            romaji: 'Ima kara isoida tokoro de, ma ni awanai.',
            vi: 'Giờ có vội cũng không kịp.',
          },
          {
            jp: '謝ったところで、許してもらえないだろう。',
            romaji: 'Ayamatta tokoro de, yurushite moraenai darō.',
            vi: 'Có xin lỗi thì chắc cũng không được tha.',
          },
        ],
      },
      {
        pattern: 'V/A/N + にしろ / にせよ / にしても',
        meaning: 'dù ~ đi chăng nữa, cho dù là ~',
        explanation:
          'Nhượng bộ. Dạng 「AにしろBにしろ」 = dù A hay B. 「にせよ」 trang trọng nhất.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '行くにしろ行かないにしろ、早く決めてください。',
            romaji: 'Iku ni shiro ikanai ni shiro, hayaku kimete kudasai.',
            vi: 'Dù đi hay không thì cũng quyết định nhanh giúp.',
          },
          {
            jp: '冗談にせよ、そんなことを言うべきではない。',
            romaji: 'Jōdan ni seyo, sonna koto o iu beki de wa nai.',
            vi: 'Cho dù là đùa thì cũng không nên nói vậy.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + わりに(は)',
        meaning: 'so với ~ thì lại (khác kỳ vọng)',
        explanation:
          'Kết quả không tương xứng với tiền đề (theo hướng bất ngờ).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: 'この店は値段のわりにおいしい。',
            romaji: 'Kono mise wa nedan no wari ni oishii.',
            vi: 'Quán này so với giá thì ngon đấy.',
          },
          {
            jp: '彼は年のわりに若く見える。',
            romaji: 'Kare wa toshi no wari ni wakaku mieru.',
            vi: 'Anh ấy trông trẻ hơn so với tuổi.',
          },
        ],
      },
      {
        pattern: 'V(từ điển/ない) + べきだ / べきではない',
        meaning: 'nên / không nên ~ (theo lẽ phải)',
        explanation:
          'Bổn phận, lẽ phải chung. する → すべき (hoặc するべき). Không dùng cho luật lệ cứng nhắc (dùng なければならない).',
        formalityLevel: 'written',
        examples: [
          {
            jp: '約束は守るべきだ。',
            romaji: 'Yakusoku wa mamoru beki da.',
            vi: 'Đã hứa thì nên giữ lời.',
          },
          {
            jp: '人の悪口を言うべきではない。',
            romaji: 'Hito no waruguchi o iu beki de wa nai.',
            vi: 'Không nên nói xấu người khác.',
          },
        ],
      },
      {
        pattern: 'N + くらい / ほど + N + はない',
        meaning: 'không gì ~ bằng ~ (so sánh nhất)',
        explanation:
          'Nhấn mạnh mức độ cao nhất bằng cách phủ định mọi thứ khác.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '家族を失うことほど悲しいことはない。',
            romaji: 'Kazoku o ushinau koto hodo kanashii koto wa nai.',
            vi: 'Không gì buồn bằng mất đi người thân.',
          },
          {
            jp: '今日ぐらい暑い日はない。',
            romaji: 'Kyō gurai atsui hi wa nai.',
            vi: 'Không có ngày nào nóng như hôm nay.',
          },
        ],
      },
      {
        pattern: 'V(た) + あげく(に) / N + のあげく',
        meaning: 'sau khi ~ mãi, cuối cùng thì ~ (kết quả xấu)',
        explanation:
          'Sau một quá trình dài (thường vất vả) mới đi đến kết cục không hay.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'さんざん迷ったあげく、何も買わなかった。',
            romaji: 'Sanzan mayotta ageku, nani mo kawanakatta.',
            vi: 'Phân vân mãi, cuối cùng chẳng mua gì.',
          },
          {
            jp: '口論のあげく、彼は部屋を出て行った。',
            romaji: 'Kōron no ageku, kare wa heya o dete itta.',
            vi: 'Sau một hồi cãi vã, anh ta bỏ ra khỏi phòng.',
          },
        ],
      },
      {
        pattern: 'V(た) + 末(に) / N + の末(に)',
        meaning: 'sau khi ~ rốt cuộc thì ~ (kết quả trung tính/tốt)',
        explanation:
          'Sau một quá trình cân nhắc/nỗ lực dài đi đến kết luận. Sắc thái trung tính hơn 「あげく」.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'よく考えた末に、留学を決めた。',
            romaji: 'Yoku kangaeta sue ni, ryūgaku o kimeta.',
            vi: 'Sau khi suy nghĩ kỹ, tôi quyết định đi du học.',
          },
          {
            jp: '長い交渉の末、契約が成立した。',
            romaji: 'Nagai kōshō no sue, keiyaku ga seiritsu shita.',
            vi: 'Sau đàm phán dài, hợp đồng đã được ký kết.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ) +得る / 得ない',
        meaning: 'có thể / không thể xảy ra ~',
        explanation:
          'Khả năng về mặt lý thuyết. 得る đọc là える hoặc うる (từ điển: うる), 得ない luôn là えない.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'そんなことは起こり得ない。',
            romaji: 'Sonna koto wa okori enai.',
            vi: 'Chuyện như thế không thể xảy ra.',
          },
          {
            jp: '誰にでも間違いはあり得る。',
            romaji: 'Dare ni demo machigai wa ari uru.',
            vi: 'Ai cũng có thể mắc lỗi.',
          },
        ],
      },
      {
        pattern: 'V(từ điển) + まい / V + まいか',
        meaning: 'quyết không ~; chẳng lẽ không ~',
        explanation:
          'Phủ định ý chí (もう〜まい) hoặc phủ định phỏng đoán (〜ではあるまいか). Văn viết, cổ.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'あんな店には二度と行くまい。',
            romaji: 'Anna mise ni wa nido to iku mai.',
            vi: 'Tôi sẽ không bao giờ đến quán đó nữa.',
          },
          {
            jp: '彼はもう来ないのではあるまいか。',
            romaji: 'Kare wa mō konai no de wa aru mai ka.',
            vi: 'Chẳng lẽ anh ấy sẽ không đến nữa sao?',
          },
        ],
      },
    ],
  },

  {
    lessonNumber: 405,
    jlptLevel: 'N2',
    title: 'N2 · Bài 5 — Bổ sung, hệ quả, cảm thán',
    sortOrder: 4050,
    items: [
      {
        pattern: 'N + のみならず / V/A(thể thường) + のみならず',
        meaning: 'không những ~ mà còn ~',
        explanation:
          'Bản văn viết trang trọng của 「〜だけでなく」. Vế sau thường có 「も」.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'この薬は頭痛のみならず、肩こりにも効く。',
            romaji: 'Kono kusuri wa zutsū nomi narazu, katakori ni mo kiku.',
            vi: 'Thuốc này không chỉ trị đau đầu mà còn trị mỏi vai.',
          },
          {
            jp: '国内のみならず、海外でも有名だ。',
            romaji: 'Kokunai nomi narazu, kaigai de mo yūmei da.',
            vi: 'Không chỉ trong nước mà ở nước ngoài cũng nổi tiếng.',
          },
        ],
      },
      {
        pattern: 'N + はもちろん / はもとより',
        meaning: 'không cần nói tới ~, đương nhiên là ~',
        explanation:
          '「〜はもとより」 trang trọng hơn 「〜はもちろん」. Cả hai nêu điều hiển nhiên rồi thêm điều đáng chú ý hơn.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '彼は英語はもちろん、中国語も話せる。',
            romaji: 'Kare wa eigo wa mochiron, chūgokugo mo hanaseru.',
            vi: 'Anh ấy tiếng Anh khỏi nói, tiếng Trung cũng nói được.',
          },
          {
            jp: '準備不足はもとより、当日の天候も悪かった。',
            romaji: 'Junbi busoku wa motoyori, tōjitsu no tenkō mo warukatta.',
            vi: 'Chuẩn bị thiếu đã đành, thời tiết hôm đó cũng xấu.',
          },
        ],
      },
      {
        pattern: 'V(た/ている) + 上で / N + の上で',
        meaning: 'sau khi ~ rồi (mới ~)',
        explanation:
          'Làm việc A trước như một bước cần thiết, rồi mới làm B. Khác 「〜上に」 (hơn nữa).',
        formalityLevel: 'written',
        examples: [
          {
            jp: '内容をよく確認した上で、サインしてください。',
            romaji: 'Naiyō o yoku kakunin shita ue de, sain shite kudasai.',
            vi: 'Sau khi kiểm tra kỹ nội dung rồi hãy ký.',
          },
          {
            jp: '家族と相談の上で、お返事します。',
            romaji: 'Kazoku to sōdan no ue de, ohenji shimasu.',
            vi: 'Tôi sẽ trả lời sau khi bàn với gia đình.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + 上に',
        meaning: 'không những ~ mà còn ~ (thêm vào)',
        explanation:
          'Chồng thêm một yếu tố cùng chiều (tốt + tốt, hoặc xấu + xấu). N/Na + である上に.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'この部屋は狭い上に、日当たりも悪い。',
            romaji: 'Kono heya wa semai ue ni, hiatari mo warui.',
            vi: 'Phòng này vừa chật lại vừa thiếu nắng.',
          },
          {
            jp: '彼女は美人な上に頭もいい。',
            romaji: 'Kanojo wa bijin na ue ni atama mo ii.',
            vi: 'Cô ấy vừa xinh lại vừa thông minh.',
          },
        ],
      },
      {
        pattern: 'V(từ điển/ない) + ことなく',
        meaning: 'mà không ~, không hề ~',
        explanation:
          'Bản văn viết của 「〜ないで」. Nhấn mạnh một việc hoàn toàn không xảy ra.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '彼は一日も休むことなく働き続けた。',
            romaji: 'Kare wa ichinichi mo yasumu koto naku hataraki tsuzuketa.',
            vi: 'Anh ấy làm việc không nghỉ một ngày nào.',
          },
          {
            jp: '最後まであきらめることなく戦った。',
            romaji: 'Saigo made akirameru koto naku tatakatta.',
            vi: 'Đã chiến đấu đến cùng mà không hề bỏ cuộc.',
          },
        ],
      },
      {
        pattern: 'V(た) + 結果 / N + の結果',
        meaning: 'kết quả của việc ~ là ~',
        explanation:
          'Nêu kết cục sau một quá trình. Trung tính, hay dùng trong báo cáo.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'よく話し合った結果、留学を延期することにした。',
            romaji: 'Yoku hanashiatta kekka, ryūgaku o enki suru koto ni shita.',
            vi: 'Sau khi bàn kỹ, chúng tôi quyết định hoãn du học.',
          },
          {
            jp: '調査の結果、原因が明らかになった。',
            romaji: 'Chōsa no kekka, gen\'in ga akiraka ni natta.',
            vi: 'Kết quả điều tra đã làm rõ nguyên nhân.',
          },
        ],
      },
      {
        pattern: 'V(た) + あまり(に) / N + のあまり',
        meaning: 'vì quá ~ nên ~',
        explanation:
          'Cảm xúc/trạng thái quá mức dẫn đến hệ quả (thường bất thường). Hay đi với 心配, 緊張, 驚き, うれしさ.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '緊張のあまり、声が出なかった。',
            romaji: 'Kinchō no amari, koe ga denakatta.',
            vi: 'Vì quá hồi hộp nên không thốt nên lời.',
          },
          {
            jp: '働きすぎたあまり、体を壊した。',
            romaji: 'Hatarakisugita amari, karada o kowashita.',
            vi: 'Vì làm việc quá sức nên đổ bệnh.',
          },
        ],
      },
      {
        pattern: 'V(từ điển/ない) + より(ほか)ない → ôn; V(ます bỏ) + ようがない',
        meaning: 'không có cách nào để ~',
        explanation:
          'Không có phương tiện/cách thức để thực hiện. 「連絡しようがない」, 「どうしようもない」.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '電話番号がわからないので、連絡しようがない。',
            romaji: 'Denwa bangō ga wakaranai node, renraku shiyō ga nai.',
            vi: 'Không biết số điện thoại nên không có cách nào liên lạc.',
          },
          {
            jp: 'こうなってはもうどうしようもない。',
            romaji: 'Kō natte wa mō dō shiyō mo nai.',
            vi: 'Đến nước này thì hết cách rồi.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ) + かける / かけの N',
        meaning: 'đang ~ dở, làm ~ chừng',
        explanation:
          'Hành động bắt đầu nhưng chưa xong. 読みかけの本, 食べかけ, 言いかけて やめる.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '読みかけの本が机の上にある。',
            romaji: 'Yomikake no hon ga tsukue no ue ni aru.',
            vi: 'Trên bàn có cuốn sách đang đọc dở.',
          },
          {
            jp: '彼は何か言いかけて、やめた。',
            romaji: 'Kare wa nani ka iikakete, yameta.',
            vi: 'Anh ấy định nói gì đó rồi lại thôi.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + ものだ',
        meaning: 'vốn dĩ ~, thường thì ~ (chân lý/hồi tưởng/cảm thán)',
        explanation:
          'Nhiều sắc thái: chân lý chung, hồi tưởng 「〜たものだ」, cảm thán, lời khuyên 「〜ものではない」.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '若いころは、よく徹夜したものだ。',
            romaji: 'Wakai koro wa, yoku tetsuya shita mono da.',
            vi: 'Hồi trẻ tôi hay thức trắng đêm lắm.',
          },
          {
            jp: '人の悪口を言うものではない。',
            romaji: 'Hito no waruguchi o iu mono de wa nai.',
            vi: 'Không nên nói xấu người khác.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────── N1 ───────────────────────────────
  {
    lessonNumber: 501,
    jlptLevel: 'N1',
    title: 'N1 · Bài 1 — Nhấn mạnh & sắc thái văn viết',
    sortOrder: 5010,
    items: [
      {
        pattern: 'N + をもって',
        meaning: 'bằng ~; kể từ ~ (mốc thời gian trang trọng)',
        explanation:
          'Nghĩa 1: phương tiện/tiêu chuẩn (身をもって). Nghĩa 2: mốc thời gian trong thông báo chính thức.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '本日をもって、当店は閉店いたします。',
            romaji: 'Honjitsu o motte, tōten wa heiten itashimasu.',
            vi: 'Kể từ hôm nay, cửa hàng chúng tôi đóng cửa.',
          },
          {
            jp: '成功は努力をもってのみ得られる。',
            romaji: 'Seikō wa doryoku o motte nomi erareru.',
            vi: 'Thành công chỉ có được bằng nỗ lực.',
          },
        ],
      },
      {
        pattern: 'N + をよそに',
        meaning: 'bất chấp ~, phớt lờ ~',
        explanation:
          'Hành động phớt lờ mối lo ngại/kỳ vọng/phản đối của người xung quanh. Sắc thái phê phán.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '親の心配をよそに、彼は世界一周の旅に出た。',
            romaji: 'Oya no shinpai o yoso ni, kare wa sekai isshū no tabi ni deta.',
            vi: 'Bất chấp nỗi lo của bố mẹ, anh ấy lên đường vòng quanh thế giới.',
          },
          {
            jp: '住民の反対をよそに、工事が始まった。',
            romaji: 'Jūmin no hantai o yoso ni, kōji ga hajimatta.',
            vi: 'Phớt lờ sự phản đối của dân, công trình vẫn khởi công.',
          },
        ],
      },
      {
        pattern: 'N + をおいて(ほかに~ない)',
        meaning: 'ngoài ~ ra thì không còn ~',
        explanation:
          'Khẳng định đối tượng là duy nhất, không có lựa chọn thay thế.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'この仕事を任せられるのは、彼をおいてほかにいない。',
            romaji: 'Kono shigoto o makaserareru no wa, kare o oite hoka ni inai.',
            vi: 'Người có thể giao việc này thì ngoài anh ấy ra không còn ai.',
          },
          {
            jp: '今をおいて、チャンスはない。',
            romaji: 'Ima o oite, chansu wa nai.',
            vi: 'Ngoài lúc này ra thì không còn cơ hội nào.',
          },
        ],
      },
      {
        pattern: 'N + たる(もの) / V + たる',
        meaning: 'là ~ thì (phải có tư cách xứng đáng)',
        explanation:
          'Nhấn mạnh trách nhiệm/phẩm chất đi kèm với một địa vị. Cổ, trang trọng.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '政治家たる者、国民の声に耳を傾けるべきだ。',
            romaji: 'Seijika taru mono, kokumin no koe ni mimi o katamukeru beki da.',
            vi: 'Đã là chính trị gia thì phải lắng nghe tiếng nói của dân.',
          },
          {
            jp: '指導者たる者が、そんな弱音を吐いてはいけない。',
            romaji: 'Shidōsha taru mono ga, sonna yowane o haite wa ikenai.',
            vi: 'Người lãnh đạo thì không được thốt ra lời yếu đuối như thế.',
          },
        ],
      },
      {
        pattern: 'N + ならでは(の)',
        meaning: 'chỉ có ~ mới có được (đặc trưng riêng)',
        explanation:
          'Khen ngợi nét độc đáo mà chỉ đối tượng đó mới làm/có được.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'これはこの町ならではの味だ。',
            romaji: 'Kore wa kono machi naradewa no aji da.',
            vi: 'Đây là hương vị chỉ riêng thị trấn này mới có.',
          },
          {
            jp: 'プロならではの技術に驚いた。',
            romaji: 'Puro naradewa no gijutsu ni odoroita.',
            vi: 'Tôi kinh ngạc trước kỹ thuật chỉ dân chuyên nghiệp mới có.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ) + っこない',
        meaning: 'làm gì có chuyện ~, không đời nào ~',
        explanation:
          'Phủ định khả năng, khẩu ngữ mạnh. Tương đương 「〜わけがない / 〜はずがない」.',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: 'そんな難しい問題、わかりっこないよ。',
            romaji: 'Sonna muzukashii mondai, wakarikkonai yo.',
            vi: 'Bài khó thế thì làm sao mà hiểu được.',
          },
          {
            jp: '今から行っても間に合いっこない。',
            romaji: 'Ima kara itte mo maniaikkonai.',
            vi: 'Giờ đi thì không đời nào kịp.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + といったらない / といったらありはしない',
        meaning: '~ vô cùng, không thể tả nổi ~',
        explanation:
          'Cảm thán mức độ cực đại (tốt hoặc xấu). Khẩu ngữ: 〜ったらない.',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: '毎日同じ作業の繰り返しで、退屈といったらない。',
            romaji: 'Mainichi onaji sagyō no kurikaeshi de, taikutsu to ittara nai.',
            vi: 'Ngày nào cũng lặp lại công việc y hệt, chán không tả nổi.',
          },
          {
            jp: '初めて富士山を見たときの感動といったらなかった。',
            romaji: 'Hajimete Fujisan o mita toki no kandō to ittara nakatta.',
            vi: 'Nỗi xúc động khi lần đầu thấy núi Phú Sĩ thật khó tả.',
          },
        ],
      },
      {
        pattern: 'V(た) + が最後 / V(たら) + 最後',
        meaning: 'một khi đã ~ thì (chắc chắn hậu quả xấu)',
        explanation:
          'Nếu làm việc đó thì nhất định sẽ dẫn đến kết cục tồi tệ, không cứu vãn.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '彼にお金を貸したが最後、返ってこない。',
            romaji: 'Kare ni okane o kashita ga saigo, kaette konai.',
            vi: 'Một khi đã cho anh ta mượn tiền là không đòi lại được.',
          },
          {
            jp: 'この秘密を知られたら最後、私の立場はない。',
            romaji: 'Kono himitsu o shirararetara saigo, watashi no tachiba wa nai.',
            vi: 'Bí mật này mà bị lộ thì tôi hết đường.',
          },
        ],
      },
      {
        pattern: 'N + ずくめ',
        meaning: 'toàn là ~, chỗ nào cũng ~',
        explanation:
          'Toàn bộ đều là cùng một thứ. いいことずくめ, 黒ずくめ, 記録ずくめ.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '今年はいいことずくめの一年だった。',
            romaji: 'Kotoshi wa ii koto zukume no ichinen datta.',
            vi: 'Năm nay là một năm toàn chuyện tốt.',
          },
          {
            jp: '黒ずくめの服装の男が立っていた。',
            romaji: 'Kuro zukume no fukusō no otoko ga tatte ita.',
            vi: 'Một người đàn ông ăn mặc toàn đồ đen đứng đó.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ) + そびれる',
        meaning: 'lỡ mất cơ hội ~, định làm mà không làm được',
        explanation:
          '「〜そびれる」: định làm nhưng lỡ dịp/không làm được. Hay gặp: 言いそびれる, 食べそびれる, 聞きそびれる, 寝そびれる.',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '忙しくて、昼ご飯を食べそびれた。',
            romaji: 'Isogashikute, hirugohan o tabesobireta.',
            vi: 'Bận quá nên lỡ mất bữa trưa.',
          },
          {
            jp: 'お礼を言いそびれてしまった。',
            romaji: 'Orei o iisobirete shimatta.',
            vi: 'Tôi lỡ mất dịp nói lời cảm ơn.',
          },
        ],
      },
    ],
  },
  {
    lessonNumber: 502,
    jlptLevel: 'N1',
    title: 'N1 · Bài 2 — Quan hệ logic & nhượng bộ',
    sortOrder: 5020,
    items: [
      {
        pattern: 'V(た/từ điển) + が早いか',
        meaning: 'vừa ~ là lập tức ~',
        explanation:
          'Gần như đồng thời, việc sau xảy ra ngay tức khắc. Văn viết, tương tự 「〜なり」, 「〜そばから」.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'ベルが鳴るが早いか、生徒たちは教室を飛び出した。',
            romaji: 'Beru ga naru ga hayai ka, seito-tachi wa kyōshitsu o tobidashita.',
            vi: 'Chuông vừa reo là học sinh lao ra khỏi lớp.',
          },
          {
            jp: '横になるが早いか、いびきをかき始めた。',
            romaji: 'Yoko ni naru ga hayai ka, ibiki o kakihajimeta.',
            vi: 'Vừa nằm xuống là bắt đầu ngáy.',
          },
        ],
      },
      {
        pattern: 'V(từ điển) + そばから',
        meaning: 'vừa ~ xong lại ~ ngay (lặp đi lặp lại)',
        explanation:
          'Việc vừa làm xong thì tình trạng cũ tái diễn ngay, thường gây bực bội.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '片付けるそばから、子どもが散らかす。',
            romaji: 'Katazukeru soba kara, kodomo ga chirakasu.',
            vi: 'Vừa dọn xong là bọn trẻ lại bày bừa.',
          },
          {
            jp: '習うそばから忘れてしまう。',
            romaji: 'Narau soba kara wasurete shimau.',
            vi: 'Vừa học xong đã quên ngay.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + であれ / であろうと',
        meaning: 'dù là ~ đi nữa',
        explanation:
          'Nhượng bộ trang trọng. Dạng 「たとえ〜であれ」, 「どんなN であれ」.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: 'どんな理由であれ、暴力は許されない。',
            romaji: 'Donna riyū de are, bōryoku wa yurusarenai.',
            vi: 'Dù lý do gì đi nữa, bạo lực là không thể chấp nhận.',
          },
          {
            jp: 'たとえ子どもであれ、責任は取るべきだ。',
            romaji: 'Tatoe kodomo de are, sekinin wa toru beki da.',
            vi: 'Cho dù là trẻ con thì cũng phải chịu trách nhiệm.',
          },
        ],
      },
      {
        pattern: 'V(よう) + が / と + V(まい) + が',
        meaning: 'dù ~ hay không ~ cũng mặc',
        explanation:
          'Kết quả không đổi bất kể lựa chọn nào. 「〜(よ)うが〜まいが」.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '君が信じようが信じまいが、これは事実だ。',
            romaji: 'Kimi ga shinjiyō ga shinjimai ga, kore wa jijitsu da.',
            vi: 'Cậu tin hay không thì đây vẫn là sự thật.',
          },
          {
            jp: '雨が降ろうが、試合は行われる。',
            romaji: 'Ame ga furō ga, shiai wa okonawareru.',
            vi: 'Dù có mưa thì trận đấu vẫn diễn ra.',
          },
        ],
      },
      {
        pattern: 'N + いかんによっては / N + いかんだ',
        meaning: 'tùy vào ~ (mà có thể khác đi)',
        explanation:
          'Trang trọng, văn viết/hành chính. 「〜いかんにかかわらず」 = bất kể ~ thế nào.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '結果いかんによっては、計画を見直す必要がある。',
            romaji: 'Kekka ikan ni yotte wa, keikaku o minaosu hitsuyō ga aru.',
            vi: 'Tùy vào kết quả mà có thể phải xem lại kế hoạch.',
          },
          {
            jp: '理由のいかんにかかわらず、遅刻は認めない。',
            romaji: 'Riyū no ikan ni kakawarazu, chikoku wa mitomenai.',
            vi: 'Bất kể lý do gì, đi muộn là không chấp nhận.',
          },
        ],
      },
      {
        pattern: 'V(ない) + くもない / ないものでもない',
        meaning: 'cũng không hẳn là không ~ (chấp nhận có mức độ)',
        explanation:
          'Phủ định kép nhẹ, biểu thị sự đồng ý dè dặt hoặc khả năng có điều kiện.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '条件によっては、引き受けないものでもない。',
            romaji: 'Jōken ni yotte wa, hikiukenai mono demo nai.',
            vi: 'Tùy điều kiện, cũng không phải là không nhận.',
          },
          {
            jp: '彼の気持ちもわからなくもない。',
            romaji: 'Kare no kimochi mo wakaranaku mo nai.',
            vi: 'Tâm trạng của anh ấy tôi cũng không phải không hiểu.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + まじ / まじき',
        meaning: 'không được phép ~ (điều không thể tha thứ)',
        explanation:
          '「あるまじき N」: hành vi không xứng với tư cách. Rất trang trọng, cổ.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: 'それは教師にあるまじき行為だ。',
            romaji: 'Sore wa kyōshi ni aru majiki kōi da.',
            vi: 'Đó là hành vi không thể chấp nhận ở một giáo viên.',
          },
          {
            jp: '許すまじき犯罪だ。',
            romaji: 'Yurusu majiki hanzai da.',
            vi: 'Đây là tội ác không thể dung thứ.',
          },
        ],
      },
      {
        pattern: 'V(た) + ら + V(た) + で / V(ば) + V(た) + で',
        meaning: 'nếu ~ thì cũng có cái khó của ~ (dù thế nào cũng có vấn đề)',
        explanation:
          'Dù tình huống xảy ra hay không thì đều có mặt phiền toái riêng. 「〜なら〜で」.',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: 'お金がないと困るが、あればあったで使ってしまう。',
            romaji: 'Okane ga nai to komaru ga, areba atta de tsukatte shimau.',
            vi: 'Không tiền thì khổ, mà có tiền thì lại tiêu hết.',
          },
          {
            jp: '暇なら暇で、何をすればいいか困る。',
            romaji: 'Hima nara hima de, nani o sureba ii ka komaru.',
            vi: 'Rảnh thì lại chẳng biết làm gì cho hết.',
          },
        ],
      },
      {
        pattern: 'V(ない) + ではおかない / ずにはおかない',
        meaning: 'nhất định sẽ ~ cho bằng được; tất yếu gây ra ~',
        explanation:
          'Ý chí mạnh mẽ, hoặc tác động tự nhiên tất yếu (cảm xúc). Trang trọng.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '真相を明らかにせずにはおかない。',
            romaji: 'Shinsō o akiraka ni sezu ni wa okanai.',
            vi: 'Nhất định phải làm rõ sự thật cho bằng được.',
          },
          {
            jp: 'この映画は見る者を感動させずにはおかない。',
            romaji: 'Kono eiga wa miru mono o kandō sasezu ni wa okanai.',
            vi: 'Bộ phim này chắc chắn khiến người xem xúc động.',
          },
        ],
      },
      {
        pattern: 'V(ない) + では済まない / ずには済まない',
        meaning: 'không ~ thì không xong, buộc phải ~',
        explanation:
          'Áp lực xã hội buộc phải làm gì đó, nếu không sẽ có hậu quả.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'これだけ迷惑をかけたのだから、謝らないでは済まない。',
            romaji: 'Kore dake meiwaku o kaketa no da kara, ayamaranai de wa sumanai.',
            vi: 'Gây phiền hà đến mức này thì không xin lỗi không xong.',
          },
          {
            jp: '弁償せずには済まないだろう。',
            romaji: 'Benshō sezu ni wa sumanai darō.',
            vi: 'Chắc là không bồi thường thì không xong đâu.',
          },
        ],
      },
    ],
  },
  {
    lessonNumber: 503,
    jlptLevel: 'N1',
    title: 'N1 · Bài 3 — Cảm xúc, đánh giá, thành ngữ ngữ pháp',
    sortOrder: 5030,
    items: [
      {
        pattern: 'V(ます bỏ) + かねる / かねない',
        meaning: 'khó lòng ~, không thể ~ / có nguy cơ ~',
        explanation:
          '「〜かねる」: không thể làm (dù muốn), lịch sự. 「〜かねない」: có khả năng xảy ra điều xấu.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: 'その件については、私では判断しかねます。',
            romaji: 'Sono ken ni tsuite wa, watashi de wa handan shikanemasu.',
            vi: 'Về việc đó, tôi khó mà tự quyết định được.',
          },
          {
            jp: 'そんな無理をすると、体を壊しかねない。',
            romaji: 'Sonna muri o suru to, karada o kowashikanenai.',
            vi: 'Làm quá sức thế thì có nguy cơ đổ bệnh.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + とあって',
        meaning: 'vì là ~ (tình huống đặc biệt) nên ~',
        explanation:
          'Do hoàn cảnh đặc biệt nên đương nhiên có kết quả tương ứng. Văn viết, tường thuật.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '連休とあって、どの観光地も混んでいる。',
            romaji: 'Renkyū to atte, dono kankōchi mo konde iru.',
            vi: 'Vì là kỳ nghỉ dài nên khu du lịch nào cũng đông.',
          },
          {
            jp: '有名歌手が来るとあって、会場は満員だ。',
            romaji: 'Yūmei kashu ga kuru to atte, kaijō wa man\'in da.',
            vi: 'Vì có ca sĩ nổi tiếng đến nên hội trường chật kín.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + とはいえ',
        meaning: 'tuy nói là ~ nhưng thực tế ~',
        explanation:
          'Nhượng bộ trang trọng, tương tự 「〜といっても」 nhưng văn viết hơn.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '春とはいえ、まだ朝晩は冷える。',
            romaji: 'Haru to wa ie, mada asaban wa hieru.',
            vi: 'Tuy là mùa xuân nhưng sáng tối vẫn lạnh.',
          },
          {
            jp: '仕事とはいえ、休日まで働くのはつらい。',
            romaji: 'Shigoto to wa ie, kyūjitsu made hataraku no wa tsurai.',
            vi: 'Dù là công việc nhưng làm cả ngày nghỉ thì mệt.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ) + つ + V(ます bỏ) + つ',
        meaning: 'khi thì ~ khi thì ~ (hai hành động luân phiên)',
        explanation:
          'Thành ngữ cố định: 行きつ戻りつ, 抜きつ抜かれつ, 持ちつ持たれつ. Văn viết cổ.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '二人の走者は抜きつ抜かれつの接戦を演じた。',
            romaji: 'Futari no sōsha wa nukitsu nukaretsu no sessen o enjita.',
            vi: 'Hai vận động viên rượt đuổi nhau sát nút, khi vượt khi bị vượt.',
          },
          {
            jp: '人は互いに持ちつ持たれつで生きている。',
            romaji: 'Hito wa tagai ni mochitsu motaretsu de ikite iru.',
            vi: 'Con người sống nương tựa, giúp đỡ lẫn nhau.',
          },
        ],
      },
      {
        pattern: 'N + であれ N + であれ / N + といい N + といい',
        meaning: 'cả ~ lẫn ~ đều ~',
        explanation:
          '「〜といい〜といい」: nêu hai ví dụ tiêu biểu để đánh giá tổng thể.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '色といいデザインといい、この服は気に入った。',
            romaji: 'Iro to ii dezain to ii, kono fuku wa ki ni itta.',
            vi: 'Cả màu lẫn kiểu dáng, bộ đồ này tôi đều ưng.',
          },
          {
            jp: '味といい量といい、この店は満足だ。',
            romaji: 'Aji to ii ryō to ii, kono mise wa manzoku da.',
            vi: 'Cả vị lẫn lượng, quán này tôi đều hài lòng.',
          },
        ],
      },
      {
        pattern: 'V(た) + ならまだしも / N + ならまだしも',
        meaning: 'nếu là ~ thì còn được, đằng này ~',
        explanation:
          'So sánh: trường hợp A còn chấp nhận được, nhưng B thì không.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '一度ならまだしも、三度も遅刻するとは。',
            romaji: 'Ichido nara madashimo, sando mo chikoku suru to wa.',
            vi: 'Một lần thì còn được, đằng này muộn tận ba lần.',
          },
          {
            jp: '子どもならまだしも、大人がそんなことを言うなんて。',
            romaji: 'Kodomo nara madashimo, otona ga sonna koto o iu nante.',
            vi: 'Trẻ con thì còn được, người lớn mà nói thế à.',
          },
        ],
      },
      {
        pattern: 'V(た) + ところで + どうにもならない',
        meaning: 'có ~ đi nữa cũng chẳng ích gì',
        explanation:
          'Kết hợp 「〜たところで」 với vế phủ định mạnh biểu thị sự bất lực.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '今さら後悔したところで、どうにもならない。',
            romaji: 'Imasara kōkai shita tokoro de, dō ni mo naranai.',
            vi: 'Giờ có hối hận thì cũng chẳng thay đổi được gì.',
          },
          {
            jp: '一人で悩んだところで、解決しない。',
            romaji: 'Hitori de nayanda tokoro de, kaiketsu shinai.',
            vi: 'Một mình ôm phiền muộn thì cũng không giải quyết được.',
          },
        ],
      },
      {
        pattern: 'V/N + にかこつけて',
        meaning: 'mượn cớ ~, viện cớ ~',
        explanation:
          'Lấy một lý do làm cái cớ để làm việc mình muốn. Sắc thái phê phán.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '出張にかこつけて、観光を楽しんだ。',
            romaji: 'Shutchō ni kakotsukete, kankō o tanoshinda.',
            vi: 'Mượn cớ đi công tác để đi chơi.',
          },
          {
            jp: '病気にかこつけて、集まりを欠席した。',
            romaji: 'Byōki ni kakotsukete, atsumari o kesseki shita.',
            vi: 'Viện cớ ốm để vắng mặt buổi họp mặt.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ) + ながらに(して) / N + ながらに',
        meaning: 'ở nguyên trạng thái ~ mà vẫn ~',
        explanation:
          'Thành ngữ: 生まれながらに, 居ながらにして, 涙ながらに.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'インターネットで、家に居ながらにして買い物ができる。',
            romaji: 'Intānetto de, ie ni inagara ni shite kaimono ga dekiru.',
            vi: 'Nhờ Internet, ngồi ở nhà vẫn mua sắm được.',
          },
          {
            jp: '彼女は涙ながらに当時のことを語った。',
            romaji: 'Kanojo wa namida nagara ni tōji no koto o katatta.',
            vi: 'Cô ấy vừa khóc vừa kể lại chuyện hồi đó.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + ゆえ(に) / N + ゆえの N',
        meaning: 'vì ~, do ~ (nguyên nhân trang trọng, cổ)',
        explanation:
          'Bản văn viết/cổ của 「〜から / 〜ので」. N + (の)ゆえに.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '経験が浅いゆえに、判断を誤った。',
            romaji: 'Keiken ga asai yue ni, handan o ayamatta.',
            vi: 'Vì thiếu kinh nghiệm nên đã phán đoán sai.',
          },
          {
            jp: '若さゆえの過ちだった。',
            romaji: 'Wakasa yue no ayamachi datta.',
            vi: 'Đó là lỗi lầm do sự trẻ người non dạ.',
          },
        ],
      },
    ],
  },
  {
    lessonNumber: 504,
    jlptLevel: 'N1',
    title: 'N1 · Bài 4 — Giới hạn, phạm vi, thái độ',
    sortOrder: 5040,
    items: [
      {
        pattern: 'N + に至る / に至って / に至っては',
        meaning: 'đến tận mức ~, đến khi ~ (thì mới)',
        explanation:
          '「〜に至る」: đi đến một kết cục nghiêm trọng. 「〜に至って(初めて)」: mãi đến lúc đó mới. 「〜に至っては」: đến cả ~ (ví dụ cực đoan).',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '両社は合併するに至った。',
            romaji: 'Ryōsha wa gappei suru ni itatta.',
            vi: 'Hai công ty đã đi đến chỗ sáp nhập.',
          },
          {
            jp: '事故が起きるに至って、ようやく対策が取られた。',
            romaji: 'Jiko ga okiru ni itatte, yōyaku taisaku ga torareta.',
            vi: 'Mãi đến khi xảy ra tai nạn mới có biện pháp.',
          },
        ],
      },
      {
        pattern: 'N + にとどまらず',
        meaning: 'không dừng lại ở ~ mà còn lan sang ~',
        explanation:
          'Phạm vi ảnh hưởng vượt ra ngoài mức ban đầu. Trang trọng.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '被害は一地域にとどまらず、全国に広がった。',
            romaji: 'Higai wa ichi chiiki ni todomarazu, zenkoku ni hirogatta.',
            vi: 'Thiệt hại không dừng ở một vùng mà lan ra cả nước.',
          },
          {
            jp: '彼の関心は音楽にとどまらず、美術にも及ぶ。',
            romaji: 'Kare no kanshin wa ongaku ni todomarazu, bijutsu ni mo oyobu.',
            vi: 'Mối quan tâm của anh ấy không chỉ ở âm nhạc mà cả mỹ thuật.',
          },
        ],
      },
      {
        pattern: 'N + をものともせず(に)',
        meaning: 'bất chấp ~, không hề nao núng trước ~',
        explanation:
          'Vượt qua khó khăn/trở ngại lớn một cách dũng cảm. Đánh giá tích cực.',
        formalityLevel: 'written',
        examples: [
          {
            jp: '悪天候をものともせず、登山を続けた。',
            romaji: 'Akutenkō o mono to mo sezu, tozan o tsuzuketa.',
            vi: 'Bất chấp thời tiết xấu, họ vẫn tiếp tục leo núi.',
          },
          {
            jp: '周囲の批判をものともせず、彼は信念を貫いた。',
            romaji: 'Shūi no hihan o mono to mo sezu, kare wa shinnen o tsuranuita.',
            vi: 'Bất chấp chỉ trích xung quanh, anh giữ vững niềm tin.',
          },
        ],
      },
      {
        pattern: 'N + いかんによらず / N + を問わず',
        meaning: 'bất kể ~, không phân biệt ~',
        explanation:
          '「〜を問わず」 phổ biến hơn (経験を問わず, 年齢・性別を問わず). 「〜いかんによらず」 trang trọng, hành chính.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '経験の有無を問わず、応募できます。',
            romaji: 'Keiken no umu o towazu, ōbo dekimasu.',
            vi: 'Có kinh nghiệm hay không đều có thể ứng tuyển.',
          },
          {
            jp: '理由のいかんによらず、返金はできません。',
            romaji: 'Riyū no ikan ni yorazu, henkin wa dekimasen.',
            vi: 'Bất kể lý do gì cũng không hoàn tiền.',
          },
        ],
      },
      {
        pattern: 'N + をよそに → ôn; N + はさておき',
        meaning: 'khoan bàn tới ~, gác ~ sang một bên',
        explanation:
          'Tạm gác chủ đề này để nói sang chuyện khác (quan trọng/cấp bách hơn).',
        formalityLevel: 'neutral',
        examples: [
          {
            jp: '冗談はさておき、本題に入りましょう。',
            romaji: 'Jōdan wa sate oki, hondai ni hairimashō.',
            vi: 'Đùa vậy đủ rồi, ta vào vấn đề chính nào.',
          },
          {
            jp: '結果はさておき、よく頑張ったと思う。',
            romaji: 'Kekka wa sate oki, yoku ganbatta to omou.',
            vi: 'Kết quả tạm gác lại, tôi thấy cậu đã rất cố gắng.',
          },
        ],
      },
      {
        pattern: 'V(ます bỏ) + っぷり / V(ます bỏ) + ぶり',
        meaning: 'cách ~, dáng vẻ ~',
        explanation:
          'Chỉ phong thái, cách thức làm việc gì. 飲みっぷり, 話しぶり, 仕事ぶり. 「N ぶり」 còn nghĩa "sau bao lâu".',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: '彼の思い切った決断ぶりに感心した。',
            romaji: 'Kare no omoikitta ketsudan buri ni kanshin shita.',
            vi: 'Tôi khâm phục cách anh ấy ra quyết định dứt khoát.',
          },
          {
            jp: '十年ぶりに故郷に帰った。',
            romaji: 'Jū-nen buri ni kokyō ni kaetta.',
            vi: 'Sau 10 năm tôi mới về quê.',
          },
        ],
      },
      {
        pattern: 'V/N + にかたくない',
        meaning: 'không khó để ~ (tưởng tượng/suy đoán)',
        explanation:
          'Thành ngữ cố định, hầu như chỉ dùng với 想像/察する: 「想像にかたくない」.',
        formalityLevel: 'formal',
        examples: [
          {
            jp: '遺族の悲しみは想像にかたくない。',
            romaji: 'Izoku no kanashimi wa sōzō ni katakunai.',
            vi: 'Không khó để hình dung nỗi đau của thân nhân.',
          },
          {
            jp: '当時の苦労は察するにかたくない。',
            romaji: 'Tōji no kurō wa sassuru ni katakunai.',
            vi: 'Không khó để thấu hiểu nỗi vất vả khi đó.',
          },
        ],
      },
      {
        pattern: 'V(た/ている) + 手前',
        meaning: 'đã trót ~ (trước mặt người khác) nên đành phải ~',
        explanation:
          'Vì thể diện / vì đã nói/làm gì đó trước mặt người khác nên buộc phải hành xử cho nhất quán.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'できると言った手前、今さらやめられない。',
            romaji: 'Dekiru to itta temae, imasara yamerarenai.',
            vi: 'Đã trót nói là làm được nên giờ không bỏ được.',
          },
          {
            jp: '後輩の前で失敗した手前、格好がつかない。',
            romaji: 'Kōhai no mae de shippai shita temae, kakkō ga tsukanai.',
            vi: 'Trót thất bại trước mặt đàn em nên mất mặt.',
          },
        ],
      },
      {
        pattern: 'V(た) + ら + それまでだ / V(ば) + それまでだ',
        meaning: 'nếu ~ thì coi như hết, thế là xong',
        explanation:
          'Nhấn mạnh: một khi điều đó xảy ra thì mọi nỗ lực trở nên vô nghĩa.',
        formalityLevel: 'spoken',
        examples: [
          {
            jp: 'どんなに貯金しても、病気になればそれまでだ。',
            romaji: 'Donna ni chokin shite mo, byōki ni nareba sore made da.',
            vi: 'Có để dành bao nhiêu, đổ bệnh một cái là hết.',
          },
          {
            jp: '規則だと言われればそれまでだ。',
            romaji: 'Kisoku da to iwarereba sore made da.',
            vi: 'Người ta bảo đó là quy định thì cũng chịu.',
          },
        ],
      },
      {
        pattern: 'V/A/N(thể thường) + ずにはいられない / ないではいられない',
        meaning: 'không thể không ~, cầm lòng không đặng',
        explanation:
          'Cảm xúc/thôi thúc mạnh khiến không kìm được hành động. する→せずにはいられない.',
        formalityLevel: 'written',
        examples: [
          {
            jp: 'あの映画を見ると、泣かずにはいられない。',
            romaji: 'Ano eiga o miru to, nakazu ni wa irarenai.',
            vi: 'Xem bộ phim đó là không cầm được nước mắt.',
          },
          {
            jp: '彼の勇気に感心せずにはいられなかった。',
            romaji: 'Kare no yūki ni kanshin sezu ni wa irarenakatta.',
            vi: 'Tôi không thể không khâm phục lòng dũng cảm của anh ấy.',
          },
        ],
      },
    ],
  },
];
