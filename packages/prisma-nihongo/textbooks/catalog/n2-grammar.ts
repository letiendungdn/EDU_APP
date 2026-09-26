import type { TbGrammar } from '../types';

export const N2_CATEGORIES: Record<string, string> = {
  time: 'Thời điểm & diễn biến',
  basis: 'Căn cứ, tiêu chuẩn & đối tượng',
  scope: 'Phạm vi & giới hạn',
  cause: 'Nguyên nhân, lý do & kết quả',
  judge: 'Đánh giá & nhận định',
  contrast: 'Tương phản & nhượng bộ',
  feel: 'Cảm xúc, nhấn mạnh & không kìm được',
  state: 'Trạng thái & khuynh hướng',
};

export const N2_GRAMMAR: TbGrammar[] = [
  // ── Thời điểm & diễn biến ──
  {
    p: '〜際（に）',
    m: 'khi, nhân dịp … (trang trọng)',
    c: 'time',
    ex: [
      ['おかえりの さいは、わすれものに ごちゅういください。', 'okaeri no sai wa, wasuremono ni gochuui kudasai.', 'Khi ra về, xin chú ý đừng để quên đồ.'],
      ['にほんへ いった さいに、ふじさんに のぼった。', 'nihon e itta sai ni, fujisan ni nobotta.', 'Nhân dịp sang Nhật, tôi đã leo núi Phú Sĩ.'],
    ],
  },
  {
    p: '〜に際して',
    m: 'nhân dịp, khi bắt đầu …',
    c: 'time',
    ex: [
      ['にゅうがくに さいして、せつめいかいが おこなわれた。', 'nyuugaku ni saishite, setsumeikai ga okonawareta.', 'Nhân dịp nhập học, buổi giới thiệu đã được tổ chức.'],
      ['けいやくに さいして、いくつか かくにんしたい ことが ある。', 'keiyaku ni saishite, ikutsuka kakunin shitai koto ga aru.', 'Khi ký hợp đồng, tôi muốn xác nhận vài điều.'],
    ],
  },
  {
    p: '〜次第（ngay khi）',
    m: 'ngay sau khi … thì',
    c: 'time',
    ex: [
      ['しりょうが とどき しだい、おおくりします。', 'shiryou ga todoki shidai, ookuri shimasu.', 'Ngay khi tài liệu đến, tôi sẽ gửi đi.'],
      ['じゅんびが でき しだい、しゅっぱつしましょう。', 'junbi ga deki shidai, shuppatsu shimashou.', 'Chuẩn bị xong là xuất phát nhé.'],
    ],
  },
  {
    p: '〜かと思うと／〜かと思ったら',
    m: 'vừa mới … thì đã (bất ngờ)',
    c: 'time',
    ex: [
      ['はれたかと おもったら、また ふりだした。', 'hareta ka to omottara, mata furidashita.', 'Vừa tưởng tạnh thì lại mưa tiếp.'],
      ['こどもは かえって きたかと おもうと、すぐ あそびに でかけた。', 'kodomo wa kaette kita ka to omou to, sugu asobi ni dekaketa.', 'Con vừa về đã lại đi chơi ngay.'],
    ],
  },
  {
    p: '〜につれて',
    m: 'cùng với … thì dần dần',
    c: 'time',
    ex: [
      ['としを とるに つれて、からだが よわく なる。', 'toshi o toru ni tsurete, karada ga yowaku naru.', 'Càng có tuổi, cơ thể càng yếu đi.'],
      ['じかんが たつに つれて、かなしみも うすれた。', 'jikan ga tatsu ni tsurete, kanashimi mo usureta.', 'Thời gian trôi đi, nỗi buồn cũng nhạt dần.'],
    ],
  },
  {
    p: '〜に従って',
    m: 'theo …, cùng với … (biến đổi / làm theo)',
    c: 'time',
    ex: [
      ['やまを のぼるに したがって、きおんが さがる。', 'yama o noboru ni shitagatte, kion ga sagaru.', 'Càng leo lên núi, nhiệt độ càng giảm.'],
      ['せんせいの しじに したがって ください。', 'sensei no shiji ni shitagatte kudasai.', 'Hãy làm theo chỉ thị của thầy.'],
    ],
  },
  {
    p: '〜とともに',
    m: 'cùng với …, đồng thời',
    c: 'time',
    ex: [
      ['けいざいの はってんと ともに、せいかつが ゆたかに なった。', 'keizai no hatten to tomo ni, seikatsu ga yutaka ni natta.', 'Cùng với sự phát triển kinh tế, đời sống sung túc hơn.'],
      ['かぞくと ともに しょうがつを すごした。', 'kazoku to tomo ni shougatsu o sugoshita.', 'Tôi đón Tết cùng gia đình.'],
    ],
  },
  {
    p: '〜末（に）',
    m: 'sau khi (trải qua) … rốt cuộc',
    c: 'time',
    ex: [
      ['ながい はなしあいの すえに、けつろんが でた。', 'nagai hanashiai no sue ni, ketsuron ga deta.', 'Sau một hồi bàn bạc dài, đã có kết luận.'],
      ['なやんだ すえ、かいしゃを やめる ことに した。', 'nayanda sue, kaisha o yameru koto ni shita.', 'Sau khi đắn đo, tôi quyết định nghỉ việc.'],
    ],
  },
  {
    p: '〜あげく（に）',
    m: 'rốt cuộc sau khi … (kết cục xấu)',
    c: 'time',
    ex: [
      ['さんざん まよった あげく、なにも かわなかった。', 'sanzan mayotta ageku, nani mo kawanakatta.', 'Đắn đo mãi rốt cuộc chẳng mua gì.'],
      ['けんかした あげくに、わかれて しまった。', 'kenka shita ageku ni, wakarete shimatta.', 'Cãi nhau mãi rồi rốt cuộc chia tay.'],
    ],
  },
  {
    p: '〜上で（trình tự）',
    m: 'sau khi … rồi mới',
    c: 'time',
    ex: [
      ['よく かんがえた うえで、へんじします。', 'yoku kangaeta ue de, henji shimasu.', 'Tôi sẽ suy nghĩ kỹ rồi mới trả lời.'],
      ['りょうしんと そうだんの うえ、きめました。', 'ryoushin to soudan no ue, kimemashita.', 'Sau khi bàn với bố mẹ, tôi đã quyết định.'],
    ],
  },
  {
    p: '〜てからというもの',
    m: 'kể từ khi … (thay đổi hẳn)',
    c: 'time',
    ex: [
      ['いぬを かいはじめて からと いう もの、まいあさ さんぽして いる。', 'inu o kaihajimete kara to iu mono, maiasa sanpo shite iru.', 'Kể từ khi nuôi chó, sáng nào tôi cũng đi dạo.'],
      ['かのじょに あって からと いう もの、かれは かわった。', 'kanojo ni atte kara to iu mono, kare wa kawatta.', 'Từ khi gặp cô ấy, anh ta thay đổi hẳn.'],
    ],
  },
  {
    p: '〜にあたって',
    m: 'khi, vào lúc (việc quan trọng)',
    c: 'time',
    ex: [
      ['しんせいかつを はじめるに あたって、けいかくを たてた。', 'shinseikatsu o hajimeru ni atatte, keikaku o tateta.', 'Khi bắt đầu cuộc sống mới, tôi đã lập kế hoạch.'],
      ['かいかいに あたり、ひとこと ごあいさつ もうしあげます。', 'kaikai ni atari, hitokoto goaisatsu moushiagemasu.', 'Nhân dịp khai mạc, tôi xin có đôi lời.'],
    ],
  },
  // ── Căn cứ, tiêu chuẩn & đối tượng ──
  {
    p: '〜に基づいて',
    m: 'dựa trên …',
    c: 'basis',
    ex: [
      ['データに もとづいて、けいかくを たてる。', 'deeta ni motozuite, keikaku o tateru.', 'Lập kế hoạch dựa trên dữ liệu.'],
      ['じじつに もとづいた えいがです。', 'jijitsu ni motozuita eiga desu.', 'Đây là bộ phim dựa trên sự thật.'],
    ],
  },
  {
    p: '〜をもとに（して）',
    m: 'lấy … làm cơ sở',
    c: 'basis',
    ex: [
      ['この しょうせつは さっかの たいけんを もとに かかれた。', 'kono shousetsu wa sakka no taiken o moto ni kakareta.', 'Cuốn tiểu thuyết này được viết dựa trên trải nghiệm của tác giả.'],
      ['アンケートの けっかを もとに して、しょうひんを かいぜんした。', 'ankeeto no kekka o moto ni shite, shouhin o kaizen shita.', 'Cải tiến sản phẩm dựa trên kết quả khảo sát.'],
    ],
  },
  {
    p: '〜に沿って',
    m: 'theo, dọc theo …',
    c: 'basis',
    ex: [
      ['かわに そって、さくらが さいて いる。', 'kawa ni sotte, sakura ga saite iru.', 'Hoa anh đào nở dọc bờ sông.'],
      ['マニュアルに そって さぎょうを すすめて ください。', 'manyuaru ni sotte sagyou o susumete kudasai.', 'Hãy tiến hành công việc theo sổ hướng dẫn.'],
    ],
  },
  {
    p: '〜に応じて',
    m: 'tùy theo, đáp ứng …',
    c: 'basis',
    ex: [
      ['レベルに おうじて、クラスを わけます。', 'reberu ni oujite, kurasu o wakemasu.', 'Chia lớp tùy theo trình độ.'],
      ['きゃくの ようぼうに おうじた サービスを ていきょうする。', 'kyaku no youbou ni oujita saabisu o teikyou suru.', 'Cung cấp dịch vụ đáp ứng yêu cầu khách hàng.'],
    ],
  },
  {
    p: '〜をめぐって',
    m: 'xoay quanh (tranh luận) …',
    c: 'basis',
    ex: [
      ['あたらしい ほうりつを めぐって、ぎろんが つづいて いる。', 'atarashii houritsu o megutte, giron ga tsuzuite iru.', 'Tranh luận quanh luật mới vẫn tiếp diễn.'],
      ['いさんを めぐる あらそいが おきた。', 'isan o meguru arasoi ga okita.', 'Đã xảy ra tranh chấp quanh tài sản thừa kế.'],
    ],
  },
  {
    p: '〜を中心に（して）',
    m: 'lấy … làm trung tâm',
    c: 'basis',
    ex: [
      ['この まつりは わかものを ちゅうしんに にんきが ある。', 'kono matsuri wa wakamono o chuushin ni ninki ga aru.', 'Lễ hội này được ưa chuộng, chủ yếu trong giới trẻ.'],
      ['えきを ちゅうしんに して、まちが ひろがって いる。', 'eki o chuushin ni shite, machi ga hirogatte iru.', 'Thị trấn trải rộng lấy nhà ga làm trung tâm.'],
    ],
  },
  {
    p: '〜にわたって',
    m: 'trải suốt, khắp …',
    c: 'basis',
    ex: [
      ['かいぎは 3じかんに わたって つづいた。', 'kaigi wa sanjikan ni watatte tsuzuita.', 'Cuộc họp kéo dài suốt 3 tiếng.'],
      ['ぜんこくに わたる ちょうさが おこなわれた。', 'zenkoku ni wataru chousa ga okonawareta.', 'Cuộc khảo sát khắp cả nước đã được tiến hành.'],
    ],
  },
  {
    p: '〜を通じて／〜を通して',
    m: 'thông qua …; suốt …',
    c: 'basis',
    ex: [
      ['ともだちを つうじて、かのじょと しりあった。', 'tomodachi o tsuujite, kanojo to shiriatta.', 'Tôi quen cô ấy thông qua bạn bè.'],
      ['この ちほうは いちねんを とおして あたたかい。', 'kono chihou wa ichinen o tooshite atatakai.', 'Vùng này ấm áp quanh năm.'],
    ],
  },
  {
    p: '〜に関して',
    m: 'liên quan đến … (trang trọng)',
    c: 'basis',
    ex: [
      ['この けんに かんして、ごいけんを おきかせください。', 'kono ken ni kanshite, goiken o okikase kudasai.', 'Xin cho biết ý kiến về việc này.'],
      ['かんきょうもんだいに かんする ろんぶんを かいた。', 'kankyou mondai ni kansuru ronbun o kaita.', 'Tôi đã viết luận văn về vấn đề môi trường.'],
    ],
  },
  {
    p: '〜をきっかけに',
    m: 'nhân cơ hội …, từ việc …',
    c: 'basis',
    ex: [
      ['りゅうがくを きっかけに、にほんの ぶんかに きょうみを もった。', 'ryuugaku o kikkake ni, nihon no bunka ni kyoumi o motta.', 'Nhân chuyến du học, tôi bắt đầu thích văn hóa Nhật.'],
      ['びょうきを きっかけに、タバコを やめた。', 'byouki o kikkake ni, tabako o yameta.', 'Nhân lần ốm, tôi đã bỏ thuốc lá.'],
    ],
  },
  {
    p: '〜にかけては',
    m: 'về mặt … thì (giỏi nhất)',
    c: 'basis',
    ex: [
      ['りょうりに かけては、かれに かなう ひとは いない。', 'ryouri ni kakete wa, kare ni kanau hito wa inai.', 'Về nấu ăn thì không ai bằng anh ấy.'],
      ['はしる ことに かけては、じしんが ある。', 'hashiru koto ni kakete wa, jishin ga aru.', 'Về chạy thì tôi tự tin.'],
    ],
  },
  // ── Phạm vi & giới hạn ──
  {
    p: '〜に限らず',
    m: 'không chỉ riêng …',
    c: 'scope',
    ex: [
      ['この ゲームは こども に かぎらず、おとなにも にんきだ。', 'kono geemu wa kodomo ni kagirazu, otona ni mo ninki da.', 'Trò chơi này không chỉ trẻ em mà người lớn cũng thích.'],
      ['にちようびに かぎらず、へいじつも あいて います。', 'nichiyoubi ni kagirazu, heijitsu mo aite imasu.', 'Không chỉ Chủ nhật, ngày thường cũng mở cửa.'],
    ],
  },
  {
    p: '〜に限り',
    m: 'chỉ riêng … (ưu đãi)',
    c: 'scope',
    ex: [
      ['きょうに かぎり、ぜんぴん はんがくです。', 'kyou ni kagiri, zenpin hangaku desu.', 'Chỉ riêng hôm nay, mọi sản phẩm giảm nửa giá.'],
      ['よやくした かたに かぎり、にゅうじょうできます。', 'yoyaku shita kata ni kagiri, nyuujou dekimasu.', 'Chỉ người đã đặt trước mới được vào.'],
    ],
  },
  {
    p: '〜限り（は）',
    m: 'chừng nào còn …',
    c: 'scope',
    ex: [
      ['いきて いる かぎり、あなたを わすれない。', 'ikite iru kagiri, anata o wasurenai.', 'Chừng nào còn sống, tôi không quên bạn.'],
      ['わたしの しって いる かぎり、かれは しょうじきな ひとだ。', 'watashi no shitte iru kagiri, kare wa shoujiki na hito da.', 'Theo như tôi biết, anh ấy là người thật thà.'],
    ],
  },
  {
    p: '〜のみならず',
    m: 'không chỉ … mà còn (văn viết)',
    c: 'scope',
    ex: [
      ['この もんだいは にほん のみならず、せかいの もんだいだ。', 'kono mondai wa nihon nominarazu, sekai no mondai da.', 'Vấn đề này không chỉ của Nhật mà của cả thế giới.'],
      ['かれは がくせい のみならず、せんせいからも しんらいされて いる。', 'kare wa gakusei nominarazu, sensei kara mo shinrai sarete iru.', 'Anh ấy được cả học sinh lẫn giáo viên tin tưởng.'],
    ],
  },
  {
    p: '〜はもちろん',
    m: '… thì đương nhiên, ngay cả …',
    c: 'scope',
    ex: [
      ['この みせは あじは もちろん、サービスも いい。', 'kono mise wa aji wa mochiron, saabisu mo ii.', 'Quán này vị thì khỏi nói, phục vụ cũng tốt.'],
      ['にちようびは もちろん、へいじつも こんで いる。', 'nichiyoubi wa mochiron, heijitsu mo konde iru.', 'Chủ nhật thì đương nhiên, ngày thường cũng đông.'],
    ],
  },
  {
    p: '〜はともかく',
    m: 'tạm gác … sang một bên',
    c: 'scope',
    ex: [
      ['ねだんは ともかく、デザインが きに いらない。', 'nedan wa tomokaku, dezain ga ki ni iranai.', 'Giá cả thì tạm gác, tôi không thích thiết kế.'],
      ['けっかは ともかく、さいごまで がんばった ことが たいせつだ。', 'kekka wa tomokaku, saigo made ganbatta koto ga taisetsu da.', 'Kết quả thế nào không bàn, cố gắng đến cùng mới quan trọng.'],
    ],
  },
  {
    p: '〜を問わず',
    m: 'không kể, bất kể …',
    c: 'scope',
    ex: [
      ['ねんれいを とわず、だれでも さんかできます。', 'nenrei o towazu, daredemo sanka dekimasu.', 'Bất kể tuổi tác, ai cũng có thể tham gia.'],
      ['この しごとは けいけんの うむを とわない。', 'kono shigoto wa keiken no umu o towanai.', 'Công việc này không kể có kinh nghiệm hay không.'],
    ],
  },
  {
    p: '〜にかかわらず',
    m: 'bất chấp, không liên quan đến …',
    c: 'scope',
    ex: [
      ['てんきに かかわらず、しあいは おこなわれます。', 'tenki ni kakawarazu, shiai wa okonawaremasu.', 'Bất kể thời tiết, trận đấu vẫn diễn ra.'],
      ['さんかする しないに かかわらず、へんじを ください。', 'sanka suru shinai ni kakawarazu, henji o kudasai.', 'Dù tham gia hay không, xin hãy phản hồi.'],
    ],
  },
  {
    p: '〜もかまわず',
    m: 'không để ý đến …',
    c: 'scope',
    ex: [
      ['かれは ひとめも かまわず、ないた。', 'kare wa hitome mo kamawazu, naita.', 'Anh ấy khóc chẳng để ý ánh mắt người khác.'],
      ['ふくが ぬれるのも かまわず、あめの なかを はしった。', 'fuku ga nureru no mo kamawazu, ame no naka o hashitta.', 'Mặc kệ quần áo ướt, tôi chạy trong mưa.'],
    ],
  },
  {
    p: '〜はさておき',
    m: 'tạm để … sang bên, trước hết',
    c: 'scope',
    ex: [
      ['じょうだんは さておき、ほんだいに はいりましょう。', 'joudan wa sateoki, hondai ni hairimashou.', 'Đùa thì để sau, vào vấn đề chính thôi.'],
      ['ひようの もんだいは さておき、まず けいかくを たてよう。', 'hiyou no mondai wa sateoki, mazu keikaku o tateyou.', 'Chuyện chi phí để sau, trước hết lập kế hoạch đã.'],
    ],
  },
  {
    p: '〜だけ（あって）',
    m: 'quả đúng là … (xứng đáng)',
    c: 'scope',
    ex: [
      ['さすが プロだけ あって、うまいね。', 'sasuga puro dake atte, umai ne.', 'Quả là dân chuyên nghiệp, giỏi thật.'],
      ['10ねん すんで いた だけ あって、この まちに くわしい。', 'juunen sunde ita dake atte, kono machi ni kuwashii.', 'Đã sống 10 năm nên quả rành thị trấn này.'],
    ],
  },
  // ── Nguyên nhân, lý do & kết quả ──
  {
    p: '〜からには／〜以上（は）',
    m: 'một khi đã … thì',
    c: 'cause',
    ex: [
      ['やると きめた からには、さいごまで やる。', 'yaru to kimeta kara ni wa, saigo made yaru.', 'Một khi đã quyết làm thì làm đến cùng.'],
      ['やくそくした いじょう、まもらなければ ならない。', 'yakusoku shita ijou, mamoranakereba naranai.', 'Đã hứa thì phải giữ lời.'],
    ],
  },
  {
    p: '〜だけに',
    m: 'chính vì … nên càng',
    c: 'cause',
    ex: [
      ['きたいして いた だけに、ざんねんだ。', 'kitai shite ita dake ni, zannen da.', 'Chính vì đã kỳ vọng nên càng tiếc.'],
      ['かんこうちだけに、ひとが おおい。', 'kankouchi dake ni, hito ga ooi.', 'Vì là điểm du lịch nên càng đông người.'],
    ],
  },
  {
    p: '〜ものだから',
    m: 'vì … (biện minh)',
    c: 'cause',
    ex: [
      ['でんしゃが おくれた ものだから、ちこくして しまいました。', 'densha ga okureta mono da kara, chikoku shite shimaimashita.', 'Vì tàu trễ nên tôi đến muộn.'],
      ['あまりに おいしい ものだから、たべすぎて しまった。', 'amari ni oishii mono da kara, tabesugite shimatta.', 'Ngon quá nên tôi ăn quá nhiều.'],
    ],
  },
  {
    p: '〜あまり',
    m: 'vì quá … nên',
    c: 'cause',
    ex: [
      ['しんぱいの あまり、ねむれなかった。', 'shinpai no amari, nemurenakatta.', 'Vì quá lo lắng nên không ngủ được.'],
      ['よろこびの あまり、なきだした。', 'yorokobi no amari, nakidashita.', 'Vui quá nên bật khóc.'],
    ],
  },
  {
    p: '〜ことだから',
    m: 'vì là … (tính cách quen thuộc) nên chắc',
    c: 'cause',
    ex: [
      ['まじめな かれの ことだから、やくそくは まもるだろう。', 'majime na kare no koto da kara, yakusoku wa mamoru darou.', 'Anh ấy nghiêm túc nên chắc sẽ giữ lời.'],
      ['あの ひとの ことだから、また わすれて いるよ。', 'ano hito no koto da kara, mata wasurete iru yo.', 'Người đó mà, chắc lại quên rồi.'],
    ],
  },
  {
    p: '〜からといって',
    m: 'không phải cứ vì … mà',
    c: 'cause',
    ex: [
      ['おかねが ある からと いって、しあわせとは かぎらない。', 'okane ga aru kara to itte, shiawase to wa kagiranai.', 'Có tiền chưa chắc đã hạnh phúc.'],
      ['にほんじんだ からと いって、けいごが じょうずとは かぎらない。', 'nihonjin da kara to itte, keigo ga jouzu to wa kagiranai.', 'Là người Nhật chưa chắc đã giỏi kính ngữ.'],
    ],
  },
  {
    p: '〜せいか',
    m: 'có lẽ vì … (nên kết quả không tốt)',
    c: 'cause',
    ex: [
      ['ねぶそくの せいか、あたまが いたい。', 'nebusoku no sei ka, atama ga itai.', 'Có lẽ do thiếu ngủ nên đau đầu.'],
      ['としの せいか、つかれやすく なった。', 'toshi no sei ka, tsukareyasuku natta.', 'Có lẽ do tuổi tác nên dễ mệt hơn.'],
    ],
  },
  {
    p: '〜ことから（tên gọi / kết luận）',
    m: 'vì … nên (mới gọi là / suy ra)',
    c: 'cause',
    ex: [
      ['この はしは かたちが にじに にて いる ことから、にじばしと よばれて いる。', 'kono hashi wa katachi ga niji ni nite iru koto kara, nijibashi to yobarete iru.', 'Cây cầu có hình giống cầu vồng nên được gọi là cầu Cầu Vồng.'],
      ['あしあとが ある ことから、だれかが はいったと わかった。', 'ashiato ga aru koto kara, dareka ga haitta to wakatta.', 'Từ dấu chân, biết là có người đã vào.'],
    ],
  },
  {
    p: '〜わけだから',
    m: 'bởi vì (lẽ đương nhiên) … nên',
    c: 'cause',
    ex: [
      ['ひとりで さんにんぶん はたらいて いる わけだから、つかれるのも とうぜんだ。', 'hitori de sanninbun hataraite iru wake da kara, tsukareru no mo touzen da.', 'Một mình làm việc của ba người thì mệt là đương nhiên.'],
      ['もう きめた わけだから、まよう ひつようは ない。', 'mou kimeta wake da kara, mayou hitsuyou wa nai.', 'Đã quyết rồi thì không cần đắn đo.'],
    ],
  },
  {
    p: '〜結果',
    m: 'kết quả là …',
    c: 'cause',
    ex: [
      ['はなしあった けっか、けいかくを へんこうする ことに なった。', 'hanashiatta kekka, keikaku o henkou suru koto ni natta.', 'Kết quả bàn bạc là đổi kế hoạch.'],
      ['ちょうさの けっか、げんいんが わかった。', 'chousa no kekka, gen\'in ga wakatta.', 'Kết quả điều tra đã tìm ra nguyên nhân.'],
    ],
  },
  {
    p: '〜ことになっている',
    m: 'theo quy định thì …',
    c: 'cause',
    ex: [
      ['この りょうでは 10じいこう、おんがくを ひかない ことに なって いる。', 'kono ryou de wa juuji ikou, ongaku o hikanai koto ni natte iru.', 'Ở ký túc xá này quy định sau 10 giờ không chơi nhạc.'],
      ['しゅっきんしたら、タイムカードを おす ことに なって います。', 'shukkin shitara, taimukaado o osu koto ni natte imasu.', 'Theo quy định, đi làm thì phải bấm thẻ chấm công.'],
    ],
  },
  // ── Đánh giá & nhận định ──
  {
    p: '〜にすぎない',
    m: 'chỉ là … mà thôi',
    c: 'judge',
    ex: [
      ['それは うわさに すぎない。', 'sore wa uwasa ni suginai.', 'Đó chỉ là tin đồn mà thôi.'],
      ['わたしは ただの がくせいに すぎません。', 'watashi wa tada no gakusei ni sugimasen.', 'Tôi chỉ là một sinh viên bình thường.'],
    ],
  },
  {
    p: '〜に決まっている',
    m: 'chắc chắn là … (chủ quan)',
    c: 'judge',
    ex: [
      ['そんな はなし、うそに きまって いる。', 'sonna hanashi, uso ni kimatte iru.', 'Chuyện như thế chắc chắn là nói dối.'],
      ['いまから いっても まにあわないに きまって いる。', 'ima kara itte mo maniawanai ni kimatte iru.', 'Bây giờ đi thì chắc chắn không kịp.'],
    ],
  },
  {
    p: '〜に相違ない',
    m: 'chắc chắn là … (văn viết)',
    c: 'judge',
    ex: [
      ['かれが はんにんで ある ことに そういない。', 'kare ga hannin de aru koto ni soui nai.', 'Chắc chắn anh ta là thủ phạm.'],
      ['この えは ゆうめいな がかの さくひんに そういない。', 'kono e wa yuumei na gaka no sakuhin ni soui nai.', 'Bức tranh này hẳn là tác phẩm của họa sĩ nổi tiếng.'],
    ],
  },
  {
    p: '〜ものか／〜もんか',
    m: 'làm gì có chuyện … (phủ định mạnh)',
    c: 'judge',
    ex: [
      ['あんな みせ、にどと いく ものか。', 'anna mise, nido to iku mono ka.', 'Quán như thế, còn lâu tôi mới quay lại.'],
      ['まけて たまるもんか。', 'makete tamaru mon ka.', 'Không đời nào tôi chịu thua.'],
    ],
  },
  {
    p: '〜っこない',
    m: 'không thể nào … (khẩu ngữ)',
    c: 'judge',
    ex: [
      ['そんな むずかしい もんだい、わかりっこない。', 'sonna muzukashii mondai, wakarikkonai.', 'Bài khó thế sao mà hiểu nổi.'],
      ['いまから はしっても、まにあいっこない。', 'ima kara hashitte mo, maniaikkonai.', 'Giờ chạy cũng không đời nào kịp.'],
    ],
  },
  {
    p: '〜ようがない',
    m: 'không có cách nào …',
    c: 'judge',
    ex: [
      ['れんらくさきが わからないので、れんらくの しようが ない。', 'renrakusaki ga wakaranai node, renraku no shiyou ga nai.', 'Không biết địa chỉ liên lạc nên không có cách nào liên lạc.'],
      ['こわれて しまって、なおしようが ない。', 'kowarete shimatte, naoshiyou ga nai.', 'Hỏng mất rồi, không cách nào sửa được.'],
    ],
  },
  {
    p: '〜ざるを得ない',
    m: 'buộc phải …',
    c: 'judge',
    ex: [
      ['たいふうが くるので、りょこうを ちゅうしせざるを えない。', 'taifuu ga kuru node, ryokou o chuushi sezaru o enai.', 'Bão đến nên buộc phải hủy chuyến đi.'],
      ['しゃちょうの めいれいなら、したがわざるを えない。', 'shachou no meirei nara, shitagawazaru o enai.', 'Lệnh giám đốc thì buộc phải tuân theo.'],
    ],
  },
  {
    p: '〜かねない',
    m: 'có thể (gây ra điều xấu)',
    c: 'judge',
    ex: [
      ['この ままでは じこに なりかねない。', 'kono mama de wa jiko ni narikanenai.', 'Cứ thế này thì có thể xảy ra tai nạn.'],
      ['かれなら そんな ことも いいかねない。', 'kare nara sonna koto mo iikanenai.', 'Anh ta thì có khi nói ra điều đó lắm.'],
    ],
  },
  {
    p: '〜かねる',
    m: 'khó mà …, không thể (lịch sự)',
    c: 'judge',
    ex: [
      ['その ごようぼうには おこたえ しかねます。', 'sono goyoubou ni wa okotae shikanemasu.', 'Chúng tôi khó đáp ứng yêu cầu đó.'],
      ['かれの いけんには さんせいしかねる。', 'kare no iken ni wa sansei shikaneru.', 'Tôi khó mà tán thành ý kiến của anh ấy.'],
    ],
  },
  {
    p: '〜がたい',
    m: 'khó mà … (tâm lý)',
    c: 'judge',
    ex: [
      ['かれが うそを ついたとは しんじがたい。', 'kare ga uso o tsuita to wa shinjigatai.', 'Khó tin rằng anh ấy đã nói dối.'],
      ['この おもいでは わすれがたい。', 'kono omoide wa wasuregatai.', 'Kỷ niệm này khó mà quên.'],
    ],
  },
  {
    p: '〜得る／〜得ない',
    m: 'có thể / không thể xảy ra',
    c: 'judge',
    ex: [
      ['だれにでも ありうる しっぱいだ。', 'dare ni demo ariuru shippai da.', 'Đó là thất bại ai cũng có thể mắc.'],
      ['そんな ことは ありえない。', 'sonna koto wa arienai.', 'Chuyện đó không thể có.'],
    ],
  },
  {
    p: '〜にほかならない',
    m: 'chính là, không gì khác ngoài …',
    c: 'judge',
    ex: [
      ['せいこうしたのは どりょくの けっかに ほかならない。', 'seikou shita no wa doryoku no kekka ni hoka naranai.', 'Thành công chính là kết quả của nỗ lực.'],
      ['この しっぱいは けいかくの あまさに ほかならない。', 'kono shippai wa keikaku no amasa ni hoka naranai.', 'Thất bại này không gì khác ngoài kế hoạch sơ sài.'],
    ],
  },
  {
    p: '〜というものではない',
    m: 'không phải cứ … là được',
    c: 'judge',
    ex: [
      ['ながく べんきょうすれば いい と いう ものでは ない。', 'nagaku benkyou sureba ii to iu mono de wa nai.', 'Không phải cứ học lâu là tốt.'],
      ['やすければ うれる と いう ものでは ない。', 'yasukereba ureru to iu mono de wa nai.', 'Không phải cứ rẻ là bán được.'],
    ],
  },
  // ── Tương phản & nhượng bộ ──
  {
    p: '〜ものの',
    m: 'mặc dù … nhưng',
    c: 'contrast',
    ex: [
      ['くるまの めんきょは ある ものの、ほとんど うんてんしない。', 'kuruma no menkyo wa aru mono no, hotondo unten shinai.', 'Có bằng lái nhưng tôi hầu như không lái.'],
      ['やくそくした ものの、いけるか どうか わからない。', 'yakusoku shita mono no, ikeru ka dou ka wakaranai.', 'Đã hứa nhưng không biết có đi được không.'],
    ],
  },
  {
    p: '〜にもかかわらず',
    m: 'mặc dù … vậy mà',
    c: 'contrast',
    ex: [
      ['あめに も かかわらず、おおぜいの ひとが あつまった。', 'ame ni mo kakawarazu, oozei no hito ga atsumatta.', 'Mặc dù mưa, rất nhiều người đã tập trung.'],
      ['どりょくしたに も かかわらず、しっぱいした。', 'doryoku shita ni mo kakawarazu, shippai shita.', 'Dù đã nỗ lực vẫn thất bại.'],
    ],
  },
  {
    p: '〜つつ（も）',
    m: 'mặc dù … vẫn; vừa … vừa',
    c: 'contrast',
    ex: [
      ['わるいと しりつつ、うそを ついて しまった。', 'warui to shiritsutsu, uso o tsuite shimatta.', 'Biết là sai mà vẫn nói dối.'],
      ['けしきを たのしみつつ、さんぽした。', 'keshiki o tanoshimitsutsu, sanpo shita.', 'Vừa ngắm cảnh vừa đi dạo.'],
    ],
  },
  {
    p: '〜反面',
    m: 'mặt khác …, ngược lại',
    c: 'contrast',
    ex: [
      ['とかいは べんりな はんめん、ストレスも おおい。', 'tokai wa benri na hanmen, sutoresu mo ooi.', 'Thành phố tiện lợi, mặt khác cũng nhiều áp lực.'],
      ['この くすりは よく きく はんめん、ふくさようも ある。', 'kono kusuri wa yoku kiku hanmen, fukusayou mo aru.', 'Thuốc này hiệu quả, nhưng cũng có tác dụng phụ.'],
    ],
  },
  {
    p: '〜一方（で）',
    m: 'mặt khác, trong khi …',
    c: 'contrast',
    ex: [
      ['しごとを する いっぽうで、だいがくいんにも かよって いる。', 'shigoto o suru ippou de, daigakuin ni mo kayotte iru.', 'Vừa đi làm, mặt khác vẫn học cao học.'],
      ['とかいの じんこうは ふえる いっぽうで、いなかは へって いる。', 'tokai no jinkou wa fueru ippou de, inaka wa hette iru.', 'Dân số đô thị tăng trong khi nông thôn giảm.'],
    ],
  },
  {
    p: '〜に反して',
    m: 'trái với …',
    c: 'contrast',
    ex: [
      ['よそうに はんして、しあいに まけた。', 'yosou ni hanshite, shiai ni maketa.', 'Trái với dự đoán, chúng tôi thua trận.'],
      ['おやの きたいに はんして、かれは だいがくを やめた。', 'oya no kitai ni hanshite, kare wa daigaku o yameta.', 'Trái với kỳ vọng của bố mẹ, anh ấy bỏ đại học.'],
    ],
  },
  {
    p: '〜どころか',
    m: 'nói gì đến …, trái lại còn',
    c: 'contrast',
    ex: [
      ['やすむ どころか、ねる じかんも ない。', 'yasumu dokoroka, neru jikan mo nai.', 'Nói gì đến nghỉ, đến thời gian ngủ cũng không có.'],
      ['くすりを のんだが、よく なる どころか わるく なった。', 'kusuri o nonda ga, yoku naru dokoroka waruku natta.', 'Uống thuốc rồi mà chẳng đỡ, trái lại còn tệ hơn.'],
    ],
  },
  {
    p: '〜というより',
    m: 'nói là … thì đúng hơn',
    c: 'contrast',
    ex: [
      ['きょうは すずしい と いうより さむい。', 'kyou wa suzushii to iu yori samui.', 'Hôm nay nói mát thì đúng hơn là lạnh.'],
      ['かれは ともだち と いうより かぞくの ような ものだ。', 'kare wa tomodachi to iu yori kazoku no you na mono da.', 'Anh ấy giống gia đình hơn là bạn bè.'],
    ],
  },
  {
    p: '〜たところで',
    m: 'dù có … thì cũng (vô ích)',
    c: 'contrast',
    ex: [
      ['いまさら あやまった ところで、ゆるして もらえないだろう。', 'imasara ayamatta tokoro de, yurushite moraenai darou.', 'Bây giờ có xin lỗi thì cũng chẳng được tha thứ.'],
      ['いくら いった ところで、かれは きかない。', 'ikura itta tokoro de, kare wa kikanai.', 'Có nói bao nhiêu thì anh ta cũng không nghe.'],
    ],
  },
  {
    p: '〜にしても／〜にしろ〜にしろ',
    m: 'dù là … đi nữa / dù … hay …',
    c: 'contrast',
    ex: [
      ['いそがしい にしても、れんらくくらい できたはずだ。', 'isogashii ni shite mo, renraku kurai dekita hazu da.', 'Dù bận đi nữa thì ít ra cũng liên lạc được.'],
      ['いく にしろ いかない にしろ、へんじを して ください。', 'iku ni shiro ikanai ni shiro, henji o shite kudasai.', 'Đi hay không đi thì cũng hãy trả lời.'],
    ],
  },
  {
    p: '〜ながら（も）（N2・văn viết）',
    m: 'mặc dù … (thừa nhận nhưng)',
    c: 'contrast',
    ex: [
      ['ざんねん ながら、こんかいは みおくる ことに しました。', 'zannen nagara, konkai wa miokuru koto ni shimashita.', 'Rất tiếc, lần này chúng tôi quyết định không tham gia.'],
      ['こども ながら、しっかりした かんがえを もって いる。', 'kodomo nagara, shikkari shita kangae o motte iru.', 'Tuy là trẻ con nhưng suy nghĩ rất chín chắn.'],
    ],
  },
  {
    p: '〜わりに（は）',
    m: 'so với … thì (không tương xứng)',
    c: 'contrast',
    ex: [
      ['この みせは ねだんの わりに おいしい。', 'kono mise wa nedan no wari ni oishii.', 'Quán này so với giá thì khá ngon.'],
      ['かれは としの わりに わかく みえる。', 'kare wa toshi no wari ni wakaku mieru.', 'So với tuổi, anh ấy trông trẻ.'],
    ],
  },
  // ── Cảm xúc, nhấn mạnh & không kìm được ──
  {
    p: '〜ずにはいられない',
    m: 'không thể không …',
    c: 'feel',
    ex: [
      ['あの えいがを みたら、なかずには いられない。', 'ano eiga o mitara, nakazu ni wa irarenai.', 'Xem bộ phim đó thì không thể không khóc.'],
      ['かのじょの ことを しんぱいせずには いられない。', 'kanojo no koto o shinpai sezu ni wa irarenai.', 'Tôi không thể không lo cho cô ấy.'],
    ],
  },
  {
    p: '〜てたまらない',
    m: '… không chịu nổi, vô cùng',
    c: 'feel',
    ex: [
      ['のどが かわいて たまらない。', 'nodo ga kawaite tamaranai.', 'Khát không chịu nổi.'],
      ['こきょうの かぞくに あいたくて たまらない。', 'kokyou no kazoku ni aitakute tamaranai.', 'Nhớ gia đình ở quê vô cùng.'],
    ],
  },
  {
    p: '〜てならない',
    m: '… không sao chịu được (cảm xúc tự nhiên)',
    c: 'feel',
    ex: [
      ['むすこの ことが しんぱいで ならない。', 'musuko no koto ga shinpai de naranai.', 'Tôi lo cho con trai không sao chịu được.'],
      ['だれかに みられて いる ような きが して ならない。', 'dareka ni mirarete iru you na ki ga shite naranai.', 'Cứ có cảm giác như bị ai đó nhìn.'],
    ],
  },
  {
    p: '〜てしょうがない／〜てしかたがない',
    m: '… hết sức, không biết làm sao',
    c: 'feel',
    ex: [
      ['あたまが いたくて しょうがない。', 'atama ga itakute shouganai.', 'Đau đầu hết sức.'],
      ['ひまで しかたが ない。', 'hima de shikata ga nai.', 'Rảnh rỗi chán không chịu được.'],
    ],
  },
  {
    p: '〜ことか',
    m: 'biết bao nhiêu …! (cảm thán)',
    c: 'feel',
    ex: [
      ['あなたに あえて、どんなに うれしい ことか。', 'anata ni aete, donna ni ureshii koto ka.', 'Được gặp bạn tôi vui biết bao!'],
      ['なんど ちゅういした ことか。', 'nando chuui shita koto ka.', 'Đã nhắc nhở bao nhiêu lần rồi!'],
    ],
  },
  {
    p: '〜に限る',
    m: '… là nhất',
    c: 'feel',
    ex: [
      ['つかれた ときは ねるに かぎる。', 'tsukareta toki wa neru ni kagiru.', 'Khi mệt thì ngủ là nhất.'],
      ['なつは つめたい ビールに かぎる。', 'natsu wa tsumetai biiru ni kagiru.', 'Mùa hè thì bia lạnh là nhất.'],
    ],
  },
  {
    p: '〜てこそ',
    m: 'chỉ khi … mới',
    c: 'feel',
    ex: [
      ['じぶんで やって こそ、ほんとうに わかる。', 'jibun de yatte koso, hontou ni wakaru.', 'Chỉ khi tự làm mới thật sự hiểu.'],
      ['たがいに たすけあって こそ、なかまだ。', 'tagai ni tasukeatte koso, nakama da.', 'Có giúp đỡ nhau mới là đồng đội.'],
    ],
  },
  {
    p: '〜さえ／〜すら',
    m: 'ngay cả …',
    c: 'feel',
    ex: [
      ['いそがしくて、しょくじを する じかん さえ ない。', 'isogashikute, shokuji o suru jikan sae nai.', 'Bận đến mức ngay cả thời gian ăn cũng không có.'],
      ['この かんじは せんせい すら よめなかった。', 'kono kanji wa sensei sura yomenakatta.', 'Chữ Hán này ngay cả thầy cũng không đọc được.'],
    ],
  },
  {
    p: '〜なんて／〜なんか',
    m: 'cái chuyện … (ngạc nhiên, coi nhẹ)',
    c: 'feel',
    ex: [
      ['かれが けっこんする なんて、しんじられない。', 'kare ga kekkon suru nante, shinjirarenai.', 'Anh ta mà kết hôn ư, không thể tin nổi.'],
      ['べんきょう なんか したくない。', 'benkyou nanka shitakunai.', 'Học hành gì chứ, chẳng muốn.'],
    ],
  },
  {
    p: '〜くらいなら',
    m: 'nếu phải … thì thà',
    c: 'feel',
    ex: [
      ['あんな ひとに たのむ くらいなら、じぶんで やる。', 'anna hito ni tanomu kurai nara, jibun de yaru.', 'Nếu phải nhờ người như thế thì thà tự làm.'],
      ['とちゅうで やめる くらいなら、はじめから やらない ほうが いい。', 'tochuu de yameru kurai nara, hajime kara yaranai hou ga ii.', 'Nếu bỏ giữa chừng thì thà đừng làm từ đầu.'],
    ],
  },
  {
    p: 'ぜひ〜たい／なんとしても',
    m: 'nhất định (bằng mọi giá)',
    c: 'feel',
    ex: [
      ['なんとしても こんどの しけんに ごうかくしたい。', 'nan to shite mo kondo no shiken ni goukaku shitai.', 'Bằng mọi giá tôi muốn đỗ kỳ thi lần này.'],
      ['ぜひ いちど おあいしたいです。', 'zehi ichido oai shitai desu.', 'Nhất định tôi muốn gặp anh một lần.'],
    ],
  },
  // ── Trạng thái & khuynh hướng ──
  {
    p: '〜だらけ',
    m: 'đầy, toàn là (không tốt)',
    c: 'state',
    ex: [
      ['この さくぶんは まちがい だらけだ。', 'kono sakubun wa machigai darake da.', 'Bài văn này toàn là lỗi.'],
      ['どろ だらけの くつで はいらないで。', 'doro darake no kutsu de hairanaide.', 'Đừng đi giày lấm bùn vào.'],
    ],
  },
  {
    p: '〜ずくめ',
    m: 'toàn là … (tốt / màu sắc)',
    c: 'state',
    ex: [
      ['ことしは いい こと ずくめだった。', 'kotoshi wa ii koto zukume datta.', 'Năm nay toàn chuyện tốt đẹp.'],
      ['かのじょは くろ ずくめの ふくを きて いた。', 'kanojo wa kuro zukume no fuku o kite ita.', 'Cô ấy mặc toàn đồ đen.'],
    ],
  },
  {
    p: '〜げ',
    m: 'có vẻ … (dáng vẻ)',
    c: 'state',
    ex: [
      ['かのじょは さびし げに わらった。', 'kanojo wa sabishi ge ni waratta.', 'Cô ấy cười có vẻ buồn.'],
      ['こどもたちは たのし げに あそんで いる。', 'kodomotachi wa tanoshi ge ni asonde iru.', 'Bọn trẻ đang chơi có vẻ vui.'],
    ],
  },
  {
    p: '〜向き／〜向け',
    m: 'phù hợp với … / dành cho …',
    c: 'state',
    ex: [
      ['この コースは しょしんしゃ むきです。', 'kono koosu wa shoshinsha muki desu.', 'Khóa này phù hợp người mới.'],
      ['これは こども むけの ばんぐみだ。', 'kore wa kodomo muke no bangumi da.', 'Đây là chương trình dành cho trẻ em.'],
    ],
  },
  {
    p: '〜次第だ／〜次第で',
    m: 'tùy thuộc vào …',
    c: 'state',
    ex: [
      ['せいこうするか どうかは どりょく しだいだ。', 'seikou suru ka dou ka wa doryoku shidai da.', 'Thành công hay không tùy vào nỗ lực.'],
      ['てんき しだいで、よていを かえる。', 'tenki shidai de, yotei o kaeru.', 'Tùy thời tiết mà đổi kế hoạch.'],
    ],
  },
  {
    p: '〜に伴って',
    m: 'kéo theo, cùng với …',
    c: 'state',
    ex: [
      ['じんこうの ぞうかに ともなって、じゅうたくが ふそくした。', 'jinkou no zouka ni tomonatte, juutaku ga fusoku shita.', 'Cùng với dân số tăng, nhà ở trở nên thiếu.'],
      ['ぎじゅつの しんぽに ともない、せいかつが かわった。', 'gijutsu no shinpo ni tomonai, seikatsu ga kawatta.', 'Kéo theo tiến bộ kỹ thuật, cuộc sống thay đổi.'],
    ],
  },
  {
    p: '〜一方だ（N2・xu hướng xấu）',
    m: 'cứ ngày càng … (không dừng)',
    c: 'state',
    ex: [
      ['ごみの りょうは ふえる いっぽうだ。', 'gomi no ryou wa fueru ippou da.', 'Lượng rác cứ ngày càng tăng.'],
      ['かれとの きょりは ひらく いっぽうだった。', 'kare to no kyori wa hiraku ippou datta.', 'Khoảng cách với anh ấy ngày càng xa.'],
    ],
  },
  {
    p: '〜ぬきで／〜ぬきに',
    m: 'không có …, bỏ qua …',
    c: 'state',
    ex: [
      ['あさごはん ぬきで かいしゃに いった。', 'asagohan nuki de kaisha ni itta.', 'Tôi đi làm mà không ăn sáng.'],
      ['じょうだんは ぬきに して、まじめに はなそう。', 'joudan wa nuki ni shite, majime ni hanasou.', 'Bỏ đùa sang bên, nói chuyện nghiêm túc nào.'],
    ],
  },
  {
    p: '〜ようになっている',
    m: 'được thiết kế / sắp xếp sao cho …',
    c: 'state',
    ex: [
      ['この ドアは ひとが ちかづくと あく ように なって いる。', 'kono doa wa hito ga chikazuku to aku you ni natte iru.', 'Cửa này được thiết kế để mở khi có người lại gần.'],
      ['ボタンを おすと、おゆが でる ように なって います。', 'botan o osu to, oyu ga deru you ni natte imasu.', 'Bấm nút là nước nóng chảy ra.'],
    ],
  },
  {
    p: '〜ばかりになっている',
    m: 'chỉ còn chờ …',
    c: 'state',
    ex: [
      ['にもつは まとめて、あとは でかける ばかりに なって いる。', 'nimotsu wa matomete, ato wa dekakeru bakari ni natte iru.', 'Hành lý đã gói xong, chỉ còn chờ đi.'],
      ['りょうりは あとは たべる ばかりだ。', 'ryouri wa ato wa taberu bakari da.', 'Món ăn giờ chỉ còn ăn thôi.'],
    ],
  },
  {
    p: '〜ことなく',
    m: 'không hề …',
    c: 'state',
    ex: [
      ['かれは やすむ ことなく はたらきつづけた。', 'kare wa yasumu koto naku hatarakitsuzuketa.', 'Anh ấy làm việc liên tục không hề nghỉ.'],
      ['あきらめる ことなく、さいごまで がんばった。', 'akirameru koto naku, saigo made ganbatta.', 'Không hề bỏ cuộc, cố gắng đến cùng.'],
    ],
  },
  {
    p: '〜ほどだ（N2・mức độ cực đoan）',
    m: 'đến mức …',
    c: 'state',
    ex: [
      ['あしが いたくて、あるけない ほどだ。', 'ashi ga itakute, arukenai hodo da.', 'Chân đau đến mức không đi được.'],
      ['この せつめいは こどもでも わかる ほど かんたんだ。', 'kono setsumei wa kodomo demo wakaru hodo kantan da.', 'Lời giải thích đơn giản đến mức trẻ con cũng hiểu.'],
    ],
  },
];
