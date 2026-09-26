import type { TbGrammar } from '../types';

export const N1_CATEGORIES: Record<string, string> = {
  time: 'Thời điểm & nối tiếp tức thì',
  scope: 'Phạm vi, giới hạn & tiêu chuẩn',
  cond: 'Điều kiện & giả định',
  concede: 'Nhượng bộ & trái với dự đoán',
  degree: 'Mức độ cực điểm & nhấn mạnh',
  attitude: 'Thái độ, bổn phận & đánh giá',
  manner: 'Cách thức, dáng vẻ & trạng thái',
  cause: 'Nguyên nhân, mục đích & kết quả',
};

export const N1_GRAMMAR: TbGrammar[] = [
  // ── Thời điểm & nối tiếp tức thì ──
  {
    p: '〜や否や／〜や',
    m: 'vừa … thì ngay lập tức',
    c: 'time',
    ex: [
      ['ベルが なるや いなや、がくせいたちは きょうしつを とびだした。', 'beru ga naru ya ina ya, gakuseitachi wa kyoushitsu o tobidashita.', 'Chuông vừa reo, học sinh đã lao ra khỏi lớp.'],
      ['かれは いえに つくや、ベッドに たおれこんだ。', 'kare wa ie ni tsuku ya, beddo ni taorekonda.', 'Vừa về đến nhà, anh ấy đã đổ vật xuống giường.'],
    ],
  },
  {
    p: '〜が早いか',
    m: 'vừa mới … là đã',
    c: 'time',
    ex: [
      ['こどもは かばんを おくが はやいか、あそびに でかけた。', 'kodomo wa kaban o oku ga hayai ka, asobi ni dekaketa.', 'Đứa trẻ vừa đặt cặp xuống là đã đi chơi.'],
      ['しょうひんが ならぶが はやいか、うりきれた。', 'shouhin ga narabu ga hayai ka, urikireta.', 'Hàng vừa bày ra đã bán hết.'],
    ],
  },
  {
    p: '〜なり',
    m: 'vừa … liền (hành động bất ngờ)',
    c: 'time',
    ex: [
      ['かのじょは わたしの かおを みるなり、なきだした。', 'kanojo wa watashi no kao o miru nari, nakidashita.', 'Cô ấy vừa nhìn thấy mặt tôi liền bật khóc.'],
      ['ちちは でんわを きるなり、でかけて いった。', 'chichi wa denwa o kiru nari, dekakete itta.', 'Bố vừa cúp máy là đi ra ngoài ngay.'],
    ],
  },
  {
    p: '〜そばから',
    m: 'vừa … xong thì lại (lặp lại)',
    c: 'time',
    ex: [
      ['かたづける そばから、こどもが ちらかす。', 'katazukeru soba kara, kodomo ga chirakasu.', 'Vừa dọn xong là bọn trẻ lại bày bừa.'],
      ['ならった そばから わすれて しまう。', 'naratta soba kara wasurete shimau.', 'Vừa học xong đã quên ngay.'],
    ],
  },
  {
    p: '〜を皮切りに',
    m: 'bắt đầu từ …, khởi đầu là …',
    c: 'time',
    ex: [
      ['とうきょうこうえんを かわきりに、ぜんこくツアーが はじまった。', 'toukyou kouen o kawakiri ni, zenkoku tsuaa ga hajimatta.', 'Khởi đầu bằng buổi diễn ở Tokyo, tour toàn quốc bắt đầu.'],
      ['かれの はつげんを かわきりに、つぎつぎと いけんが でた。', 'kare no hatsugen o kawakiri ni, tsugitsugi to iken ga deta.', 'Bắt đầu từ phát biểu của anh ấy, ý kiến liên tục được đưa ra.'],
    ],
  },
  {
    p: '〜に至って（は）',
    m: 'đến khi … thì (mới)',
    c: 'time',
    ex: [
      ['しにんが でるに いたって、やっと たいさくが とられた。', 'shinin ga deru ni itatte, yatto taisaku ga torareta.', 'Đến khi có người chết thì mới có biện pháp.'],
      ['じたいが ここに いたっては、もう どうしようも ない。', 'jitai ga koko ni itatte wa, mou doushiyou mo nai.', 'Sự việc đến nước này thì không còn cách nào.'],
    ],
  },
  {
    p: '〜を限りに',
    m: 'kể từ … là thôi / lần cuối',
    c: 'time',
    ex: [
      ['こんげつを かぎりに、この みせは へいてんします。', 'kongetsu o kagiri ni, kono mise wa heiten shimasu.', 'Hết tháng này, cửa hàng sẽ đóng cửa.'],
      ['きょうを かぎりに タバコを やめる。', 'kyou o kagiri ni tabako o yameru.', 'Từ hôm nay tôi bỏ thuốc lá.'],
    ],
  },
  {
    p: '〜てこのかた',
    m: 'suốt từ khi … đến nay',
    c: 'time',
    ex: [
      ['うまれて このかた、びょうきを した ことが ない。', 'umarete kono kata, byouki o shita koto ga nai.', 'Từ khi sinh ra đến nay chưa từng ốm.'],
      ['にほんに きて このかた、いちども かえって いない。', 'nihon ni kite kono kata, ichido mo kaette inai.', 'Từ khi sang Nhật đến nay chưa về lần nào.'],
    ],
  },
  {
    p: '〜にあって',
    m: 'trong (hoàn cảnh) …',
    c: 'time',
    ex: [
      ['こんなんな じょうきょうに あって、かれは おちついて いた。', 'konnan na joukyou ni atte, kare wa ochitsuite ita.', 'Trong hoàn cảnh khó khăn, anh ấy vẫn bình tĩnh.'],
      ['じょうほうかしゃかいに あって、プライバシーの ほごは じゅうようだ。', 'jouhouka shakai ni atte, puraibashii no hogo wa juuyou da.', 'Trong xã hội thông tin, bảo vệ quyền riêng tư là quan trọng.'],
    ],
  },
  {
    p: '〜折（に）',
    m: 'vào dịp, khi … (trang trọng)',
    c: 'time',
    ex: [
      ['こんど おあいした おりに、くわしく おはなしします。', 'kondo oai shita ori ni, kuwashiku ohanashi shimasu.', 'Dịp gặp lần tới tôi sẽ nói chi tiết.'],
      ['おちかくに おこしの おりは、ぜひ おたちよりください。', 'ochikaku ni okoshi no ori wa, zehi otachiyori kudasai.', 'Khi đến gần đây, xin hãy ghé chơi.'],
    ],
  },
  {
    p: '〜ところを',
    m: 'trong lúc … (mà lại làm phiền)',
    c: 'time',
    ex: [
      ['おいそがしい ところを、ありがとうございます。', 'oisogashii tokoro o, arigatou gozaimasu.', 'Cảm ơn anh đã dành thời gian dù đang bận.'],
      ['おやすみの ところを おじゃまして すみません。', 'oyasumi no tokoro o ojama shite sumimasen.', 'Xin lỗi đã làm phiền lúc anh đang nghỉ.'],
    ],
  },
  // ── Phạm vi, giới hạn & tiêu chuẩn ──
  {
    p: '〜をおいて（ほかに〜ない）',
    m: 'ngoài … ra thì không có',
    c: 'scope',
    ex: [
      ['この しごとを まかせられるのは、かれを おいて ほかに いない。', 'kono shigoto o makaserareru no wa, kare o oite hoka ni inai.', 'Ngoài anh ấy ra không ai được giao việc này.'],
      ['リーダーは かのじょを おいて ほかに かんがえられない。', 'riidaa wa kanojo o oite hoka ni kangaerarenai.', 'Ngoài cô ấy không thể nghĩ ra ai làm trưởng nhóm.'],
    ],
  },
  {
    p: '〜ならでは',
    m: 'chỉ riêng … mới có',
    c: 'scope',
    ex: [
      ['これは この ちほう ならではの あじだ。', 'kore wa kono chihou nara de wa no aji da.', 'Đây là hương vị chỉ vùng này mới có.'],
      ['こども ならではの はっそうに おどろいた。', 'kodomo nara de wa no hassou ni odoroita.', 'Tôi bất ngờ với ý tưởng chỉ trẻ con mới có.'],
    ],
  },
  {
    p: '〜にとどまらず',
    m: 'không chỉ dừng lại ở …',
    c: 'scope',
    ex: [
      ['この びょうきは おとな に とどまらず、こどもにも ひろがって いる。', 'kono byouki wa otona ni todomarazu, kodomo ni mo hirogatte iru.', 'Căn bệnh không chỉ ở người lớn mà lan sang cả trẻ em.'],
      ['かれの かつどうは こくない に とどまらず、かいがいにも およぶ。', 'kare no katsudou wa kokunai ni todomarazu, kaigai ni mo oyobu.', 'Hoạt động của anh ấy không chỉ trong nước mà cả nước ngoài.'],
    ],
  },
  {
    p: '〜をもって',
    m: 'bằng …; vào lúc … (trang trọng)',
    c: 'scope',
    ex: [
      ['ほんじつを もって、うけつけを しゅうりょうします。', 'honjitsu o motte, uketsuke o shuuryou shimasu.', 'Kể từ hôm nay chúng tôi ngừng tiếp nhận.'],
      ['しけんの けっかは しょめんを もって おしらせします。', 'shiken no kekka wa shomen o motte oshirase shimasu.', 'Kết quả thi sẽ được thông báo bằng văn bản.'],
    ],
  },
  {
    p: '〜に即して',
    m: 'phù hợp với, bám sát (thực tế / quy định)',
    c: 'scope',
    ex: [
      ['じじつに そくして はなして ください。', 'jijitsu ni sokushite hanashite kudasai.', 'Hãy nói bám sát sự thật.'],
      ['げんばの じょうきょうに そくした たいさくが ひつようだ。', 'genba no joukyou ni sokushita taisaku ga hitsuyou da.', 'Cần biện pháp phù hợp với tình hình thực tế.'],
    ],
  },
  {
    p: '〜にかかわる',
    m: 'liên quan đến (điều hệ trọng)',
    c: 'scope',
    ex: [
      ['これは いのちに かかわる もんだいだ。', 'kore wa inochi ni kakawaru mondai da.', 'Đây là vấn đề liên quan đến tính mạng.'],
      ['かいしゃの しんようにも かかわる ことだ。', 'kaisha no shin\'you ni mo kakawaru koto da.', 'Việc này ảnh hưởng cả uy tín công ty.'],
    ],
  },
  {
    p: '〜を除いて（は）',
    m: 'ngoại trừ …',
    c: 'scope',
    ex: [
      ['にちようびを のぞいて、まいにち えいぎょうして います。', 'nichiyoubi o nozoite, mainichi eigyou shite imasu.', 'Mở cửa hằng ngày trừ Chủ nhật.'],
      ['いちぶを のぞいて、ほとんど さんせいした。', 'ichibu o nozoite, hotondo sansei shita.', 'Trừ một số ít, hầu hết đều tán thành.'],
    ],
  },
  {
    p: '〜なしに（は）／〜なくして（は）',
    m: 'nếu không có … thì (không thể)',
    c: 'scope',
    ex: [
      ['みなさんの きょうりょく なくして、せいこうは ありえません。', 'minasan no kyouryoku nakushite, seikou wa ariemasen.', 'Không có sự hợp tác của mọi người thì không thể thành công.'],
      ['ことわり なしに へやに はいらないで。', 'kotowari nashi ni heya ni hairanaide.', 'Đừng vào phòng mà không xin phép.'],
    ],
  },
  {
    p: '〜たりとも〜ない',
    m: 'dù chỉ một … cũng không',
    c: 'scope',
    ex: [
      ['いっしゅん たりとも ゆだんできない。', 'isshun taritomo yudan dekinai.', 'Không thể lơ là dù chỉ một khoảnh khắc.'],
      ['いちえん たりとも むだに しない。', 'ichien taritomo muda ni shinai.', 'Không lãng phí dù chỉ một yên.'],
    ],
  },
  {
    p: '〜ともなると／〜ともなれば',
    m: 'một khi đã (đến mức) … thì',
    c: 'scope',
    ex: [
      ['だいがくせい とも なると、じぶんで かんがえて こうどうすべきだ。', 'daigakusei tomo naru to, jibun de kangaete koudou subeki da.', 'Đã là sinh viên thì nên tự suy nghĩ mà hành động.'],
      ['しゃちょう とも なれば、いそがしいのも とうぜんだ。', 'shachou tomo nareba, isogashii no mo touzen da.', 'Đã là giám đốc thì bận là đương nhiên.'],
    ],
  },
  // ── Điều kiện & giả định ──
  {
    p: '〜とあれば',
    m: 'nếu là (vì) … thì (sẵn sàng)',
    c: 'cond',
    ex: [
      ['こどもの ため とあれば、どんな くろうも いとわない。', 'kodomo no tame to areba, donna kurou mo itowanai.', 'Nếu vì con thì vất vả thế nào cũng không ngại.'],
      ['しゃちょうの めいれい とあれば、しかたが ない。', 'shachou no meirei to areba, shikata ga nai.', 'Nếu là lệnh giám đốc thì đành chịu.'],
    ],
  },
  {
    p: '〜ようものなら',
    m: 'nếu lỡ mà … thì (hậu quả nghiêm trọng)',
    c: 'cond',
    ex: [
      ['ちちに くちごたえ しようものなら、たいへんな ことに なる。', 'chichi ni kuchigotae shiyou mono nara, taihen na koto ni naru.', 'Nếu lỡ cãi lại bố thì to chuyện.'],
      ['しめきりに おくれようものなら、しごとを うしなう。', 'shimekiri ni okureyou mono nara, shigoto o ushinau.', 'Nếu lỡ trễ hạn thì mất việc.'],
    ],
  },
  {
    p: '〜ないまでも',
    m: 'dù không đến mức … thì ít nhất',
    c: 'cond',
    ex: [
      ['まいにち とは いわないまでも、しゅうに いちどは れんらくして。', 'mainichi to wa iwanai made mo, shuu ni ichido wa renraku shite.', 'Không đến mức mỗi ngày thì ít nhất tuần một lần hãy liên lạc.'],
      ['ゆうしょう できないまでも、いい しあいを したい。', 'yuushou dekinai made mo, ii shiai o shitai.', 'Dù không vô địch thì ít nhất muốn đấu hay.'],
    ],
  },
  {
    p: '〜ならいざしらず',
    m: 'nếu là … thì còn được, chứ …',
    c: 'cond',
    ex: [
      ['こども ならいざしらず、おとなが そんな ことを するとは。', 'kodomo nara iza shirazu, otona ga sonna koto o suru to wa.', 'Trẻ con thì đành, đằng này người lớn lại làm thế.'],
      ['しらなかった ならいざしらず、しって いて やったのは ゆるせない。', 'shiranakatta nara iza shirazu, shitte ite yatta no wa yurusenai.', 'Không biết thì còn được, biết mà vẫn làm thì không thể tha.'],
    ],
  },
  {
    p: '〜たら最後／〜たが最後',
    m: 'một khi đã … thì (không cứu vãn)',
    c: 'cond',
    ex: [
      ['かれは ねむったら さいご、なにが あっても おきない。', 'kare wa nemuttara saigo, nani ga atte mo okinai.', 'Anh ấy một khi đã ngủ thì có chuyện gì cũng không dậy.'],
      ['この ばしょを しられたが さいご、にげられない。', 'kono basho o shirareta ga saigo, nigerarenai.', 'Một khi bị biết chỗ này thì không trốn được.'],
    ],
  },
  {
    p: '〜ようによっては',
    m: 'tùy cách … mà',
    c: 'cond',
    ex: [
      ['かんがえ ように よっては、しっぱいも いい けいけんだ。', 'kangae you ni yotte wa, shippai mo ii keiken da.', 'Tùy cách nghĩ, thất bại cũng là kinh nghiệm tốt.'],
      ['この ことばは とり ように よっては しつれいに きこえる。', 'kono kotoba wa tori you ni yotte wa shitsurei ni kikoeru.', 'Tùy cách hiểu, câu này nghe có vẻ vô lễ.'],
    ],
  },
  {
    p: '〜なくしては',
    m: 'nếu không có … thì không thể',
    c: 'cond',
    ex: [
      ['あいじょう なくしては、こそだては できない。', 'aijou nakushite wa, kosodate wa dekinai.', 'Không có tình yêu thì không thể nuôi dạy con.'],
      ['どりょく なくしては、せいこうは ない。', 'doryoku nakushite wa, seikou wa nai.', 'Không có nỗ lực thì không có thành công.'],
    ],
  },
  {
    p: '〜とすれば（N1・suy luận）',
    m: 'nếu cho rằng … thì',
    c: 'cond',
    ex: [
      ['かれの はなしが ほんとう と すれば、けいかくを みなおす ひつようが ある。', 'kare no hanashi ga hontou to sureba, keikaku o minaosu hitsuyou ga aru.', 'Nếu lời anh ấy là thật thì cần xem lại kế hoạch.'],
      ['いま しゅっぱつする と すれば、ゆうがたには つく。', 'ima shuppatsu suru to sureba, yuugata ni wa tsuku.', 'Nếu xuất phát bây giờ thì chiều tối sẽ đến.'],
    ],
  },
  // ── Nhượng bộ & trái với dự đoán ──
  {
    p: '〜といえども',
    m: 'dù là … đi nữa',
    c: 'concede',
    ex: [
      ['せんもんか と いえども、まちがえる ことは ある。', 'senmonka to iedomo, machigaeru koto wa aru.', 'Dù là chuyên gia cũng có lúc sai.'],
      ['こども と いえども、ルールは まもるべきだ。', 'kodomo to iedomo, ruuru wa mamoru beki da.', 'Dù là trẻ con cũng phải giữ luật.'],
    ],
  },
  {
    p: '〜とはいえ',
    m: 'tuy nói là … nhưng',
    c: 'concede',
    ex: [
      ['はる とは いえ、まだ さむい ひが つづく。', 'haru to wa ie, mada samui hi ga tsuzuku.', 'Tuy nói là xuân nhưng vẫn còn những ngày lạnh.'],
      ['しごと とは いえ、かぞくと はなれるのは つらい。', 'shigoto to wa ie, kazoku to hanareru no wa tsurai.', 'Tuy là vì công việc nhưng xa gia đình thật khổ.'],
    ],
  },
  {
    p: '〜であれ／〜であれ〜であれ',
    m: 'dù là …',
    c: 'concede',
    ex: [
      ['どんな りゆう であれ、ぼうりょくは ゆるされない。', 'donna riyuu de are, bouryoku wa yurusarenai.', 'Dù lý do gì, bạo lực không được chấp nhận.'],
      ['あめ であれ ゆき であれ、しゅっぱつする。', 'ame de are yuki de are, shuppatsu suru.', 'Dù mưa hay tuyết cũng xuất phát.'],
    ],
  },
  {
    p: '〜にせよ〜にせよ',
    m: 'dù … hay …',
    c: 'concede',
    ex: [
      ['さんせい にせよ はんたい にせよ、いけんを のべて ください。', 'sansei ni seyo hantai ni seyo, iken o nobete kudasai.', 'Tán thành hay phản đối, xin hãy nêu ý kiến.'],
      ['いずれ にせよ、れんらくします。', 'izure ni seyo, renraku shimasu.', 'Dù sao đi nữa tôi cũng sẽ liên lạc.'],
    ],
  },
  {
    p: '〜ものを',
    m: 'giá mà … vậy mà (tiếc nuối)',
    c: 'concede',
    ex: [
      ['いって くれれば てつだった ものを。', 'itte kurereba tetsudatta mono o.', 'Giá mà nói với tôi thì tôi đã giúp rồi.'],
      ['はやく びょういんに いけば よかった ものを。', 'hayaku byouin ni ikeba yokatta mono o.', 'Giá mà đi viện sớm thì tốt rồi.'],
    ],
  },
  {
    p: '〜と思いきや',
    m: 'cứ tưởng … hóa ra',
    c: 'concede',
    ex: [
      ['はれる と おもいきや、ごごから あめに なった。', 'hareru to omoikiya, gogo kara ame ni natta.', 'Cứ tưởng trời nắng, hóa ra chiều lại mưa.'],
      ['かんたんな しけん と おもいきや、むずかしかった。', 'kantan na shiken to omoikiya, muzukashikatta.', 'Tưởng đề dễ, hóa ra lại khó.'],
    ],
  },
  {
    p: '〜ながらに（して）',
    m: 'giữ nguyên …, ngay từ khi …',
    c: 'concede',
    ex: [
      ['インターネットで いえに いながらにして かいものが できる。', 'intaanetto de ie ni inagara ni shite kaimono ga dekiru.', 'Nhờ Internet có thể mua sắm ngay tại nhà.'],
      ['かのじょは なみだ ながらに じじょうを はなした。', 'kanojo wa namida nagara ni jijou o hanashita.', 'Cô ấy vừa rơi nước mắt vừa kể sự tình.'],
    ],
  },
  {
    p: '〜ではあるまいし',
    m: 'có phải là … đâu mà',
    c: 'concede',
    ex: [
      ['こども ではあるまいし、じぶんで かんがえなさい。', 'kodomo de wa arumai shi, jibun de kangaenasai.', 'Có phải trẻ con đâu, tự suy nghĩ đi.'],
      ['えいえんに わかれる わけ ではあるまいし、なかないで。', 'eien ni wakareru wake de wa arumai shi, nakanaide.', 'Có phải chia tay mãi mãi đâu, đừng khóc.'],
    ],
  },
  {
    p: '〜とて',
    m: 'dù … cũng; ngay cả … cũng',
    c: 'concede',
    ex: [
      ['いくら ねがった とて、むりな ものは むりだ。', 'ikura negatta tote, muri na mono wa muri da.', 'Dù có mong mỏi bao nhiêu, không thể vẫn là không thể.'],
      ['わたし とて、かなしくない わけでは ない。', 'watashi tote, kanashikunai wake de wa nai.', 'Ngay cả tôi cũng đâu phải không buồn.'],
    ],
  },
  // ── Mức độ cực điểm & nhấn mạnh ──
  {
    p: '〜極まる／〜極まりない',
    m: 'cực kỳ …',
    c: 'degree',
    ex: [
      ['かれの たいどは しつれい きわまりない。', 'kare no taido wa shitsurei kiwamarinai.', 'Thái độ của anh ta cực kỳ vô lễ.'],
      ['この どうろは きけん きわまる。', 'kono douro wa kiken kiwamaru.', 'Con đường này cực kỳ nguy hiểm.'],
    ],
  },
  {
    p: '〜の極み',
    m: 'tột độ, đỉnh cao của …',
    c: 'degree',
    ex: [
      ['この ような しょうを いただき、こうえいの きわみです。', 'kono you na shou o itadaki, kouei no kiwami desu.', 'Được nhận giải thưởng này là vinh dự tột bậc.'],
      ['あの しっぱいは ひあいの きわみだった。', 'ano shippai wa hiai no kiwami datta.', 'Thất bại đó là nỗi đau tột cùng.'],
    ],
  },
  {
    p: '〜の至り',
    m: 'vô cùng … (trang trọng)',
    c: 'degree',
    ex: [
      ['おほめの ことばを いただき、こうえいの いたりです。', 'ohome no kotoba o itadaki, kouei no itari desu.', 'Được khen ngợi, tôi vô cùng vinh dự.'],
      ['わかげの いたりで、ばかな ことを した。', 'wakage no itari de, baka na koto o shita.', 'Vì bồng bột tuổi trẻ nên đã làm điều ngốc nghếch.'],
    ],
  },
  {
    p: '〜までもない',
    m: 'không cần phải … (đến mức)',
    c: 'degree',
    ex: [
      ['いう までも なく、けんこうが いちばん たいせつだ。', 'iu made mo naku, kenkou ga ichiban taisetsu da.', 'Khỏi phải nói, sức khỏe là quan trọng nhất.'],
      ['この ていどの けがなら、びょういんに いく までも ない。', 'kono teido no kega nara, byouin ni iku made mo nai.', 'Vết thương cỡ này thì không cần đến viện.'],
    ],
  },
  {
    p: '〜にかたくない',
    m: 'không khó để … (tưởng tượng)',
    c: 'degree',
    ex: [
      ['かぞくの かなしみは そうぞうに かたくない。', 'kazoku no kanashimi wa souzou ni katakunai.', 'Nỗi đau của gia đình không khó để tưởng tượng.'],
      ['かれの くろうは さっするに かたくない。', 'kare no kurou wa sassuru ni katakunai.', 'Không khó để hình dung nỗi vất vả của anh ấy.'],
    ],
  },
  {
    p: '〜にたえない／〜にたえる',
    m: 'không đáng / không chịu nổi … ; đáng để …',
    c: 'degree',
    ex: [
      ['その ばんぐみは みるに たえない。', 'sono bangumi wa miru ni taenai.', 'Chương trình đó không đáng để xem.'],
      ['この さくひんは おとなの かんしょうにも たえる。', 'kono sakuhin wa otona no kanshou ni mo taeru.', 'Tác phẩm này đáng để người lớn thưởng thức.'],
    ],
  },
  {
    p: '〜に足る',
    m: 'đủ để …, đáng …',
    c: 'degree',
    ex: [
      ['かれは しんらいするに たる ひとだ。', 'kare wa shinrai suru ni taru hito da.', 'Anh ấy là người đáng tin cậy.'],
      ['はなすに たりない ことだ。', 'hanasu ni tarinai koto da.', 'Chuyện không đáng để nói.'],
    ],
  },
  {
    p: '〜てやまない',
    m: 'luôn luôn … (tha thiết)',
    c: 'degree',
    ex: [
      ['みなさまの ごけんこうを ねがって やみません。', 'minasama no gokenkou o negatte yamimasen.', 'Luôn cầu chúc mọi người mạnh khỏe.'],
      ['かれの せいこうを いのって やまない。', 'kare no seikou o inotte yamanai.', 'Tôi luôn cầu mong anh ấy thành công.'],
    ],
  },
  {
    p: '〜といったらない',
    m: '… không kể xiết',
    c: 'degree',
    ex: [
      ['あの ときの はずかしさ と いったら なかった。', 'ano toki no hazukashisa to ittara nakatta.', 'Lúc đó xấu hổ không kể xiết.'],
      ['やまの うえからの けしきの うつくしさ と いったら ない。', 'yama no ue kara no keshiki no utsukushisa to ittara nai.', 'Cảnh từ trên núi đẹp không tả nổi.'],
    ],
  },
  {
    p: '〜だに',
    m: 'chỉ cần … thôi đã; ngay cả …',
    c: 'degree',
    ex: [
      ['じしんの ことは かんがえる だに おそろしい。', 'jishin no koto wa kangaeru dani osoroshii.', 'Chỉ nghĩ đến động đất thôi đã sợ.'],
      ['ゆめに だに おもわなかった。', 'yume ni dani omowanakatta.', 'Ngay cả trong mơ cũng không nghĩ tới.'],
    ],
  },
  {
    p: '〜だけましだ',
    m: 'còn may là … (so với tệ hơn)',
    c: 'degree',
    ex: [
      ['じこに あったが、けがを しなかった だけ ましだ。', 'jiko ni atta ga, kega o shinakatta dake mashi da.', 'Bị tai nạn nhưng còn may là không bị thương.'],
      ['きゅうりょうは やすいが、しごとが ある だけ ましだ。', 'kyuuryou wa yasui ga, shigoto ga aru dake mashi da.', 'Lương thấp nhưng còn may là có việc.'],
    ],
  },
  // ── Thái độ, bổn phận & đánh giá ──
  {
    p: '〜べからず／〜べからざる',
    m: 'không được … (cấm, văn viết)',
    c: 'attitude',
    ex: [
      ['しばふに たちいる べからず。', 'shibafu ni tachiiru bekarazu.', 'Cấm giẫm lên cỏ.'],
      ['それは けっして ゆるす べからざる こういだ。', 'sore wa kesshite yurusu bekarazaru koui da.', 'Đó là hành vi tuyệt đối không thể tha thứ.'],
    ],
  },
  {
    p: '〜まじき',
    m: 'không được phép (với tư cách …)',
    c: 'attitude',
    ex: [
      ['きょうし に あるまじき こういだ。', 'kyoushi ni aru majiki koui da.', 'Đó là hành vi không thể có ở một giáo viên.'],
      ['ひととして ゆるす まじき ことだ。', 'hito to shite yurusu majiki koto da.', 'Là con người thì không thể tha thứ việc đó.'],
    ],
  },
  {
    p: '〜までだ／〜までのことだ',
    m: 'chỉ còn cách … / chỉ là … mà thôi',
    c: 'attitude',
    ex: [
      ['だめなら、もう いちど やる までだ。', 'dame nara, mou ichido yaru made da.', 'Không được thì làm lại lần nữa thôi.'],
      ['ほんとうの ことを いった までのことだ。', 'hontou no koto o itta made no koto da.', 'Tôi chỉ nói sự thật mà thôi.'],
    ],
  },
  {
    p: '〜ばそれまでだ',
    m: 'nếu … thì cũng hết (vô nghĩa)',
    c: 'attitude',
    ex: [
      ['いくら ちょきんしても、しんで しまえば それまでだ。', 'ikura chokin shite mo, shinde shimaeba sore made da.', 'Tiết kiệm bao nhiêu thì chết rồi cũng hết.'],
      ['どんなに いい けいかくでも、じっこうしなければ それまでだ。', 'donna ni ii keikaku demo, jikkou shinakereba sore made da.', 'Kế hoạch hay mấy mà không thực hiện thì cũng vô ích.'],
    ],
  },
  {
    p: '〜を禁じ得ない',
    m: 'không kìm được …',
    c: 'attitude',
    ex: [
      ['ひさいしゃの はなしに なみだを きんじえない。', 'hisaisha no hanashi ni namida o kinjienai.', 'Nghe chuyện nạn nhân không cầm được nước mắt.'],
      ['この けっていには いきどおりを きんじえない。', 'kono kettei ni wa ikidoori o kinjienai.', 'Không kìm được phẫn nộ trước quyết định này.'],
    ],
  },
  {
    p: '〜ずにはおかない',
    m: 'chắc chắn sẽ … (không thể không)',
    c: 'attitude',
    ex: [
      ['かれの えんぜつは ひとびとを かんどうさせずには おかない。', 'kare no enzetsu wa hitobito o kandou sasezu ni wa okanai.', 'Bài diễn văn của anh ấy chắc chắn làm mọi người cảm động.'],
      ['はんにんを つかまえずには おかない。', 'hannin o tsukamaezu ni wa okanai.', 'Nhất định phải bắt được thủ phạm.'],
    ],
  },
  {
    p: '〜ずにはすまない／〜ないではすまない',
    m: 'không thể không … (bắt buộc về đạo lý)',
    c: 'attitude',
    ex: [
      ['ひとに めいわくを かけたのだから、あやまらずには すまない。', 'hito ni meiwaku o kaketa no da kara, ayamarazu ni wa sumanai.', 'Đã làm phiền người khác thì không thể không xin lỗi.'],
      ['この ままでは せきにんを とらないでは すまない。', 'kono mama de wa sekinin o toranai de wa sumanai.', 'Cứ thế này thì không thể không chịu trách nhiệm.'],
    ],
  },
  {
    p: '〜にはあたらない',
    m: 'không đáng để …',
    c: 'attitude',
    ex: [
      ['この ていどの ことで おどろくには あたらない。', 'kono teido no koto de odoroku ni wa ataranai.', 'Chuyện cỡ này không đáng để ngạc nhiên.'],
      ['かれを せめるには あたらない。', 'kare o semeru ni wa ataranai.', 'Không đáng để trách anh ấy.'],
    ],
  },
  {
    p: '〜に越したことはない',
    m: '… là tốt nhất',
    c: 'attitude',
    ex: [
      ['おかねは ある に こした ことは ない。', 'okane wa aru ni koshita koto wa nai.', 'Có tiền thì vẫn là tốt nhất.'],
      ['ようじんする に こした ことは ない。', 'youjin suru ni koshita koto wa nai.', 'Cẩn thận vẫn là hơn.'],
    ],
  },
  {
    p: '〜きらいがある',
    m: 'có khuynh hướng (xấu) …',
    c: 'attitude',
    ex: [
      ['かれは ものごとを おおげさに いう きらいが ある。', 'kare wa monogoto o oogesa ni iu kirai ga aru.', 'Anh ta có tật hay nói phóng đại.'],
      ['さいきんの わかものは けいたいに たよる きらいが ある。', 'saikin no wakamono wa keitai ni tayoru kirai ga aru.', 'Giới trẻ gần đây có xu hướng phụ thuộc điện thoại.'],
    ],
  },
  {
    p: '〜しまつだ',
    m: 'rốt cuộc đến nỗi … (kết cục tệ)',
    c: 'attitude',
    ex: [
      ['かれは なまけて ばかりで、ついには かいしゃを くびに なる しまつだ。', 'kare wa namakete bakari de, tsui ni wa kaisha o kubi ni naru shimatsu da.', 'Anh ta lười mãi, rốt cuộc bị đuổi việc.'],
      ['ちゅういしても きかず、けがを する しまつだ。', 'chuui shite mo kikazu, kega o suru shimatsu da.', 'Nhắc mà không nghe, cuối cùng bị thương.'],
    ],
  },
  {
    p: '〜べく',
    m: 'để (mục đích, văn viết)',
    c: 'attitude',
    ex: [
      ['しけんに ごうかくす べく、まいにち べんきょうして いる。', 'shiken ni goukaku su beku, mainichi benkyou shite iru.', 'Để đỗ kỳ thi, tôi học mỗi ngày.'],
      ['もんだいを かいけつす べく、かいぎが ひらかれた。', 'mondai o kaiketsu su beku, kaigi ga hirakareta.', 'Cuộc họp được mở để giải quyết vấn đề.'],
    ],
  },
  // ── Cách thức, dáng vẻ & trạng thái ──
  {
    p: '〜まみれ',
    m: 'đầy, lấm lem (dính bề mặt)',
    c: 'manner',
    ex: [
      ['こどもたちは どろ まみれに なって あそんだ。', 'kodomotachi wa doro mamire ni natte asonda.', 'Bọn trẻ chơi lấm lem bùn đất.'],
      ['あせ まみれで はたらいた。', 'ase mamire de hataraita.', 'Làm việc mồ hôi nhễ nhại.'],
    ],
  },
  {
    p: '〜めく',
    m: 'có vẻ, mang dáng dấp …',
    c: 'manner',
    ex: [
      ['だんだん はるめいて きた。', 'dandan harumeite kita.', 'Trời dần mang dáng vẻ mùa xuân.'],
      ['かれは ひにくめいた ことを いった。', 'kare wa hinikumeita koto o itta.', 'Anh ấy nói điều nghe có vẻ mỉa mai.'],
    ],
  },
  {
    p: '〜ぶる',
    m: 'làm ra vẻ …',
    c: 'manner',
    ex: [
      ['かのじょは いつも じょうひんぶって いる。', 'kanojo wa itsumo jouhinbutte iru.', 'Cô ấy lúc nào cũng làm ra vẻ thanh lịch.'],
      ['えらぶる ひとは きらわれる。', 'eraburu hito wa kirawareru.', 'Người ra vẻ ta đây bị ghét.'],
    ],
  },
  {
    p: '〜とばかりに',
    m: 'như thể muốn nói rằng …',
    c: 'manner',
    ex: [
      ['かれは もう かえれ と ばかりに、ドアを あけた。', 'kare wa mou kaere to bakari ni, doa o aketa.', 'Anh ta mở cửa như muốn bảo "về đi".'],
      ['いまが チャンス と ばかりに、みんなが かいに はしった。', 'ima ga chansu to bakari ni, minna ga kai ni hashitta.', 'Mọi người lao đi mua như thể "cơ hội là đây".'],
    ],
  },
  {
    p: '〜んばかりに',
    m: 'như thể sắp …',
    c: 'manner',
    ex: [
      ['かのじょは なきださん ばかりの かおを して いた。', 'kanojo wa nakidasan bakari no kao o shite ita.', 'Cô ấy có vẻ mặt như sắp khóc.'],
      ['われん ばかりの はくしゅが おこった。', 'waren bakari no hakushu ga okotta.', 'Tiếng vỗ tay vang dội như muốn vỡ tung.'],
    ],
  },
  {
    p: '〜ともなく／〜ともなしに',
    m: 'một cách vô thức, không định …',
    c: 'manner',
    ex: [
      ['みる とも なく テレビを みて いた。', 'miru tomo naku terebi o mite ita.', 'Tôi nhìn tivi một cách vô định.'],
      ['どこから とも なく おんがくが きこえて きた。', 'doko kara tomo naku ongaku ga kikoete kita.', 'Không biết từ đâu vọng lại tiếng nhạc.'],
    ],
  },
  {
    p: '〜かたがた',
    m: 'nhân tiện …, kết hợp …',
    c: 'manner',
    ex: [
      ['おれい かたがた、ごあいさつに うかがいました。', 'orei katagata, goaisatsu ni ukagaimashita.', 'Tôi đến chào hỏi, nhân tiện cảm ơn.'],
      ['さんぽ かたがた、ほんやに よった。', 'sanpo katagata, hon\'ya ni yotta.', 'Nhân tiện đi dạo, tôi ghé hiệu sách.'],
    ],
  },
  {
    p: '〜がてら',
    m: 'tiện thể, nhân lúc …',
    c: 'manner',
    ex: [
      ['かいもの がてら、こうえんを さんぽした。', 'kaimono gatera, kouen o sanpo shita.', 'Tiện đi mua sắm, tôi đi dạo công viên.'],
      ['えきまで おくり がてら、はなしを した。', 'eki made okuri gatera, hanashi o shita.', 'Tiện tiễn ra ga, tôi nói chuyện với anh ấy.'],
    ],
  },
  {
    p: '〜ずじまい',
    m: 'rốt cuộc đã không …',
    c: 'manner',
    ex: [
      ['いそがしくて、けっきょく かのじょに あわず じまいだった。', 'isogashikute, kekkyoku kanojo ni awazu jimai datta.', 'Bận quá rốt cuộc đã không gặp được cô ấy.'],
      ['かった ほんを よまず じまいで すてた。', 'katta hon o yomazu jimai de suteta.', 'Sách đã mua rốt cuộc không đọc mà vứt đi.'],
    ],
  },
  {
    p: '〜つ〜つ',
    m: 'lúc … lúc … (luân phiên)',
    c: 'manner',
    ex: [
      ['ふたりは おいつ おわれつ の レースを した。', 'futari wa oitsu owaretsu no reesu o shita.', 'Hai người đua nhau lúc đuổi lúc bị đuổi.'],
      ['ゆきつ もどりつ しながら かんがえた。', 'yukitsu modoritsu shinagara kangaeta.', 'Đi tới đi lui mà suy nghĩ.'],
    ],
  },
  {
    p: '〜なりに',
    m: 'theo cách của …, trong phạm vi …',
    c: 'manner',
    ex: [
      ['わたし なりに いっしょうけんめい がんばった。', 'watashi nari ni isshoukenmei ganbatta.', 'Tôi đã cố gắng hết sức theo cách của mình.'],
      ['こども なりに かんがえた けっかだ。', 'kodomo nari ni kangaeta kekka da.', 'Đó là kết quả trẻ con tự suy nghĩ theo cách của nó.'],
    ],
  },
  // ── Nguyên nhân, mục đích & kết quả ──
  {
    p: '〜ゆえ（に）',
    m: 'vì …, do … (văn viết)',
    c: 'cause',
    ex: [
      ['まずしさ ゆえに、がっこうに いけない こどもが いる。', 'mazushisa yue ni, gakkou ni ikenai kodomo ga iru.', 'Vì nghèo mà có những đứa trẻ không được đến trường.'],
      ['わかさ ゆえの あやまちだった。', 'wakasa yue no ayamachi datta.', 'Đó là lỗi lầm do tuổi trẻ.'],
    ],
  },
  {
    p: '〜ばこそ',
    m: 'chính vì … nên mới',
    c: 'cause',
    ex: [
      ['あいして いれば こそ、きびしく するのだ。', 'aishite ireba koso, kibishiku suru no da.', 'Chính vì thương nên mới nghiêm khắc.'],
      ['けんこう で あれば こそ、はたらける。', 'kenkou de areba koso, hatarakeru.', 'Chính vì khỏe mạnh mới làm việc được.'],
    ],
  },
  {
    p: '〜とあって',
    m: 'vì là (dịp đặc biệt) … nên',
    c: 'cause',
    ex: [
      ['れんきゅう とあって、かんこうちは こんで いる。', 'renkyuu to atte, kankouchi wa konde iru.', 'Vì là kỳ nghỉ dài nên điểm du lịch đông nghịt.'],
      ['ゆうめいな かしゅが くる とあって、かいじょうは まんいんだ。', 'yuumei na kashu ga kuru to atte, kaijou wa man\'in da.', 'Vì ca sĩ nổi tiếng đến nên hội trường chật kín.'],
    ],
  },
  {
    p: '〜ことだし',
    m: 'vì … (lý do nhẹ nhàng)',
    c: 'cause',
    ex: [
      ['あめも やんだ ことだし、そろそろ でかけようか。', 'ame mo yanda koto da shi, sorosoro dekakeyou ka.', 'Mưa cũng tạnh rồi, sắp đi thôi nhỉ.'],
      ['みんな そろった ことだし、はじめましょう。', 'minna sorotta koto da shi, hajimemashou.', 'Mọi người đã đủ, bắt đầu thôi.'],
    ],
  },
  {
    p: '〜んがため（に）',
    m: 'để (bằng mọi giá) … (văn viết)',
    c: 'cause',
    ex: [
      ['ゆめを かなえ んがため、かれは くにを でた。', 'yume o kanae nga tame, kare wa kuni o deta.', 'Để thực hiện ước mơ, anh ấy rời quê hương.'],
      ['いきん がために はたらく。', 'ikin ga tame ni hataraku.', 'Làm việc để mà sống.'],
    ],
  },
  {
    p: '〜を余儀なくされる',
    m: 'buộc phải … (do hoàn cảnh)',
    c: 'cause',
    ex: [
      ['たいふうの ため、しあいは ちゅうしを よぎなく された。', 'taifuu no tame, shiai wa chuushi o yoginaku sareta.', 'Vì bão mà trận đấu buộc phải hủy.'],
      ['けがで いんたいを よぎなく された。', 'kega de intai o yoginaku sareta.', 'Vì chấn thương mà buộc phải giải nghệ.'],
    ],
  },
  {
    p: '〜に至る／〜に至るまで',
    m: 'đi đến …; đến tận …',
    c: 'cause',
    ex: [
      ['ちいさな くいちがいが、おおきな じけんに いたった。', 'chiisa na kuichigai ga, ookina jiken ni itatta.', 'Sai lệch nhỏ đã dẫn đến vụ việc lớn.'],
      ['こどもから おとしよりに いたるまで、だれもが たのしめる。', 'kodomo kara otoshiyori ni itaru made, daremo ga tanoshimeru.', 'Từ trẻ em đến người già, ai cũng có thể vui chơi.'],
    ],
  },
  {
    p: '〜に終わる',
    m: 'kết thúc bằng … (kết cục không như ý)',
    c: 'cause',
    ex: [
      ['けいかくは ずさんで、けっきょく しっぱいに おわった。', 'keikaku wa zusan de, kekkyoku shippai ni owatta.', 'Kế hoạch cẩu thả, rốt cuộc kết thúc bằng thất bại.'],
      ['はなしあいは まとまらず、けんかわかれに おわった。', 'hanashiai wa matomarazu, kenkawakare ni owatta.', 'Bàn bạc không đi đến đâu, kết cục chia tay trong cãi vã.'],
    ],
  },
  {
    p: '〜ともあろう',
    m: 'người như … mà lại',
    c: 'cause',
    ex: [
      ['だいがくきょうじゅ とも あろう ひとが、そんな まちがいを するとは。', 'daigaku kyouju tomo arou hito ga, sonna machigai o suru to wa.', 'Một giáo sư đại học mà lại mắc lỗi như vậy.'],
      ['けいさつかん とも あろう ものが はんざいを おかすなんて。', 'keisatsukan tomo arou mono ga hanzai o okasu nante.', 'Là cảnh sát mà lại phạm tội.'],
    ],
  },
];
