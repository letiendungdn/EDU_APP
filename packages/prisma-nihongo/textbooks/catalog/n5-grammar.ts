import type { TbGrammar } from '../types';

export const N5_CATEGORIES: Record<string, string> = {
  basic: 'Câu cơ bản & trợ từ',
  exist: 'Tồn tại & vị trí',
  verb: 'Động từ & thì',
  adj: 'Tính từ & so sánh',
  want: 'Mong muốn & rủ rê',
  request: 'Nhờ vả, cho phép & cấm',
  time: 'Thời gian & trình tự',
  link: 'Nối câu & lý do',
};

export const N5_GRAMMAR: TbGrammar[] = [
  // ── Câu cơ bản & trợ từ ──
  {
    p: 'N1 は N2 です',
    m: 'N1 là N2',
    c: 'basic',
    e: 'Câu khẳng định lịch sự cơ bản. は (đọc "wa") đánh dấu chủ đề.',
    ex: [
      ['わたしは がくせいです。', 'watashi wa gakusei desu.', 'Tôi là học sinh.'],
      ['これは にほんごの ほんです。', 'kore wa nihongo no hon desu.', 'Đây là sách tiếng Nhật.'],
    ],
  },
  {
    p: 'N1 は N2 じゃありません／ではありません',
    m: 'N1 không phải là N2',
    c: 'basic',
    e: 'Phủ định của です. じゃ dùng trong hội thoại, では trang trọng hơn.',
    ex: [
      ['わたしは せんせいじゃありません。', 'watashi wa sensei ja arimasen.', 'Tôi không phải là giáo viên.'],
      ['あれは わたしの かさではありません。', 'are wa watashi no kasa de wa arimasen.', 'Cái kia không phải ô của tôi.'],
    ],
  },
  {
    p: '〜ですか',
    m: 'câu hỏi có / không',
    c: 'basic',
    e: 'Thêm か cuối câu để hỏi. Trả lời: はい、そうです／いいえ、ちがいます.',
    ex: [
      ['たなかさんは かいしゃいんですか。', 'tanaka-san wa kaishain desu ka.', 'Anh Tanaka là nhân viên công ty phải không?'],
      ['これは あなたの ですか。', 'kore wa anata no desu ka.', 'Cái này là của bạn phải không?'],
    ],
  },
  {
    p: 'N も',
    m: 'N cũng',
    c: 'basic',
    e: 'Thay cho は／が／を khi muốn nói "cũng vậy".',
    ex: [
      ['わたしも ベトナムじんです。', 'watashi mo betonamujin desu.', 'Tôi cũng là người Việt Nam.'],
      ['コーヒーも のみます。', 'koohii mo nomimasu.', 'Tôi cũng uống cà phê.'],
    ],
  },
  {
    p: 'N1 の N2',
    m: 'N2 của N1 / N2 thuộc N1',
    c: 'basic',
    e: 'Nối hai danh từ: sở hữu, xuất xứ, nội dung.',
    ex: [
      ['これは わたしの かばんです。', 'kore wa watashi no kaban desu.', 'Đây là cặp của tôi.'],
      ['にほんの くるまは たかいです。', 'nihon no kuruma wa takai desu.', 'Xe ô tô của Nhật thì đắt.'],
    ],
  },
  {
    p: 'これ／それ／あれ・この／その／あの N',
    m: 'cái này / cái đó / cái kia',
    c: 'basic',
    e: 'これ・それ・あれ đứng một mình; この・その・あの phải đi kèm danh từ.',
    ex: [
      ['それは なんですか。', 'sore wa nan desu ka.', 'Cái đó là cái gì?'],
      ['この とけいは いくらですか。', 'kono tokei wa ikura desu ka.', 'Cái đồng hồ này bao nhiêu tiền?'],
    ],
  },
  {
    p: 'N を V',
    m: 'làm V với / vào N (tân ngữ)',
    c: 'basic',
    e: 'を (đọc "o") đánh dấu tân ngữ trực tiếp của động từ.',
    ex: [
      ['まいあさ パンを たべます。', 'maiasa pan o tabemasu.', 'Sáng nào tôi cũng ăn bánh mì.'],
      ['テレビを みます。', 'terebi o mimasu.', 'Tôi xem tivi.'],
    ],
  },
  {
    p: 'N（địa điểm）で V',
    m: 'làm V tại N',
    c: 'basic',
    e: 'で chỉ nơi diễn ra hành động.',
    ex: [
      ['としょかんで べんきょうします。', 'toshokan de benkyou shimasu.', 'Tôi học ở thư viện.'],
      ['どこで ひるごはんを たべますか。', 'doko de hirugohan o tabemasu ka.', 'Bạn ăn trưa ở đâu?'],
    ],
  },
  {
    p: 'N（phương tiện）で',
    m: 'bằng N (phương tiện, công cụ)',
    c: 'basic',
    e: 'で chỉ phương tiện, công cụ, ngôn ngữ.',
    ex: [
      ['バスで がっこうへ いきます。', 'basu de gakkou e ikimasu.', 'Tôi đi đến trường bằng xe buýt.'],
      ['はしで ごはんを たべます。', 'hashi de gohan o tabemasu.', 'Tôi ăn cơm bằng đũa.'],
    ],
  },
  {
    p: 'N（người）と',
    m: 'cùng với N',
    c: 'basic',
    e: 'と chỉ người cùng làm hành động.',
    ex: [
      ['ともだちと えいがを みました。', 'tomodachi to eiga o mimashita.', 'Tôi đã xem phim cùng bạn.'],
      ['かぞくと きょうとへ いきます。', 'kazoku to kyouto e ikimasu.', 'Tôi đi Kyoto cùng gia đình.'],
    ],
  },
  {
    p: 'N1 と N2 ／ N1 や N2（など）',
    m: 'N1 và N2 / N1, N2… (liệt kê)',
    c: 'basic',
    e: 'と liệt kê đầy đủ; や liệt kê vài ví dụ, thường kèm など.',
    ex: [
      ['パンと たまごを かいました。', 'pan to tamago o kaimashita.', 'Tôi đã mua bánh mì và trứng.'],
      ['つくえの うえに ほんや ノートなどが あります。', "tsukue no ue ni hon ya nooto nado ga arimasu.", 'Trên bàn có sách, vở v.v.'],
    ],
  },
  {
    p: 'なに／だれ／どこ／いつ／いくら',
    m: 'cái gì / ai / ở đâu / khi nào / bao nhiêu tiền',
    c: 'basic',
    e: 'Từ để hỏi đặt vào vị trí của thông tin cần hỏi.',
    ex: [
      ['あの ひとは だれですか。', 'ano hito wa dare desu ka.', 'Người kia là ai?'],
      ['たんじょうびは いつですか。', "tanjoubi wa itsu desu ka.", 'Sinh nhật bạn là khi nào?'],
    ],
  },
  // ── Tồn tại & vị trí ──
  {
    p: 'N が あります',
    m: 'có N (đồ vật, cây cối)',
    c: 'exist',
    e: 'Dùng cho vật không tự chuyển động.',
    ex: [
      ['へやに テレビが あります。', 'heya ni terebi ga arimasu.', 'Trong phòng có tivi.'],
      ['あした テストが あります。', 'ashita tesuto ga arimasu.', 'Ngày mai có bài kiểm tra.'],
    ],
  },
  {
    p: 'N が います',
    m: 'có N (người, động vật)',
    c: 'exist',
    e: 'Dùng cho người và động vật.',
    ex: [
      ['にわに ねこが います。', 'niwa ni neko ga imasu.', 'Trong vườn có con mèo.'],
      ['わたしは きょうだいが ふたり います。', 'watashi wa kyoudai ga futari imasu.', 'Tôi có hai anh chị em.'],
    ],
  },
  {
    p: 'N1（địa điểm）に N2 が あります／います',
    m: 'ở N1 có N2',
    c: 'exist',
    e: 'に chỉ nơi tồn tại.',
    ex: [
      ['えきの まえに ぎんこうが あります。', 'eki no mae ni ginkou ga arimasu.', 'Trước nhà ga có ngân hàng.'],
      ['きょうしつに がくせいが います。', 'kyoushitsu ni gakusei ga imasu.', 'Trong lớp học có học sinh.'],
    ],
  },
  {
    p: 'N1 は N2（địa điểm）に あります／います',
    m: 'N1 ở N2',
    c: 'exist',
    e: 'Nói vị trí của một vật / người đã biết.',
    ex: [
      ['トイレは どこに ありますか。', 'toire wa doko ni arimasu ka.', 'Nhà vệ sinh ở đâu?'],
      ['ははは だいどころに います。', 'haha wa daidokoro ni imasu.', 'Mẹ tôi ở trong bếp.'],
    ],
  },
  {
    p: 'N の うえ／した／なか／まえ／うしろ／となり',
    m: 'trên / dưới / trong / trước / sau / bên cạnh N',
    c: 'exist',
    e: 'Danh từ chỉ vị trí đứng sau の.',
    ex: [
      ['かぎは つくえの したに あります。', 'kagi wa tsukue no shita ni arimasu.', 'Chìa khóa ở dưới bàn.'],
      ['ゆうびんきょくは びょういんの となりです。', 'yuubinkyoku wa byouin no tonari desu.', 'Bưu điện ở cạnh bệnh viện.'],
    ],
  },
  {
    p: 'ここ／そこ／あそこ／どこ',
    m: 'chỗ này / chỗ đó / chỗ kia / chỗ nào',
    c: 'exist',
    e: 'Đại từ chỉ nơi chốn; dạng lịch sự: こちら／そちら／あちら／どちら.',
    ex: [
      ['ここは しょくどうです。', 'koko wa shokudou desu.', 'Đây là nhà ăn.'],
      ['エレベーターは あそこです。', 'erebeetaa wa asoko desu.', 'Thang máy ở đằng kia.'],
    ],
  },
  // ── Động từ & thì ──
  {
    p: 'V ます／V ません',
    m: 'làm / không làm (lịch sự, hiện tại – tương lai)',
    c: 'verb',
    ex: [
      ['まいにち にほんごを べんきょうします。', 'mainichi nihongo o benkyou shimasu.', 'Hằng ngày tôi học tiếng Nhật.'],
      ['にちようびは はたらきません。', 'nichiyoubi wa hatarakimasen.', 'Chủ nhật tôi không làm việc.'],
    ],
  },
  {
    p: 'V ました／V ませんでした',
    m: 'đã làm / đã không làm',
    c: 'verb',
    ex: [
      ['きのう てがみを かきました。', 'kinou tegami o kakimashita.', 'Hôm qua tôi đã viết thư.'],
      ['けさ あさごはんを たべませんでした。', 'kesa asagohan o tabemasendeshita.', 'Sáng nay tôi đã không ăn sáng.'],
    ],
  },
  {
    p: 'N（địa điểm）へ／に いきます・きます・かえります',
    m: 'đi / đến / về N',
    c: 'verb',
    e: 'へ (đọc "e") hoặc に chỉ hướng di chuyển.',
    ex: [
      ['らいしゅう とうきょうへ いきます。', 'raishuu toukyou e ikimasu.', 'Tuần sau tôi đi Tokyo.'],
      ['なんじに うちへ かえりますか。', 'nanji ni uchi e kaerimasu ka.', 'Mấy giờ bạn về nhà?'],
    ],
  },
  {
    p: 'V て います',
    m: 'đang làm V',
    c: 'verb',
    e: 'Hành động đang diễn ra.',
    ex: [
      ['いま あめが ふって います。', 'ima ame ga futte imasu.', 'Bây giờ trời đang mưa.'],
      ['おとうとは へやで ねて います。', 'otouto wa heya de nete imasu.', 'Em trai đang ngủ trong phòng.'],
    ],
  },
  {
    p: 'V て います（trạng thái, thói quen）',
    m: 'đang ở trạng thái / thường xuyên làm',
    c: 'verb',
    e: 'Kết quả còn lại (けっこんして います) hoặc nghề nghiệp, thói quen.',
    ex: [
      ['あねは けっこんして います。', 'ane wa kekkon shite imasu.', 'Chị tôi đã kết hôn.'],
      ['ちちは ぎんこうで はたらいて います。', 'chichi wa ginkou de hataraite imasu.', 'Bố tôi làm việc ở ngân hàng.'],
    ],
  },
  {
    p: 'V た ことが あります',
    m: 'đã từng làm V',
    c: 'verb',
    e: 'Nói về kinh nghiệm.',
    ex: [
      ['ふじさんに のぼった ことが あります。', 'fujisan ni nobotta koto ga arimasu.', 'Tôi đã từng leo núi Phú Sĩ.'],
      ['すしを たべた ことが ありますか。', 'sushi o tabeta koto ga arimasu ka.', 'Bạn đã từng ăn sushi chưa?'],
    ],
  },
  {
    p: 'V（thể từ điển）ことが できます',
    m: 'có thể làm V',
    c: 'verb',
    ex: [
      ['わたしは ピアノを ひく ことが できます。', 'watashi wa piano o hiku koto ga dekimasu.', 'Tôi có thể chơi piano.'],
      ['ここで カードで はらう ことが できますか。', 'koko de kaado de harau koto ga dekimasu ka.', 'Ở đây có thể trả bằng thẻ không?'],
    ],
  },
  {
    p: 'N が できます／わかります／すきです',
    m: 'biết / hiểu / thích N (đối tượng dùng が)',
    c: 'verb',
    e: 'Một số động từ, tính từ chỉ khả năng, cảm xúc dùng が cho đối tượng.',
    ex: [
      ['リンさんは にほんごが よく わかります。', 'rin-san wa nihongo ga yoku wakarimasu.', 'Chị Linh hiểu tiếng Nhật rất rõ.'],
      ['わたしは サッカーが すきです。', 'watashi wa sakkaa ga suki desu.', 'Tôi thích bóng đá.'],
    ],
  },
  {
    p: 'N に なります／A くなります',
    m: 'trở thành N / trở nên A',
    c: 'verb',
    e: 'Tính từ い: い→く＋なります; tính từ な & danh từ: に＋なります.',
    ex: [
      ['はるに なりました。', 'haru ni narimashita.', 'Đã sang xuân rồi.'],
      ['だんだん さむく なります。', 'dandan samuku narimasu.', 'Trời dần dần lạnh đi.'],
    ],
  },
  // ── Tính từ & so sánh ──
  {
    p: 'A い です／A な です',
    m: 'tính từ đuôi い / đuôi な làm vị ngữ',
    c: 'adj',
    e: 'Phủ định: A い → A くないです; A な → A じゃありません.',
    ex: [
      ['この りんごは おいしいです。', 'kono ringo wa oishii desu.', 'Quả táo này ngon.'],
      ['この まちは しずかです。', 'kono machi wa shizuka desu.', 'Thị trấn này yên tĩnh.'],
    ],
  },
  {
    p: 'A い かったです／A な でした',
    m: 'tính từ ở quá khứ',
    c: 'adj',
    e: 'い→かったです; な／N → でした. Phủ định quá khứ: くなかったです／じゃありませんでした.',
    ex: [
      ['きのうは あつかったです。', 'kinou wa atsukatta desu.', 'Hôm qua trời nóng.'],
      ['パーティーは にぎやかでした。', "paatii wa nigiyaka deshita.", 'Bữa tiệc rất náo nhiệt.'],
    ],
  },
  {
    p: 'A い N ／ A な N',
    m: 'tính từ bổ nghĩa cho danh từ',
    c: 'adj',
    ex: [
      ['あかい かばんを かいました。', 'akai kaban o kaimashita.', 'Tôi đã mua cái cặp màu đỏ.'],
      ['きれいな こうえんですね。', 'kirei na kouen desu ne.', 'Công viên đẹp nhỉ.'],
    ],
  },
  {
    p: 'とても／あまり 〜ない',
    m: 'rất / không … lắm',
    c: 'adj',
    e: 'あまり luôn đi với thể phủ định.',
    ex: [
      ['この えいがは とても おもしろいです。', 'kono eiga wa totemo omoshiroi desu.', 'Bộ phim này rất hay.'],
      ['きょうは あまり さむくないです。', 'kyou wa amari samukunai desu.', 'Hôm nay không lạnh lắm.'],
    ],
  },
  {
    p: 'N1 は N2 より A です',
    m: 'N1 A hơn N2',
    c: 'adj',
    ex: [
      ['でんしゃは バスより はやいです。', 'densha wa basu yori hayai desu.', 'Tàu điện nhanh hơn xe buýt.'],
      ['きょうは きのうより あたたかいです。', 'kyou wa kinou yori atatakai desu.', 'Hôm nay ấm hơn hôm qua.'],
    ],
  },
  {
    p: 'N1 と N2 と どちらが A ですか',
    m: 'N1 và N2, cái nào A hơn?',
    c: 'adj',
    e: 'Trả lời: N1 の ほうが A です.',
    ex: [
      ['いぬと ねこと どちらが すきですか。', 'inu to neko to dochira ga suki desu ka.', 'Chó và mèo, bạn thích con nào hơn?'],
      ['ねこの ほうが すきです。', 'neko no hou ga suki desu.', 'Tôi thích mèo hơn.'],
    ],
  },
  {
    p: 'N（の なか）で いちばん A',
    m: 'A nhất trong N',
    c: 'adj',
    ex: [
      ['くだものの なかで いちごが いちばん すきです。', 'kudamono no naka de ichigo ga ichiban suki desu.', 'Trong các loại quả, tôi thích dâu nhất.'],
      ['クラスで だれが いちばん せが たかいですか。', 'kurasu de dare ga ichiban se ga takai desu ka.', 'Trong lớp ai cao nhất?'],
    ],
  },
  {
    p: 'A くて／A で／N で',
    m: 'A và … (nối tính từ, danh từ)',
    c: 'adj',
    ex: [
      ['この へやは ひろくて あかるいです。', 'kono heya wa hirokute akarui desu.', 'Căn phòng này rộng và sáng.'],
      ['やまださんは しんせつで おもしろい ひとです。', 'yamada-san wa shinsetsu de omoshiroi hito desu.', 'Anh Yamada là người tốt bụng và thú vị.'],
    ],
  },
  // ── Mong muốn & rủ rê ──
  {
    p: 'N が ほしいです',
    m: 'muốn có N',
    c: 'want',
    ex: [
      ['あたらしい パソコンが ほしいです。', 'atarashii pasokon ga hoshii desu.', 'Tôi muốn có máy tính mới.'],
      ['いま なにが いちばん ほしいですか。', 'ima nani ga ichiban hoshii desu ka.', 'Bây giờ bạn muốn có gì nhất?'],
    ],
  },
  {
    p: 'V たいです',
    m: 'muốn làm V',
    c: 'want',
    e: 'Bỏ ます thêm たい. Đối tượng có thể dùng が hoặc を.',
    ex: [
      ['にほんへ いきたいです。', 'nihon e ikitai desu.', 'Tôi muốn đi Nhật.'],
      ['つめたい みずが のみたいです。', 'tsumetai mizu ga nomitai desu.', 'Tôi muốn uống nước lạnh.'],
    ],
  },
  {
    p: 'V ませんか',
    m: 'cùng làm V không? (mời, rủ)',
    c: 'want',
    ex: [
      ['いっしょに えいがを みませんか。', 'issho ni eiga o mimasen ka.', 'Cùng đi xem phim không?'],
      ['こんど テニスを しませんか。', 'kondo tenisu o shimasen ka.', 'Lần tới cùng chơi tennis không?'],
    ],
  },
  {
    p: 'V ましょう／V ましょうか',
    m: 'cùng làm V nào / tôi làm V giúp nhé?',
    c: 'want',
    ex: [
      ['ちょっと やすみましょう。', 'chotto yasumimashou.', 'Nghỉ một chút nào.'],
      ['にもつを もちましょうか。', 'nimotsu o mochimashou ka.', 'Để tôi xách hành lý giúp nhé?'],
    ],
  },
  {
    p: 'N（địa điểm）へ V ます に いきます',
    m: 'đi đến N để làm V',
    c: 'want',
    e: 'Mục đích của việc di chuyển: V bỏ ます ＋ に.',
    ex: [
      ['デパートへ くつを かいに いきます。', 'depaato e kutsu o kai ni ikimasu.', 'Tôi đến bách hóa để mua giày.'],
      ['こうえんへ さんぽに いきました。', 'kouen e sanpo ni ikimashita.', 'Tôi đã ra công viên đi dạo.'],
    ],
  },
  // ── Nhờ vả, cho phép & cấm ──
  {
    p: 'V て ください',
    m: 'hãy làm V',
    c: 'request',
    ex: [
      ['ここに なまえを かいて ください。', 'koko ni namae o kaite kudasai.', 'Hãy viết tên vào đây.'],
      ['もう いちど いって ください。', 'mou ichido itte kudasai.', 'Xin hãy nói lại một lần nữa.'],
    ],
  },
  {
    p: 'V ないで ください',
    m: 'xin đừng làm V',
    c: 'request',
    ex: [
      ['ここで しゃしんを とらないで ください。', 'koko de shashin o toranaide kudasai.', 'Xin đừng chụp ảnh ở đây.'],
      ['しんぱいしないで ください。', 'shinpai shinaide kudasai.', 'Xin đừng lo lắng.'],
    ],
  },
  {
    p: 'V ても いいですか',
    m: 'làm V có được không? (xin phép)',
    c: 'request',
    ex: [
      ['まどを あけても いいですか。', 'mado o aketemo ii desu ka.', 'Tôi mở cửa sổ có được không?'],
      ['この ペンを つかっても いいですか。', 'kono pen o tsukattemo ii desu ka.', 'Tôi dùng cây bút này được không?'],
    ],
  },
  {
    p: 'V ては いけません',
    m: 'không được làm V (cấm)',
    c: 'request',
    ex: [
      ['ここで タバコを すっては いけません。', 'koko de tabako o sutte wa ikemasen.', 'Không được hút thuốc ở đây.'],
      ['じゅぎょうちゅうに ねては いけません。', 'jugyouchuu ni nete wa ikemasen.', 'Không được ngủ trong giờ học.'],
    ],
  },
  {
    p: 'N を ください',
    m: 'cho tôi N',
    c: 'request',
    ex: [
      ['この シャツを ください。', 'kono shatsu o kudasai.', 'Cho tôi cái áo sơ mi này.'],
      ['みずを ふたつ ください。', 'mizu o futatsu kudasai.', 'Cho tôi hai cốc nước.'],
    ],
  },
  {
    p: 'V なければ なりません',
    m: 'phải làm V',
    c: 'request',
    ex: [
      ['あしたまでに レポートを ださなければ なりません。', 'ashita made ni repooto o dasanakereba narimasen.', 'Tôi phải nộp báo cáo trước ngày mai.'],
      ['まいにち くすりを のまなければ なりません。', 'mainichi kusuri o nomanakereba narimasen.', 'Hằng ngày tôi phải uống thuốc.'],
    ],
  },
  {
    p: 'V なくても いいです',
    m: 'không cần làm V cũng được',
    c: 'request',
    ex: [
      ['あしたは こなくても いいです。', 'ashita wa konakutemo ii desu.', 'Ngày mai bạn không cần đến cũng được.'],
      ['くつを ぬがなくても いいですよ。', 'kutsu o nuganakutemo ii desu yo.', 'Không cần cởi giày đâu.'],
    ],
  },
  // ── Thời gian & trình tự ──
  {
    p: '〜じ〜ふん に V',
    m: 'làm V vào lúc … giờ … phút',
    c: 'time',
    e: 'に đi với thời điểm cụ thể (giờ, ngày, tháng); không dùng với きょう, あした, まいにち…',
    ex: [
      ['まいあさ 6じに おきます。', 'maiasa rokuji ni okimasu.', 'Sáng nào tôi cũng dậy lúc 6 giờ.'],
      ['じゅぎょうは 9じ はんに はじまります。', 'jugyou wa kuji han ni hajimarimasu.', 'Giờ học bắt đầu lúc 9 rưỡi.'],
    ],
  },
  {
    p: 'N1 から N2 まで',
    m: 'từ N1 đến N2',
    c: 'time',
    e: 'Dùng cho cả thời gian và địa điểm.',
    ex: [
      ['ぎんこうは 9じから 3じまでです。', 'ginkou wa kuji kara sanji made desu.', 'Ngân hàng làm việc từ 9 giờ đến 3 giờ.'],
      ['うちから えきまで あるいて 10ぷんです。', 'uchi kara eki made aruite juppun desu.', 'Từ nhà đến ga đi bộ mất 10 phút.'],
    ],
  },
  {
    p: 'V て、V て、V ます',
    m: 'làm V1, rồi V2, rồi V3 (trình tự)',
    c: 'time',
    ex: [
      ['あさ おきて、かおを あらって、ごはんを たべます。', 'asa okite, kao o aratte, gohan o tabemasu.', 'Buổi sáng tôi dậy, rửa mặt rồi ăn cơm.'],
      ['デパートへ いって、かいものを しました。', 'depaato e itte, kaimono o shimashita.', 'Tôi đến bách hóa rồi mua sắm.'],
    ],
  },
  {
    p: 'V て から',
    m: 'sau khi làm V thì …',
    c: 'time',
    ex: [
      ['しゅくだいを して から、テレビを みます。', 'shukudai o shite kara, terebi o mimasu.', 'Làm bài tập xong rồi tôi mới xem tivi.'],
      ['てを あらって から、たべて ください。', 'te o aratte kara, tabete kudasai.', 'Hãy rửa tay rồi mới ăn.'],
    ],
  },
  {
    p: 'V る まえに／N の まえに',
    m: 'trước khi làm V / trước N',
    c: 'time',
    ex: [
      ['ねる まえに はを みがきます。', 'neru mae ni ha o migakimasu.', 'Trước khi ngủ tôi đánh răng.'],
      ['しょくじの まえに てを あらいます。', 'shokuji no mae ni te o araimasu.', 'Trước bữa ăn tôi rửa tay.'],
    ],
  },
  {
    p: 'V た あとで／N の あとで',
    m: 'sau khi làm V / sau N',
    c: 'time',
    ex: [
      ['しごとが おわった あとで、のみに いきます。', 'shigoto ga owatta ato de, nomi ni ikimasu.', 'Sau khi xong việc tôi đi uống.'],
      ['じゅぎょうの あとで、せんせいに ききます。', 'jugyou no ato de, sensei ni kikimasu.', 'Sau giờ học tôi sẽ hỏi thầy.'],
    ],
  },
  {
    p: 'もう V ました／まだ V て いません',
    m: 'đã … rồi / vẫn chưa …',
    c: 'time',
    ex: [
      ['もう ひるごはんを たべましたか。', 'mou hirugohan o tabemashita ka.', 'Bạn đã ăn trưa chưa?'],
      ['いいえ、まだ たべて いません。', 'iie, mada tabete imasen.', 'Chưa, tôi vẫn chưa ăn.'],
    ],
  },
  {
    p: 'V ながら',
    m: 'vừa V1 vừa V2',
    c: 'time',
    e: 'Hành động chính đứng sau.',
    ex: [
      ['おんがくを ききながら べんきょうします。', 'ongaku o kikinagara benkyou shimasu.', 'Tôi vừa nghe nhạc vừa học.'],
      ['あるきながら でんわしないで ください。', 'arukinagara denwa shinaide kudasai.', 'Đừng vừa đi vừa gọi điện thoại.'],
    ],
  },
  {
    p: 'V たり V たり します',
    m: 'lúc thì V1, lúc thì V2 (liệt kê hành động)',
    c: 'time',
    ex: [
      ['やすみの ひは そうじしたり せんたくしたり します。', 'yasumi no hi wa souji shitari sentaku shitari shimasu.', 'Ngày nghỉ tôi lúc dọn dẹp, lúc giặt giũ.'],
      ['にちようびは ほんを よんだり えいがを みたり しました。', 'nichiyoubi wa hon o yondari eiga o mitari shimashita.', 'Chủ nhật tôi đọc sách, xem phim v.v.'],
    ],
  },
  // ── Nối câu & lý do ──
  {
    p: '〜から、〜',
    m: 'vì … nên …',
    c: 'link',
    e: 'から đứng sau vế lý do.',
    ex: [
      ['じかんが ありませんから、タクシーで いきます。', 'jikan ga arimasen kara, takushii de ikimasu.', 'Vì không có thời gian nên tôi đi taxi.'],
      ['あめですから、うちに います。', 'ame desu kara, uchi ni imasu.', 'Vì trời mưa nên tôi ở nhà.'],
    ],
  },
  {
    p: '〜が、〜',
    m: '… nhưng …',
    c: 'link',
    ex: [
      ['にほんごは むずかしいですが、おもしろいです。', 'nihongo wa muzukashii desu ga, omoshiroi desu.', 'Tiếng Nhật khó nhưng thú vị.'],
      ['すみませんが、ちょっと てつだって ください。', 'sumimasen ga, chotto tetsudatte kudasai.', 'Xin lỗi nhưng giúp tôi một chút nhé.'],
    ],
  },
  {
    p: 'どうして〜か／〜からです',
    m: 'tại sao …? / là vì …',
    c: 'link',
    ex: [
      ['どうして きのう やすみましたか。', 'doushite kinou yasumimashita ka.', 'Tại sao hôm qua bạn nghỉ?'],
      ['ねつが あったからです。', 'netsu ga atta kara desu.', 'Là vì tôi bị sốt.'],
    ],
  },
  {
    p: 'そして／それから',
    m: 'và / sau đó',
    c: 'link',
    ex: [
      ['この みせは やすいです。そして おいしいです。', 'kono mise wa yasui desu. soshite oishii desu.', 'Quán này rẻ. Và lại ngon.'],
      ['かいものを しました。それから ばんごはんを つくりました。', 'kaimono o shimashita. sorekara bangohan o tsukurimashita.', 'Tôi đi mua sắm. Sau đó nấu bữa tối.'],
    ],
  },
  {
    p: 'でも／しかし',
    m: 'nhưng / tuy nhiên (đầu câu)',
    c: 'link',
    ex: [
      ['この くつは すてきです。でも、たかいです。', 'kono kutsu wa suteki desu. demo, takai desu.', 'Đôi giày này đẹp. Nhưng đắt.'],
      ['よく べんきょうしました。しかし、しけんは むずかしかったです。', 'yoku benkyou shimashita. shikashi, shiken wa muzukashikatta desu.', 'Tôi đã học kỹ. Tuy nhiên bài thi khó.'],
    ],
  },
  {
    p: '〜と おもいます',
    m: 'tôi nghĩ là …',
    c: 'link',
    e: 'Đứng sau thể thường.',
    ex: [
      ['あしたは はれると おもいます。', 'ashita wa hareru to omoimasu.', 'Tôi nghĩ mai trời sẽ nắng.'],
      ['この ほんは おもしろいと おもいます。', 'kono hon wa omoshiroi to omoimasu.', 'Tôi nghĩ cuốn sách này hay.'],
    ],
  },
  {
    p: '〜と いいます',
    m: 'nói rằng … / tên là …',
    c: 'link',
    ex: [
      ['「ありがとう」は ベトナムごで なんと いいますか。', '"arigatou" wa betonamugo de nan to iimasu ka.', '"Arigatou" tiếng Việt nói thế nào?'],
      ['わたしは リンと いいます。', 'watashi wa rin to iimasu.', 'Tôi tên là Linh.'],
    ],
  },
];
