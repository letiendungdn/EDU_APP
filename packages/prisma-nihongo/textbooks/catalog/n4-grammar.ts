import type { TbGrammar } from '../types';

export const N4_CATEGORIES: Record<string, string> = {
  form: 'Thể thông thường & biến đổi',
  ability: 'Khả năng & thay đổi',
  intent: 'Ý định, dự định & lời khuyên',
  condition: 'Điều kiện & giả định',
  giving: 'Cho – nhận & làm giúp',
  voice: 'Bị động, sai khiến',
  guess: 'Suy đoán & truyền đạt',
  state: 'Trạng thái, mức độ & mục đích',
};

export const N4_GRAMMAR: TbGrammar[] = [
  // ── Thể thông thường & biến đổi ──
  {
    p: 'Thể thông thường（普通形）',
    m: 'cách nói thân mật / dùng trong mệnh đề',
    c: 'form',
    e: 'V る／V ない／V た／V なかった; A い; A な・N だ. Dùng với bạn bè và trước các mẫu như と思う, でしょう.',
    ex: [
      ['あした、うちに いる？', 'ashita, uchi ni iru?', 'Mai cậu có ở nhà không?'],
      ['きのうは いそがしかった。', 'kinou wa isogashikatta.', 'Hôm qua bận lắm.'],
    ],
  },
  {
    p: 'V た ほうが いい',
    m: 'nên làm V',
    c: 'form',
    e: 'Phủ định: V ない ほうが いい (không nên).',
    ex: [
      ['ねつが あるなら、はやく ねた ほうが いいですよ。', 'netsu ga aru nara, hayaku neta hou ga ii desu yo.', 'Nếu bị sốt thì nên ngủ sớm đấy.'],
      ['よる おそく コーヒーを のまない ほうが いいです。', 'yoru osoku koohii o nomanai hou ga ii desu.', 'Không nên uống cà phê vào đêm khuya.'],
    ],
  },
  {
    p: 'V（thể thông thường）N',
    m: 'mệnh đề bổ nghĩa cho danh từ',
    c: 'form',
    e: 'Chủ ngữ trong mệnh đề dùng が (hoặc の).',
    ex: [
      ['これは ははが つくった ケーキです。', 'kore wa haha ga tsukutta keeki desu.', 'Đây là bánh mẹ tôi làm.'],
      ['めがねを かけて いる ひとが やまださんです。', 'megane o kakete iru hito ga yamada-san desu.', 'Người đeo kính là anh Yamada.'],
    ],
  },
  {
    p: 'V る の が A です',
    m: 'việc V thì A (danh từ hóa bằng の)',
    c: 'form',
    ex: [
      ['わたしは えを かくのが すきです。', 'watashi wa e o kaku no ga suki desu.', 'Tôi thích vẽ tranh.'],
      ['ひとりで りょこうするのは たのしいです。', 'hitori de ryokou suru no wa tanoshii desu.', 'Đi du lịch một mình thì vui.'],
    ],
  },
  {
    p: 'V る の を わすれました',
    m: 'quên làm V',
    c: 'form',
    ex: [
      ['でんきを けすのを わすれました。', 'denki o kesu no o wasuremashita.', 'Tôi quên tắt đèn.'],
      ['しゅくだいを だすのを わすれないで ください。', 'shukudai o dasu no o wasurenaide kudasai.', 'Đừng quên nộp bài tập.'],
    ],
  },
  {
    p: 'V た／V ない まま',
    m: 'để nguyên trạng thái …',
    c: 'form',
    ex: [
      ['エアコンを つけた まま ねて しまいました。', 'eakon o tsuketa mama nete shimaimashita.', 'Tôi lỡ ngủ mà để nguyên điều hòa.'],
      ['くつを はいた まま へやに はいらないで ください。', 'kutsu o haita mama heya ni hairanaide kudasai.', 'Đừng đi nguyên giày vào phòng.'],
    ],
  },
  {
    p: 'V て しまいました',
    m: 'lỡ làm V / đã làm xong V',
    c: 'form',
    e: 'Diễn tả hối tiếc, hoặc hoàn tất. Hội thoại: 〜ちゃった.',
    ex: [
      ['でんしゃに かさを わすれて しまいました。', 'densha ni kasa o wasurete shimaimashita.', 'Tôi lỡ để quên ô trên tàu.'],
      ['この ほんは もう よんで しまいました。', 'kono hon wa mou yonde shimaimashita.', 'Tôi đã đọc hết cuốn sách này rồi.'],
    ],
  },
  {
    p: 'V て おきます',
    m: 'làm V sẵn / trước',
    c: 'form',
    ex: [
      ['パーティーの まえに のみものを かって おきます。', 'paatii no mae ni nomimono o katte okimasu.', 'Trước bữa tiệc tôi mua sẵn đồ uống.'],
      ['つかった あとで、もとの ところに もどして おいて ください。', 'tsukatta ato de, moto no tokoro ni modoshite oite kudasai.', 'Dùng xong hãy để lại chỗ cũ.'],
    ],
  },
  {
    p: 'V て あります',
    m: 'đã được V sẵn (trạng thái do ai đó làm)',
    c: 'form',
    ex: [
      ['まどが あけて あります。', 'mado ga akete arimasu.', 'Cửa sổ đã được mở sẵn.'],
      ['カレンダーに よていが かいて あります。', 'karendaa ni yotei ga kaite arimasu.', 'Lịch trình đã được ghi trên lịch.'],
    ],
  },
  // ── Khả năng & thay đổi ──
  {
    p: 'Thể khả năng（V れる／V られる）',
    m: 'có thể làm V',
    c: 'ability',
    e: 'Nhóm 1: う→える (よむ→よめる); nhóm 2: る→られる; する→できる, くる→こられる.',
    ex: [
      ['わたしは かんじが 300 ぐらい よめます。', 'watashi wa kanji ga sanbyaku gurai yomemasu.', 'Tôi đọc được khoảng 300 chữ Hán.'],
      ['あしたは こられますか。', 'ashita wa koraremasu ka.', 'Ngày mai bạn đến được không?'],
    ],
  },
  {
    p: 'みえます／きこえます',
    m: 'nhìn thấy được / nghe thấy được (tự nhiên)',
    c: 'ability',
    ex: [
      ['まどから ふじさんが みえます。', 'mado kara fujisan ga miemasu.', 'Từ cửa sổ nhìn thấy núi Phú Sĩ.'],
      ['となりの へやから ピアノの おとが きこえます。', 'tonari no heya kara piano no oto ga kikoemasu.', 'Nghe thấy tiếng piano từ phòng bên.'],
    ],
  },
  {
    p: 'V る ように なります',
    m: 'trở nên có thể V / bắt đầu (thói quen)',
    c: 'ability',
    ex: [
      ['にほんごが すこし はなせる ように なりました。', 'nihongo ga sukoshi hanaseru you ni narimashita.', 'Tôi đã nói được một chút tiếng Nhật.'],
      ['まいあさ ジョギングする ように なりました。', 'maiasa jogingu suru you ni narimashita.', 'Tôi đã bắt đầu chạy bộ mỗi sáng.'],
    ],
  },
  {
    p: 'V る ように します',
    m: 'cố gắng (tạo thói quen) làm V',
    c: 'ability',
    ex: [
      ['やさいを たくさん たべる ように して います。', 'yasai o takusan taberu you ni shite imasu.', 'Tôi cố gắng ăn nhiều rau.'],
      ['じゅぎょうに おくれない ように します。', 'jugyou ni okurenai you ni shimasu.', 'Tôi sẽ cố không đến lớp muộn.'],
    ],
  },
  {
    p: 'A く／A に／N に します',
    m: 'làm cho … / quyết định chọn N',
    c: 'ability',
    ex: [
      ['へやを あたたかく しました。', 'heya o atatakaku shimashita.', 'Tôi làm cho căn phòng ấm lên.'],
      ['のみものは コーヒーに します。', 'nomimono wa koohii ni shimasu.', 'Đồ uống thì tôi chọn cà phê.'],
    ],
  },
  {
    p: 'V る ことに なりました',
    m: 'đã được quyết định là V (không phải do mình)',
    c: 'ability',
    ex: [
      ['らいげつ おおさかに てんきんする ことに なりました。', 'raigetsu oosaka ni tenkin suru koto ni narimashita.', 'Tháng sau tôi được điều chuyển về Osaka.'],
      ['しあいは ちゅうしする ことに なりました。', 'shiai wa chuushi suru koto ni narimashita.', 'Trận đấu đã được quyết định hủy.'],
    ],
  },
  {
    p: 'V る ことに しました',
    m: 'tôi đã quyết định V',
    c: 'ability',
    ex: [
      ['なつやすみに ベトナムへ かえる ことに しました。', 'natsuyasumi ni betonamu e kaeru koto ni shimashita.', 'Tôi quyết định về Việt Nam vào kỳ nghỉ hè.'],
      ['あしたから タバコを やめる ことに しました。', 'ashita kara tabako o yameru koto ni shimashita.', 'Tôi quyết định bỏ thuốc lá từ ngày mai.'],
    ],
  },
  {
    p: 'V る ことに して います',
    m: 'tôi có quy tắc / thói quen V',
    c: 'ability',
    ex: [
      ['ねる まえに にっきを かく ことに して います。', 'neru mae ni nikki o kaku koto ni shite imasu.', 'Tôi có thói quen viết nhật ký trước khi ngủ.'],
      ['しゅうまつは しごとの メールを みない ことに して います。', 'shuumatsu wa shigoto no meeru o minai koto ni shite imasu.', 'Cuối tuần tôi có nguyên tắc không xem email công việc.'],
    ],
  },
  // ── Ý định, dự định & lời khuyên ──
  {
    p: 'Thể ý chí（V よう）',
    m: 'nào cùng V (thân mật)',
    c: 'intent',
    e: 'Nhóm 1: う→おう (いく→いこう); nhóm 2: る→よう; する→しよう, くる→こよう.',
    ex: [
      ['すこし やすもう。', 'sukoshi yasumou.', 'Nghỉ một chút đi.'],
      ['いっしょに かえろう。', 'issho ni kaerou.', 'Cùng về nào.'],
    ],
  },
  {
    p: 'V よう と おもって います',
    m: 'tôi đang định V',
    c: 'intent',
    ex: [
      ['らいねん だいがくいんに はいろうと おもって います。', 'rainen daigakuin ni hairou to omotte imasu.', 'Tôi đang định năm sau vào cao học.'],
      ['こんばん はやく ねようと おもって います。', 'konban hayaku neyou to omotte imasu.', 'Tối nay tôi định ngủ sớm.'],
    ],
  },
  {
    p: 'V る つもりです',
    m: 'dự định V',
    c: 'intent',
    e: 'Phủ định: V ない つもりです.',
    ex: [
      ['なつやすみは アルバイトを する つもりです。', 'natsuyasumi wa arubaito o suru tsumori desu.', 'Kỳ nghỉ hè tôi dự định làm thêm.'],
      ['もう あの みせには いかない つもりです。', 'mou ano mise ni wa ikanai tsumori desu.', 'Tôi định không đến quán đó nữa.'],
    ],
  },
  {
    p: 'V る／N の よていです',
    m: 'theo kế hoạch sẽ V',
    c: 'intent',
    ex: [
      ['かいぎは 3じに おわる よていです。', 'kaigi wa sanji ni owaru yotei desu.', 'Cuộc họp dự kiến kết thúc lúc 3 giờ.'],
      ['らいしゅうから しゅっちょうの よていです。', 'raishuu kara shucchou no yotei desu.', 'Theo kế hoạch tôi đi công tác từ tuần sau.'],
    ],
  },
  {
    p: 'V た ばかりです',
    m: 'vừa mới V xong',
    c: 'intent',
    ex: [
      ['にほんに きた ばかりです。', 'nihon ni kita bakari desu.', 'Tôi vừa mới đến Nhật.'],
      ['さっき ひるごはんを たべた ばかりです。', 'sakki hirugohan o tabeta bakari desu.', 'Tôi vừa ăn trưa xong lúc nãy.'],
    ],
  },
  {
    p: 'V る ところです／V て いる ところです／V た ところです',
    m: 'sắp V / đang V / vừa V xong',
    c: 'intent',
    ex: [
      ['いまから でかける ところです。', 'ima kara dekakeru tokoro desu.', 'Tôi đang chuẩn bị ra ngoài.'],
      ['いま しりょうを よんで いる ところです。', 'ima shiryou o yonde iru tokoro desu.', 'Bây giờ tôi đang đọc tài liệu.'],
    ],
  },
  {
    p: 'V たら どうですか',
    m: 'làm V thử xem sao? (khuyên)',
    c: 'intent',
    ex: [
      ['つかれたら、すこし やすんだら どうですか。', 'tsukaretara, sukoshi yasundara dou desu ka.', 'Nếu mệt thì nghỉ một chút xem sao?'],
      ['せんせいに そうだんしたら どうですか。', 'sensei ni soudan shitara dou desu ka.', 'Thử hỏi ý kiến thầy xem sao?'],
    ],
  },
  // ── Điều kiện & giả định ──
  {
    p: '〜たら',
    m: 'nếu … thì / sau khi … thì',
    c: 'condition',
    ex: [
      ['あめが ふったら、しあいは ありません。', 'ame ga futtara, shiai wa arimasen.', 'Nếu trời mưa thì không có trận đấu.'],
      ['うちに ついたら、でんわして ください。', 'uchi ni tsuitara, denwa shite kudasai.', 'Về đến nhà thì gọi điện cho tôi nhé.'],
    ],
  },
  {
    p: '〜ば／〜なければ',
    m: 'nếu … thì (điều kiện giả định)',
    c: 'condition',
    e: 'V: う→えば (いく→いけば); A い→ければ; A な・N→なら.',
    ex: [
      ['この ボタンを おせば、きっぷが でます。', 'kono botan o oseba, kippu ga demasu.', 'Nếu bấm nút này thì vé sẽ ra.'],
      ['やすければ、かいたいです。', 'yasukereba, kaitai desu.', 'Nếu rẻ thì tôi muốn mua.'],
    ],
  },
  {
    p: '〜と、〜',
    m: 'hễ … thì (kết quả tất yếu)',
    c: 'condition',
    ex: [
      ['この かどを みぎに まがると、えきが あります。', 'kono kado o migi ni magaru to, eki ga arimasu.', 'Rẽ phải ở góc này thì sẽ thấy nhà ga.'],
      ['はるに なると、さくらが さきます。', 'haru ni naru to, sakura ga sakimasu.', 'Hễ đến mùa xuân là hoa anh đào nở.'],
    ],
  },
  {
    p: 'N なら',
    m: 'nếu là N thì …',
    c: 'condition',
    ex: [
      ['にほんりょうりなら、すしが いちばん すきです。', 'nihon ryouri nara, sushi ga ichiban suki desu.', 'Nếu là món Nhật thì tôi thích sushi nhất.'],
      ['パソコンを かうなら、あの みせが やすいですよ。', 'pasokon o kau nara, ano mise ga yasui desu yo.', 'Nếu mua máy tính thì cửa hàng kia rẻ đấy.'],
    ],
  },
  {
    p: '〜ても',
    m: 'dù … cũng',
    c: 'condition',
    ex: [
      ['あめが ふっても、しごとに いきます。', 'ame ga futte mo, shigoto ni ikimasu.', 'Dù trời mưa tôi vẫn đi làm.'],
      ['いくら かんがえても、わかりません。', 'ikura kangaete mo, wakarimasen.', 'Nghĩ bao nhiêu cũng không hiểu.'],
    ],
  },
  {
    p: 'V ば V る ほど',
    m: 'càng V càng …',
    c: 'condition',
    ex: [
      ['にほんごは べんきょうすれば するほど おもしろく なります。', 'nihongo wa benkyou sureba suru hodo omoshiroku narimasu.', 'Tiếng Nhật càng học càng thấy thú vị.'],
      ['やさいは あたらしければ あたらしいほど おいしいです。', 'yasai wa atarashikereba atarashii hodo oishii desu.', 'Rau càng tươi càng ngon.'],
    ],
  },
  {
    p: '〜か どうか',
    m: 'có … hay không',
    c: 'condition',
    ex: [
      ['かれが くるか どうか わかりません。', 'kare ga kuru ka dou ka wakarimasen.', 'Tôi không biết anh ấy có đến hay không.'],
      ['この くすりが きくか どうか ためして みます。', 'kono kusuri ga kiku ka dou ka tameshite mimasu.', 'Tôi sẽ thử xem thuốc này có hiệu quả không.'],
    ],
  },
  // ── Cho – nhận & làm giúp ──
  {
    p: 'あげます／くれます／もらいます',
    m: 'cho (người khác) / (ai đó) cho tôi / nhận',
    c: 'giving',
    ex: [
      ['ともだちが わたしに ほんを くれました。', 'tomodachi ga watashi ni hon o kuremashita.', 'Bạn tôi đã cho tôi cuốn sách.'],
      ['わたしは あねに とけいを もらいました。', 'watashi wa ane ni tokei o moraimashita.', 'Tôi nhận được đồng hồ từ chị gái.'],
    ],
  },
  {
    p: 'V て あげます',
    m: 'làm V cho (người khác)',
    c: 'giving',
    ex: [
      ['いもうとに えほんを よんで あげました。', 'imouto ni ehon o yonde agemashita.', 'Tôi đọc truyện tranh cho em gái.'],
      ['おばあさんの にもつを もって あげました。', 'obaasan no nimotsu o motte agemashita.', 'Tôi xách đồ giúp bà cụ.'],
    ],
  },
  {
    p: 'V て くれます',
    m: '(ai đó) làm V cho tôi',
    c: 'giving',
    ex: [
      ['どうりょうが しごとを てつだって くれました。', 'douryou ga shigoto o tetsudatte kuremashita.', 'Đồng nghiệp đã giúp tôi làm việc.'],
      ['ははが べんとうを つくって くれます。', 'haha ga bentou o tsukutte kuremasu.', 'Mẹ làm cơm hộp cho tôi.'],
    ],
  },
  {
    p: 'V て もらいます',
    m: 'được (ai đó) làm V cho',
    c: 'giving',
    ex: [
      ['せんせいに さくぶんを なおして もらいました。', 'sensei ni sakubun o naoshite moraimashita.', 'Tôi được thầy sửa bài văn cho.'],
      ['ともだちに えきまで おくって もらいました。', 'tomodachi ni eki made okutte moraimashita.', 'Tôi được bạn đưa ra ga.'],
    ],
  },
  {
    p: 'V て いただけませんか',
    m: 'anh/chị có thể làm V giúp tôi được không? (lịch sự)',
    c: 'giving',
    ex: [
      ['すみません、しゃしんを とって いただけませんか。', 'sumimasen, shashin o totte itadakemasen ka.', 'Xin lỗi, anh chụp giúp tôi tấm ảnh được không?'],
      ['もう すこし ゆっくり はなして いただけませんか。', 'mou sukoshi yukkuri hanashite itadakemasen ka.', 'Anh có thể nói chậm hơn một chút được không?'],
    ],
  },
  {
    p: 'V て くださいませんか',
    m: 'xin anh/chị làm V giúp được không?',
    c: 'giving',
    ex: [
      ['この ことばの いみを おしえて くださいませんか。', 'kono kotoba no imi o oshiete kudasaimasen ka.', 'Xin chỉ cho tôi nghĩa của từ này được không?'],
      ['あした もう いちど きて くださいませんか。', 'ashita mou ichido kite kudasaimasen ka.', 'Mai anh đến thêm một lần được không?'],
    ],
  },
  // ── Bị động, sai khiến ──
  {
    p: 'Thể bị động（V れる／V られる）',
    m: 'bị / được V',
    c: 'voice',
    e: 'Nhóm 1: う→あれる (よむ→よまれる); nhóm 2: る→られる; する→される, くる→こられる.',
    ex: [
      ['わたしは せんせいに ほめられました。', 'watashi wa sensei ni homeraremashita.', 'Tôi được thầy khen.'],
      ['おとうとに ケーキを たべられました。', 'otouto ni keeki o taberaremashita.', 'Tôi bị em trai ăn mất bánh.'],
    ],
  },
  {
    p: 'N は（người）に よって V られます',
    m: 'N được tạo ra / làm bởi …',
    c: 'voice',
    ex: [
      ['この おてらは 600ねんまえに たてられました。', 'kono otera wa roppyakunen mae ni tateraremashita.', 'Ngôi chùa này được xây 600 năm trước.'],
      ['「源氏物語」は むらさきしきぶに よって かかれました。', '"genji monogatari" wa murasaki shikibu ni yotte kakaremashita.', '"Truyện Genji" được viết bởi Murasaki Shikibu.'],
    ],
  },
  {
    p: 'Thể sai khiến（V せる／V させる）',
    m: 'bắt / cho phép (ai) làm V',
    c: 'voice',
    e: 'Nhóm 1: う→あせる (いく→いかせる); nhóm 2: る→させる; する→させる, くる→こさせる.',
    ex: [
      ['ははは おとうとに へやを そうじさせました。', 'haha wa otouto ni heya o souji sasemashita.', 'Mẹ bắt em trai dọn phòng.'],
      ['こどもを こうえんで あそばせました。', 'kodomo o kouen de asobasemashita.', 'Tôi cho con chơi ở công viên.'],
    ],
  },
  {
    p: 'V させて いただけませんか',
    m: 'xin cho phép tôi được V',
    c: 'voice',
    ex: [
      ['きょうは はやく かえらせて いただけませんか。', 'kyou wa hayaku kaerasete itadakemasen ka.', 'Hôm nay cho phép tôi về sớm được không?'],
      ['この しりょうを コピーさせて いただけませんか。', 'kono shiryou o kopii sasete itadakemasen ka.', 'Cho tôi photo tài liệu này được không?'],
    ],
  },
  {
    p: 'Kính ngữ お V に なります',
    m: '(người trên) làm V — tôn kính ngữ',
    c: 'voice',
    ex: [
      ['しゃちょうは もう おかえりに なりました。', 'shachou wa mou okaeri ni narimashita.', 'Giám đốc đã về rồi ạ.'],
      ['この ほんを およみに なりましたか。', 'kono hon o oyomi ni narimashita ka.', 'Ngài đã đọc cuốn sách này chưa ạ?'],
    ],
  },
  {
    p: 'Khiêm nhường ngữ お V します',
    m: 'tôi xin làm V (cho người trên)',
    c: 'voice',
    ex: [
      ['にもつを おもちします。', 'nimotsu o omochi shimasu.', 'Để tôi xách hành lý giúp ạ.'],
      ['あとで おでんわします。', 'ato de odenwa shimasu.', 'Lát nữa tôi sẽ gọi điện ạ.'],
    ],
  },
  {
    p: 'いらっしゃいます／めしあがります／ごらんに なります',
    m: 'kính ngữ đặc biệt: ở/đi/đến · ăn/uống · xem',
    c: 'voice',
    ex: [
      ['せんせいは けんきゅうしつに いらっしゃいます。', 'sensei wa kenkyuushitsu ni irasshaimasu.', 'Thầy đang ở phòng nghiên cứu ạ.'],
      ['どうぞ めしあがって ください。', 'douzo meshiagatte kudasai.', 'Xin mời dùng bữa ạ.'],
    ],
  },
  {
    p: 'まいります／いただきます／はいけんします',
    m: 'khiêm nhường ngữ đặc biệt: đi/đến · ăn/nhận · xem',
    c: 'voice',
    ex: [
      ['あした 10じに まいります。', 'ashita juuji ni mairimasu.', 'Ngày mai tôi sẽ đến lúc 10 giờ ạ.'],
      ['しりょうを はいけんしました。', 'shiryou o haiken shimashita.', 'Tôi đã xem tài liệu ạ.'],
    ],
  },
  // ── Suy đoán & truyền đạt ──
  {
    p: '〜でしょう／〜だろう',
    m: 'có lẽ … (dự đoán)',
    c: 'guess',
    ex: [
      ['あしたは あめが ふるでしょう。', 'ashita wa ame ga furu deshou.', 'Ngày mai có lẽ trời mưa.'],
      ['かれは たぶん しらないだろう。', 'kare wa tabun shiranai darou.', 'Chắc anh ấy không biết đâu.'],
    ],
  },
  {
    p: '〜かもしれません',
    m: 'có thể là … (khả năng thấp hơn でしょう)',
    c: 'guess',
    ex: [
      ['ごごから ゆきが ふるかもしれません。', 'gogo kara yuki ga furu kamoshiremasen.', 'Có thể chiều nay tuyết rơi.'],
      ['その はなしは うそかもしれません。', 'sono hanashi wa uso kamoshiremasen.', 'Câu chuyện đó có thể là nói dối.'],
    ],
  },
  {
    p: '〜はずです',
    m: 'chắc chắn là … (theo lý mà nói)',
    c: 'guess',
    ex: [
      ['かれは もう ついて いる はずです。', 'kare wa mou tsuite iru hazu desu.', 'Anh ấy chắc chắn đã đến nơi rồi.'],
      ['あの レストランは きょう やすみの はずです。', 'ano resutoran wa kyou yasumi no hazu desu.', 'Nhà hàng đó hôm nay chắc là nghỉ.'],
    ],
  },
  {
    p: 'V ます／A そうです（dáng vẻ）',
    m: 'trông có vẻ … / sắp …',
    c: 'guess',
    e: 'Dựa trên quan sát trực tiếp. いい→よさそう, ない→なさそう.',
    ex: [
      ['この ケーキは おいしそうですね。', 'kono keeki wa oishisou desu ne.', 'Cái bánh này trông ngon nhỉ.'],
      ['いまにも あめが ふりそうです。', 'imanimo ame ga furisou desu.', 'Trời sắp mưa đến nơi.'],
    ],
  },
  {
    p: 'Thể thông thường ＋ そうです（truyền đạt）',
    m: 'nghe nói là …',
    c: 'guess',
    ex: [
      ['てんきよほうに よると、あしたは さむく なるそうです。', 'tenki yohou ni yoru to, ashita wa samuku naru sou desu.', 'Theo dự báo thời tiết, nghe nói mai trời lạnh.'],
      ['たなかさんは らいげつ けっこんするそうです。', 'tanaka-san wa raigetsu kekkon suru sou desu.', 'Nghe nói tháng sau anh Tanaka cưới.'],
    ],
  },
  {
    p: '〜ようです／〜みたいです',
    m: 'hình như … (phán đoán)',
    c: 'guess',
    ex: [
      ['だれも いない ようです。', 'daremo inai you desu.', 'Hình như không có ai.'],
      ['かぜを ひいたみたいです。', 'kaze o hiita mitai desu.', 'Hình như tôi bị cảm rồi.'],
    ],
  },
  {
    p: '〜らしいです',
    m: 'nghe đâu … / có vẻ (thông tin gián tiếp)',
    c: 'guess',
    ex: [
      ['あの みせは らいしゅう しまるらしいです。', 'ano mise wa raishuu shimaru rashii desu.', 'Nghe đâu cửa hàng đó tuần sau đóng cửa.'],
      ['やまださんは ねこが すきらしいです。', 'yamada-san wa neko ga suki rashii desu.', 'Có vẻ anh Yamada thích mèo.'],
    ],
  },
  {
    p: 'N1 と いう N2',
    m: 'N2 có tên là N1',
    c: 'guess',
    ex: [
      ['「さくら」という レストランを しって いますか。', '"sakura" to iu resutoran o shitte imasu ka.', 'Bạn có biết nhà hàng tên "Sakura" không?'],
      ['これは おりがみと いう あそびです。', 'kore wa origami to iu asobi desu.', 'Đây là trò chơi gọi là origami.'],
    ],
  },
  {
    p: '〜と いって いました／〜と つたえて ください',
    m: '(ai đó) đã nói là … / nhắn giúp là …',
    c: 'guess',
    ex: [
      ['リンさんは すこし おくれると いって いました。', 'rin-san wa sukoshi okureru to itte imashita.', 'Chị Linh nói là sẽ đến muộn một chút.'],
      ['あしたの かいぎは 2じからだと つたえて ください。', 'ashita no kaigi wa niji kara da to tsutaete kudasai.', 'Nhắn giúp là cuộc họp mai bắt đầu từ 2 giờ.'],
    ],
  },
  // ── Trạng thái, mức độ & mục đích ──
  {
    p: 'V る ために／N の ために',
    m: 'để V / vì N (mục đích có chủ ý)',
    c: 'state',
    ex: [
      ['いえを かう ために ちょきんして います。', 'ie o kau tame ni chokin shite imasu.', 'Tôi đang tiết kiệm để mua nhà.'],
      ['けんこうの ために まいにち あるきます。', 'kenkou no tame ni mainichi arukimasu.', 'Vì sức khỏe, hằng ngày tôi đi bộ.'],
    ],
  },
  {
    p: 'V る／V ない ように',
    m: 'để (có thể) V / để không V',
    c: 'state',
    e: 'Đi với động từ không chủ ý, thể khả năng hoặc phủ định.',
    ex: [
      ['うしろの ひとにも きこえる ように おおきい こえで はなします。', 'ushiro no hito ni mo kikoeru you ni ookii koe de hanashimasu.', 'Tôi nói to để người phía sau cũng nghe thấy.'],
      ['かぜを ひかない ように あたたかく して ください。', 'kaze o hikanai you ni atatakaku shite kudasai.', 'Hãy giữ ấm để không bị cảm.'],
    ],
  },
  {
    p: 'V ます すぎます／A すぎます',
    m: 'quá …',
    c: 'state',
    ex: [
      ['ゆうべ のみすぎました。', 'yuube nomisugimashita.', 'Tối qua tôi uống quá nhiều.'],
      ['この もんだいは むずかしすぎます。', 'kono mondai wa muzukashisugimasu.', 'Câu hỏi này khó quá.'],
    ],
  },
  {
    p: 'V ます やすいです／にくいです',
    m: 'dễ V / khó V',
    c: 'state',
    ex: [
      ['この ペンは かきやすいです。', 'kono pen wa kakiyasui desu.', 'Cây bút này dễ viết.'],
      ['この くすりは のみにくいです。', 'kono kusuri wa nominikui desu.', 'Thuốc này khó uống.'],
    ],
  },
  {
    p: 'N1 は N2 が A です',
    m: 'N1 thì N2 (bộ phận) A',
    c: 'state',
    ex: [
      ['ぞうは はなが ながいです。', 'zou wa hana ga nagai desu.', 'Con voi có cái vòi dài.'],
      ['この まちは こうつうが べんりです。', 'kono machi wa koutsuu ga benri desu.', 'Thị trấn này giao thông thuận tiện.'],
    ],
  },
  {
    p: 'N ばかり／V て ばかり います',
    m: 'toàn là N / chỉ toàn V',
    c: 'state',
    ex: [
      ['おとうとは ゲームばかり して います。', 'otouto wa geemu bakari shite imasu.', 'Em trai tôi chỉ toàn chơi game.'],
      ['かれは あそんで ばかり いて、ぜんぜん べんきょうしません。', 'kare wa asonde bakari ite, zenzen benkyou shimasen.', 'Anh ta chỉ toàn chơi, chẳng học gì cả.'],
    ],
  },
  {
    p: 'N しか 〜ない',
    m: 'chỉ có N (nhấn mạnh ít)',
    c: 'state',
    ex: [
      ['さいふに 500えんしか ありません。', 'saifu ni gohyakuen shika arimasen.', 'Trong ví chỉ có 500 yên.'],
      ['にほんごは すこししか はなせません。', 'nihongo wa sukoshi shika hanasemasen.', 'Tôi chỉ nói được chút ít tiếng Nhật.'],
    ],
  },
  {
    p: 'Số lượng ＋ も',
    m: 'những … (nhấn mạnh nhiều)',
    c: 'state',
    ex: [
      ['きのうは 10じかんも ねました。', 'kinou wa juujikan mo nemashita.', 'Hôm qua tôi ngủ tới 10 tiếng.'],
      ['この かばんは 5まんえんも しました。', 'kono kaban wa goman en mo shimashita.', 'Cái túi này đắt tới 50.000 yên.'],
    ],
  },
  {
    p: 'V ても いい です／V なくても かまいません',
    m: 'V cũng được / không V cũng không sao',
    c: 'state',
    ex: [
      ['ペンで かいても いいです。', 'pen de kaite mo ii desu.', 'Viết bằng bút mực cũng được.'],
      ['いそがしければ、こなくても かまいません。', 'isogashikereba, konakute mo kamaimasen.', 'Nếu bận thì không đến cũng không sao.'],
    ],
  },
  {
    p: '〜し、〜し',
    m: 'vừa … lại vừa … (liệt kê lý do)',
    c: 'state',
    ex: [
      ['この アパートは えきに ちかいし、やすいし、いいですね。', 'kono apaato wa eki ni chikai shi, yasui shi, ii desu ne.', 'Căn hộ này vừa gần ga lại rẻ, tốt nhỉ.'],
      ['きょうは ねつも あるし、あたまも いたいし、やすみます。', 'kyou wa netsu mo aru shi, atama mo itai shi, yasumimasu.', 'Hôm nay vừa sốt vừa đau đầu nên tôi nghỉ.'],
    ],
  },
  {
    p: '〜ので',
    m: 'vì … nên (khách quan, lịch sự)',
    c: 'state',
    ex: [
      ['でんしゃが おくれたので、ちこくしました。', 'densha ga okureta node, chikoku shimashita.', 'Vì tàu trễ nên tôi đến muộn.'],
      ['あしたは しけんなので、こんばんは べんきょうします。', 'ashita wa shiken na node, konban wa benkyou shimasu.', 'Vì mai thi nên tối nay tôi học.'],
    ],
  },
  {
    p: '〜のに',
    m: 'vậy mà … / mặc dù … (bất mãn)',
    c: 'state',
    ex: [
      ['いっしょうけんめい べんきょうしたのに、ごうかくできませんでした。', 'isshoukenmei benkyou shita noni, goukaku dekimasen deshita.', 'Học chăm chỉ vậy mà vẫn không đỗ.'],
      ['やくそくしたのに、かれは こなかった。', 'yakusoku shita noni, kare wa konakatta.', 'Đã hứa rồi vậy mà anh ta không đến.'],
    ],
  },
  {
    p: 'V た とき／V る とき',
    m: 'khi … (quan hệ thời gian trước/sau)',
    c: 'state',
    e: 'V る とき: lúc hành động chưa xong; V た とき: sau khi đã xong.',
    ex: [
      ['にほんへ いく とき、かばんを かいました。', 'nihon e iku toki, kaban o kaimashita.', 'Khi (trước lúc) đi Nhật, tôi đã mua cặp.'],
      ['にほんへ いった とき、かばんを かいました。', 'nihon e itta toki, kaban o kaimashita.', 'Khi (đã) sang Nhật, tôi đã mua cặp.'],
    ],
  },
  {
    p: 'V ながら（hai hành động song song）',
    m: 'vừa … vừa … (hai việc cùng lúc lâu dài)',
    c: 'state',
    ex: [
      ['アルバイトを しながら だいがくに かよって います。', 'arubaito o shinagara daigaku ni kayotte imasu.', 'Tôi vừa làm thêm vừa đi học đại học.'],
      ['はたらきながら こどもを そだてて います。', 'hatarakinagara kodomo o sodatete imasu.', 'Tôi vừa làm việc vừa nuôi con.'],
    ],
  },
  {
    p: 'V ば いいです',
    m: 'chỉ cần V là được',
    c: 'state',
    ex: [
      ['どう すれば いいですか。', 'dou sureba ii desu ka.', 'Tôi nên làm thế nào thì được?'],
      ['ここに なまえを かけば いいです。', 'koko ni namae o kakeba ii desu.', 'Chỉ cần viết tên vào đây là được.'],
    ],
  },
];
