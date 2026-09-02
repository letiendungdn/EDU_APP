// Ngữ pháp JLPT bổ sung — bù gap theo jlpt-targets.ts
// Tổng: 238 mẫu (N5×64, N4×58, N3×39, N2×7, N1×70)

import type { JlptGrammarUnit } from './jlpt-grammar.data';

export const JLPT_GRAMMAR_GAP_FILL: JlptGrammarUnit[] = [
  {
    lessonNumber: 102,
    jlptLevel: 'N5',
    title: 'N5 · Ngữ pháp bổ sung (bài 1)',
    sortOrder: 1020,
    items: [
      {
        pattern: "N は N です",
        meaning: "A là B",
        explanation: "Cấu trúc cơ bản nhất để giới thiệu danh từ.",
        formalityLevel: "polite",
        examples: [
          { jp: "私は学生です。", romaji: "Watashi wa gakusei desu.", vi: "Tôi là học sinh." },
          { jp: "これは本です。", romaji: "Kore wa hon desu.", vi: "Đây là quyển sách." },
        ],
      },
      {
        pattern: "N は N じゃありません",
        meaning: "A không phải là B",
        formalityLevel: "polite",
        examples: [
          { jp: "彼は先生じゃありません。", romaji: "Kare wa sensei ja arimasen.", vi: "Anh ấy không phải giáo viên." },
          { jp: "それは私の傘じゃありません。", romaji: "Sore wa watashi no kasa ja arimasen.", vi: "Đó không phải ô của tôi." },
        ],
      },
      {
        pattern: "N も",
        meaning: "A cũng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "私も日本人です。", romaji: "Watashi mo nihonjin desu.", vi: "Tôi cũng là người Nhật." },
          { jp: "彼も来ます。", romaji: "Kare mo kimasu.", vi: "Anh ấy cũng đến." },
        ],
      },
      {
        pattern: "V(ます) + ましょう",
        meaning: "hãy cùng ~",
        formalityLevel: "polite",
        examples: [
          { jp: "一緒に行きましょう。", romaji: "Issho ni ikimashō.", vi: "Hãy cùng đi." },
          { jp: "休みましょう。", romaji: "Yasumimashō.", vi: "Hãy nghỉ đi." },
        ],
      },
      {
        pattern: "V(ます) + ませんか",
        meaning: "~ cùng không?",
        explanation: "Mời rủ lịch sự.",
        formalityLevel: "polite",
        examples: [
          { jp: "コーヒーを飲みませんか。", romaji: "Kōhī o nomimasen ka.", vi: "Uống cà phê cùng không?" },
          { jp: "映画を見ませんか。", romaji: "Eiga o mimasen ka.", vi: "Xem phim cùng không?" },
        ],
      },
      {
        pattern: "V(て) + ください",
        meaning: "hãy ~ (yêu cầu)",
        formalityLevel: "polite",
        examples: [
          { jp: "ここに座ってください。", romaji: "Koko ni suwatte kudasai.", vi: "Hãy ngồi ở đây." },
          { jp: "もう一度言ってください。", romaji: "Mō ichido itte kudasai.", vi: "Hãy nói lại lần nữa." },
        ],
      },
      {
        pattern: "V(て) + います",
        meaning: "đang ~",
        formalityLevel: "polite",
        examples: [
          { jp: "今、勉強しています。", romaji: "Ima, benkyō shite imasu.", vi: "Bây giờ tôi đang học." },
          { jp: "雨が降っています。", romaji: "Ame ga futte imasu.", vi: "Trời đang mưa." },
        ],
      },
      {
        pattern: "V(て) + から",
        meaning: "vì ~ nên ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "勉強してから、寝ます。", romaji: "Benkyō shite kara, nemasu.", vi: "Học xong rồi tôi đi ngủ." },
          { jp: "食べてから、出かけます。", romaji: "Tabete kara, dekakemasu.", vi: "Ăn xong rồi tôi ra ngoài." },
        ],
      },
    ],
  },
  {
    lessonNumber: 103,
    jlptLevel: 'N5',
    title: 'N5 · Ngữ pháp bổ sung (bài 2)',
    sortOrder: 1030,
    items: [
      {
        pattern: "V(て) + もいいですか",
        meaning: "tôi ~ được không?",
        formalityLevel: "polite",
        examples: [
          { jp: "写真を撮ってもいいですか。", romaji: "Shashin o totte mo ii desu ka.", vi: "Tôi chụp ảnh được không?" },
          { jp: "ここに入ってもいいですか。", romaji: "Koko ni haitte mo ii desu ka.", vi: "Tôi vào đây được không?" },
        ],
      },
      {
        pattern: "V(て) + はいけません",
        meaning: "không được ~",
        formalityLevel: "polite",
        examples: [
          { jp: "ここでタバコを吸ってはいけません。", romaji: "Koko de tabako o sutte wa ikemasen.", vi: "Không được hút thuốc ở đây." },
          { jp: "走ってはいけません。", romaji: "Hashitte wa ikemasen.", vi: "Không được chạy." },
        ],
      },
      {
        pattern: "V(ない) + でください",
        meaning: "đừng ~",
        formalityLevel: "polite",
        examples: [
          { jp: "心配しないでください。", romaji: "Shinpai shinaide kudasai.", vi: "Đừng lo." },
          { jp: "触らないでください。", romaji: "Sawaranaide kudasai.", vi: "Đừng chạm vào." },
        ],
      },
      {
        pattern: "V(たい) + です",
        meaning: "muốn ~",
        formalityLevel: "polite",
        examples: [
          { jp: "日本に行きたいです。", romaji: "Nihon ni ikitai desu.", vi: "Tôi muốn đi Nhật." },
          { jp: "寿司が食べたいです。", romaji: "Sushi ga tabetai desu.", vi: "Tôi muốn ăn sushi." },
        ],
      },
      {
        pattern: "V(ます) + たい + んです",
        meaning: "muốn ~ (giải thích)",
        formalityLevel: "polite",
        examples: [
          { jp: "早く帰りたいんです。", romaji: "Hayaku kaeritain desu.", vi: "Tôi muốn về sớm (vì lý do nào đó)." },
          { jp: "もっと勉強したいんです。", romaji: "Motto benkyō shitain desu.", vi: "Tôi muốn học thêm." },
        ],
      },
      {
        pattern: "V(辞書形) + ことができます",
        meaning: "có thể ~",
        formalityLevel: "polite",
        examples: [
          { jp: "日本語を話すことができます。", romaji: "Nihongo o hanasu koto ga dekimasu.", vi: "Tôi có thể nói tiếng Nhật." },
          { jp: "泳ぐことができます。", romaji: "Oyogu koto ga dekimasu.", vi: "Tôi có thể bơi." },
        ],
      },
      {
        pattern: "V(辞書形) + 必要があります",
        meaning: "cần phải ~",
        formalityLevel: "formal",
        examples: [
          { jp: "パスポートが必要があります。", romaji: "Pasupōto ga hitsuyō desu.", vi: "Cần có hộ chiếu." },
          { jp: "予約する必要があります。", romaji: "Yoyaku suru hitsuyō ga arimasu.", vi: "Cần phải đặt trước." },
        ],
      },
      {
        pattern: "V(なければ) + なりません",
        meaning: "phải ~",
        formalityLevel: "formal",
        examples: [
          { jp: "明日早く起きなければなりません。", romaji: "Ashita hayaku okinakereba narimasen.", vi: "Ngày mai tôi phải dậy sớm." },
          { jp: "宿題をしなければなりません。", romaji: "Shukudai o shinakereba narimasen.", vi: "Phải làm bài tập." },
        ],
      },
    ],
  },
  {
    lessonNumber: 104,
    jlptLevel: 'N5',
    title: 'N5 · Ngữ pháp bổ sung (bài 3)',
    sortOrder: 1040,
    items: [
      {
        pattern: "V(なくても) + いい",
        meaning: "không ~ cũng được",
        formalityLevel: "neutral",
        examples: [
          { jp: "今日は来なくてもいいです。", romaji: "Kyō wa konakute mo ii desu.", vi: "Hôm nay không đến cũng được." },
          { jp: "食べなくてもいいです。", romaji: "Tabenakute mo ii desu.", vi: "Không ăn cũng được." },
        ],
      },
      {
        pattern: "A(い) + く / A(な) + に + なります",
        meaning: "trở nên ~",
        formalityLevel: "polite",
        examples: [
          { jp: "日本語が上手になりました。", romaji: "Nihongo ga jōzu ni narimashita.", vi: "Tiếng Nhật giỏi hơn rồi." },
          { jp: "寒くなりました。", romaji: "Samuku narimashita.", vi: "Trời lạnh hơn rồi." },
        ],
      },
      {
        pattern: "V(辞書形) + 前に",
        meaning: "trước khi ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "寝る前に歯を磨きます。", romaji: "Neru mae ni ha o migakimasu.", vi: "Trước khi ngủ tôi đánh răng." },
          { jp: "出かける前に鍵を確認します。", romaji: "Dekakeru mae ni kagi o kakunin shimasu.", vi: "Trước khi ra ngoài tôi kiểm tra chìa khóa." },
        ],
      },
      {
        pattern: "V(た) + 後で",
        meaning: "sau khi ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "ご飯を食べた後で、散歩します。", romaji: "Gohan o tabeta ato de, sanpo shimasu.", vi: "Sau khi ăn cơm tôi đi dạo." },
          { jp: "仕事が終わった後で、飲みに行きます。", romaji: "Shigoto ga owatta ato de, nomi ni ikimasu.", vi: "Sau khi tan làm tôi đi uống." },
        ],
      },
      {
        pattern: "V(辞書形) + 時",
        meaning: "khi ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "日本に行く時、カメラを持っていきます。", romaji: "Nihon ni iku toki, kamera o motte ikimasu.", vi: "Khi đi Nhật tôi mang máy ảnh." },
          { jp: "困った時、先生に聞きます。", romaji: "Komatta toki, sensei ni kikimasu.", vi: "Khi gặp khó khăn tôi hỏi thầy." },
        ],
      },
      {
        pattern: "V(た) + り、V(た) + りする",
        meaning: "vừa ~ vừa ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "休日は本を読んだり、映画を見たりします。", romaji: "Kyūjitsu wa hon o yondari, eiga o mitari shimasu.", vi: "Ngày nghỉ tôi vừa đọc sách vừa xem phim." },
          { jp: "歌ったり、踊ったりしました。", romaji: "Utattari, odottari shimashita.", vi: "Vừa hát vừa nhảy." },
        ],
      },
      {
        pattern: "V(辞書形) + のが + 好き",
        meaning: "thích việc ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "音楽を聞くのが好きです。", romaji: "Ongaku o kiku no ga suki desu.", vi: "Tôi thích nghe nhạc." },
          { jp: "旅行するのが好きです。", romaji: "Ryokō suru no ga suki desu.", vi: "Tôi thích đi du lịch." },
        ],
      },
      {
        pattern: "V(辞書形) + のは + A(い/な) + です",
        meaning: "~ thì ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "早起きするのは大変です。", romaji: "Hayaoki suru no wa taihen desu.", vi: "Dậy sớm thì vất vả." },
          { jp: "日本語を勉強するのは楽しいです。", romaji: "Nihongo o benkyō suru no wa tanoshii desu.", vi: "Học tiếng Nhật thì vui." },
        ],
      },
    ],
  },
  {
    lessonNumber: 105,
    jlptLevel: 'N5',
    title: 'N5 · Ngữ pháp bổ sung (bài 4)',
    sortOrder: 1050,
    items: [
      {
        pattern: "N + が + 好き / 嫌い",
        meaning: "thích / ghét ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "猫が好きです。", romaji: "Neko ga suki desu.", vi: "Tôi thích mèo." },
          { jp: "野菜が嫌いです。", romaji: "Yasai ga kirai desu.", vi: "Tôi ghét rau." },
        ],
      },
      {
        pattern: "N + が + 上手 / 下手",
        meaning: "giỏi / kém ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "彼女は歌が上手です。", romaji: "Kanojo wa uta ga jōzu desu.", vi: "Cô ấy hát hay." },
          { jp: "私は料理が下手です。", romaji: "Watashi wa ryōri ga heta desu.", vi: "Tôi nấu ăn dở." },
        ],
      },
      {
        pattern: "N + が + 欲しい",
        meaning: "muốn có ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "新しいパソコンが欲しいです。", romaji: "Atarashii pasokon ga hoshii desu.", vi: "Tôi muốn có máy tính mới." },
          { jp: "時間が欲しいです。", romaji: "Jikan ga hoshii desu.", vi: "Tôi muốn có thời gian." },
        ],
      },
      {
        pattern: "N + があります / いません",
        meaning: "có / không có ~",
        formalityLevel: "polite",
        examples: [
          { jp: "机の上に本があります。", romaji: "Tsukue no ue ni hon ga arimasu.", vi: "Trên bàn có sách." },
          { jp: "お金がありません。", romaji: "Okane ga arimasen.", vi: "Không có tiền." },
        ],
      },
      {
        pattern: "N + が + います / いません",
        meaning: "có / không có (sinh vật)",
        formalityLevel: "polite",
        examples: [
          { jp: "公園に子供がいます。", romaji: "Kōen ni kodomo ga imasu.", vi: "Trong công viên có trẻ em." },
          { jp: "教室に誰もいません。", romaji: "Kyōshitsu ni dare mo imasen.", vi: "Trong lớp không có ai." },
        ],
      },
      {
        pattern: "A(い) + く / A(な) + に + V",
        meaning: "một cách ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "ゆっくり話してください。", romaji: "Yukkuri hanashite kudasai.", vi: "Hãy nói chậm." },
          { jp: "早く起きました。", romaji: "Hayaku okimashita.", vi: "Dậy sớm." },
        ],
      },
      {
        pattern: "A(い) + くない / A(な) + じゃない",
        meaning: "không ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "この問題は難しくないです。", romaji: "Kono mondai wa muzukashikunai desu.", vi: "Bài này không khó." },
          { jp: "彼は親切じゃないです。", romaji: "Kare wa shinsetsu ja nai desu.", vi: "Anh ấy không thân thiện." },
        ],
      },
      {
        pattern: "A(い) + かった / A(な) + だった",
        meaning: "đã ~ (quá khứ)",
        formalityLevel: "neutral",
        examples: [
          { jp: "昨日は暑かったです。", romaji: "Kinō wa atsukatta desu.", vi: "Hôm qua nóng." },
          { jp: "子供の時、元気だった。", romaji: "Kodomo no toki, genki datta.", vi: "Hồi nhỏ tôi khỏe." },
        ],
      },
    ],
  },
  {
    lessonNumber: 106,
    jlptLevel: 'N5',
    title: 'N5 · Ngữ pháp bổ sung (bài 5)',
    sortOrder: 1060,
    items: [
      {
        pattern: "N + で (phương tiện / địa điểm)",
        meaning: "bằng ~ / tại ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "電車で行きます。", romaji: "Densha de ikimasu.", vi: "Tôi đi bằng tàu điện." },
          { jp: "レストランで食べます。", romaji: "Resutoran de tabemasu.", vi: "Tôi ăn ở nhà hàng." },
        ],
      },
      {
        pattern: "N + から N + まで",
        meaning: "từ ~ đến ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "九時から五時まで働きます。", romaji: "Kuji kara goji made hatarakimasu.", vi: "Làm việc từ 9 đến 5 giờ." },
          { jp: "東京から大阪まで行きます。", romaji: "Tōkyō kara Ōsaka made ikimasu.", vi: "Đi từ Tokyo đến Osaka." },
        ],
      },
      {
        pattern: "N + ぐらい / くらい",
        meaning: "khoảng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "一時間ぐらいかかります。", romaji: "Ichijikan gurai kakarimasu.", vi: "Mất khoảng một tiếng." },
          { jp: "三人くらい来ました。", romaji: "Sannin kurai kimashita.", vi: "Có khoảng ba người đến." },
        ],
      },
      {
        pattern: "N + しか + V(否定)",
        meaning: "chỉ ~ (nhấn mạnh ít)",
        formalityLevel: "neutral",
        examples: [
          { jp: "千円しかありません。", romaji: "Sen en shika arimasen.", vi: "Chỉ có nghìn yên." },
          { jp: "一人しか来ませんでした。", romaji: "Hitori shika kimasen deshita.", vi: "Chỉ có một người đến." },
        ],
      },
      {
        pattern: "N + だけ",
        meaning: "chỉ ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "水だけ飲みます。", romaji: "Mizu dake nomimasu.", vi: "Tôi chỉ uống nước." },
          { jp: "彼だけ知っています。", romaji: "Kare dake shitte imasu.", vi: "Chỉ anh ấy biết." },
        ],
      },
      {
        pattern: "N + など",
        meaning: "v.v., ~ và những thứ tương tự",
        formalityLevel: "neutral",
        examples: [
          { jp: "りんごやバナナなどを買いました。", romaji: "Ringo ya banana nado o kaimashita.", vi: "Tôi mua táo, chuối v.v." },
          { jp: "東京や大阪などに行きました。", romaji: "Tōkyō ya Ōsaka nado ni ikimashita.", vi: "Tôi đã đi Tokyo, Osaka v.v." },
        ],
      },
      {
        pattern: "N + について",
        meaning: "về ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "日本の文化について勉強しています。", romaji: "Nihon no bunka ni tsuite benkyō shite imasu.", vi: "Tôi đang học về văn hóa Nhật." },
          { jp: "この問題について話しましょう。", romaji: "Kono mondai ni tsuite hanashimashō.", vi: "Hãy nói về vấn đề này." },
        ],
      },
      {
        pattern: "N + によると",
        meaning: "theo ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "天気予報によると、明日は雨です。", romaji: "Tenki yohō ni yoru to, ashita wa ame desu.", vi: "Theo dự báo thời tiết, mai mưa." },
          { jp: "新聞によると、事件が起きた。", romaji: "Shinbun ni yoru to, jiken ga okita.", vi: "Theo báo, đã xảy ra sự việc." },
        ],
      },
    ],
  },
  {
    lessonNumber: 107,
    jlptLevel: 'N5',
    title: 'N5 · Ngữ pháp bổ sung (bài 6)',
    sortOrder: 1070,
    items: [
      {
        pattern: "V(辞書形) + という + N",
        meaning: "N mang tên / được gọi là ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "富士山という山が有名です。", romaji: "Fujisan to iu yama ga yūmei desu.", vi: "Núi tên là Fuji nổi tiếng." },
          { jp: "田中さんという人に会いました。", romaji: "Tanaka-san to iu hito ni aimashita.", vi: "Tôi gặp người tên Tanaka." },
        ],
      },
      {
        pattern: "V(普通形) + と思います",
        meaning: "tôi nghĩ rằng ~",
        formalityLevel: "polite",
        examples: [
          { jp: "明日は晴れると思います。", romaji: "Ashita wa hareru to omoimasu.", vi: "Tôi nghĩ mai trời nắng." },
          { jp: "彼は来ないと思います。", romaji: "Kare wa konai to omoimasu.", vi: "Tôi nghĩ anh ấy không đến." },
        ],
      },
      {
        pattern: "V(普通形) + と言いました",
        meaning: "đã nói rằng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "先生は勉強しなさいと言いました。", romaji: "Sensei wa benkyō shinasai to iimashita.", vi: "Thầy bảo hãy học." },
          { jp: "彼女は行きたいと言いました。", romaji: "Kanojo wa ikitai to iimashita.", vi: "Cô ấy nói muốn đi." },
        ],
      },
      {
        pattern: "V(普通形) + そうです (nghe nói)",
        meaning: "nghe nói là ~",
        formalityLevel: "polite",
        examples: [
          { jp: "明日は雪が降るそうです。", romaji: "Ashita wa yuki ga furu sō desu.", vi: "Nghe nói mai có tuyết." },
          { jp: "彼は結婚したそうです。", romaji: "Kare wa kekkon shita sō desu.", vi: "Nghe nói anh ấy đã kết hôn." },
        ],
      },
      {
        pattern: "V(ます) + そうです (nhìn thấy)",
        meaning: "trông có vẻ sắp ~",
        formalityLevel: "polite",
        examples: [
          { jp: "雨が降りそうです。", romaji: "Ame ga furisō desu.", vi: "Trông có vẻ sắp mưa." },
          { jp: "おいしそうです。", romaji: "Oishisō desu.", vi: "Trông có vẻ ngon." },
        ],
      },
      {
        pattern: "V(普通形) + らしい",
        meaning: "hình như ~ (suy đoán)",
        formalityLevel: "neutral",
        examples: [
          { jp: "彼は忙しいらしい。", romaji: "Kare wa isogashii rashii.", vi: "Hình như anh ấy bận." },
          { jp: "試験は難しかったらしい。", romaji: "Shiken wa muzukashikatta rashii.", vi: "Hình như bài thi khó." },
        ],
      },
      {
        pattern: "V(普通形) + ようだ / みたいだ",
        meaning: "dường như ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "彼は疲れたようだ。", romaji: "Kare wa tsukareta yō da.", vi: "Anh ấy dường như mệt." },
          { jp: "雨が降るみたいです。", romaji: "Ame ga furu mitai desu.", vi: "Dường như sắp mưa." },
        ],
      },
      {
        pattern: "V(ば) + ～",
        meaning: "nếu ~ thì ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "早く起きれば、間に合います。", romaji: "Hayaku okireba, maniaimasu.", vi: "Nếu dậy sớm thì kịp." },
          { jp: "安ければ、買います。", romaji: "Yasukereba, kaimasu.", vi: "Nếu rẻ thì mua." },
        ],
      },
    ],
  },
  {
    lessonNumber: 108,
    jlptLevel: 'N5',
    title: 'N5 · Ngữ pháp bổ sung (bài 7)',
    sortOrder: 1080,
    items: [
      {
        pattern: "V(て) + も",
        meaning: "dù ~ cũng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "何回説明しても、わかりません。", romaji: "Nankai setsumei shite mo, wakarimasen.", vi: "Dù giải thích bao lần cũng không hiểu." },
          { jp: "雨が降っても、行きます。", romaji: "Ame ga futte mo, ikimasu.", vi: "Dù mưa cũng đi." },
        ],
      },
      {
        pattern: "V(て) + しまう",
        meaning: "vô tình / hoàn toàn ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "鍵を忘れてしまいました。", romaji: "Kagi o wasurete shimaimashita.", vi: "Lỡ quên chìa khóa." },
          { jp: "全部食べてしまった。", romaji: "Zenbu tabete shimatta.", vi: "Ăn hết sạch rồi." },
        ],
      },
      {
        pattern: "V(て) + おく",
        meaning: "làm ~ trước (chuẩn bị)",
        formalityLevel: "neutral",
        examples: [
          { jp: "チケットを買っておきます。", romaji: "Chiketto o katte okimasu.", vi: "Tôi mua vé trước." },
          { jp: "資料を読んでおいてください。", romaji: "Shiryō o yonde oite kudasai.", vi: "Hãy đọc tài liệu trước." },
        ],
      },
      {
        pattern: "V(て) + みる",
        meaning: "thử ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "一度やってみてください。", romaji: "Ichido yatte mite kudasai.", vi: "Hãy thử làm một lần." },
          { jp: "この料理を食べてみました。", romaji: "Kono ryōri o tabete mimashita.", vi: "Tôi đã thử ăn món này." },
        ],
      },
      {
        pattern: "V(て) + あげる / くれる / もらう",
        meaning: "cho / được cho",
        formalityLevel: "neutral",
        examples: [
          { jp: "友達に本を貸してあげました。", romaji: "Tomodachi ni hon o kashite agemashita.", vi: "Tôi cho bạn mượn sách." },
          { jp: "母が料理を作ってくれました。", romaji: "Haha ga ryōri o tsukutte kuremashita.", vi: "Mẹ nấu ăn cho tôi." },
        ],
      },
      {
        pattern: "V(意向形) + と思っています",
        meaning: "định ~",
        formalityLevel: "polite",
        examples: [
          { jp: "来年、留学しようと思っています。", romaji: "Rainen, ryūgaku shiyō to omotte imasu.", vi: "Tôi định đi du học năm sau." },
          { jp: "週末は海に行こうと思っています。", romaji: "Shūmatsu wa umi ni ikō to omotte imasu.", vi: "Cuối tuần tôi định đi biển." },
        ],
      },
      {
        pattern: "V(辞書形) + ことにします",
        meaning: "quyết định ~",
        formalityLevel: "polite",
        examples: [
          { jp: "毎日運動することにしました。", romaji: "Mainichi undō suru koto ni shimashita.", vi: "Tôi quyết định tập thể dục mỗi ngày." },
          { jp: "タバコをやめることにします。", romaji: "Tabako o yameru koto ni shimasu.", vi: "Tôi quyết định bỏ thuốc." },
        ],
      },
      {
        pattern: "V(辞書形) + ことがあります",
        meaning: "đôi khi ~",
        formalityLevel: "polite",
        examples: [
          { jp: "夜、遅くまで起きていることがあります。", romaji: "Yoru, osoku made okite iru koto ga arimasu.", vi: "Đôi khi tôi thức khuya." },
          { jp: "映画を見に行くことがあります。", romaji: "Eiga o mi ni iku koto ga arimasu.", vi: "Đôi khi tôi đi xem phim." },
        ],
      },
    ],
  },
  {
    lessonNumber: 109,
    jlptLevel: 'N5',
    title: 'N5 · Ngữ pháp bổ sung (bài 8)',
    sortOrder: 1090,
    items: [
      {
        pattern: "V(辞書形) + ほうがいい",
        meaning: "nên ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "もっと野菜を食べたほうがいいです。", romaji: "Motto yasai o tabeta hō ga ii desu.", vi: "Nên ăn nhiều rau hơn." },
          { jp: "早く寝たほうがいい。", romaji: "Hayaku neta hō ga ii.", vi: "Nên ngủ sớm." },
        ],
      },
      {
        pattern: "V(辞書形) + つもりです",
        meaning: "dự định ~",
        formalityLevel: "polite",
        examples: [
          { jp: "大学を卒業したら、働くつもりです。", romaji: "Daigaku o sotsugyō shitara, hataraku tsumori desu.", vi: "Sau khi tốt nghiệp đại học tôi dự định làm việc." },
          { jp: "来月、引っ越すつもりです。", romaji: "Raigetsu, hikkosu tsumori desu.", vi: "Tháng sau tôi dự định chuyển nhà." },
        ],
      },
      {
        pattern: "V(辞書形) + やすい / にくい",
        meaning: "dễ / khó ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "この本は読みやすいです。", romaji: "Kono hon wa yomiyasui desu.", vi: "Sách này dễ đọc." },
          { jp: "この字は覚えにくい。", romaji: "Kono ji wa oboenikui.", vi: "Chữ này khó nhớ." },
        ],
      },
      {
        pattern: "V(ます) + ながら",
        meaning: "vừa ~ vừa ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "音楽を聞きながら、勉強します。", romaji: "Ongaku o kikinagara, benkyō shimasu.", vi: "Vừa nghe nhạc vừa học." },
          { jp: "歩きながら、電話しました。", romaji: "Arukinagara, denwa shimashita.", vi: "Vừa đi bộ vừa gọi điện." },
        ],
      },
      {
        pattern: "V(辞書形) + ために",
        meaning: "để ~ (mục đích)",
        formalityLevel: "neutral",
        examples: [
          { jp: "健康のために、運動しています。", romaji: "Kenkō no tame ni, undō shite imasu.", vi: "Vì sức khỏe tôi tập thể dục." },
          { jp: "試験に合格するために、勉強します。", romaji: "Shiken ni gōkaku suru tame ni, benkyō shimasu.", vi: "Để thi đỗ tôi học." },
        ],
      },
      {
        pattern: "V(普通形) + かどうか",
        meaning: "liệu có ~ hay không",
        formalityLevel: "neutral",
        examples: [
          { jp: "彼が来るかどうか、わかりません。", romaji: "Kare ga kuru ka dō ka, wakarimasen.", vi: "Không biết anh ấy có đến không." },
          { jp: "この方法が正しいかどうか確認します。", romaji: "Kono hōhō ga tadashii ka dō ka kakunin shimasu.", vi: "Kiểm tra xem cách này đúng không." },
        ],
      },
      {
        pattern: "お/ご + N + する (kính ngữ cơ bản)",
        meaning: "kính ngữ với hành động",
        formalityLevel: "formal",
        examples: [
          { jp: "先生がお話しになりました。", romaji: "Sensei ga ohanashi ni narimashita.", vi: "Thầy đã nói (kính ngữ)." },
          { jp: "社長がお見えになりました。", romaji: "Shachō ga omie ni narimashita.", vi: "Giám đốc đã đến (kính ngữ)." },
        ],
      },
      {
        pattern: "N + を + V(他動詞)",
        meaning: "tân ngữ + động từ",
        formalityLevel: "neutral",
        examples: [
          { jp: "ご飯を食べます。", romaji: "Gohan o tabemasu.", vi: "Tôi ăn cơm." },
          { jp: "手紙を書きます。", romaji: "Tegami o kakimasu.", vi: "Tôi viết thư." },
        ],
      },
    ],
  },
  {
    lessonNumber: 112,
    jlptLevel: 'N4',
    title: 'N4 · Ngữ pháp bổ sung (bài 1)',
    sortOrder: 1120,
    items: [
      {
        pattern: "V(可能形)",
        meaning: "có thể ~ (thể khả năng)",
        formalityLevel: "neutral",
        examples: [
          { jp: "この字が読めます。", romaji: "Kono ji ga yomemasu.", vi: "Đọc được chữ này." },
          { jp: "一人で料理ができます。", romaji: "Hitori de ryōri ga dekimasu.", vi: "Có thể nấu ăn một mình." },
        ],
      },
      {
        pattern: "V(受身)",
        meaning: "bị ~ / được ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "弟にケーキを食べられました。", romaji: "Otōto ni kēki o taberaremashita.", vi: "Bánh bị em ăn mất." },
          { jp: "この本は多くの人に読まれています。", romaji: "Kono hon wa ōku no hito ni yomarete imasu.", vi: "Sách này được nhiều người đọc." },
        ],
      },
      {
        pattern: "V(使役)",
        meaning: "bắt / cho phép ai ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "母は子供に野菜を食べさせます。", romaji: "Haha wa kodomo ni yasai o tabesasemasu.", vi: "Mẹ bắt con ăn rau." },
          { jp: "先生は学生に本を読ませました。", romaji: "Sensei wa gakusei ni hon o yomasemashita.", vi: "Thầy cho học sinh đọc sách." },
        ],
      },
      {
        pattern: "V(使役受身)",
        meaning: "bị bắt ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "上司に残業させられました。", romaji: "Jōshi ni zangyō saseraremashita.", vi: "Bị sếp bắt làm thêm giờ." },
          { jp: "毎日、運動させられています。", romaji: "Mainichi, undō saserarete imasu.", vi: "Mỗi ngày bị bắt tập thể dục." },
        ],
      },
      {
        pattern: "V(て) + いる (trạng thái kết quả)",
        meaning: "đang ở trạng thái ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "窓が開いています。", romaji: "Mado ga aite imasu.", vi: "Cửa sổ đang mở." },
          { jp: "結婚しています。", romaji: "Kekkon shite imasu.", vi: "Đã kết hôn (trạng thái)." },
        ],
      },
      {
        pattern: "V(て) + ある",
        meaning: "đã được ~ (kết quả)",
        formalityLevel: "neutral",
        examples: [
          { jp: "壁に絵が掛けてあります。", romaji: "Kabe ni e ga kakete arimasu.", vi: "Trên tường có treo tranh." },
          { jp: "準備がしてあります。", romaji: "Junbi ga shite arimasu.", vi: "Đã chuẩn bị sẵn." },
        ],
      },
      {
        pattern: "V(て) + くる / いく",
        meaning: "dần ~ / tiếp tục ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "だんだん暖かくなってきました。", romaji: "Dandan atatakaku natte kimashita.", vi: "Dần ấm lên." },
          { jp: "これから忙しくなっていきます。", romaji: "Kore kara isogashiku natte ikimasu.", vi: "Từ giờ sẽ bận dần." },
        ],
      },
      {
        pattern: "V(て) + しまう (tiếc nuối)",
        meaning: "lỡ ~ mất",
        formalityLevel: "neutral",
        examples: [
          { jp: "大切な物をなくしてしまいました。", romaji: "Taisetsu na mono o nakushite shimaimashita.", vi: "Lỡ làm mất đồ quan trọng." },
          { jp: "寝坊してしまいました。", romaji: "Nebō shite shimaimashita.", vi: "Lỡ ngủ quên." },
        ],
      },
      {
        pattern: "V(て) + おく (chuẩn bị)",
        meaning: "làm sẵn ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "会議の資料をコピーしておきました。", romaji: "Kaigi no shiryō o kopī shite okimashita.", vi: "Đã photocopy tài liệu họp sẵn." },
          { jp: "明日の弁当を作っておきます。", romaji: "Ashita no bentō o tsukutte okimasu.", vi: "Làm cơm hộp ngày mai sẵn." },
        ],
      },
    ],
  },
  {
    lessonNumber: 113,
    jlptLevel: 'N4',
    title: 'N4 · Ngữ pháp bổ sung (bài 2)',
    sortOrder: 1130,
    items: [
      {
        pattern: "V(て) + みる (thử)",
        meaning: "thử ~ xem",
        formalityLevel: "neutral",
        examples: [
          { jp: "着てみてもいいですか。", romaji: "Kite mite mo ii desu ka.", vi: "Thử mặc được không?" },
          { jp: "このソフトを使ってみました。", romaji: "Kono sofuto o tsukatte mimashita.", vi: "Tôi đã thử dùng phần mềm này." },
        ],
      },
      {
        pattern: "V(て) + ください (yêu cầu liên tục)",
        meaning: "hãy ~ (nhờ vả)",
        formalityLevel: "polite",
        examples: [
          { jp: "この書類に署名してください。", romaji: "Kono shorui ni shomei shite kudasai.", vi: "Hãy ký vào giấy tờ này." },
          { jp: "もう少し待ってください。", romaji: "Mō sukoshi matte kudasai.", vi: "Hãy đợi thêm chút." },
        ],
      },
      {
        pattern: "V(ない) + ほうがいい",
        meaning: "không nên ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "無理をしないほうがいいです。", romaji: "Muri o shinai hō ga ii desu.", vi: "Không nên gượng." },
          { jp: "夜遅く食べないほうがいい。", romaji: "Yoru osoku tabenai hō ga ii.", vi: "Không nên ăn khuya." },
        ],
      },
      {
        pattern: "V(た) + ことがある",
        meaning: "đã từng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "富士山に登ったことがあります。", romaji: "Fujisan ni nobotta koto ga arimasu.", vi: "Tôi đã từng leo Fuji." },
          { jp: "一度も行ったことがない。", romaji: "Ichido mo itta koto ga nai.", vi: "Chưa từng đi lần nào." },
        ],
      },
      {
        pattern: "V(た) + ば + よかった",
        meaning: "đáng lẽ nên ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "もっと勉強すればよかった。", romaji: "Motto benkyō sureba yokatta.", vi: "Đáng lẽ nên học nhiều hơn." },
          { jp: "傘を持って行けばよかった。", romaji: "Kasa o motte ikeba yokatta.", vi: "Đáng lẽ nên mang ô." },
        ],
      },
      {
        pattern: "V(た) + ところ",
        meaning: "vừa mới ~ xong",
        formalityLevel: "neutral",
        examples: [
          { jp: "今、着いたところです。", romaji: "Ima, tsuita tokoro desu.", vi: "Vừa mới đến." },
          { jp: "ご飯を食べたところです。", romaji: "Gohan o tabeta tokoro desu.", vi: "Vừa ăn cơm xong." },
        ],
      },
      {
        pattern: "V(る) + ところ",
        meaning: "sắp ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "今から出かけるところです。", romaji: "Ima kara dekakeru tokoro desu.", vi: "Sắp ra ngoài." },
          { jp: "会議が始まるところです。", romaji: "Kaigi ga hajimaru tokoro desu.", vi: "Họp sắp bắt đầu." },
        ],
      },
      {
        pattern: "V(ている) + ところ",
        meaning: "đang ~ (ngay lúc này)",
        formalityLevel: "neutral",
        examples: [
          { jp: "今、料理をしているところです。", romaji: "Ima, ryōri o shite iru tokoro desu.", vi: "Đang nấu ăn." },
          { jp: "レポートを書いているところです。", romaji: "Repōto o kaite iru tokoro desu.", vi: "Đang viết báo cáo." },
        ],
      },
      {
        pattern: "V(辞書形) + はずだ",
        meaning: "chắc hẳn ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "彼はもう着いたはずです。", romaji: "Kare wa mō tsuita hazu desu.", vi: "Anh ấy chắc đã đến rồi." },
          { jp: "この薬は効くはずだ。", romaji: "Kono kusuri wa kiku hazu da.", vi: "Thuốc này chắc có tác dụng." },
        ],
      },
    ],
  },
  {
    lessonNumber: 114,
    jlptLevel: 'N4',
    title: 'N4 · Ngữ pháp bổ sung (bài 3)',
    sortOrder: 1140,
    items: [
      {
        pattern: "V(辞書形) + べきだ",
        meaning: "nên ~ (moral)",
        formalityLevel: "formal",
        examples: [
          { jp: "約束は守るべきだ。", romaji: "Yakusoku wa mamoru beki da.", vi: "Nên giữ lời hứa." },
          { jp: "もっと環境を考えるべきです。", romaji: "Motto kankyō o kangaeru beki desu.", vi: "Nên quan tâm môi trường hơn." },
        ],
      },
      {
        pattern: "V(辞書形) + かもしれない",
        meaning: "có thể ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "明日は雨かもしれません。", romaji: "Ashita wa ame kamoshiremasen.", vi: "Mai có thể mưa." },
          { jp: "彼は知らないかもしれない。", romaji: "Kare wa shiranai kamoshirenai.", vi: "Anh ấy có thể không biết." },
        ],
      },
      {
        pattern: "V(辞書形) + わけではない",
        meaning: "không hẳn là ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "嫌いなわけではありません。", romaji: "Kirai na wake dewa arimasen.", vi: "Không hẳn là ghét." },
          { jp: "行きたくないわけではない。", romaji: "Ikitakunai wake dewa nai.", vi: "Không phải là không muốn đi." },
        ],
      },
      {
        pattern: "V(辞書形) + わけがない",
        meaning: "không thể nào ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "そんなことがあるわけがない。", romaji: "Sonna koto ga aru wake ga nai.", vi: "Không thể có chuyện đó." },
          { jp: "彼が嘘をつくわけがない。", romaji: "Kare ga uso o tsuku wake ga nai.", vi: "Anh ấy không thể nói dối." },
        ],
      },
      {
        pattern: "V(普通形) + ので / から",
        meaning: "vì ~ nên ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "雨なので、出かけません。", romaji: "Ame na node, dekakemasen.", vi: "Vì mưa nên không ra ngoài." },
          { jp: "忙しいから、行けません。", romaji: "Isogashii kara, ikemasen.", vi: "Vì bận nên không đi được." },
        ],
      },
      {
        pattern: "V(普通形) + のに",
        meaning: "mặc dù ~ mà ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "勉強したのに、試験に落ちた。", romaji: "Benkyō shita noni, shiken ni ochita.", vi: "Mặc dù học mà vẫn trượt." },
          { jp: "約束したのに、来なかった。", romaji: "Yakusoku shita noni, konakatta.", vi: "Mặc dù hứa mà không đến." },
        ],
      },
      {
        pattern: "V(普通形) + けれど / けど",
        meaning: "tuy ~ nhưng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "高いけれど、買いました。", romaji: "Takai keredo, kaimashita.", vi: "Tuy đắt nhưng đã mua." },
          { jp: "行きたいけど、時間がない。", romaji: "Ikitai kedo, jikan ga nai.", vi: "Muốn đi nhưng không có thời gian." },
        ],
      },
      {
        pattern: "V(普通形) + し",
        meaning: "vì ~ và ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "この店は安いし、おいしいし、人気です。", romaji: "Kono mise wa yasui shi, oishii shi, ninki desu.", vi: "Quán vừa rẻ vừa ngon nên nổi tiếng." },
          { jp: "時間もないし、お金もない。", romaji: "Jikan mo nai shi, okane mo nai.", vi: "Không có thời gian lẫn tiền." },
        ],
      },
    ],
  },
  {
    lessonNumber: 115,
    jlptLevel: 'N4',
    title: 'N4 · Ngữ pháp bổ sung (bài 4)',
    sortOrder: 1150,
    items: [
      {
        pattern: "V(普通形) + なら",
        meaning: "nếu là ~ thì ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "行くなら、早く行ったほうがいい。", romaji: "Iku nara, hayaku itta hō ga ii.", vi: "Nếu đi thì nên đi sớm." },
          { jp: "日本語なら、少し話せます。", romaji: "Nihongo nara, sukoshi hanasemasu.", vi: "Nếu là tiếng Nhật thì nói được chút." },
        ],
      },
      {
        pattern: "V(普通形) + たら",
        meaning: "nếu / khi ~ thì ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "暇だったら、手伝ってください。", romaji: "Hima dattara, tetsudatte kudasai.", vi: "Nếu rảnh hãy giúp." },
          { jp: "着いたら、電話してください。", romaji: "Tsuitara, denwa shite kudasai.", vi: "Khi đến hãy gọi điện." },
        ],
      },
      {
        pattern: "V(普通形) + ても",
        meaning: "dù ~ cũng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "何を言っても、聞いてくれない。", romaji: "Nani o itte mo, kiite kurenai.", vi: "Dù nói gì cũng không nghe." },
          { jp: "何回行っても、覚えられない。", romaji: "Nankai itte mo, oboerarenai.", vi: "Dù đi bao lần cũng không nhớ." },
        ],
      },
      {
        pattern: "V(普通形) + ば + いい",
        meaning: "chỉ cần ~ là được",
        formalityLevel: "neutral",
        examples: [
          { jp: "聞けばいいです。", romaji: "Kikeba ii desu.", vi: "Cứ hỏi là được." },
          { jp: "早く寝ればいい。", romaji: "Hayaku nereba ii.", vi: "Ngủ sớm là được." },
        ],
      },
      {
        pattern: "V(普通形) + ば + よかった",
        meaning: "nếu ~ thì tốt rồi",
        formalityLevel: "neutral",
        examples: [
          { jp: "もっと早く来ればよかった。", romaji: "Motto hayaku kureba yokatta.", vi: "Đến sớm hơn thì tốt rồi." },
          { jp: "予約すればよかった。", romaji: "Yoyaku sureba yokatta.", vi: "Đặt trước thì tốt rồi." },
        ],
      },
      {
        pattern: "A(い) + すぎる / V(ます) + すぎる",
        meaning: "quá ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "この服は大きすぎます。", romaji: "Kono fuku wa ōkisugimasu.", vi: "Quần áo này quá rộng." },
          { jp: "食べすぎました。", romaji: "Tabesugimashita.", vi: "Ăn quá nhiều." },
        ],
      },
      {
        pattern: "V(辞書形) + 出す",
        meaning: "bắt đầu đột ngột ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "急に雨が降り出した。", romaji: "Kyuu ni ame ga furidashita.", vi: "Đột nhiên trời bắt đầu mưa." },
          { jp: "子供が泣き出した。", romaji: "Kodomo ga nakidashita.", vi: "Đứa trẻ bắt đầu khóc." },
        ],
      },
      {
        pattern: "V(ます) + 続ける",
        meaning: "tiếp tục ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "三時間走り続けました。", romaji: "Sanjikan hashiritsuzukemashita.", vi: "Chạy liên tục ba tiếng." },
          { jp: "勉強し続けてください。", romaji: "Benkyō shitsuzukete kudasai.", vi: "Hãy tiếp tục học." },
        ],
      },
    ],
  },
  {
    lessonNumber: 116,
    jlptLevel: 'N4',
    title: 'N4 · Ngữ pháp bổ sung (bài 5)',
    sortOrder: 1160,
    items: [
      {
        pattern: "V(ます) + 直す",
        meaning: "làm lại ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "書き直してください。", romaji: "Kakinaoshite kudasai.", vi: "Hãy viết lại." },
          { jp: "考え直す必要がある。", romaji: "Kangaenaosu hitsuyō ga aru.", vi: "Cần suy nghĩ lại." },
        ],
      },
      {
        pattern: "V(ます) + 切る",
        meaning: "làm hết ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "本を読み切りました。", romaji: "Hon o yomikirimashita.", vi: "Đọc hết sách." },
          { jp: "使い切ってください。", romaji: "Tsukaikitte kudasai.", vi: "Hãy dùng hết." },
        ],
      },
      {
        pattern: "V(ます) + 切れない",
        meaning: "không thể ~ hết",
        formalityLevel: "neutral",
        examples: [
          { jp: "食べ切れませんでした。", romaji: "Tabekiremasen deshita.", vi: "Không ăn hết được." },
          { jp: "一人では運べ切れない。", romaji: "Hitori dewa hakobekirenai.", vi: "Một mình không vác hết được." },
        ],
      },
      {
        pattern: "N + によって / により",
        meaning: "tùy theo ~",
        formalityLevel: "formal",
        examples: [
          { jp: "人によって意見が違います。", romaji: "Hito ni yotte iken ga chigaimasu.", vi: "Tùy người mà ý kiến khác nhau." },
          { jp: "法律により禁止されています。", romaji: "Hōritsu ni yotte kinshi sarete imasu.", vi: "Bị cấm theo luật." },
        ],
      },
      {
        pattern: "N + に対して",
        meaning: "đối với ~",
        formalityLevel: "formal",
        examples: [
          { jp: "お客様に対して丁寧に対応します。", romaji: "Okyakusama ni taishite teinei ni taiō shimasu.", vi: "Đối xử lịch sự với khách." },
          { jp: "子供に対して厳しすぎる。", romaji: "Kodomo ni taishite kibishisugiru.", vi: "Quá nghiêm với trẻ." },
        ],
      },
      {
        pattern: "N + にとって",
        meaning: "đối với ~ (quan điểm)",
        formalityLevel: "neutral",
        examples: [
          { jp: "私にとって家族が一番大切です。", romaji: "Watashi ni totte kazoku ga ichiban taisetsu desu.", vi: "Đối với tôi gia đình quan trọng nhất." },
          { jp: "彼にとっては問題ない。", romaji: "Kare ni totte wa mondai nai.", vi: "Đối với anh ấy không sao." },
        ],
      },
      {
        pattern: "N + として",
        meaning: "với tư cách ~",
        formalityLevel: "formal",
        examples: [
          { jp: "医者として働いています。", romaji: "Isha to shite hataraitе imasu.", vi: "Làm việc với tư cách bác sĩ." },
          { jp: "代表として出席します。", romaji: "Daihyō to shite shusseki shimasu.", vi: "Tham dự với tư cách đại diện." },
        ],
      },
      {
        pattern: "N + によって (tác giả)",
        meaning: "bởi ~",
        formalityLevel: "formal",
        examples: [
          { jp: "この小説は村上春樹によって書かれた。", romaji: "Kono shōsetsu wa Murakami Haruki ni yotte kakareta.", vi: "Tiểu thuyết này được viết bởi Murakami." },
          { jp: "新しい制度が導入された。", romaji: "Atarashii seido ga dōnyū sareta.", vi: "Hệ thống mới đã được đưa vào." },
        ],
      },
    ],
  },
  {
    lessonNumber: 117,
    jlptLevel: 'N4',
    title: 'N4 · Ngữ pháp bổ sung (bài 6)',
    sortOrder: 1170,
    items: [
      {
        pattern: "N + について (chủ đề)",
        meaning: "về ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "環境問題について考えましょう。", romaji: "Kankyō mondai ni tsuite kangaemashō.", vi: "Hãy suy nghĩ về vấn đề môi trường." },
          { jp: "詳しく説明してください。", romaji: "Kuwashiku setsumei shite kudasai.", vi: "Hãy giải thích chi tiết." },
        ],
      },
      {
        pattern: "N + に関して",
        meaning: "liên quan đến ~",
        formalityLevel: "formal",
        examples: [
          { jp: "この件に関して質問があります。", romaji: "Kono ken ni kanshite shitsumon ga arimasu.", vi: "Có câu hỏi liên quan việc này." },
          { jp: "契約に関して相談したい。", romaji: "Keiyaku ni kanshite sōdan shitai.", vi: "Muốn trao đổi về hợp đồng." },
        ],
      },
      {
        pattern: "N + の代わりに",
        meaning: "thay vì ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "バスの代わりに、電車で行きます。", romaji: "Basu no kawari ni, densha de ikimasu.", vi: "Thay vì xe buýt đi bằng tàu." },
          { jp: "彼の代わりに行きます。", romaji: "Kare no kawari ni ikimasu.", vi: "Tôi đi thay anh ấy." },
        ],
      },
      {
        pattern: "N + 次第",
        meaning: "ngay khi ~",
        formalityLevel: "formal",
        examples: [
          { jp: "到着次第、連絡します。", romaji: "Tōchaku shidai, renraku shimasu.", vi: "Ngay khi đến sẽ liên lạc." },
          { jp: "準備ができ次第、始めます。", romaji: "Junbi ga dekishidai, hajimemasu.", vi: "Chuẩn bị xong sẽ bắt đầu." },
        ],
      },
      {
        pattern: "V(ます) + 方",
        meaning: "cách ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "この料理の作り方を教えてください。", romaji: "Kono ryōri no tsukurikata o oshiete kudasai.", vi: "Hãy dạy cách nấu món này." },
          { jp: "使い方がわかりません。", romaji: "Tsukaikata ga wakarimasen.", vi: "Không biết cách dùng." },
        ],
      },
      {
        pattern: "V(ます) + やすい / にくい",
        meaning: "dễ / khó ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "このペンは書きやすい。", romaji: "Kono pen wa kakiyasui.", vi: "Bút này dễ viết." },
          { jp: "信じにくい話だ。", romaji: "Shinj inikui hanashi da.", vi: "Chuyện khó tin." },
        ],
      },
      {
        pattern: "V(ます) + たがる",
        meaning: "muốn ~ (của người khác)",
        formalityLevel: "neutral",
        examples: [
          { jp: "子供が公園に行きたがっています。", romaji: "Kodomo ga kōen ni ikitagatte imasu.", vi: "Con muốn đi công viên." },
          { jp: "彼女は新しい服を買いたがっている。", romaji: "Kanojo wa atarashii fuku o kaitagatte iru.", vi: "Cô ấy muốn mua quần áo mới." },
        ],
      },
      {
        pattern: "V(ます) + そうにない",
        meaning: "không có vẻ sẽ ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "雨は降りそうにない。", romaji: "Ame wa furisō ni nai.", vi: "Không có vẻ sẽ mưa." },
          { jp: "成功しそうにない。", romaji: "Seikō shisō ni nai.", vi: "Không có vẻ sẽ thành công." },
        ],
      },
    ],
  },
  {
    lessonNumber: 118,
    jlptLevel: 'N4',
    title: 'N4 · Ngữ pháp bổ sung (bài 7)',
    sortOrder: 1180,
    items: [
      {
        pattern: "V(ます) + っぱなし",
        meaning: "để nguyên ~",
        formalityLevel: "spoken",
        examples: [
          { jp: "ドアを開けっぱなしにしないで。", romaji: "Doa o akeppanashi ni shinaide.", vi: "Đừng để cửa mở mãi." },
          { jp: "テレビをつけっぱなしで寝た。", romaji: "Terebi o tsukeppanashi de neta.", vi: "Ngủ quên bật TV." },
        ],
      },
      {
        pattern: "V(ます) + まくる",
        meaning: "làm ~ liên tục (slang)",
        formalityLevel: "spoken",
        examples: [
          { jp: "ゲームをやりまくった。", romaji: "Gēmu o yarimakutta.", vi: "Chơi game suốt." },
          { jp: "文句を言いまくる。", romaji: "Monku o iimakuru.", vi: "Cằn nhằn suốt." },
        ],
      },
      {
        pattern: "V(辞書形) + 最中に",
        meaning: "ngay lúc đang ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "食事の最中に電話が鳴った。", romaji: "Shokuji no saichū ni denwa ga natta.", vi: "Ngay lúc đang ăn chuông reo." },
          { jp: "出かける最中に雨が降った。", romaji: "Dekakeru saichū ni ame ga futta.", vi: "Lúc sắp ra ngoài thì mưa." },
        ],
      },
      {
        pattern: "V(辞書形) + うちに",
        meaning: "trong lúc ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "若いうちに、たくさん旅行したほうがいい。", romaji: "Wakai uchi ni, takusan ryokō shita hō ga ii.", vi: "Nên đi du lịch nhiều khi còn trẻ." },
          { jp: "明るいうちに帰りましょう。", romaji: "Akarui uchi ni kaerimashō.", vi: "Về khi còn sáng." },
        ],
      },
      {
        pattern: "V(辞書形) + あいだに",
        meaning: "trong lúc ~ thì ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "シャワーを浴びているあいだに、配達が来た。", romaji: "Shawā o abite iru aida ni, haitatsu ga kita.", vi: "Lúc đang tắm thì giao hàng đến." },
          { jp: "出かけているあいだに、盗まれた。", romaji: "Dekakete iru aida ni, nusumareta.", vi: "Lúc ra ngoài thì bị trộm." },
        ],
      },
      {
        pattern: "V(辞書形) + おかげで",
        meaning: "nhờ ~ (tích cực)",
        formalityLevel: "neutral",
        examples: [
          { jp: "先生のおかげで、合格できました。", romaji: "Sensei no okage de, gōkaku dekimashita.", vi: "Nhờ thầy mà đỗ." },
          { jp: "天気のおかげで、楽しめた。", romaji: "Tenki no okage de, tanoshimeta.", vi: "Nhờ thời tiết đẹp mà vui." },
        ],
      },
      {
        pattern: "V(辞書形) + せいで",
        meaning: "tại vì ~ (tiêu cực)",
        formalityLevel: "neutral",
        examples: [
          { jp: "寝坊したせいで、遅刻した。", romaji: "Nebō shita sei de, chikoku shita.", vi: "Vì ngủ quên mà đi trễ." },
          { jp: "彼のせいで失敗した。", romaji: "Kare no sei de shippai shita.", vi: "Vì anh ấy mà thất bại." },
        ],
      },
      {
        pattern: "V(辞書形) + くせに",
        meaning: "mà lại ~ (trách móc)",
        formalityLevel: "spoken",
        examples: [
          { jp: "知っているくせに、教えてくれない。", romaji: "Shitte iru kuse ni, oshiete kurenai.", vi: "Biết mà không chịu dạy." },
          { jp: "約束したくせに、来ない。", romaji: "Yakusoku shita kuse ni, konai.", vi: "Hứa rồi mà không đến." },
        ],
      },
    ],
  },
  {
    lessonNumber: 312,
    jlptLevel: 'N3',
    title: 'N3 · Ngữ pháp bổ sung (bài 1)',
    sortOrder: 3120,
    items: [
      {
        pattern: "V(普通形) + ように",
        meaning: "để ~ (kết quả không chủ ý)",
        formalityLevel: "neutral",
        examples: [
          { jp: "忘れないようにメモしました。", romaji: "Wasurenai yō ni memo shimashita.", vi: "Ghi chú để khỏi quên." },
          { jp: "後ろの人にも聞こえるように話した。", romaji: "Ushiro no hito ni mo kikoeru yō ni hanashita.", vi: "Nói to để người sau nghe được." },
        ],
      },
      {
        pattern: "V(普通形) + ようにする / ようになる",
        meaning: "cố gắng ~ / trở nên ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "毎日運動するようにしています。", romaji: "Mainichi undō suru yō ni shite imasu.", vi: "Tôi cố tập thể dục mỗi ngày." },
          { jp: "日本語が話せるようになりました。", romaji: "Nihongo ga hanaseru yō ni narimashita.", vi: "Giờ nói được tiếng Nhật." },
        ],
      },
      {
        pattern: "V(普通形) + ために",
        meaning: "để ~ (mục đích có chủ ý)",
        formalityLevel: "neutral",
        examples: [
          { jp: "健康のために野菜を食べる。", romaji: "Kenkō no tame ni yasai o taberu.", vi: "Ăn rau vì sức khỏe." },
          { jp: "留学するために貯金している。", romaji: "Ryūgaku suru tame ni chokin shite iru.", vi: "Đang tiết kiệm để du học." },
        ],
      },
      {
        pattern: "V(た) + おかげで",
        meaning: "nhờ ~ (kết quả tốt)",
        formalityLevel: "neutral",
        examples: [
          { jp: "友達のおかげで助かった。", romaji: "Tomodachi no okage de tasukatta.", vi: "Nhờ bạn mà được cứu." },
          { jp: "天気が良かったおかげで、楽しめた。", romaji: "Tenki ga yokakatta okage de, tanoshimeta.", vi: "Nhờ trời đẹp mà chơi vui." },
        ],
      },
      {
        pattern: "V(普通形) + せいで",
        meaning: "tại vì ~ (kết quả xấu)",
        formalityLevel: "neutral",
        examples: [
          { jp: "道が込んでいたせいで遅れた。", romaji: "Michi ga konde ita sei de okureta.", vi: "Vì đường tắc nên trễ." },
          { jp: "不注意のせいで事故が起きた。", romaji: "Fuchūi no sei de jiko ga okita.", vi: "Vì bất cẩn mà xảy ra tai nạn." },
        ],
      },
      {
        pattern: "V/A/N(普通形) + ば + ～ほど",
        meaning: "càng ~ càng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "考えれば考えるほど混乱する。", romaji: "Kangaereba kangaeru hodo konran suru.", vi: "Càng nghĩ càng rối." },
          { jp: "練習すればするほど上手になる。", romaji: "Renshū sureba suru hodo jōzu ni naru.", vi: "Càng luyện càng giỏi." },
        ],
      },
      {
        pattern: "V(普通形) + ば + いいのに",
        meaning: "đáng lẽ ~ thì tốt",
        formalityLevel: "neutral",
        examples: [
          { jp: "もっと時間があればいいのに。", romaji: "Motto jikan ga areba ii noni.", vi: "Đáng lẽ có thêm thời gian thì tốt." },
          { jp: "雨が降らなければいいのに。", romaji: "Ame ga furanakereba ii noni.", vi: "Đáng lẽ không mưa thì tốt." },
        ],
      },
      {
        pattern: "V(普通形) + もの / もん",
        meaning: "vì ~ (biện minh)",
        formalityLevel: "spoken",
        examples: [
          { jp: "忙しいもの、行けないんです。", romaji: "Isogashii mono, ikenain desu.", vi: "Vì bận nên không đi được." },
          { jp: "子供だもの、仕方ない。", romaji: "Kodomo da mono, shikata nai.", vi: "Vì còn trẻ nên không sao." },
        ],
      },
    ],
  },
  {
    lessonNumber: 313,
    jlptLevel: 'N3',
    title: 'N3 · Ngữ pháp bổ sung (bài 2)',
    sortOrder: 3130,
    items: [
      {
        pattern: "V(普通形) + ものだ",
        meaning: "đương nhiên ~; thói quen xưa",
        formalityLevel: "neutral",
        examples: [
          { jp: "子供は元気なものだ。", romaji: "Kodomo wa genki na mono da.", vi: "Trẻ con đương nhiên khỏe." },
          { jp: "昔はよくこの店に来たものだ。", romaji: "Mukashi wa yoku kono mise ni kita mono da.", vi: "Ngày xưa hay ghé quán này." },
        ],
      },
      {
        pattern: "V(普通形) + ものではない",
        meaning: "không nên ~",
        formalityLevel: "formal",
        examples: [
          { jp: "人の悪口を言うものではない。", romaji: "Hito no waruguchi o iu mono dewa nai.", vi: "Không nên nói xấu người khác." },
          { jp: "そんなに無理をするものではありません。", romaji: "Sonna ni muri o suru mono dewa arimasen.", vi: "Không nên gượng như vậy." },
        ],
      },
      {
        pattern: "V(普通形) + ものか / もんか",
        meaning: "quyết không ~",
        formalityLevel: "spoken",
        examples: [
          { jp: "そんなこと、信じるものか。", romaji: "Sonna koto, shinjiru mono ka.", vi: "Sao tôi tin chuyện đó được." },
          { jp: "負けるもんか。", romaji: "Makeru mon ka.", vi: "Sao tôi thua được." },
        ],
      },
      {
        pattern: "V(普通形) + ことだ",
        meaning: "nên ~ (lời khuyên)",
        formalityLevel: "neutral",
        examples: [
          { jp: "もっと睡眠をとることだ。", romaji: "Motto suimin o toru koto da.", vi: "Nên ngủ đủ." },
          { jp: "一度専門家に相談することだ。", romaji: "Ichido senmonka ni sōdan suru koto da.", vi: "Nên hỏi chuyên gia một lần." },
        ],
      },
      {
        pattern: "V(普通形) + ことか",
        meaning: "biết bao ~!",
        formalityLevel: "neutral",
        examples: [
          { jp: "どれほど嬉しかったことか。", romaji: "Dore hodo ureshikatta koto ka.", vi: "Biết bao tôi vui!" },
          { jp: "何度困ったことか。", romaji: "Nando komatta koto ka.", vi: "Biết bao lần khó xử!" },
        ],
      },
      {
        pattern: "V(普通形) + ことはない",
        meaning: "không cần ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "心配することはありません。", romaji: "Shinpai suru koto wa arimasen.", vi: "Không cần lo." },
          { jp: "そんなに怒ることはない。", romaji: "Sonna ni okoru koto wa nai.", vi: "Không cần tức như vậy." },
        ],
      },
      {
        pattern: "V(普通形) + ことにはならない",
        meaning: "chưa chắc đã ~",
        formalityLevel: "formal",
        examples: [
          { jp: "謝ったからといって許されたことにはならない。", romaji: "Ayamatta kara to itte yurushita koto ni wa naranai.", vi: "Xin lỗi chưa chắc đã được tha." },
          { jp: "書いたから完成したことにはならない。", romaji: "Kaita kara kansei shita koto ni wa naranai.", vi: "Viết xong chưa chắc đã hoàn thành." },
        ],
      },
      {
        pattern: "V(普通形) + わけだ",
        meaning: "hèn chi ~; tất nhiên ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "彼が来ないわけだ、知らせていなかった。", romaji: "Kare ga konai wake da, shirasete inakatta.", vi: "Hèn chi anh ấy không đến, không báo mà." },
          { jp: "なるほど、そういうわけですね。", romaji: "Naruhodo, sō iu wake desu ne.", vi: "Ra vậy, thế là hợp lý." },
        ],
      },
    ],
  },
  {
    lessonNumber: 314,
    jlptLevel: 'N3',
    title: 'N3 · Ngữ pháp bổ sung (bài 3)',
    sortOrder: 3140,
    items: [
      {
        pattern: "V(普通形) + わけがない",
        meaning: "không thể ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "そんな高いものは買えるわけがない。", romaji: "Sonna takai mono wa kaeru wake ga nai.", vi: "Không thể mua đồ đắt như vậy." },
          { jp: "彼が嘘をつくわけがない。", romaji: "Kare ga uso o tsuku wake ga nai.", vi: "Anh ấy không thể nói dối." },
        ],
      },
      {
        pattern: "V(普通形) + わけにはいかない",
        meaning: "không thể ~ (ràng buộc)",
        formalityLevel: "neutral",
        examples: [
          { jp: "約束を破るわけにはいかない。", romaji: "Yakusoku o yaburu wake ni wa ikanai.", vi: "Không thể phá lời hứa." },
          { jp: "ここで諦めるわけにはいかない。", romaji: "Koko de akirameru wake ni wa ikanai.", vi: "Không thể bỏ cuộc ở đây." },
        ],
      },
      {
        pattern: "V(普通形) + わけではない",
        meaning: "không hẳn ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "行きたくないわけではない。", romaji: "Ikitakunai wake dewa nai.", vi: "Không phải là không muốn đi." },
          { jp: "反対するわけではありません。", romaji: "Hantai suru wake dewa arimasen.", vi: "Không hẳn là phản đối." },
        ],
      },
      {
        pattern: "V(普通形) + とは限らない",
        meaning: "chưa chắc ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "高いからといって美味しいとは限らない。", romaji: "Takai kara to itte oishii to wa kagiranai.", vi: "Đắt chưa chắc ngon." },
          { jp: "努力すれば必ず成功するとは限らない。", romaji: "Doryoku sureba kanarazu seikō suru to wa kagiranai.", vi: "Cố gắng chưa chắc thành công." },
        ],
      },
      {
        pattern: "V(普通形) + 一方だ",
        meaning: "càng ngày càng ~",
        formalityLevel: "formal",
        examples: [
          { jp: "物価は上がる一方だ。", romaji: "Bukka wa agaru ippō da.", vi: "Giá cả càng ngày càng tăng." },
          { jp: "状況は悪くなる一方だ。", romaji: "Jōkyō wa waruku naru ippō da.", vi: "Tình hình càng ngày càng xấu." },
        ],
      },
      {
        pattern: "V(普通形) + 一方で",
        meaning: "một mặt ~ mặt khác ~",
        formalityLevel: "formal",
        examples: [
          { jp: "都市化が進む一方で、過疎化も進んでいる。", romaji: "Toshika ga susumu ippō de, kasoka mo susunde iru.", vi: "Đô thị hóa tiến triển, đồng thời cũng có làng bị bỏ hoang." },
          { jp: "便利な一方で、ストレスも増えた。", romaji: "Benri na ippō de, sutoresu mo fueta.", vi: "Tiện lợi nhưng stress cũng tăng." },
        ],
      },
      {
        pattern: "V(普通形) + 最中に",
        meaning: "ngay giữa lúc ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "会議の最中に停電した。", romaji: "Kaigi no saichū ni teiden shita.", vi: "Giữa cuộc họp mất điện." },
          { jp: "食事の最中に知らせが来た。", romaji: "Shokuji no saichū ni shirase ga kita.", vi: "Đang ăn thì có tin." },
        ],
      },
      {
        pattern: "V(普通形) + 際に",
        meaning: "khi ~ (trang trọng)",
        formalityLevel: "formal",
        examples: [
          { jp: "お越しいただいた際に、資料をお渡しします。", romaji: "Okoshi itadaita sai ni, shiryō o owatashi shimasu.", vi: "Khi quý vị đến tôi sẽ giao tài liệu." },
          { jp: "海外に行く際には、保険に入ってください。", romaji: "Kaigai ni iku sai ni wa, hoken ni hatte kudasai.", vi: "Khi đi nước ngoài hãy mua bảo hiểm." },
        ],
      },
    ],
  },
  {
    lessonNumber: 315,
    jlptLevel: 'N3',
    title: 'N3 · Ngữ pháp bổ sung (bài 4)',
    sortOrder: 3150,
    items: [
      {
        pattern: "V(普通形) + うちに",
        meaning: "trong khi còn ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "忘れないうちに書き留めておこう。", romaji: "Wasurenai uchi ni kakitomete okō.", vi: "Ghi lại trước khi quên." },
          { jp: "明るいうちに帰ろう。", romaji: "Akarui uchi ni kaerō.", vi: "Về khi còn sáng." },
        ],
      },
      {
        pattern: "V(普通形) + たびに",
        meaning: "mỗi lần ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "この歌を聞くたびに、故郷を思い出す。", romaji: "Kono uta o kiku tabi ni, kokyō o omoidasu.", vi: "Mỗi lần nghe bài này nhớ quê." },
          { jp: "会うたびに元気そうだ。", romaji: "Au tabi ni genki sō da.", vi: "Mỗi lần gặp trông đều khỏe." },
        ],
      },
      {
        pattern: "V(普通形) + かけ",
        meaning: "đang ~ dở",
        formalityLevel: "neutral",
        examples: [
          { jp: "読みかけの本がある。", romaji: "Yomikake no hon ga aru.", vi: "Có sách đọc dở." },
          { jp: "書きかけのレポートを仕上げた。", romaji: "Kakikake no repōto o shiageta.", vi: "Hoàn thành báo cáo viết dở." },
        ],
      },
      {
        pattern: "V(普通形) + っこない",
        meaning: "không thể ~",
        formalityLevel: "spoken",
        examples: [
          { jp: "そんな高い山、登りっこない。", romaji: "Sonna takai yama, noborikkonai.", vi: "Núi cao thế không leo nổi." },
          { jp: "勝てっこない。", romaji: "Kattekkonai.", vi: "Không thể thắng." },
        ],
      },
      {
        pattern: "V(普通形) + 得る / 得ない",
        meaning: "có thể / không thể ~",
        formalityLevel: "formal",
        examples: [
          { jp: "想像し得る範囲内だ。", romaji: "Sōzō shieru han'i nai da.", vi: "Trong phạm vi có thể tưởng tượng." },
          { jp: "そんなことは起こり得ない。", romaji: "Sonna koto wa okori enai.", vi: "Chuyện đó không thể xảy ra." },
        ],
      },
      {
        pattern: "V(普通形) + かねる",
        meaning: "khó ~; không thể ~ (lịch sự từ chối)",
        formalityLevel: "formal",
        examples: [
          { jp: "そのご提案はお受けしかねます。", romaji: "Sono goteian wa oukeshi kanemasu.", vi: "Khó mà chấp nhận đề xuất đó." },
          { jp: "賛成しかねる点もある。", romaji: "Sansei shikaneru ten mo aru.", vi: "Cũng có điểm khó đồng ý." },
        ],
      },
      {
        pattern: "V(普通形) + かねない",
        meaning: "có thể ~ (xấu)",
        formalityLevel: "formal",
        examples: [
          { jp: "このままでは事故を起こしかねない。", romaji: "Kono mama dewa jiko o okoshikanenai.", vi: "Cứ thế này có thể gây tai nạn." },
          { jp: "信頼を失いかねない。", romaji: "Shinrai o ushinikanenai.", vi: "Có thể mất lòng tin." },
        ],
      },
      {
        pattern: "V(普通形) + きる / きれない",
        meaning: "làm hết ~ / không thể hết ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "全部食べきった。", romaji: "Zenbu tabekitta.", vi: "Ăn hết sạch." },
          { jp: "信じきれない。", romaji: "Shinjikirenai.", vi: "Không thể tin hết." },
        ],
      },
    ],
  },
  {
    lessonNumber: 316,
    jlptLevel: 'N3',
    title: 'N3 · Ngữ pháp bổ sung (bài 5)',
    sortOrder: 3160,
    items: [
      {
        pattern: "V(普通形) + 切れない",
        meaning: "không thể ~ hết",
        formalityLevel: "neutral",
        examples: [
          { jp: "使い切れない量だ。", romaji: "Tsukaikirenai ryō da.", vi: "Lượng không dùng hết." },
          { jp: "読み切れない本がある。", romaji: "Yomikirenai hon ga aru.", vi: "Có sách không đọc hết." },
        ],
      },
      {
        pattern: "V(普通形) + 抜く",
        meaning: "làm ~ hết mình",
        formalityLevel: "neutral",
        examples: [
          { jp: "彼は最後まで戦い抜いた。", romaji: "Kare wa saigo made tatakainukita.", vi: "Anh ấy chiến đấu đến cùng." },
          { jp: "考え抜いて決めた。", romaji: "Kangaenuite kimeta.", vi: "Suy nghĩ kỹ rồi quyết định." },
        ],
      },
      {
        pattern: "V(普通形) + 合う",
        meaning: "~ lẫn nhau",
        formalityLevel: "neutral",
        examples: [
          { jp: "助け合いましょう。", romaji: "Tasukeaimashō.", vi: "Hãy giúp nhau." },
          { jp: "意見が食い違っている。", romaji: "Iken ga kuchigatte iru.", vi: "Ý kiến bất đồng." },
        ],
      },
      {
        pattern: "V(普通形) + 直す",
        meaning: "làm lại ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "書き直す時間がない。", romaji: "Kakinaosu jikan ga nai.", vi: "Không có thời gian viết lại." },
          { jp: "やり直したい。", romaji: "Yarinaoshitai.", vi: "Muốn làm lại." },
        ],
      },
      {
        pattern: "V(普通形) + 通す",
        meaning: "làm ~ suốt",
        formalityLevel: "neutral",
        examples: [
          { jp: "最後まで走り通した。", romaji: "Saigo made hashiritsūshita.", vi: "Chạy suốt đến cuối." },
          { jp: "彼は言い通すタイプだ。", romaji: "Kare wa iitsūsu taipu da.", vi: "Anh ấy kiểu cứ khăng khăng nói cho bằng được." },
        ],
      },
      {
        pattern: "V(普通形) + 尽くす",
        meaning: "dốc hết ~",
        formalityLevel: "formal",
        examples: [
          { jp: "力を尽くす。", romaji: "Chikara o tsukusu.", vi: "Dốc hết sức." },
          { jp: "知恵を尽くしても解決しなかった。", romaji: "Chie o tsukushitemo kaiketsu shinakatta.", vi: "Dù hết mực suy nghĩ vẫn không giải quyết được." },
        ],
      },
      {
        pattern: "V(普通形) + 始める",
        meaning: "bắt đầu ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "雨が降り始めた。", romaji: "Ame ga furihajimeta.", vi: "Trời bắt đầu mưa." },
          { jp: "彼女は泣き始めた。", romaji: "Kanojo wa nakihajimeta.", vi: "Cô ấy bắt đầu khóc." },
        ],
      },
    ],
  },
  {
    lessonNumber: 418,
    jlptLevel: 'N2',
    title: 'N2 · Ngữ pháp bổ sung (bài 1)',
    sortOrder: 4180,
    items: [
      {
        pattern: "V(普通形) + に違いない",
        meaning: "chắc chắn ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "彼は知っているに違いない。", romaji: "Kare wa shitte iru ni chigainai.", vi: "Anh ấy chắc chắn biết." },
          { jp: "成功するに違いない。", romaji: "Seikō suru ni chigainai.", vi: "Chắc chắn sẽ thành công." },
        ],
      },
      {
        pattern: "V(普通形) + に決まっている",
        meaning: "chắc chắn ~ (tự tin)",
        formalityLevel: "spoken",
        examples: [
          { jp: "そんなの勝つに決まってる。", romaji: "Sonna no katsu ni kimatteru.", vi: "Thế đó chắc thắng." },
          { jp: "彼が来ないに決まっている。", romaji: "Kare ga konai ni kimatte iru.", vi: "Chắc chắn anh ấy không đến." },
        ],
      },
      {
        pattern: "V(普通形) + とも限らない",
        meaning: "chưa chắc ~",
        formalityLevel: "formal",
        examples: [
          { jp: "安いものが悪いとも限らない。", romaji: "Yasui mono ga warui to mo kagiranai.", vi: "Đồ rẻ chưa chắc xấu." },
          { jp: "経験があれば成功するとも限らない。", romaji: "Keiken ga areba seikō suru to mo kagiranai.", vi: "Có kinh nghiệm chưa chắc thành công." },
        ],
      },
      {
        pattern: "V(普通形) + ないものでもない",
        meaning: "không phải là không ~",
        formalityLevel: "formal",
        examples: [
          { jp: "やってみないものでもない。", romaji: "Yatte minai mono demo nai.", vi: "Thử thì cũng không phải là không được." },
          { jp: "彼なら解決できないものでもない。", romaji: "Kare nara kaiketsu dekinai mono demo nai.", vi: "Anh ấy không phải không giải quyết được." },
        ],
      },
    ],
  },
  {
    lessonNumber: 419,
    jlptLevel: 'N2',
    title: 'N2 · Ngữ pháp bổ sung (bài 2)',
    sortOrder: 4190,
    items: [
      {
        pattern: "V(普通形) + っこない",
        meaning: "không thể ~ (mạnh)",
        formalityLevel: "spoken",
        examples: [
          { jp: "そんなこと、できっこない。", romaji: "Sonna koto, dekikkonai.", vi: "Chuyện đó không thể làm được." },
          { jp: "勝てっこないよ。", romaji: "Kattekkonai yo.", vi: "Không thể thắng đâu." },
        ],
      },
      {
        pattern: "V(普通形) + 始末だ",
        meaning: "cuối cùng lại ~ (tiêu cực)",
        formalityLevel: "formal",
        examples: [
          { jp: "押し付けられて、断る始末だ。", romaji: "Oshitsukerarete, kotowaru shimatsu da.", vi: "Bị ép cuối cùng phải từ chối." },
          { jp: "忘れて、遅刻する始末だった。", romaji: "Wasurete, chikoku suru shimatsu datta.", vi: "Quên nên cuối cùng đi trễ." },
        ],
      },
      {
        pattern: "V(普通形) + ただ～するだけ",
        meaning: "chỉ ~ thôi (hạn chế)",
        formalityLevel: "neutral",
        examples: [
          { jp: "見ただけで判断するのは早計だ。", romaji: "Mita dake de handan suru no wa sōkei da.", vi: "Chỉ nhìn mà phán đoán là vội." },
          { jp: "待っているだけでは解決しない。", romaji: "Matte iru dake dewa kaiketsu shinai.", vi: "Chỉ chờ thì không giải quyết được." },
        ],
      },
    ],
  },
  {
    lessonNumber: 515,
    jlptLevel: 'N1',
    title: 'N1 · Ngữ pháp bổ sung (bài 1)',
    sortOrder: 5150,
    items: [
      {
        pattern: "V(普通形) + に至る",
        meaning: "đến mức ~; dẫn đến ~",
        formalityLevel: "formal",
        examples: [
          { jp: "議論は結論に至った。", romaji: "Giron wa ketsuron ni itaru.", vi: "Cuộc thảo luận đã đi đến kết luận." },
          { jp: "努力の末、成功に至った。", romaji: "Doryoku no sue, seikō ni itatta.", vi: "Sau nỗ lực đã đạt thành công." },
        ],
      },
      {
        pattern: "V(普通形) + に至るまで",
        meaning: "cho đến cả ~",
        formalityLevel: "formal",
        examples: [
          { jp: "準備から実行に至るまで、すべて確認した。", romaji: "Junbi kara jikkō ni itaru made, subete kakunin shita.", vi: "Từ chuẩn bị đến thực hiện đều đã kiểm tra." },
          { jp: "細部に至るまで配慮されている。", romaji: "Saisbu ni itaru made hairyo sarete iru.", vi: "Được chu đáo đến từng chi tiết." },
        ],
      },
      {
        pattern: "V(普通形) + に至って",
        meaning: "mãi đến khi ~ thì ~",
        formalityLevel: "formal",
        examples: [
          { jp: "事件が起きて初めて問題に至った。", romaji: "Jiken ga okitе hajimete mondai ni itatte.", vi: "Mãi khi sự việc xảy ra mới thành vấn đề." },
          { jp: "長い議論の末に、ようやく決定に至った。", romaji: "Nagai giron no sue ni, yōyaku kettei ni itatta.", vi: "Sau tranh luận lâu cuối cùng mới quyết định." },
        ],
      },
      {
        pattern: "V(普通形) + に先立ち",
        meaning: "trước khi ~",
        formalityLevel: "formal",
        examples: [
          { jp: "会議に先立ち、資料を配布した。", romaji: "Kaigi ni sakidachi, shiryō o haifu shita.", vi: "Trước cuộc họp đã phát tài liệu." },
          { jp: "出発に先立ち、点検を行った。", romaji: "Shuppatsu ni sakidachi, tenken o okonatta.", vi: "Trước khi khởi hành đã kiểm tra." },
        ],
      },
      {
        pattern: "V(普通形) + に際して",
        meaning: "nhân dịp ~",
        formalityLevel: "formal",
        examples: [
          { jp: "開店に際して、セールを行う。", romaji: "Kaiten ni saishite, sēru o okonau.", vi: "Nhân dịp khai trương sẽ giảm giá." },
          { jp: "卒業に際して、感謝の言葉を述べた。", romaji: "Sotsugyō ni saishite, kansha no kotoba o nobeta.", vi: "Nhân dịp tốt nghiệp đã bày tỏ lòng biết ơn." },
        ],
      },
      {
        pattern: "V(普通形) + に即して",
        meaning: "theo ~; phù hợp với ~",
        formalityLevel: "formal",
        examples: [
          { jp: "現状に即して計画を修正する。", romaji: "Genjō ni sokushite keikaku o shūsei suru.", vi: "Sửa kế hoạch cho phù hợp hiện trạng." },
          { jp: "時代に即した教育が必要だ。", romaji: "Jidai ni sokushita kyōiku ga hitsuyō da.", vi: "Cần giáo dục phù hợp thời đại." },
        ],
      },
      {
        pattern: "V(普通形) + に沿って",
        meaning: "theo ~; dọc theo ~",
        formalityLevel: "formal",
        examples: [
          { jp: "方針に沿って進める。", romaji: "Hōshin ni sotte susumeru.", vi: "Tiến hành theo phương châm." },
          { jp: "川に沿って道が続いている。", romaji: "Kawa ni sotte michi ga tsuzuite iru.", vi: "Đường chạy dọc theo sông." },
        ],
      },
      {
        pattern: "V(普通形) + に基づいて",
        meaning: "dựa trên ~",
        formalityLevel: "formal",
        examples: [
          { jp: "事実に基づいて判断する。", romaji: "Jijitsu ni motozuite handan suru.", vi: "Phán đoán dựa trên sự thật." },
          { jp: "法律に基づいて処分された。", romaji: "Hōritsu ni motozuite shobun sareta.", vi: "Bị xử lý theo luật." },
        ],
      },
    ],
  },
  {
    lessonNumber: 516,
    jlptLevel: 'N1',
    title: 'N1 · Ngữ pháp bổ sung (bài 2)',
    sortOrder: 5160,
    items: [
      {
        pattern: "V(普通形) + に伴って",
        meaning: "cùng với ~; kèm theo ~",
        formalityLevel: "formal",
        examples: [
          { jp: "経済成長に伴って、生活水準も上がった。", romaji: "Keizai seichō ni tomonatte, seikatsu suijun mo agatta.", vi: "Cùng tăng trưởng kinh tế, mức sống cũng lên." },
          { jp: "制度変更に伴い、手続きも変わる。", romaji: "Seido henkō ni tomonai, tetsuzuki mo kawaru.", vi: "Theo thay đổi chế độ, thủ tục cũng đổi." },
        ],
      },
      {
        pattern: "V(普通形) + に即した",
        meaning: "phù hợp với ~",
        formalityLevel: "formal",
        examples: [
          { jp: "現実に即した解決策が必要だ。", romaji: "Genjitsu ni sokushita kaiketsusaku ga hitsuyō da.", vi: "Cần giải pháp phù hợp thực tế." },
          { jp: "需要に即した商品開発を行う。", romaji: "Juyō ni sokushita shōhin kaihatsu o okonau.", vi: "Phát triển sản phẩm theo nhu cầu." },
        ],
      },
      {
        pattern: "V(普通形) + をもって",
        meaning: "bằng ~; coi như ~",
        formalityLevel: "formal",
        examples: [
          { jp: "本日をもって、退職いたします。", romaji: "Honjitsu o motte, taishoku itashimasu.", vi: "Kể từ hôm nay tôi nghỉ việc." },
          { jp: "これをもって会議を終了します。", romaji: "Kore o motte kaigi o shūryō shimasu.", vi: "Như vậy xin kết thúc cuộc họp." },
        ],
      },
      {
        pattern: "V(普通形) + を以て",
        meaning: "bằng ~ (văn viết)",
        formalityLevel: "formal",
        examples: [
          { jp: "誠意を以て対応する。", romaji: "Seii o motte taiō suru.", vi: "Đối ứng bằng thành ý." },
          { jp: "実力を以て評価される。", romaji: "Jitsuryoku o motte hyōka sareru.", vi: "Được đánh giá bằng năng lực." },
        ],
      },
      {
        pattern: "V(普通形) + を禁じ得ない",
        meaning: "không thể không ~",
        formalityLevel: "formal",
        examples: [
          { jp: "その光景には驚きを禁じ得ない。", romaji: "Sono kōkei ni wa kyōki o kinjienai.", vi: "Không thể không ngạc nhiên trước cảnh đó." },
          { jp: "同情を禁じ得ない状況だ。", romaji: "Dōjō o kinjienai jōkyō da.", vi: "Tình huống không thể không thương cảm." },
        ],
      },
      {
        pattern: "V(普通形) + を余儀なくされる",
        meaning: "bị buộc phải ~",
        formalityLevel: "formal",
        examples: [
          { jp: "台風で延期を余儀なくされた。", romaji: "Taifū de enki o yoginaku sareta.", vi: "Vì bão buộc phải hoãn." },
          { jp: "経営難で閉店を余儀なくされた。", romaji: "Keiei nan de heiten o yoginaku sareta.", vi: "Vì khó kinh doanh buộc phải đóng cửa." },
        ],
      },
      {
        pattern: "V(普通形) + をよそに",
        meaning: "bất chấp ~",
        formalityLevel: "formal",
        examples: [
          { jp: "世間の批判をよそに、彼は進めた。", romaji: "Seken no hihan o yoso ni, kare wa susumeta.", vi: "Bất chấp chỉ trích dư luận anh ấy vẫn tiến." },
          { jp: "不安の声をよそに、計画は続行された。", romaji: "Fuan no koe o yoso ni, keikaku wa zokkō sareta.", vi: "Bất chấp lo ngại kế hoạch vẫn tiếp tục." },
        ],
      },
      {
        pattern: "V(普通形) + をおいて",
        meaning: "ngoài ~ ra không có",
        formalityLevel: "formal",
        examples: [
          { jp: "この仕事をおいて、他に適任者はいない。", romaji: "Kono shigoto o oite, hoka ni tekininsha wa inai.", vi: "Ngoài anh ấy không ai hợp việc này." },
          { jp: "彼をおいて、代表は務まらない。", romaji: "Kare o oite, daihyō wa matomaranai.", vi: "Không ai đại diện bằng anh ấy." },
        ],
      },
    ],
  },
  {
    lessonNumber: 517,
    jlptLevel: 'N1',
    title: 'N1 · Ngữ pháp bổ sung (bài 3)',
    sortOrder: 5170,
    items: [
      {
        pattern: "V(普通形) + を皮切りに",
        meaning: "bắt đầu từ ~",
        formalityLevel: "formal",
        examples: [
          { jp: "東京公演を皮切りに、全国ツアーが始まる。", romaji: "Tōkyō kōen o kawakiri ni, zenkoku tsuā ga hajimaru.", vi: "Bắt đầu từ Tokyo, tour toàn quốc khởi động." },
          { jp: "この商品を皮切りに、新ラインを展開する。", romaji: "Kono shōhin o kawakiri ni, shin rain o tenkai suru.", vi: "Bắt đầu từ sản phẩm này mở rộng dòng mới." },
        ],
      },
      {
        pattern: "V(普通形) + を機に",
        meaning: "lấy ~ làm cơ hội",
        formalityLevel: "formal",
        examples: [
          { jp: "転職を機に、新しいスキルを学んだ。", romaji: "Tenshoku o ki ni, atarashii sukiru o mananda.", vi: "Nhân chuyển việc học kỹ năng mới." },
          { jp: "引っ越しを機に、生活習慣を見直した。", romaji: "Hikkoshi o ki ni, seikatsu shūkan o minaoshita.", vi: "Nhân chuyển nhà xem lại thói quen." },
        ],
      },
      {
        pattern: "V(普通形) + を契機に",
        meaning: "lấy ~ làm dịp",
        formalityLevel: "formal",
        examples: [
          { jp: "事故を契機に、安全対策が強化された。", romaji: "Jiko o keiki ni, anzen taisaku ga kyōka sareta.", vi: "Nhân tai nạn biện pháp an toàn được tăng cường." },
          { jp: "出産を契機に、仕事の見直しをした。", romaji: "Shussan o keiki ni, shigoto no minaoshi o shita.", vi: "Nhân sinh con xem lại công việc." },
        ],
      },
      {
        pattern: "V(普通形) + を踏まえて",
        meaning: "dựa trên ~; cân nhắc ~",
        formalityLevel: "formal",
        examples: [
          { jp: "調査結果を踏まえて、方針を決めた。", romaji: "Chōsa kekka o fumae te, hōshin o kimeta.", vi: "Dựa kết quả khảo sát quyết phương châm." },
          { jp: "過去の失敗を踏まえ、計画を立てる。", romaji: "Kako no shippai o fumae, keikaku o tateru.", vi: "Cân nhắc thất bại quá khứ lập kế hoạch." },
        ],
      },
      {
        pattern: "V(普通形) + を顧みず",
        meaning: "không màng ~",
        formalityLevel: "formal",
        examples: [
          { jp: "危険を顧みず、前進した。", romaji: "Kiken o kaerimizu, zenshin shita.", vi: "Không màng nguy hiểm tiến lên." },
          { jp: "批判を顧みず、信念を貫いた。", romaji: "Hihan o kaerimizu, shinnen o tsuranuita.", vi: "Không màng chỉ trích giữ vững niềm tin." },
        ],
      },
      {
        pattern: "V(普通形) + をものともせず",
        meaning: "coi ~ như không",
        formalityLevel: "formal",
        examples: [
          { jp: "困難をものともせず、研究を続けた。", romaji: "Konnan o mono tomo sezu, kenkyū o tsuzuketa.", vi: "Coi khó khăn như không, tiếp tục nghiên cứu." },
          { jp: "反対をものともせず、改革を進めた。", romaji: "Hantai o mono tomo sezu, kaikaku o susumeta.", vi: "Coi phản đối như không, tiến hành cải cách." },
        ],
      },
      {
        pattern: "V(普通形) + をものとせず",
        meaning: "không coi ~ là vấn đề",
        formalityLevel: "formal",
        examples: [
          { jp: "損失をものとせず、再投資した。", romaji: "Sonshitsu o mono to sezu, saitōshi shita.", vi: "Không màng thiệt hại đầu tư lại." },
          { jp: "失敗をものとせず、挑戦し続ける。", romaji: "Shippai o mono to sezu, chōsen shitsuzukeru.", vi: "Không coi thất bại là vấn đề, tiếp tục thử." },
        ],
      },
      {
        pattern: "V(普通形) + 極まりない",
        meaning: "cực kỳ ~",
        formalityLevel: "formal",
        examples: [
          { jp: "その態度は失礼極まりない。", romaji: "Sono taido wa shitsurei gokumarinaki.", vi: "Thái độ đó cực kỳ thất lễ." },
          { jp: "危険極まりない行為だ。", romaji: "Kiken gokumarinaki kōi da.", vi: "Hành vi cực kỳ nguy hiểm." },
        ],
      },
    ],
  },
  {
    lessonNumber: 518,
    jlptLevel: 'N1',
    title: 'N1 · Ngữ pháp bổ sung (bài 4)',
    sortOrder: 5180,
    items: [
      {
        pattern: "V(普通形) + 限りだ",
        meaning: "cảm thấy ~ vô cùng",
        formalityLevel: "formal",
        examples: [
          { jp: "再会できて嬉しい限りだ。", romaji: "Saikai dekite ureshii kagiri da.", vi: "Gặp lại được vô cùng vui." },
          { jp: "期待外れで残念限りだ。", romaji: "Kitai hazure de zannen kagiri da.", vi: "Không như mong đợi, tiếc vô cùng." },
        ],
      },
      {
        pattern: "V(普通形) + 始末だ",
        meaning: "cuối cùng lại ~ (tiêu cực)",
        formalityLevel: "formal",
        examples: [
          { jp: "計画倒れで、出費を増やす始末だ。", romaji: "Keikaku dore de, shuppi o fuyasu shimatsu da.", vi: "Kế hoạch hỏng cuối cùng lại tăng chi." },
          { jp: "忘れ物をして、取りに戻る始末だった。", romaji: "Wasuremono o shite, tori ni modoru shimatsu datta.", vi: "Quên đồ cuối cùng phải quay lấy." },
        ],
      },
      {
        pattern: "V(普通形) + 始末である",
        meaning: "rốt cuộc ~ (trang trọng)",
        formalityLevel: "formal",
        examples: [
          { jp: "努力の結果、成功した始末である。", romaji: "Doryoku no kekka, seikō shita shimatsu de aru.", vi: "Kết quả nỗ lực rốt cuộc thành công." },
          { jp: "議論の末、妥協に至った始末だ。", romaji: "Giron no sue, dakyō ni itatta shimatsu da.", vi: "Sau tranh luận rốt cuộc thỏa hiệp." },
        ],
      },
      {
        pattern: "V(普通形) + べからず",
        meaning: "không được ~ (cấm)",
        formalityLevel: "formal",
        examples: [
          { jp: "立入禁止。関係者以外入るべからず。", romaji: "Tachiiri kinshi. Kankeisha igai hairu bekarazu.", vi: "Cấm vào. Người không liên quan không được vào." },
          { jp: "他人を見下すべからず。", romaji: "Tajin o mikudasu bekarazu.", vi: "Không được coi thường người khác." },
        ],
      },
      {
        pattern: "V(普通形) + べく",
        meaning: "để ~ (văn viết)",
        formalityLevel: "formal",
        examples: [
          { jp: "成功すべく、日夜努力している。", romaji: "Seikō subeku, nichiya doryoku shite iru.", vi: "Để thành công ngày đêm nỗ lực." },
          { jp: "問題を解決すべく、調査を開始した。", romaji: "Mondai o kaiketsu subeku, chōsa o kaishi shita.", vi: "Để giải quyết vấn đề bắt đầu điều tra." },
        ],
      },
      {
        pattern: "V(普通形) + べからざる",
        meaning: "không thể ~ được",
        formalityLevel: "formal",
        examples: [
          { jp: "許すべからざる行為だ。", romaji: "Yurusu bekarazaru kōi da.", vi: "Hành vi không thể tha thứ." },
          { jp: "避けるべからざる選択だ。", romaji: "Sakeru bekarazaru sentaku da.", vi: "Lựa chọn không thể tránh." },
        ],
      },
      {
        pattern: "V(普通形) + まじき",
        meaning: "không nên ~; không đáng ~",
        formalityLevel: "formal",
        examples: [
          { jp: "教師にあるまじき発言だ。", romaji: "Kyōshi ni arumajiki hatsugen da.", vi: "Phát ngôn không xứng giáo viên." },
          { jp: "人として許すまじき行為だ。", romaji: "Hito to shite yurusu majiki kōi da.", vi: "Hành vi con người không thể tha." },
        ],
      },
      {
        pattern: "V(普通形) + ならざる",
        meaning: "không thể không ~",
        formalityLevel: "formal",
        examples: [
          { jp: "感謝せざるを得ない。", romaji: "Kansha sezaru o enai.", vi: "Không thể không biết ơn." },
          { jp: "認めざるを得ない結果だ。", romaji: "Mitomezaru o enai kekka da.", vi: "Kết quả buộc phải thừa nhận." },
        ],
      },
    ],
  },
  {
    lessonNumber: 519,
    jlptLevel: 'N1',
    title: 'N1 · Ngữ pháp bổ sung (bài 5)',
    sortOrder: 5190,
    items: [
      {
        pattern: "V(普通形) + ざるを得ない",
        meaning: "không thể không ~",
        formalityLevel: "formal",
        examples: [
          { jp: "値上げせざるを得ない状況だ。", romaji: "Neage sezaru o enai jōkyō da.", vi: "Tình huống buộc phải tăng giá." },
          { jp: "認めざるを得ない。", romaji: "Mitomezaru o enai.", vi: "Buộc phải thừa nhận." },
        ],
      },
      {
        pattern: "V(普通形) + ないではいられない",
        meaning: "không thể không ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "笑わないではいられなかった。", romaji: "Warawanaide wa irarenakatta.", vi: "Không thể không cười." },
          { jp: "心配しないではいられない。", romaji: "Shinpai shinaide wa irarenai.", vi: "Không thể không lo." },
        ],
      },
      {
        pattern: "V(普通形) + ずにはいられない",
        meaning: "không thể không ~ (văn)",
        formalityLevel: "formal",
        examples: [
          { jp: "感動せずにはいられなかった。", romaji: "Kandō sezu ni wa irarenakatta.", vi: "Không thể không xúc động." },
          { jp: "同情せずにはいられない。", romaji: "Dōjō sezu ni wa irarenai.", vi: "Không thể không thương cảm." },
        ],
      },
      {
        pattern: "V(普通形) + てたまらない",
        meaning: "rất ~; ~ không chịu nổi",
        formalityLevel: "neutral",
        examples: [
          { jp: "会いたくてたまらない。", romaji: "Aitakute tamaranai.", vi: "Nhớ muốn gặp không chịu nổi." },
          { jp: "暑くてたまらない。", romaji: "Atsukute tamaranai.", vi: "Nóng không chịu nổi." },
        ],
      },
      {
        pattern: "V(普通形) + てならない",
        meaning: "rất ~ (cảm xúc)",
        formalityLevel: "formal",
        examples: [
          { jp: "結果が気になってならない。", romaji: "Kekka ga ki ni natte naranai.", vi: "Rất lo kết quả." },
          { jp: "彼の安否が心配でならない。", romaji: "Kare no anpi ga shinpai de naranai.", vi: "Lo lắng an toàn anh ấy không yên." },
        ],
      },
      {
        pattern: "V(普通形) + て仕方がない",
        meaning: "rất ~; ~ vô cùng",
        formalityLevel: "neutral",
        examples: [
          { jp: "眠くて仕方がない。", romaji: "Nemukute shikata ga nai.", vi: "Buồn ngủ vô cùng." },
          { jp: "嬉しくて仕方がない。", romaji: "Ureshikute shikata ga nai.", vi: "Vui vô cùng." },
        ],
      },
      {
        pattern: "V(普通形) + て当然だ",
        meaning: "đương nhiên ~",
        formalityLevel: "formal",
        examples: [
          { jp: "努力すれば成功して当然だ。", romaji: "Doryoku sureba seikō shite tōzen da.", vi: "Cố gắng thì thành công là đương nhiên." },
          { jp: "約束を破れば、信用を失って当然だ。", romaji: "Yakusoku o yabureba, shinyō o ushinatte tōzen da.", vi: "Phá lời hứa mất lòng tin là đương nhiên." },
        ],
      },
      {
        pattern: "V(普通形) + て当然である",
        meaning: "đương nhiên phải ~",
        formalityLevel: "formal",
        examples: [
          { jp: "違反すれば罰せられて当然である。", romaji: "Ihan sureba basserarete tōzen de aru.", vi: "Vi phạm bị phạt là đương nhiên." },
          { jp: "結果が出るまで待つのが当然である。", romaji: "Kekka ga deru made matsu no ga tōzen de aru.", vi: "Đợi đến khi có kết quả là đương nhiên." },
        ],
      },
    ],
  },
  {
    lessonNumber: 520,
    jlptLevel: 'N1',
    title: 'N1 · Ngữ pháp bổ sung (bài 6)',
    sortOrder: 5200,
    items: [
      {
        pattern: "V(普通形) + て当然の",
        meaning: "đương nhiên ~",
        formalityLevel: "formal",
        examples: [
          { jp: "成功は努力の結果として当然の帰結だ。", romaji: "Seikō wa doryoku no kekka to shite tōzen no kiketsu da.", vi: "Thành công là kết cục đương nhiên của nỗ lực." },
          { jp: "彼の昇進は実力相応で当然のことだ。", romaji: "Kare no shōshin wa jitsuryoku sōō de tōzen no koto da.", vi: "Thăng tiến anh ấy xứng năng lực là đương nhiên." },
        ],
      },
      {
        pattern: "V(普通形) + て当然を得ない",
        meaning: "không thể cho là đương nhiên",
        formalityLevel: "formal",
        examples: [
          { jp: "その説明では納得して当然を得ない。", romaji: "Sono setsumei dewa nattoku shite tōzen o enai.", vi: "Giải thích đó không thể coi là đương nhiên mà chấp nhận." },
          { jp: "突然の辞任は当然を得ない。", romaji: "Totsuzen no jinin wa tōzen o enai.", vi: "Từ chức đột ngột không thể coi là đương nhiên." },
        ],
      },
      {
        pattern: "V(普通形) + てからというもの",
        meaning: "kể từ khi ~ thì ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "結婚してからというもの、生活が変わった。", romaji: "Kekkon shite kara to iu mono, seikatsu ga kawatta.", vi: "Kể từ khi cưới cuộc sống thay đổi." },
          { jp: "引っ越してからというもの、会えなくなった。", romaji: "Hikkoshi shite kara to iu mono, aenaku natta.", vi: "Kể từ chuyển nhà không gặp được." },
        ],
      },
      {
        pattern: "V(普通形) + て以来",
        meaning: "kể từ khi ~",
        formalityLevel: "formal",
        examples: [
          { jp: "留学して以来、考え方が変わった。", romaji: "Ryūgaku shite irai, kangaekata ga kawatta.", vi: "Kể từ du học cách nghĩ thay đổi." },
          { jp: "事故に遭って以来、慎重になった。", romaji: "Jiko ni atatte irai, shinchō ni natta.", vi: "Kể từ tai nạn trở nên thận trọng." },
        ],
      },
      {
        pattern: "V(普通形) + てからでないと",
        meaning: "phải ~ trước thì mới ~",
        formalityLevel: "formal",
        examples: [
          { jp: "確認してからでないと、進められない。", romaji: "Kakunin shite kara denai to, susumerarenai.", vi: "Phải xác nhận trước mới tiến hành được." },
          { jp: "許可を得てからでないと、使用できない。", romaji: "Kyoka o ete kara denai to, shiyō dekinai.", vi: "Phải được phép trước mới dùng được." },
        ],
      },
      {
        pattern: "V(普通形) + てからこそ",
        meaning: "chính vì đã ~ nên ~",
        formalityLevel: "formal",
        examples: [
          { jp: "経験してからこそ、理解できる。", romaji: "Keiken shite kara koso, rikai dekiru.", vi: "Chính vì trải nghiệm mới hiểu được." },
          { jp: "失敗してからこそ、成長できる。", romaji: "Shippai shite kara koso, seichō dekiru.", vi: "Chính vì thất bại mới trưởng thành." },
        ],
      },
      {
        pattern: "V(普通形) + てこそ",
        meaning: "chỉ khi ~ thì mới ~",
        formalityLevel: "formal",
        examples: [
          { jp: "健康があってこそ、幸せだ。", romaji: "Kenkō ga atte koso, shiawase da.", vi: "Chỉ khi có sức khỏe mới hạnh phúc." },
          { jp: "努力してこそ、成果が出る。", romaji: "Doryoku shite koso, seika ga deru.", vi: "Chỉ khi nỗ lực mới có thành quả." },
        ],
      },
      {
        pattern: "V(普通形) + ては",
        meaning: "nếu ~ thì (phản ứng tiêu cực)",
        formalityLevel: "neutral",
        examples: [
          { jp: "食べては寝られない。", romaji: "Tabete wa nerarenai.", vi: "Ăn rồi không ngủ được." },
          { jp: "そんなことを言っては、誤解される。", romaji: "Sonna koto o itte wa, gokai sareru.", vi: "Nói vậy sẽ bị hiểu lầm." },
        ],
      },
    ],
  },
  {
    lessonNumber: 521,
    jlptLevel: 'N1',
    title: 'N1 · Ngữ pháp bổ sung (bài 7)',
    sortOrder: 5210,
    items: [
      {
        pattern: "V(普通形) + てはいられない",
        meaning: "không thể cứ ~ mãi",
        formalityLevel: "formal",
        examples: [
          { jp: "悲しんでいてはいられない。", romaji: "Kanashinde ite wa irarenai.", vi: "Không thể cứ buồn mãi." },
          { jp: "待っていてはいられない。", romaji: "Matte ite wa irarenai.", vi: "Không thể cứ chờ mãi." },
        ],
      },
      {
        pattern: "V(普通形) + てはならない",
        meaning: "không được ~",
        formalityLevel: "formal",
        examples: [
          { jp: "約束を破ってはならない。", romaji: "Yakusoku o yabutte wa naranai.", vi: "Không được phá lời hứa." },
          { jp: "人を見下してはならない。", romaji: "Hito o mikudashite wa naranai.", vi: "Không được coi thường người khác." },
        ],
      },
      {
        pattern: "V(普通形) + てまで",
        meaning: "ngay cả ~ cũng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "借金してまで買う必要はない。", romaji: "Shakkin shite made kau hitsuyō wa nai.", vi: "Không cần vay nợ mà mua." },
          { jp: "嘘をついてまで守りたいものはない。", romaji: "Uso o tsuite made mamoritai mono wa nai.", vi: "Không có gì đáng nói dối mà bảo vệ." },
        ],
      },
      {
        pattern: "V(普通形) + てでも",
        meaning: "dù phải ~ cũng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "会ってでも謝りたい。", romaji: "Aitte demo ayamaritai.", vi: "Dù gặp cũng muốn xin lỗi." },
          { jp: "借りてでも実現させる。", romaji: "Karite demo jitsugen saseru.", vi: "Dù vay cũng thực hiện." },
        ],
      },
      {
        pattern: "V(普通形) + ては始まらない",
        meaning: "chỉ ~ thì không đủ",
        formalityLevel: "formal",
        examples: [
          { jp: "待っていては始まらない。", romaji: "Matte ite wa hajimaranai.", vi: "Chỉ chờ thì không ổn." },
          { jp: "言うだけでは始まらない。", romaji: "Iu dake dewa hajimaranai.", vi: "Chỉ nói thì không đủ." },
        ],
      },
      {
        pattern: "V(普通形) + て済むことではない",
        meaning: "không phải ~ là xong",
        formalityLevel: "formal",
        examples: [
          { jp: "謝って済むことではない。", romaji: "Ayamatte sumu koto dewa nai.", vi: "Không phải xin lỗi là xong." },
          { jp: "説明して済む問題ではない。", romaji: "Setsumei shite sumu mondai dewa nai.", vi: "Không phải giải thích là giải quyết được." },
        ],
      },
      {
        pattern: "V(普通形) + て済む",
        meaning: "~ là đủ; chỉ cần ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "メールして済ませた。", romaji: "Mēru shite sumaseta.", vi: "Nhắn mail là xong." },
          { jp: "謝れば済む話だ。", romaji: "Ayamareba sumu hanashi da.", vi: "Xin lỗi là xong chuyện." },
        ],
      },
      {
        pattern: "V(普通形) + に越したことはない",
        meaning: "không gì hơn ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "早めに予約したに越したことはない。", romaji: "Hayame ni yoyaku shita ni koshita koto wa nai.", vi: "Đặt sớm không gì hơn." },
          { jp: "健康に越したものはない。", romaji: "Kenkō ni koshita mono wa nai.", vi: "Không gì hơn sức khỏe." },
        ],
      },
    ],
  },
  {
    lessonNumber: 522,
    jlptLevel: 'N1',
    title: 'N1 · Ngữ pháp bổ sung (bài 8)',
    sortOrder: 5220,
    items: [
      {
        pattern: "V(普通形) + にほかならない",
        meaning: "không gì khác ngoài ~",
        formalityLevel: "formal",
        examples: [
          { jp: "成功は努力の結果にほかならない。", romaji: "Seikō wa doryoku no kekka ni hoka naranai.", vi: "Thành công không gì khác ngoài kết quả nỗ lực." },
          { jp: "それは偶然にほかならない。", romaji: "Sore wa gūzen ni hoka naranai.", vi: "Đó không gì khác ngoài ngẫu nhiên." },
        ],
      },
      {
        pattern: "V(普通形) + に他ならない",
        meaning: "chính là ~",
        formalityLevel: "formal",
        examples: [
          { jp: "原因は怠慢に他ならない。", romaji: "Genin wa taiman ni hoka naranai.", vi: "Nguyên nhân chính là sự lơ đãng." },
          { jp: "目的は平和の実現に他ならない。", romaji: "Mokuteki wa heiwa no jitsugen ni hoka naranai.", vi: "Mục đích chính là hiện thực hòa bình." },
        ],
      },
      {
        pattern: "V(普通形) + にすぎない",
        meaning: "chỉ là ~ thôi",
        formalityLevel: "formal",
        examples: [
          { jp: "噂にすぎない。", romaji: "Uwasa ni suginai.", vi: "Chỉ là tin đồn." },
          { jp: "彼の意見は参考程度にすぎない。", romaji: "Kare no iken wa sankō teido ni suginai.", vi: "Ý kiến anh ấy chỉ mang tính tham khảo." },
        ],
      },
      {
        pattern: "V(普通形) + に過ぎない",
        meaning: "chỉ dừng ở mức ~",
        formalityLevel: "formal",
        examples: [
          { jp: "始まりに過ぎない。", romaji: "Hajimari ni suginai.", vi: "Chỉ mới là khởi đầu." },
          { jp: "それは一例に過ぎない。", romaji: "Sore wa ichirei ni suginai.", vi: "Đó chỉ là một ví dụ." },
        ],
      },
      {
        pattern: "V(普通形) + に相違ない",
        meaning: "chắc chắn là ~",
        formalityLevel: "formal",
        examples: [
          { jp: "彼の勝利に相違ない。", romaji: "Kare no shōri ni sōi nai.", vi: "Chắc chắn anh ấy thắng." },
          { jp: "計画通りに進んでいるに相違ない。", romaji: "Keikaku dōri ni susunde iru ni sōi nai.", vi: "Chắc chắn đang tiến đúng kế hoạch." },
        ],
      },
      {
        pattern: "V(普通形) + に違いない",
        meaning: "chắc chắn ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "彼は知っているに違いない。", romaji: "Kare wa shitte iru ni chigainai.", vi: "Anh ấy chắc chắn biết." },
          { jp: "成功するに違いない。", romaji: "Seikō suru ni chigainai.", vi: "Chắc chắn sẽ thành công." },
        ],
      },
      {
        pattern: "V(普通形) + に決まっている",
        meaning: "chắc chắn ~",
        formalityLevel: "spoken",
        examples: [
          { jp: "そんなの勝つに決まってる。", romaji: "Sonna no katsu ni kimatteru.", vi: "Thế đó chắc thắng." },
          { jp: "彼が来ないに決まっている。", romaji: "Kare ga konai ni kimatte iru.", vi: "Chắc chắn anh ấy không đến." },
        ],
      },
    ],
  },
  {
    lessonNumber: 523,
    jlptLevel: 'N1',
    title: 'N1 · Ngữ pháp bổ sung (bài 9)',
    sortOrder: 5230,
    items: [
      {
        pattern: "V(普通形) + にして",
        meaning: "ở mức ~; với tư cách ~",
        formalityLevel: "formal",
        examples: [
          { jp: "専門家にして初めて理解できる。", romaji: "Senmonka ni shite hajimete rikai dekiru.", vi: "Ở mức chuyên gia mới hiểu được." },
          { jp: "現代にして必要不可欠だ。", romaji: "Gendai ni shite hitsuyō fukaketsu da.", vi: "Ở thời hiện đại là không thể thiếu." },
        ],
      },
      {
        pattern: "V(普通形) + にして初めて",
        meaning: "chỉ khi ~ mới ~",
        formalityLevel: "formal",
        examples: [
          { jp: "失敗にして初めて学べる。", romaji: "Shippai ni shite hajimete manaberu.", vi: "Chỉ khi thất bại mới học được." },
          { jp: "大人にして初めて分かる。", romaji: "Otona ni shite hajimete wakaru.", vi: "Lớn rồi mới hiểu." },
        ],
      },
      {
        pattern: "V(普通形) + にしても",
        meaning: "dù ~ cũng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "行くにしても、準備が必要だ。", romaji: "Iku ni shite mo, junbi ga hitsuyō da.", vi: "Dù đi cũng cần chuẩn bị." },
          { jp: "高いにしても、買う価値がある。", romaji: "Takai ni shite mo, kau kachi ga aru.", vi: "Dù đắt cũng đáng mua." },
        ],
      },
      {
        pattern: "V(普通形) + にせよ / にしろ",
        meaning: "dù ~ cũng ~",
        formalityLevel: "formal",
        examples: [
          { jp: "行くにせよ行かないにせよ、連絡してほしい。", romaji: "Iku ni seyo ikanai ni seyo, renraku shite hoshii.", vi: "Dù đi hay không hãy liên lạc." },
          { jp: "賛成にしろ反対にしろ、意見を聞きたい。", romaji: "Sansei ni shiro hantai ni shiro, iken o kikitai.", vi: "Dù đồng ý hay phản đối tôi muốn nghe ý kiến." },
        ],
      },
      {
        pattern: "V(普通形) + にしたところで",
        meaning: "dù có ~ cũng vô ích",
        formalityLevel: "neutral",
        examples: [
          { jp: "今さら後悔したところで遅い。", romaji: "Ima sara kōkai shita tokoro de osui.", vi: "Giờ hối hận cũng muộn." },
          { jp: "待ったところで来ない。", romaji: "Mattatokoro de konai.", vi: "Chờ cũng không đến." },
        ],
      },
      {
        pattern: "V(普通形) + たところで",
        meaning: "dù ~ cũng ~",
        formalityLevel: "neutral",
        examples: [
          { jp: "言ったところで信じられない。", romaji: "Itta tokoro de shinjirarenai.", vi: "Dù nói cũng không tin." },
          { jp: "待ったところで来ない。", romaji: "Mattatokoro de konai.", vi: "Chờ cũng không đến." },
        ],
      },
      {
        pattern: "V(普通形) + たところが",
        meaning: "đã ~ nhưng ~",
        formalityLevel: "formal",
        examples: [
          { jp: "調べたところが、新しい事実が判明した。", romaji: "Shirabeta tokoro ga, atarashii jijitsu ga hanmei shita.", vi: "Đã điều tra nhưng phát hiện sự thật mới." },
          { jp: "会ったところが、印象が良かった。", romaji: "Atta tokoro ga, inshō ga yokakatta.", vi: "Gặp rồi nhưng ấn tượng tốt." },
        ],
      },
    ],
  },
];
