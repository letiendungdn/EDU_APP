import type { TbGrammar } from '../types';

export const N3_CATEGORIES: Record<string, string> = {
  cause: 'Mục đích, nguyên nhân & kết quả',
  time: 'Thời điểm & trình tự',
  condition: 'Điều kiện, giả định & nhượng bộ',
  degree: 'Mức độ, so sánh & giới hạn',
  view: 'Quan điểm, đánh giá & phán đoán',
  trend: 'Thay đổi, xu hướng & khuynh hướng',
  quote: 'Truyền đạt, trích dẫn & ví von',
  add: 'Bổ sung, thay thế & liệt kê',
};

export const N3_GRAMMAR: TbGrammar[] = [
  // ── Mục đích, nguyên nhân & kết quả ──
  {
    p: '〜せいで／〜せいだ',
    m: 'tại vì … (nguyên nhân xấu)',
    c: 'cause',
    ex: [
      ['ねぼうした せいで、でんしゃに のりおくれた。', 'nebou shita sei de, densha ni noriokureta.', 'Tại ngủ quên nên tôi lỡ tàu.'],
      ['あめの せいで、しあいが ちゅうしに なった。', 'ame no sei de, shiai ga chuushi ni natta.', 'Tại mưa nên trận đấu bị hủy.'],
    ],
  },
  {
    p: '〜おかげで／〜おかげだ',
    m: 'nhờ có … (nguyên nhân tốt)',
    c: 'cause',
    ex: [
      ['せんせいの おかげで、ごうかくできました。', 'sensei no okage de, goukaku dekimashita.', 'Nhờ thầy mà tôi đã đỗ.'],
      ['くすりを のんだ おかげで、ねつが さがった。', 'kusuri o nonda okage de, netsu ga sagatta.', 'Nhờ uống thuốc mà hạ sốt.'],
    ],
  },
  {
    p: '〜によって（nguyên nhân）',
    m: 'do …, vì … (văn viết)',
    c: 'cause',
    ex: [
      ['じしんに よって、おおくの いえが たおれた。', 'jishin ni yotte, ooku no ie ga taoreta.', 'Do động đất, nhiều ngôi nhà bị đổ.'],
      ['ふちゅういに よる じこが ふえて いる。', 'fuchuui ni yoru jiko ga fuete iru.', 'Tai nạn do bất cẩn đang tăng lên.'],
    ],
  },
  {
    p: '〜ため（に）（nguyên nhân）',
    m: 'vì … (trang trọng)',
    c: 'cause',
    ex: [
      ['おおゆきの ため、でんしゃが とまって います。', 'ooyuki no tame, densha ga tomatte imasu.', 'Vì tuyết lớn nên tàu đang ngừng chạy.'],
      ['こうじちゅうの ため、この みちは とおれません。', 'koujichuu no tame, kono michi wa tooremasen.', 'Vì đang thi công nên không đi qua đường này được.'],
    ],
  },
  {
    p: '〜から こそ',
    m: 'chính vì … mới',
    c: 'cause',
    ex: [
      ['あなたの ことを しんぱいして いる から こそ、ちゅういするのです。', 'anata no koto o shinpai shite iru kara koso, chuui suru no desu.', 'Chính vì lo cho bạn nên tôi mới nhắc nhở.'],
      ['むずかしい から こそ、やる かちが ある。', 'muzukashii kara koso, yaru kachi ga aru.', 'Chính vì khó nên mới đáng làm.'],
    ],
  },
  {
    p: '〜ように（mục đích）',
    m: 'để (không chủ ý / khả năng)',
    c: 'cause',
    e: 'So sánh với ために: ように đi với động từ không chủ ý, thể khả năng, phủ định.',
    ex: [
      ['わすれない ように、メモして おきます。', 'wasurenai you ni, memo shite okimasu.', 'Tôi ghi chú lại để khỏi quên.'],
      ['だれでも わかる ように、やさしく せつめいした。', 'daredemo wakaru you ni, yasashiku setsumei shita.', 'Tôi giải thích dễ hiểu để ai cũng hiểu được.'],
    ],
  },
  {
    p: '〜ことから',
    m: 'từ việc … (căn cứ / nguồn gốc)',
    c: 'cause',
    ex: [
      ['かたちが にて いる ことから、この なまえが ついた。', 'katachi ga nite iru koto kara, kono namae ga tsuita.', 'Vì hình dạng giống nên mới có tên này.'],
      ['へやの でんきが ついて いる ことから、かれは いえに いると わかった。', 'heya no denki ga tsuite iru koto kara, kare wa ie ni iru to wakatta.', 'Từ việc đèn phòng đang bật, tôi biết anh ấy ở nhà.'],
    ],
  },
  {
    p: '〜わけだ',
    m: 'thảo nào / thì ra là (kết luận hợp lý)',
    c: 'cause',
    ex: [
      ['10ねんも にほんに すんで いたのか。にほんごが じょうずな わけだ。', 'juunen mo nihon ni sunde ita no ka. nihongo ga jouzu na wake da.', 'Sống ở Nhật tận 10 năm à. Thảo nào tiếng Nhật giỏi.'],
      ['エアコンが こわれて いる。あつい わけだ。', 'eakon ga kowarete iru. atsui wake da.', 'Điều hòa hỏng rồi. Thảo nào nóng.'],
    ],
  },
  {
    p: '〜ところだった',
    m: 'suýt nữa thì …',
    c: 'cause',
    ex: [
      ['もう すこしで くるまに ひかれる ところだった。', 'mou sukoshi de kuruma ni hikareru tokoro datta.', 'Suýt nữa thì bị xe tông.'],
      ['めざましが なかったら、ちこくする ところだった。', 'mezamashi ga nakattara, chikoku suru tokoro datta.', 'Nếu không có đồng hồ báo thức thì suýt muộn rồi.'],
    ],
  },
  {
    p: '〜ことに なる',
    m: 'rốt cuộc sẽ … (kết quả tất yếu)',
    c: 'cause',
    ex: [
      ['いま べんきょうしないと、あとで こまる ことに なる。', 'ima benkyou shinai to, ato de komaru koto ni naru.', 'Bây giờ không học thì sau này sẽ khổ.'],
      ['しゅうに 3かい かよえば、ひとつきで 12かい いく ことに なる。', 'shuu ni sankai kayoeba, hitotsuki de juunikai iku koto ni naru.', 'Tuần đi 3 lần thì một tháng sẽ đi 12 lần.'],
    ],
  },
  {
    p: '〜ばかりに',
    m: 'chỉ vì … mà (hậu quả xấu)',
    c: 'cause',
    ex: [
      ['パスワードを わすれた ばかりに、ひどい めに あった。', 'pasuwaado o wasureta bakari ni, hidoi me ni atta.', 'Chỉ vì quên mật khẩu mà gặp rắc rối to.'],
      ['よけいな ことを いった ばかりに、けんかに なった。', 'yokei na koto o itta bakari ni, kenka ni natta.', 'Chỉ vì nói điều thừa thãi mà thành cãi nhau.'],
    ],
  },
  {
    p: '〜のだから',
    m: 'vì (rõ ràng) là … nên',
    c: 'cause',
    ex: [
      ['もう おとななのだから、じぶんで きめなさい。', 'mou otona na no da kara, jibun de kimenasai.', 'Đã là người lớn rồi thì tự quyết định đi.'],
      ['やくそくしたのだから、まもらなければ ならない。', 'yakusoku shita no da kara, mamoranakereba naranai.', 'Đã hứa rồi thì phải giữ lời.'],
    ],
  },
  // ── Thời điểm & trình tự ──
  {
    p: '〜うちに',
    m: 'trong lúc còn … / trong khi …',
    c: 'time',
    ex: [
      ['わかい うちに、いろいろな くにへ いきたい。', 'wakai uchi ni, iroiro na kuni e ikitai.', 'Tôi muốn đi nhiều nước khi còn trẻ.'],
      ['あつい うちに、どうぞ めしあがって ください。', 'atsui uchi ni, douzo meshiagatte kudasai.', 'Xin mời ăn khi còn nóng.'],
    ],
  },
  {
    p: '〜ないうちに',
    m: 'trước khi (chưa) … xảy ra',
    c: 'time',
    ex: [
      ['あめが ふらない うちに、かえりましょう。', 'ame ga furanai uchi ni, kaerimashou.', 'Về thôi trước khi trời mưa.'],
      ['わすれない うちに、メモして おこう。', 'wasurenai uchi ni, memo shite okou.', 'Ghi lại trước khi quên thôi.'],
    ],
  },
  {
    p: '〜さいちゅうに',
    m: 'đúng lúc đang …',
    c: 'time',
    ex: [
      ['かいぎの さいちゅうに、でんわが なった。', 'kaigi no saichuu ni, denwa ga natta.', 'Đúng lúc đang họp thì điện thoại reo.'],
      ['しょくじを して いる さいちゅうに、じしんが あった。', 'shokuji o shite iru saichuu ni, jishin ga atta.', 'Đúng lúc đang ăn thì có động đất.'],
    ],
  },
  {
    p: '〜たとたん（に）',
    m: 'vừa … thì ngay lập tức',
    c: 'time',
    ex: [
      ['いえを でた とたん、あめが ふりだした。', 'ie o deta totan, ame ga furidashita.', 'Vừa ra khỏi nhà thì trời đổ mưa.'],
      ['ベッドに はいった とたんに、ねて しまった。', 'beddo ni haitta totan ni, nete shimatta.', 'Vừa lên giường là ngủ luôn.'],
    ],
  },
  {
    p: '〜て いらい',
    m: 'kể từ khi …',
    c: 'time',
    ex: [
      ['にほんに きて いらい、いちども かえって いない。', 'nihon ni kite irai, ichido mo kaette inai.', 'Kể từ khi sang Nhật, tôi chưa về lần nào.'],
      ['そつぎょうして いらい、かれに あって いない。', 'sotsugyou shite irai, kare ni atte inai.', 'Từ khi tốt nghiệp tôi chưa gặp anh ấy.'],
    ],
  },
  {
    p: '〜て はじめて',
    m: 'phải đến khi … mới',
    c: 'time',
    ex: [
      ['びょうきに なって はじめて、けんこうの たいせつさが わかった。', 'byouki ni natte hajimete, kenkou no taisetsusa ga wakatta.', 'Phải đến khi ốm mới hiểu sức khỏe quý giá.'],
      ['ひとりで くらして はじめて、おやの ありがたさを かんじた。', 'hitori de kurashite hajimete, oya no arigatasa o kanjita.', 'Phải sống một mình mới thấy biết ơn cha mẹ.'],
    ],
  },
  {
    p: '〜ところに／〜ところへ',
    m: 'đúng lúc … thì (có việc khác xen vào)',
    c: 'time',
    ex: [
      ['でかけようと した ところに、ともだちが きた。', 'dekakeyou to shita tokoro ni, tomodachi ga kita.', 'Đúng lúc định ra ngoài thì bạn đến.'],
      ['こまって いる ところへ、せんぱいが たすけて くれた。', 'komatte iru tokoro e, senpai ga tasukete kureta.', 'Đúng lúc đang khó thì đàn anh giúp.'],
    ],
  },
  {
    p: '〜たび（に）',
    m: 'mỗi lần …',
    c: 'time',
    ex: [
      ['この うたを きく たびに、こきょうを おもいだす。', 'kono uta o kiku tabi ni, kokyou o omoidasu.', 'Mỗi lần nghe bài hát này, tôi lại nhớ quê.'],
      ['りょこうの たびに、おみやげを かって くる。', 'ryokou no tabi ni, omiyage o katte kuru.', 'Mỗi lần đi du lịch, tôi đều mua quà về.'],
    ],
  },
  {
    p: '〜ついでに',
    m: 'nhân tiện … thì',
    c: 'time',
    ex: [
      ['かいものの ついでに、ゆうびんきょくに よった。', 'kaimono no tsuide ni, yuubinkyoku ni yotta.', 'Nhân tiện đi mua sắm, tôi ghé bưu điện.'],
      ['さんぽに いく ついでに、ごみを だして きて。', 'sanpo ni iku tsuide ni, gomi o dashite kite.', 'Tiện đi dạo thì đổ rác giúp nhé.'],
    ],
  },
  {
    p: '〜てから でないと／〜てからでなければ',
    m: 'nếu chưa … thì không thể',
    c: 'time',
    ex: [
      ['しゅくだいを おえて からでないと、あそびに いっては だめ。', 'shukudai o oete kara de nai to, asobi ni itte wa dame.', 'Chưa làm xong bài tập thì không được đi chơi.'],
      ['じっさいに みて からでなければ、きめられない。', 'jissai ni mite kara de nakereba, kimerarenai.', 'Chưa xem tận mắt thì không quyết định được.'],
    ],
  },
  {
    p: '〜きり',
    m: 'từ khi … rồi thôi (không tiếp diễn)',
    c: 'time',
    ex: [
      ['かれとは きょねん あった きり、れんらくが ない。', 'kare to wa kyonen atta kiri, renraku ga nai.', 'Gặp anh ấy năm ngoái rồi thôi, không liên lạc nữa.'],
      ['むすこは あさ でかけた きり、まだ かえって こない。', 'musuko wa asa dekaketa kiri, mada kaette konai.', 'Con trai đi từ sáng đến giờ vẫn chưa về.'],
    ],
  },
  // ── Điều kiện, giả định & nhượng bộ ──
  {
    p: '〜としたら／〜とすれば',
    m: 'giả sử … thì',
    c: 'condition',
    ex: [
      ['もし 1おくえん あたった としたら、なにに つかいますか。', 'moshi ichiokuen atatta to shitara, nani ni tsukaimasu ka.', 'Giả sử trúng 100 triệu yên thì bạn tiêu vào gì?'],
      ['この はなしが ほんとうだ とすれば、たいへんな ことだ。', 'kono hanashi ga hontou da to sureba, taihen na koto da.', 'Nếu chuyện này là thật thì nghiêm trọng đấy.'],
    ],
  },
  {
    p: '〜さえ〜ば',
    m: 'chỉ cần … là',
    c: 'condition',
    ex: [
      ['じかん さえ あれば、もっと べんきょうできるのに。', 'jikan sae areba, motto benkyou dekiru noni.', 'Chỉ cần có thời gian là học được nhiều hơn.'],
      ['この くすりを のみ さえ すれば、なおりますよ。', 'kono kusuri o nomi sae sureba, naorimasu yo.', 'Chỉ cần uống thuốc này là khỏi.'],
    ],
  },
  {
    p: '〜ないかぎり',
    m: 'chừng nào chưa … thì',
    c: 'condition',
    ex: [
      ['れんしゅうしない かぎり、じょうずに ならない。', 'renshuu shinai kagiri, jouzu ni naranai.', 'Chừng nào chưa luyện tập thì không giỏi được.'],
      ['あめが ふらない かぎり、しあいは おこなわれます。', 'ame ga furanai kagiri, shiai wa okonawaremasu.', 'Trừ khi trời mưa, trận đấu vẫn diễn ra.'],
    ],
  },
  {
    p: 'たとえ〜ても',
    m: 'cho dù … đi nữa',
    c: 'condition',
    ex: [
      ['たとえ はんたいされても、わたしは やります。', 'tatoe hantai saretemo, watashi wa yarimasu.', 'Cho dù bị phản đối, tôi vẫn làm.'],
      ['たとえ たかくても、ほしい ものは かう。', 'tatoe takakutemo, hoshii mono wa kau.', 'Dù có đắt tôi vẫn mua thứ mình muốn.'],
    ],
  },
  {
    p: '〜としても',
    m: 'dù cho … thì cũng',
    c: 'condition',
    ex: [
      ['いまから いった としても、まにあわないだろう。', 'ima kara itta to shitemo, maniawanai darou.', 'Dù bây giờ đi thì chắc cũng không kịp.'],
      ['しっぱいした としても、こうかいしない。', 'shippai shita to shitemo, koukai shinai.', 'Dù có thất bại, tôi cũng không hối hận.'],
    ],
  },
  {
    p: '〜くせに',
    m: 'mặc dù … vậy mà (chê trách)',
    c: 'condition',
    ex: [
      ['しらない くせに、しって いる ふりを する。', 'shiranai kuse ni, shitte iru furi o suru.', 'Không biết vậy mà cứ làm như biết.'],
      ['じぶんは やらない くせに、ひとには もんくを いう。', 'jibun wa yaranai kuse ni, hito ni wa monku o iu.', 'Bản thân không làm vậy mà lại chê người khác.'],
    ],
  },
  {
    p: '〜ても かまわない',
    m: '… cũng không sao',
    c: 'condition',
    ex: [
      ['いそがしければ、あした でも かまいません。', 'isogashikereba, ashita demo kamaimasen.', 'Nếu bận thì mai cũng không sao.'],
      ['ここに すわっても かまいませんか。', 'koko ni suwattemo kamaimasen ka.', 'Tôi ngồi đây có sao không?'],
    ],
  },
  {
    p: '〜ば よかった',
    m: 'giá mà … thì tốt (hối tiếc)',
    c: 'condition',
    ex: [
      ['もっと はやく いえを でれば よかった。', 'motto hayaku ie o dereba yokatta.', 'Giá mà ra khỏi nhà sớm hơn.'],
      ['あんな こと、いわなければ よかった。', 'anna koto, iwanakereba yokatta.', 'Giá mà đừng nói điều như thế.'],
    ],
  },
  {
    p: '〜ものなら',
    m: 'nếu mà có thể … thì',
    c: 'condition',
    ex: [
      ['できる ものなら、むかしに もどりたい。', 'dekiru mono nara, mukashi ni modoritai.', 'Nếu có thể, tôi muốn quay về ngày xưa.'],
      ['いける ものなら、いますぐ いきたい。', 'ikeru mono nara, ima sugu ikitai.', 'Nếu đi được thì tôi muốn đi ngay.'],
    ],
  },
  {
    p: '〜ないことには',
    m: 'nếu không … thì (không thể)',
    c: 'condition',
    ex: [
      ['じっさいに やって みない ことには、わからない。', 'jissai ni yatte minai koto ni wa, wakaranai.', 'Không làm thử thì không biết được.'],
      ['おかねが ない ことには、なにも はじめられない。', 'okane ga nai koto ni wa, nani mo hajimerarenai.', 'Không có tiền thì chẳng bắt đầu được gì.'],
    ],
  },
  {
    p: '〜ても〜なくても',
    m: 'dù có … hay không …',
    c: 'condition',
    ex: [
      ['あめが ふっても ふらなくても、いきます。', 'ame ga futtemo furanakutemo, ikimasu.', 'Dù mưa hay không, tôi vẫn đi.'],
      ['すきでも すきじゃなくても、たべなさい。', 'suki demo suki ja nakutemo, tabenasai.', 'Thích hay không thì cũng ăn đi.'],
    ],
  },
  // ── Mức độ, so sánh & giới hạn ──
  {
    p: '〜ほど／〜くらい（mức độ）',
    m: 'đến mức …',
    c: 'degree',
    ex: [
      ['なきたい ほど つかれた。', 'nakitai hodo tsukareta.', 'Mệt đến mức muốn khóc.'],
      ['しんじられない くらい きれいな けしきだった。', 'shinjirarenai kurai kirei na keshiki datta.', 'Phong cảnh đẹp đến mức không thể tin nổi.'],
    ],
  },
  {
    p: 'N ほど〜ない',
    m: 'không … bằng N',
    c: 'degree',
    ex: [
      ['ことしは きょねん ほど あつくない。', 'kotoshi wa kyonen hodo atsukunai.', 'Năm nay không nóng bằng năm ngoái.'],
      ['かれ ほど まじめな ひとは いない。', 'kare hodo majime na hito wa inai.', 'Không ai nghiêm túc bằng anh ấy.'],
    ],
  },
  {
    p: '〜に くらべて',
    m: 'so với …',
    c: 'degree',
    ex: [
      ['とかいに くらべて、いなかは くらしやすい。', 'tokai ni kurabete, inaka wa kurashiyasui.', 'So với thành phố, nông thôn dễ sống hơn.'],
      ['きょねんに くらべて、きゃくが ふえた。', 'kyonen ni kurabete, kyaku ga fueta.', 'So với năm ngoái, khách đã tăng lên.'],
    ],
  },
  {
    p: '〜だけ（giới hạn / mức tối đa）',
    m: 'chỉ … / hết mức có thể',
    c: 'degree',
    ex: [
      ['できる だけ はやく へんじを ください。', 'dekiru dake hayaku henji o kudasai.', 'Hãy trả lời sớm nhất có thể.'],
      ['すきな だけ たべて いいですよ。', 'suki na dake tabete ii desu yo.', 'Ăn bao nhiêu tùy thích nhé.'],
    ],
  },
  {
    p: '〜しか〜ない（nhấn mạnh）／〜ほかない',
    m: 'chỉ còn cách …',
    c: 'degree',
    ex: [
      ['バスが ないから、あるいて いく ほかない。', 'basu ga nai kara, aruite iku hoka nai.', 'Không có xe buýt nên chỉ còn cách đi bộ.'],
      ['やくそくした いじょう、やる しか ない。', 'yakusoku shita ijou, yaru shika nai.', 'Đã hứa rồi thì chỉ còn cách làm thôi.'],
    ],
  },
  {
    p: '〜に かぎって',
    m: 'riêng … thì (lại)',
    c: 'degree',
    ex: [
      ['いそいで いる ときに かぎって、でんしゃが おくれる。', 'isoide iru toki ni kagitte, densha ga okureru.', 'Cứ lúc vội là tàu lại trễ.'],
      ['うちの こに かぎって、そんな ことは しない。', 'uchi no ko ni kagitte, sonna koto wa shinai.', 'Riêng con nhà tôi thì không làm chuyện đó đâu.'],
    ],
  },
  {
    p: '〜ばかりか／〜ばかりでなく',
    m: 'không chỉ … mà còn',
    c: 'degree',
    ex: [
      ['かれは えいご ばかりか、フランスごも はなせる。', 'kare wa eigo bakari ka, furansugo mo hanaseru.', 'Anh ấy không chỉ nói tiếng Anh mà cả tiếng Pháp.'],
      ['この みせは やすい ばかりでなく、おいしい。', 'kono mise wa yasui bakari de naku, oishii.', 'Quán này không những rẻ mà còn ngon.'],
    ],
  },
  {
    p: '〜ほど〜はない',
    m: 'không có gì … bằng',
    c: 'degree',
    ex: [
      ['なつやすみ ほど たのしい ものは ない。', 'natsuyasumi hodo tanoshii mono wa nai.', 'Không có gì vui bằng kỳ nghỉ hè.'],
      ['けんこう ほど たいせつな ものは ない。', 'kenkou hodo taisetsu na mono wa nai.', 'Không có gì quý bằng sức khỏe.'],
    ],
  },
  {
    p: '〜ほど（tỷ lệ）',
    m: 'càng … càng (rút gọn của ば〜ほど)',
    c: 'degree',
    ex: [
      ['としを とる ほど、じかんが はやく かんじる。', 'toshi o toru hodo, jikan ga hayaku kanjiru.', 'Càng có tuổi càng thấy thời gian trôi nhanh.'],
      ['かんがえる ほど わからなく なる。', 'kangaeru hodo wakaranaku naru.', 'Càng nghĩ càng không hiểu.'],
    ],
  },
  // ── Quan điểm, đánh giá & phán đoán ──
  {
    p: '〜に とって',
    m: 'đối với … (lập trường)',
    c: 'view',
    ex: [
      ['わたしに とって、かぞくが いちばん たいせつだ。', 'watashi ni totte, kazoku ga ichiban taisetsu da.', 'Đối với tôi, gia đình là quan trọng nhất.'],
      ['がくせいに とって、この ほんは たかすぎる。', 'gakusei ni totte, kono hon wa takasugiru.', 'Đối với sinh viên, cuốn sách này quá đắt.'],
    ],
  },
  {
    p: '〜に ついて',
    m: 'về … (chủ đề)',
    c: 'view',
    ex: [
      ['にほんの れきしに ついて しらべて います。', 'nihon no rekishi ni tsuite shirabete imasu.', 'Tôi đang tìm hiểu về lịch sử Nhật Bản.'],
      ['その けんに ついては、あとで はなしましょう。', 'sono ken ni tsuite wa, ato de hanashimashou.', 'Về việc đó, lát nữa ta bàn nhé.'],
    ],
  },
  {
    p: '〜に たいして',
    m: 'đối với, hướng tới … / trái lại',
    c: 'view',
    ex: [
      ['せんせいの しつもんに たいして、だれも こたえなかった。', 'sensei no shitsumon ni taishite, daremo kotaenakatta.', 'Không ai trả lời câu hỏi của thầy.'],
      ['あには かっぱつなのに たいして、おとうとは おとなしい。', 'ani wa kappatsu na no ni taishite, otouto wa otonashii.', 'Trái với anh trai năng động, em trai hiền lành.'],
    ],
  },
  {
    p: '〜として',
    m: 'với tư cách là …',
    c: 'view',
    ex: [
      ['かれは りゅうがくせいとして にほんに きた。', 'kare wa ryuugakusei to shite nihon ni kita.', 'Anh ấy đến Nhật với tư cách du học sinh.'],
      ['しゅみとして ギターを ひいて います。', 'shumi to shite gitaa o hiite imasu.', 'Tôi chơi guitar như một sở thích.'],
    ],
  },
  {
    p: '〜に ちがいない',
    m: 'chắc chắn là …',
    c: 'view',
    ex: [
      ['あの ひとは はんにんに ちがいない。', 'ano hito wa hannin ni chigainai.', 'Người đó chắc chắn là thủ phạm.'],
      ['かれの ことだから、また おくれるに ちがいない。', 'kare no koto da kara, mata okureru ni chigainai.', 'Anh ta mà, chắc chắn lại đến muộn.'],
    ],
  },
  {
    p: '〜はずが ない',
    m: 'không thể nào …',
    c: 'view',
    ex: [
      ['かれが そんな ことを いう はずが ない。', 'kare ga sonna koto o iu hazu ga nai.', 'Anh ấy không thể nào nói điều đó.'],
      ['こんな かんたんな もんだいが できない はずが ない。', 'konna kantan na mondai ga dekinai hazu ga nai.', 'Không thể nào không làm được bài dễ thế này.'],
    ],
  },
  {
    p: '〜わけが ない',
    m: 'làm gì có chuyện …',
    c: 'view',
    ex: [
      ['1しゅうかんで ペラペラに なる わけが ない。', 'isshuukan de perapera ni naru wake ga nai.', 'Làm gì có chuyện một tuần mà nói trôi chảy.'],
      ['あんなに れんしゅうしたのだから、まける わけが ない。', 'anna ni renshuu shita no da kara, makeru wake ga nai.', 'Luyện tập nhiều thế rồi, làm gì có chuyện thua.'],
    ],
  },
  {
    p: '〜わけでは ない',
    m: 'không hẳn là …',
    c: 'view',
    ex: [
      ['にくが きらいな わけでは ないが、あまり たべない。', 'niku ga kirai na wake de wa nai ga, amari tabenai.', 'Không hẳn ghét thịt, nhưng tôi ít ăn.'],
      ['いつも ひまな わけでは ない。', 'itsumo hima na wake de wa nai.', 'Không phải lúc nào cũng rảnh.'],
    ],
  },
  {
    p: '〜わけには いかない',
    m: 'không thể (vì lý do đạo lý / hoàn cảnh)',
    c: 'view',
    ex: [
      ['だいじな かいぎが あるので、やすむ わけには いかない。', 'daiji na kaigi ga aru node, yasumu wake ni wa ikanai.', 'Có cuộc họp quan trọng nên không thể nghỉ.'],
      ['ともだちの ひみつを はなす わけには いかない。', 'tomodachi no himitsu o hanasu wake ni wa ikanai.', 'Không thể kể bí mật của bạn được.'],
    ],
  },
  {
    p: '〜べきだ／〜べきでは ない',
    m: 'nên / không nên (bổn phận)',
    c: 'view',
    ex: [
      ['がくせいは もっと べんきょうする べきだ。', 'gakusei wa motto benkyou suru beki da.', 'Học sinh nên học nhiều hơn.'],
      ['ひとの わるくちを いう べきでは ない。', 'hito no warukuchi o iu beki de wa nai.', 'Không nên nói xấu người khác.'],
    ],
  },
  {
    p: '〜ことは ない',
    m: 'không cần phải …',
    c: 'view',
    ex: [
      ['そんなに しんぱいする ことは ないよ。', 'sonna ni shinpai suru koto wa nai yo.', 'Không cần phải lo lắng thế đâu.'],
      ['わざわざ くる ことは ありません。', 'wazawaza kuru koto wa arimasen.', 'Không cần phải cất công đến đâu.'],
    ],
  },
  {
    p: '〜らしい（đúng chất）',
    m: 'đúng kiểu, ra dáng …',
    c: 'view',
    ex: [
      ['きょうは はるらしい あたたかい ひだ。', 'kyou wa haru rashii atatakai hi da.', 'Hôm nay là ngày ấm áp đúng chất mùa xuân.'],
      ['かれは おとこらしい ひとだ。', 'kare wa otoko rashii hito da.', 'Anh ấy là người rất đàn ông.'],
    ],
  },
  {
    p: '〜っぽい',
    m: 'có vẻ …, hơi … (dễ …)',
    c: 'view',
    ex: [
      ['かれは おこりっぽい。', 'kare wa okorippoi.', 'Anh ta dễ nổi nóng.'],
      ['この ふくは こどもっぽい。', 'kono fuku wa kodomoppoi.', 'Bộ quần áo này trông trẻ con.'],
    ],
  },
  // ── Thay đổi, xu hướng & khuynh hướng ──
  {
    p: '〜つつ ある',
    m: 'đang dần dần …',
    c: 'trend',
    ex: [
      ['ちきゅうの きおんは あがりつつ ある。', 'chikyuu no kion wa agaritsutsu aru.', 'Nhiệt độ trái đất đang dần tăng lên.'],
      ['この まちの じんこうは へりつつ ある。', 'kono machi no jinkou wa heritsutsu aru.', 'Dân số thị trấn này đang giảm dần.'],
    ],
  },
  {
    p: '〜いっぽうだ',
    m: 'ngày càng … (một chiều)',
    c: 'trend',
    ex: [
      ['ぶっかは あがる いっぽうだ。', 'bukka wa agaru ippou da.', 'Vật giá ngày càng tăng.'],
      ['かれの びょうきは わるく なる いっぽうだ。', 'kare no byouki wa waruku naru ippou da.', 'Bệnh của anh ấy ngày càng xấu đi.'],
    ],
  },
  {
    p: '〜がちだ',
    m: 'hay …, thường dễ … (xấu)',
    c: 'trend',
    ex: [
      ['ふゆは かぜを ひきがちだ。', 'fuyu wa kaze o hikigachi da.', 'Mùa đông hay bị cảm.'],
      ['いそがしいと、しょくじが ふきそくに なりがちだ。', 'isogashii to, shokuji ga fukisoku ni narigachi da.', 'Khi bận, bữa ăn thường dễ thất thường.'],
    ],
  },
  {
    p: '〜ぎみ',
    m: 'hơi có vẻ …',
    c: 'trend',
    ex: [
      ['すこし かぜぎみなので、きょうは はやく ねます。', 'sukoshi kazegimi na node, kyou wa hayaku nemasu.', 'Hơi có dấu hiệu cảm nên hôm nay tôi ngủ sớm.'],
      ['さいきん つかれぎみだ。', 'saikin tsukaregimi da.', 'Dạo này hơi mệt mỏi.'],
    ],
  },
  {
    p: '〜っぱなし',
    m: 'để nguyên, … suốt (không làm tiếp)',
    c: 'trend',
    ex: [
      ['でんきを つけっぱなしで ねて しまった。', 'denki o tsukeppanashi de nete shimatta.', 'Tôi ngủ quên mà để đèn bật suốt.'],
      ['きょうは いちにちじゅう たちっぱなしだった。', 'kyou wa ichinichijuu tachippanashi datta.', 'Hôm nay đứng suốt cả ngày.'],
    ],
  },
  {
    p: '〜ように なる（N3・biến đổi dần）',
    m: 'dần dần trở nên …',
    c: 'trend',
    ex: [
      ['さいきん わかものが しんぶんを よまなく なった。', 'saikin wakamono ga shinbun o yomanaku natta.', 'Gần đây người trẻ không còn đọc báo nữa.'],
      ['スマホで なんでも できる ように なった。', 'sumaho de nandemo dekiru you ni natta.', 'Giờ đây có thể làm mọi thứ bằng điện thoại.'],
    ],
  },
  {
    p: '〜ようと する',
    m: 'định / sắp sửa …',
    c: 'trend',
    ex: [
      ['ねようと した とき、でんわが なった。', 'neyou to shita toki, denwa ga natta.', 'Khi định đi ngủ thì điện thoại reo.'],
      ['ドアを あけようと したが、あかなかった。', 'doa o akeyou to shita ga, akanakatta.', 'Tôi định mở cửa nhưng không mở được.'],
    ],
  },
  {
    p: '〜かける／〜かけの',
    m: 'đang dở dang …',
    c: 'trend',
    ex: [
      ['よみかけの ほんが つくえの うえに ある。', 'yomikake no hon ga tsukue no ue ni aru.', 'Cuốn sách đọc dở nằm trên bàn.'],
      ['なにか いいかけて、やめた。', 'nanika iikakete, yameta.', 'Định nói gì đó rồi thôi.'],
    ],
  },
  {
    p: '〜だす',
    m: 'bắt đầu (đột ngột) …',
    c: 'trend',
    ex: [
      ['あかちゃんが きゅうに なきだした。', 'akachan ga kyuu ni nakidashita.', 'Em bé đột nhiên khóc òa.'],
      ['あめが ふりだした。', 'ame ga furidashita.', 'Trời bắt đầu mưa.'],
    ],
  },
  {
    p: '〜きる／〜きれない',
    m: 'làm hết … / không thể làm hết',
    c: 'trend',
    ex: [
      ['この ほんは いちにちで よみきった。', 'kono hon wa ichinichi de yomikitta.', 'Tôi đọc hết cuốn sách này trong một ngày.'],
      ['りょうが おおくて、たべきれない。', 'ryou ga ookute, tabekirenai.', 'Nhiều quá, ăn không hết.'],
    ],
  },
  {
    p: '〜つづける',
    m: 'tiếp tục …',
    c: 'trend',
    ex: [
      ['あさから ずっと あめが ふりつづけて いる。', 'asa kara zutto ame ga furitsuzukete iru.', 'Mưa liên tục từ sáng.'],
      ['ゆめを もちつづける ことが たいせつだ。', 'yume o mochitsuzukeru koto ga taisetsu da.', 'Tiếp tục giữ ước mơ là điều quan trọng.'],
    ],
  },
  // ── Truyền đạt, trích dẫn & ví von ──
  {
    p: '〜と いう ことだ',
    m: 'nghe nói là … / nghĩa là …',
    c: 'quote',
    ex: [
      ['あしたの しけんは ちゅうしだ と いう ことだ。', 'ashita no shiken wa chuushi da to iu koto da.', 'Nghe nói bài thi ngày mai bị hủy.'],
      ['つまり、ことしは けっこんしない と いう ことですね。', 'tsumari, kotoshi wa kekkon shinai to iu koto desu ne.', 'Tức là năm nay anh không kết hôn nhỉ.'],
    ],
  },
  {
    p: '〜とか',
    m: 'nghe đâu là … (không chắc)',
    c: 'quote',
    ex: [
      ['たなかさん、らいげつ けっこんする とか。', 'tanaka-san, raigetsu kekkon suru toka.', 'Nghe đâu anh Tanaka tháng sau cưới.'],
      ['あの みせ、もう しまった とか きいたよ。', 'ano mise, mou shimatta toka kiita yo.', 'Nghe bảo quán đó đóng cửa rồi.'],
    ],
  },
  {
    p: '〜って',
    m: 'nghe nói / gọi là … (khẩu ngữ)',
    c: 'quote',
    ex: [
      ['あした やすみだって。', 'ashita yasumi datte.', 'Nghe bảo mai được nghỉ đấy.'],
      ['「すし」って なんですか。', '"sushi" tte nan desu ka.', '"Sushi" là gì vậy?'],
    ],
  },
  {
    p: '〜に よると／〜に よれば',
    m: 'theo … (nguồn tin)',
    c: 'quote',
    ex: [
      ['ニュースに よると、たいふうが ちかづいて いる。', 'nyuusu ni yoru to, taifuu ga chikazuite iru.', 'Theo tin tức, bão đang đến gần.'],
      ['ちょうさに よれば、わかものの 7わりが スマホを もって いる。', 'chousa ni yoreba, wakamono no nanawari ga sumaho o motte iru.', 'Theo khảo sát, 70% người trẻ có điện thoại thông minh.'],
    ],
  },
  {
    p: '〜と いわれて いる',
    m: 'người ta nói rằng …',
    c: 'quote',
    ex: [
      ['この おてらは 1000ねんまえに たてられた と いわれて いる。', 'kono otera wa sennen mae ni taterareta to iwarete iru.', 'Người ta nói ngôi chùa này được xây 1000 năm trước.'],
      ['みどりちゃは けんこうに いい と いわれて いる。', 'midoricha wa kenkou ni ii to iwarete iru.', 'Người ta nói trà xanh tốt cho sức khỏe.'],
    ],
  },
  {
    p: '〜ように いう／〜ように たのむ',
    m: 'bảo / nhờ (ai) làm …',
    c: 'quote',
    ex: [
      ['せんせいに しゅくだいを だす ように いわれた。', 'sensei ni shukudai o dasu you ni iwareta.', 'Tôi bị thầy bảo nộp bài tập.'],
      ['ははに はやく かえる ように たのまれた。', 'haha ni hayaku kaeru you ni tanomareta.', 'Mẹ nhờ tôi về sớm.'],
    ],
  },
  {
    p: '〜みたいな／〜みたいに',
    m: 'giống như … (ví von, khẩu ngữ)',
    c: 'quote',
    ex: [
      ['ゆめみたいな はなしだ。', 'yume mitai na hanashi da.', 'Chuyện như trong mơ vậy.'],
      ['こどもみたいに はしゃいで いる。', 'kodomo mitai ni hashaide iru.', 'Đang vui đùa như trẻ con.'],
    ],
  },
  {
    p: '〜かのように',
    m: 'như thể là …',
    c: 'quote',
    ex: [
      ['かれは なにも なかった かのように わらって いた。', 'kare wa nani mo nakatta ka no you ni waratte ita.', 'Anh ta cười như thể không có chuyện gì.'],
      ['まるで なつに なった かのような あつさだ。', 'marude natsu ni natta ka no you na atsusa da.', 'Nóng như thể đã sang hè.'],
    ],
  },
  {
    p: 'まるで〜ようだ',
    m: 'cứ như là …',
    c: 'quote',
    ex: [
      ['この みずうみは まるで かがみの ようだ。', 'kono mizuumi wa marude kagami no you da.', 'Cái hồ này cứ như một tấm gương.'],
      ['まるで ほんものの ような にせものだ。', 'marude honmono no you na nisemono da.', 'Đồ giả mà cứ như đồ thật.'],
    ],
  },
  {
    p: '〜ふりを する',
    m: 'giả vờ …',
    c: 'quote',
    ex: [
      ['かれは ねて いる ふりを して いる。', 'kare wa nete iru furi o shite iru.', 'Anh ấy đang giả vờ ngủ.'],
      ['きこえない ふりを しないで。', 'kikoenai furi o shinaide.', 'Đừng giả vờ không nghe thấy.'],
    ],
  },
  // ── Bổ sung, thay thế & liệt kê ──
  {
    p: '〜うえに',
    m: 'hơn nữa, không những … mà còn',
    c: 'add',
    ex: [
      ['この アパートは ひろい うえに、やちんも やすい。', 'kono apaato wa hiroi ue ni, yachin mo yasui.', 'Căn hộ này đã rộng lại còn rẻ.'],
      ['みちに まよった うえに、あめまで ふって きた。', 'michi ni mayotta ue ni, ame made futte kita.', 'Đã lạc đường lại còn mưa nữa.'],
    ],
  },
  {
    p: '〜だけでなく',
    m: 'không chỉ … mà',
    c: 'add',
    ex: [
      ['かのじょは うたが じょうずな だけでなく、ダンスも うまい。', 'kanojo wa uta ga jouzu na dake de naku, dansu mo umai.', 'Cô ấy không chỉ hát hay mà còn nhảy giỏi.'],
      ['べんきょう だけでなく、スポーツも がんばって いる。', 'benkyou dake de naku, supootsu mo ganbatte iru.', 'Không chỉ học mà còn chăm thể thao.'],
    ],
  },
  {
    p: '〜かわりに',
    m: 'thay vì / đổi lại',
    c: 'add',
    ex: [
      ['ぶちょうの かわりに、わたしが かいぎに でた。', 'buchou no kawari ni, watashi ga kaigi ni deta.', 'Tôi dự họp thay trưởng phòng.'],
      ['えいごを おしえて もらう かわりに、にほんごを おしえた。', 'eigo o oshiete morau kawari ni, nihongo o oshieta.', 'Đổi lại việc được dạy tiếng Anh, tôi dạy tiếng Nhật.'],
    ],
  },
  {
    p: '〜ながらも',
    m: 'mặc dù … nhưng',
    c: 'add',
    ex: [
      ['せまい ながらも、じぶんの いえが ほしい。', 'semai nagara mo, jibun no ie ga hoshii.', 'Dù chật nhưng tôi muốn có nhà riêng.'],
      ['わかって いながらも、また おなじ しっぱいを した。', 'wakatte inagara mo, mata onaji shippai o shita.', 'Dù biết nhưng vẫn mắc lại lỗi cũ.'],
    ],
  },
  {
    p: '〜に かわって',
    m: 'thay cho …',
    c: 'add',
    ex: [
      ['ちちに かわって、わたしが ごあいさつします。', 'chichi ni kawatte, watashi ga goaisatsu shimasu.', 'Thay mặt bố, tôi xin phát biểu.'],
      ['にんげんに かわって、ロボットが はたらく じだいだ。', 'ningen ni kawatte, robotto ga hataraku jidai da.', 'Thời đại robot làm việc thay con người.'],
    ],
  },
  {
    p: '〜をはじめ（として）',
    m: 'tiêu biểu là …, bắt đầu từ …',
    c: 'add',
    ex: [
      ['とうきょうを はじめ、おおきい まちは ひとが おおい。', 'toukyou o hajime, ookii machi wa hito ga ooi.', 'Các thành phố lớn, tiêu biểu là Tokyo, rất đông người.'],
      ['しゃちょうを はじめ、しゃいん ぜんいんが さんかした。', 'shachou o hajime, shain zen\'in ga sanka shita.', 'Từ giám đốc đến toàn bộ nhân viên đều tham gia.'],
    ],
  },
  {
    p: '〜など／〜なんか',
    m: 'những thứ như … (xem nhẹ)',
    c: 'add',
    ex: [
      ['わたしなんか、とても かないません。', 'watashi nanka, totemo kanaimasen.', 'Người như tôi thì không sánh được đâu.'],
      ['おばけなど いる わけが ない。', 'obake nado iru wake ga nai.', 'Làm gì có ma quỷ.'],
    ],
  },
  {
    p: '〜ことに（cảm xúc）',
    m: 'thật là … (bày tỏ cảm xúc)',
    c: 'add',
    ex: [
      ['ざんねんな ことに、しあいに まけて しまった。', 'zannen na koto ni, shiai ni makete shimatta.', 'Thật đáng tiếc là đã thua trận.'],
      ['おどろいた ことに、かれは 10かこくごが はなせる。', 'odoroita koto ni, kare wa jukkakokugo ga hanaseru.', 'Ngạc nhiên thay, anh ấy nói được 10 thứ tiếng.'],
    ],
  },
  {
    p: '〜ばかりだ',
    m: 'chỉ toàn … / ngày càng …',
    c: 'add',
    ex: [
      ['じょうきょうは わるく なる ばかりだ。', 'joukyou wa waruku naru bakari da.', 'Tình hình chỉ ngày càng xấu đi.'],
      ['じゅんびは できて いて、あとは はじめる ばかりだ。', 'junbi wa dekite ite, ato wa hajimeru bakari da.', 'Đã chuẩn bị xong, giờ chỉ còn bắt đầu.'],
    ],
  },
  {
    p: '〜か〜ないかのうちに',
    m: 'vừa mới … thì đã',
    c: 'add',
    ex: [
      ['ベルが なるか ならないかの うちに、せいとは きょうしつを でた。', 'beru ga naru ka naranai ka no uchi ni, seito wa kyoushitsu o deta.', 'Chuông vừa reo là học sinh đã ra khỏi lớp.'],
      ['すわるか すわらないかの うちに、ねて しまった。', 'suwaru ka suwaranai ka no uchi ni, nete shimatta.', 'Vừa ngồi xuống là ngủ mất.'],
    ],
  },
  {
    p: '〜もの（lý do, khẩu ngữ）',
    m: 'vì … mà (biện minh)',
    c: 'add',
    ex: [
      ['だって、しらなかったんだもの。', 'datte, shiranakatta n da mono.', 'Vì em không biết mà.'],
      ['いきたくないよ。つかれて いるもん。', 'ikitakunai yo. tsukarete iru mon.', 'Không muốn đi đâu. Mệt mà.'],
    ],
  },
  {
    p: '〜ものだ（bản chất / hồi tưởng）',
    m: 'vốn dĩ là … / ngày xưa hay …',
    c: 'add',
    ex: [
      ['じかんが たつのは はやい ものだ。', 'jikan ga tatsu no wa hayai mono da.', 'Thời gian trôi thật nhanh.'],
      ['こどもの ころ、よく この かわで あそんだ ものだ。', 'kodomo no koro, yoku kono kawa de asonda mono da.', 'Hồi nhỏ tôi hay chơi ở con sông này.'],
    ],
  },
  {
    p: '〜ことだ（lời khuyên）',
    m: 'nên … (lời khuyên)',
    c: 'add',
    ex: [
      ['かぜを なおしたいなら、よく ねる ことだ。', 'kaze o naoshitai nara, yoku neru koto da.', 'Muốn khỏi cảm thì nên ngủ nhiều.'],
      ['じょうずに なりたければ、まいにち れんしゅうする ことだ。', 'jouzu ni naritakereba, mainichi renshuu suru koto da.', 'Muốn giỏi thì nên luyện tập hằng ngày.'],
    ],
  },
];
