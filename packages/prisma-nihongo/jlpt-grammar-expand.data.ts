// Ngữ pháp N2/N1 bổ sung — lesson 406–410 (N2), 505–509 (N1).
// Chạy: npm run seed:jlpt-expand -w @edu/prisma-nihongo

import type { JlptGrammarUnit } from './jlpt-grammar.data';

export const JLPT_GRAMMAR_EXPAND: JlptGrammarUnit[] = [
  {
    lessonNumber: 406,
    jlptLevel: 'N2',
    title: 'N2 · Bài 6 — Việc làm, trách nhiệm',
    sortOrder: 4060,
    items: [
      {
        pattern: 'N + に就く / N + に就いて',
        meaning: 'nhậm chức ~, đảm nhận ~',
        explanation: 'Dùng với chức danh, vị trí công việc. 「〜について」 là về chủ đề, khác nghĩa.',
        formalityLevel: 'formal',
        examples: [
          { jp: '彼は来月、新しい部署に就く。', romaji: 'Kare wa raigetsu, atarashii busho ni tsuku.', vi: 'Tháng sau anh ấy nhậm chức ở phòng ban mới.' },
          { jp: '社長に就いて、経営方針が変わった。', romaji: 'Shachō ni tsuite, keiei hōshin ga kawatta.', vi: 'Kể từ khi lên chức giám đốc, phương châm kinh doanh đã thay đổi.' },
        ],
      },
      {
        pattern: 'N + に配属される',
        meaning: 'được phân công về ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '入社後、営業部に配属された。', romaji: 'Nyūsha go, eigyōbu ni haizoku sareta.', vi: 'Sau khi vào công ty, tôi được phân về phòng kinh doanh.' },
          { jp: '彼女は海外支店に配属されることになった。', romaji: 'Kanojo wa kaigai shiten ni haizoku sareru koto ni natta.', vi: 'Cô ấy sẽ được phân công sang chi nhánh nước ngoài.' },
        ],
      },
      {
        pattern: 'N + に委ねる / N + に委ねられる',
        meaning: 'giao phó cho ~, ủy thác cho ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '最終判断は委員会に委ねられた。', romaji: 'Saishū handan wa iinkai ni yudanerareta.', vi: 'Quyết định cuối cùng được giao cho ủy ban.' },
          { jp: '子供の将来は本人に委ねるべきだ。', romaji: 'Kodomo no shōrai wa honnin ni yudaneru beki da.', vi: 'Tương lai con cái nên để bản thân quyết định.' },
        ],
      },
      {
        pattern: 'N + に頼る / N + 頼りにする',
        meaning: 'dựa vào ~, tin cậy ~',
        formalityLevel: 'neutral',
        examples: [
          { jp: '彼は親の援助に頼らず、学費を稼いだ。', romaji: 'Kare wa oya no enjo ni tayorazu, gakuhi o kaseida.', vi: 'Anh ấy kiếm học phí mà không dựa vào sự giúp đỡ của bố mẹ.' },
          { jp: '彼女は頼りになる先輩だ。', romaji: 'Kanojo wa tayori ni naru senpai da.', vi: 'Cô ấy là senpai đáng tin cậy.' },
        ],
      },
      {
        pattern: 'N + を求める',
        meaning: 'yêu cầu ~, tìm kiếm ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '企業は即戦力を求めている。', romaji: 'Kigyō wa sokusenryoku o motomeru.', vi: 'Doanh nghiệp đang tìm người có thể làm ngay.' },
          { jp: '彼は理解を求めたが、得られなかった。', romaji: 'Kare wa rikai o motometa ga, erarenakatta.', vi: 'Anh ấy mong được thấu hiểu nhưng không được.' },
        ],
      },
      {
        pattern: 'N + に供給する / N + が供給される',
        meaning: 'cung cấp ~',
        formalityLevel: 'formal',
        examples: [
          { jp: 'この地域には十分な水が供給されていない。', romaji: 'Kono chiiki ni wa jūbun na mizu ga kyōkyū sarete inai.', vi: 'Khu vực này không được cung cấp đủ nước.' },
          { jp: '電力会社が都市部に電気を供給する。', romaji: 'Denryoku gaisha ga toshibu ni denki o kyōkyū suru.', vi: 'Công ty điện lực cung cấp điện cho khu đô thị.' },
        ],
      },
      {
        pattern: 'N + を届ける / N + が届く',
        meaning: 'gửi đến ~; (thông báo) đến tai ~',
        formalityLevel: 'neutral',
        examples: [
          { jp: '荷物を指定の住所に届けてください。', romaji: 'Nimotsu o shitei no jūsho ni todokete kudasai.', vi: 'Hãy giao hàng đến địa chỉ đã chỉ định.' },
          { jp: '彼の死の知らせが家族に届いた。', romaji: 'Kare no shi no shirase ga kazoku ni todoita.', vi: 'Tin anh ấy mất đã đến tai gia đình.' },
        ],
      },
      {
        pattern: 'N + の倍 / N + 倍に増える',
        meaning: 'gấp ~ lần',
        formalityLevel: 'neutral',
        examples: [
          { jp: '売上は去年の三倍になった。', romaji: 'Uriage wa kyonen no sanbai ni natta.', vi: 'Doanh thu gấp ba lần năm ngoái.' },
          { jp: '人口が十年で二倍に増えた。', romaji: 'Jinkō ga jūnen de nibai ni fueta.', vi: 'Dân số tăng gấp đôi trong mười năm.' },
        ],
      },
    ],
  },
  {
    lessonNumber: 407,
    jlptLevel: 'N2',
    title: 'N2 · Bài 7 — Môi trường, thống kê',
    sortOrder: 4070,
    items: [
      {
        pattern: 'N + によって / N + により',
        meaning: 'tùy theo ~; do ~ (nguyên nhân trang trọng)',
        explanation: 'Nghĩa phân biệt theo ngữ cảnh: phương tiện, nguyên nhân, hoặc tùy trường hợp.',
        formalityLevel: 'formal',
        examples: [
          { jp: '人によって考え方は違う。', romaji: 'Hito ni yotte kangaekata wa chigau.', vi: 'Tùy người mà cách suy nghĩ khác nhau.' },
          { jp: '台風により、多くの家が被害を受けた。', romaji: 'Taifū ni yori, ōku no ie ga higai o uketa.', vi: 'Do bão, nhiều nhà bị thiệt hại.' },
        ],
      },
      {
        pattern: 'N + に伴って / N + に伴い',
        meaning: 'cùng với ~, đi kèm theo ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '経済成長に伴って、環境問題も深刻化した。', romaji: 'Keizai seichō ni tomonatte, kankyō mondai mo shinkokuka shita.', vi: 'Cùng với tăng trưởng kinh tế, vấn đề môi trường cũng nghiêm trọng hơn.' },
          { jp: '制度改正に伴い、手続きが変わる。', romaji: 'Seido kaisei ni tomonai, tetsuzuki ga kawaru.', vi: 'Theo cải cách thể chế, thủ tục sẽ thay đổi.' },
        ],
      },
      {
        pattern: 'N + を減らす / N + が減る',
        meaning: 'giảm ~',
        formalityLevel: 'neutral',
        examples: [
          { jp: 'ゴミの量を減らす努力が必要だ。', romaji: 'Gomi no ryō o herasu doryoku ga hitsuyō da.', vi: 'Cần nỗ lực giảm lượng rác.' },
          { jp: '出生率が年々減っている。', romaji: 'Shusshōritsu ga nennen hette iru.', vi: 'Tỷ lệ sinh giảm dần theo năm.' },
        ],
      },
      {
        pattern: 'N + を加える / N + に加えて',
        meaning: 'cộng thêm ~; ngoài ~ còn ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '塩を少し加えてください。', romaji: 'Shio o sukoshi kuwaete kudasai.', vi: 'Hãy thêm một chút muối.' },
          { jp: '雨に加えて、風も強くなった。', romaji: 'Ame ni kuwaete, kaze mo tsuyoku natta.', vi: 'Ngoài mưa, gió cũng mạnh lên.' },
        ],
      },
      {
        pattern: 'N + に占める / N + の割合を占める',
        meaning: 'chiếm ~ (tỷ lệ)',
        formalityLevel: 'formal',
        examples: [
          { jp: 'この国の輸出の半分を車が占めている。', romaji: 'Kono kuni no yushutsu no hanbun o kuruma ga shimete iru.', vi: 'Ô tô chiếm một nửa xuất khẩu của nước này.' },
          { jp: '若者が人口の三割を占める。', romaji: 'Wakamono ga jinkō no sanwari o shimeru.', vi: 'Giới trẻ chiếm ba phần mười dân số.' },
        ],
      },
      {
        pattern: 'N + を統計する / N + によると',
        meaning: 'thống kê ~; theo ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '調査によると、満足度は80％だった。', romaji: 'Chōsa ni yoru to, manzokudo wa hachijū pāsento datta.', vi: 'Theo khảo sát, mức hài lòng là 80%.' },
          { jp: 'データを統計して報告書を作成した。', romaji: 'Dēta o tōkei shite hōkokusho o sakusei shita.', vi: 'Đã thống kê dữ liệu và lập báo cáo.' },
        ],
      },
      {
        pattern: 'N + のもとで / N + の下で',
        meaning: 'dưới sự ~; trong hoàn cảnh ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '平和のもとで子供たちが育つ。', romaji: 'Heiwa no moto de kodomotachi ga sodatsu.', vi: 'Trẻ em lớn lên trong hòa bình.' },
          { jp: '新しい制度の下で、手続きが簡略化された。', romaji: 'Atarashii seido no shita de, tetsuzuki ga kanryaku ka sareta.', vi: 'Dưới thể chế mới, thủ tục được đơn giản hóa.' },
        ],
      },
      {
        pattern: 'N + を危険にさらす',
        meaning: 'đặt ~ vào nguy hiểm',
        formalityLevel: 'formal',
        examples: [
          { jp: '乱開発は生態系を危険にさらす。', romaji: 'Rankaihatsu wa seitaikei o kiken ni sarasu.', vi: 'Khai thác bừa bãi đặt hệ sinh thái vào nguy hiểm.' },
          { jp: 'その行為は国民の安全を危険にさらした。', romaji: 'Sono kōi wa kokumin no anzen o kiken ni sarasu.', vi: 'Hành vi đó đặt an toàn của dân vào nguy hiểm.' },
        ],
      },
    ],
  },
  {
    lessonNumber: 408,
    jlptLevel: 'N2',
    title: 'N2 · Bài 8 — Truyền thông, công bố',
    sortOrder: 4080,
    items: [
      {
        pattern: 'N + を宣伝する / N + が宣伝される',
        meaning: 'quảng bá ~, tuyên truyền ~',
        formalityLevel: 'neutral',
        examples: [
          { jp: '新商品がテレビで宣伝されている。', romaji: 'Shin shōhin ga terebi de senden sarete iru.', vi: 'Sản phẩm mới đang được quảng cáo trên TV.' },
          { jp: '彼は自分の本を宣伝するために講演した。', romaji: 'Kare wa jibun no hon o senden suru tame ni kōen shita.', vi: 'Anh ấy thuyết trình để quảng bá cuốn sách của mình.' },
        ],
      },
      {
        pattern: 'N + を公表する / N + が公表される',
        meaning: 'công bố ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '結果は来週公表される予定だ。', romaji: 'Kekka wa raishū kōhyō sareru yotei da.', vi: 'Kết quả dự kiến được công bố tuần sau.' },
          { jp: '政府が新しい方針を公表した。', romaji: 'Seifu ga atarashii hōshin o kōhyō shita.', vi: 'Chính phủ đã công bố phương châm mới.' },
        ],
      },
      {
        pattern: 'N + を掲載する / N + に掲載される',
        meaning: 'đăng tải ~ (báo, web)',
        formalityLevel: 'formal',
        examples: [
          { jp: '記事が新聞に掲載された。', romaji: 'Kiji ga shinbun ni keisai sareta.', vi: 'Bài báo được đăng trên báo.' },
          { jp: '求人情報をサイトに掲載する。', romaji: 'Kyūjin jōhō o saito ni keisai suru.', vi: 'Đăng tin tuyển dụng lên website.' },
        ],
      },
      {
        pattern: 'N + を漏らす / N + が漏れる',
        meaning: 'tiết lộ ~; (tin) bị lộ',
        formalityLevel: 'neutral',
        examples: [
          { jp: '彼は秘密を漏らしてしまった。', romaji: 'Kare wa himitsu o morashite shimatta.', vi: 'Anh ấy lỡ tiết lộ bí mật.' },
          { jp: '計画の内容がメディアに漏れた。', romaji: 'Keikaku no naiyō ga media ni moreta.', vi: 'Nội dung kế hoạch bị lộ ra truyền thông.' },
        ],
      },
      {
        pattern: 'N + を暴露する / N + が暴露される',
        meaning: 'phơi bày ~, vạch trần ~',
        formalityLevel: 'neutral',
        examples: [
          { jp: '記者が不正を暴露した。', romaji: 'Kisha ga fusei o bakuro shita.', vi: 'Phóng viên vạch trần hành vi gian lận.' },
          { jp: 'スキャンダルが暴露され、辞任を余儀なくされた。', romaji: 'Sukyandaru ga bakuro sare, jinin o yoginaku sareta.', vi: 'Vụ bê bối bị phơi bày, buộc phải từ chức.' },
        ],
      },
      {
        pattern: 'N + について論じる',
        meaning: 'bàn luận về ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '環境問題について論じ合った。', romaji: 'Kankyō mondai ni tsuite ronjatta.', vi: 'Chúng tôi đã bàn luận về vấn đề môi trường.' },
          { jp: '彼の論文は教育制度について論じている。', romaji: 'Kare no ronbun wa kyōiku seido ni tsuite ronjite iru.', vi: 'Luận văn của anh ấy bàn về chế độ giáo dục.' },
        ],
      },
      {
        pattern: 'N + を批判する / N + が批判される',
        meaning: 'phê phán ~',
        formalityLevel: 'neutral',
        examples: [
          { jp: 'その政策は野党から批判された。', romaji: 'Sono seisaku wa yatō kara hihan sareta.', vi: 'Chính sách đó bị phe đối lập phê phán.' },
          { jp: '彼は自分の行動を後から批判した。', romaji: 'Kare wa jibun no kōdō o ato kara hihan shita.', vi: 'Sau đó anh ấy phê phán hành động của chính mình.' },
        ],
      },
      {
        pattern: 'N + と称される / N + と呼ばれる',
        meaning: 'được gọi là ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '彼は天才と称されている。', romaji: 'Kare wa tensai to shō sarete iru.', vi: 'Anh ấy được coi là thiên tài.' },
          { jp: 'この地域は「小京都」と呼ばれる。', romaji: 'Kono chiiki wa "Shō-Kyōto" to yobareru.', vi: 'Vùng này được gọi là "Kyoto thu nhỏ".' },
        ],
      },
    ],
  },
  {
    lessonNumber: 409,
    jlptLevel: 'N2',
    title: 'N2 · Bài 9 — Pháp luật, quyền lợi',
    sortOrder: 4090,
    items: [
      {
        pattern: 'N + に違反する / N + に反する',
        meaning: 'vi phạm ~, trái với ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '彼は交通規則に違反した。', romaji: 'Kare wa kōtsū kisoku ni ihan shita.', vi: 'Anh ấy vi phạm luật giao thông.' },
          { jp: 'その行為は法律に反する。', romaji: 'Sono kōi wa hōritsu ni hansuru.', vi: 'Hành vi đó trái với pháp luật.' },
        ],
      },
      {
        pattern: 'N + を訴える / N + を起訴する',
        meaning: 'kiện ~; truy tố ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '被害者が加害者を訴えた。', romaji: 'Higaisha ga kagaisha o uttaeta.', vi: 'Nạn nhân đã kiện người gây hại.' },
          { jp: '検察は彼を起訴した。', romaji: 'Kensatsu wa kare o kiso shita.', vi: 'Viện kiểm sát đã truy tố anh ta.' },
        ],
      },
      {
        pattern: 'N + を裁判する / N + で裁判される',
        meaning: 'xét xử ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '事件は最高裁で裁判された。', romaji: 'Jiken wa saikōsai de saiban sareta.', vi: 'Vụ án được xét xử ở Tòa án Tối cao.' },
          { jp: '彼は不正を裁判で争った。', romaji: 'Kare wa fusei o saiban de arasotta.', vi: 'Anh ấy tranh tụng vụ gian lận tại tòa.' },
        ],
      },
      {
        pattern: 'N + を証明する / N + が証明される',
        meaning: 'chứng minh ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '被告の無罪が証明された。', romaji: 'Hikoku no muzai ga shōmei sareta.', vi: 'Sự vô tội của bị cáo đã được chứng minh.' },
          { jp: '科学的方法で仮説を証明する。', romaji: 'Kagaku teki hōhō de kasetsu o shōmei suru.', vi: 'Chứng minh giả thuyết bằng phương pháp khoa học.' },
        ],
      },
      {
        pattern: 'N + を弁護する',
        meaning: 'biện hộ cho ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '弁護士が依頼人を弁護した。', romaji: 'Bengoshi ga irainin o bengo shita.', vi: 'Luật sư đã biện hộ cho thân chủ.' },
          { jp: '彼は自分の考えを熱心に弁護した。', romaji: 'Kare wa jibun no kangae o nesshin ni bengo shita.', vi: 'Anh ấy nhiệt tình bảo vệ quan điểm của mình.' },
        ],
      },
      {
        pattern: 'N + を補償する / N + に対して賠償する',
        meaning: 'bồi thường ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '会社は被害者に損害を補償した。', romaji: 'Kaisha wa higaisha ni songai o hoshō shita.', vi: 'Công ty bồi thường thiệt hại cho nạn nhân.' },
          { jp: '事故に対して保険会社が賠償した。', romaji: 'Jiko ni taishite hoken gaisha ga baishō shita.', vi: 'Công ty bảo hiểm đã bồi thường vụ tai nạn.' },
        ],
      },
      {
        pattern: 'N + には限界がある',
        meaning: '~ có giới hạn',
        formalityLevel: 'neutral',
        examples: [
          { jp: '人間の忍耐にも限界がある。', romaji: 'Ningen no nintai ni mo genkai ga aru.', vi: 'Sự kiên nhẫn của con người cũng có giới hạn.' },
          { jp: '予算には限界があるので、全部は買えない。', romaji: 'Yosan ni wa genkai ga aru node, zenbu wa kaenai.', vi: 'Ngân sách có hạn nên không mua hết được.' },
        ],
      },
      {
        pattern: 'N + を契約する / N + と契約する',
        meaning: 'ký hợp đồng ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '来月から新しい会社と契約する。', romaji: 'Raigetsu kara atarashii kaisha to keiyaku suru.', vi: 'Từ tháng sau ký hợp đồng với công ty mới.' },
          { jp: '賃貸契約を結んだ。', romaji: 'Chintai keiyaku o musunda.', vi: 'Đã ký hợp đồng thuê nhà.' },
        ],
      },
    ],
  },
  {
    lessonNumber: 410,
    jlptLevel: 'N2',
    title: 'N2 · Bài 10 — Phân loại, đặc trưng',
    sortOrder: 4100,
    items: [
      {
        pattern: 'N + に分類される / N + に区分される',
        meaning: 'được phân loại vào ~',
        formalityLevel: 'formal',
        examples: [
          { jp: 'この本は文学に分類される。', romaji: 'Kono hon wa bungaku ni bunrui sareru.', vi: 'Cuốn sách này được phân loại vào văn học.' },
          { jp: '商品は三つのカテゴリーに区分される。', romaji: 'Shōhin wa mittsu no kategorī ni kubun sareru.', vi: 'Sản phẩm được chia thành ba danh mục.' },
        ],
      },
      {
        pattern: 'N + の特徴として / N + が特徴的だ',
        meaning: 'đặc trưng của ~ là ~',
        formalityLevel: 'formal',
        examples: [
          { jp: 'この地域の特徴として、雪が多い。', romaji: 'Kono chiiki no tokuchō to shite, yuki ga ōi.', vi: 'Đặc trưng của vùng này là tuyết nhiều.' },
          { jp: '彼の話し方は特徴的だ。', romaji: 'Kare no hanashikata wa tokuchō teki da.', vi: 'Cách nói chuyện của anh ấy rất đặc trưng.' },
        ],
      },
      {
        pattern: 'N + に相当する',
        meaning: 'tương đương với ~',
        formalityLevel: 'formal',
        examples: [
          { jp: 'この仕事は部長に相当する。', romaji: 'Kono shigoto wa buchō ni sōtō suru.', vi: 'Công việc này tương đương trưởng phòng.' },
          { jp: '日本の高校は12年生に相当する。', romaji: 'Nihon no kōkō wa jūni gakunen ni sōtō suru.', vi: 'Trung học Nhật tương đương lớp 12.' },
        ],
      },
      {
        pattern: 'N + によって異なる / N + により異なる',
        meaning: 'khác nhau tùy theo ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '見え方は人によって異なる。', romaji: 'Miekata wa hito ni yotte koto naru.', vi: 'Cách nhìn khác nhau tùy người.' },
          { jp: '制度は国により異なる。', romaji: 'Seido wa kuni ni yori koto naru.', vi: 'Thể chế khác nhau tùy quốc gia.' },
        ],
      },
      {
        pattern: 'N + を整理する / N + が整理される',
        meaning: 'sắp xếp ~, chỉnh lý ~',
        formalityLevel: 'neutral',
        examples: [
          { jp: '資料を整理してから会議に出た。', romaji: 'Shiryō o seiri shite kara kaigi ni deta.', vi: 'Sắp xếp tài liệu rồi mới đi họp.' },
          { jp: '部屋が整理されて気持ちがいい。', romaji: 'Heya ga seiri sarete kimochi ga ii.', vi: 'Phòng được dọn gọn nên thấy thoải mái.' },
        ],
      },
      {
        pattern: 'N + を改める / N + を改めて',
        meaning: 'cải cách ~; một lần nữa ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '生活習慣を改める必要がある。', romaji: 'Seikatsu shūkan o aratameru hitsuyō ga aru.', vi: 'Cần thay đổi thói quen sinh hoạt.' },
          { jp: '改めてお礼を申し上げます。', romaji: 'Aratame te orei o mōshiagemasu.', vi: 'Xin được một lần nữa cảm ơn.' },
        ],
      },
      {
        pattern: 'N + の構造 / N + 構造で',
        meaning: 'cấu trúc của ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '社会の構造が変化している。', romaji: 'Shakai no kōzō ga henka shite iru.', vi: 'Cấu trúc xã hội đang thay đổi.' },
          { jp: 'この建物は独特の構造をしている。', romaji: 'Kono tatemono wa dokutoku no kōzō o shite iru.', vi: 'Tòa nhà này có cấu trúc độc đáo.' },
        ],
      },
      {
        pattern: 'N + を共通とする / N + が共通している',
        meaning: 'có chung ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '二人は価値観を共通としている。', romaji: 'Futari wa kachikan o kyōtsū to shite iru.', vi: 'Hai người có chung quan niệm giá trị.' },
          { jp: 'これらの言語は語源が共通している。', romaji: 'Korera no gengo wa gogen ga kyōtsū shite iru.', vi: 'Các ngôn ngữ này có chung nguồn gốc từ.' },
        ],
      },
    ],
  },

  // ─── N1 ───
  {
    lessonNumber: 505,
    jlptLevel: 'N1',
    title: 'N1 · Bài 5 — Kinh tế, bồi thường',
    sortOrder: 5050,
    items: [
      {
        pattern: 'N + を余儀なくされる',
        meaning: 'bị buộc phải ~ (vì hoàn cảnh)',
        formalityLevel: 'formal',
        examples: [
          { jp: '台風のため、出発を余儀なくされた。', romaji: 'Taifū no tame, shuppatsu o yoginaku sareta.', vi: 'Vì bão nên buộc phải hoãn khởi hành.' },
          { jp: '経営不振により、リストラを余儀なくされた。', romaji: 'Keiei fushin ni yori, risutora o yoginaku sareta.', vi: 'Do kinh doanh suy thoái buộc phải cắt giảm nhân sự.' },
        ],
      },
      {
        pattern: 'N + に足る / N + に足りる',
        meaning: 'đáng ~, xứng đáng ~',
        formalityLevel: 'written',
        examples: [
          { jp: '彼の努力は称賛に足る。', romaji: 'Kare no doryoku wa shōsan ni taru.', vi: 'Nỗ lực của anh ấy đáng được ca ngợi.' },
          { jp: 'その証拠は信用に足りない。', romaji: 'Sono shōko wa shinyō ni tarinai.', vi: 'Bằng chứng đó không đáng tin.' },
        ],
      },
      {
        pattern: 'N + をもってしても',
        meaning: 'dù có ~ cũng (không đủ)',
        formalityLevel: 'formal',
        examples: [
          { jp: '今の技術をもってしても、解決は難しい。', romaji: 'Ima no gijutsu o motte shite mo, kaiketsu wa muzukashii.', vi: 'Dù có công nghệ hiện tại cũng khó giải quyết.' },
          { jp: '全力をもってしても、及ばなかった。', romaji: 'Zenryoku o motte shite mo, oyobanakatta.', vi: 'Dù dốc toàn lực cũng không sánh kịp.' },
        ],
      },
      {
        pattern: 'N + に迫る / N + が迫る',
        meaning: 'ép buộc ~; (thời hạn) cận kề',
        formalityLevel: 'formal',
        examples: [
          { jp: '締め切りが迫っている。', romaji: 'Shimekiri ga sematte iru.', vi: 'Hạn chót đang cận kề.' },
          { jp: '生活苦に迫られた。', romaji: 'Seikatsuku ni semarareta.', vi: 'Bị ép buộc bởi khó khăn sinh hoạt.' },
        ],
      },
      {
        pattern: 'N + を余すところなく',
        meaning: 'không chừa một ~ nào, triệt để',
        formalityLevel: 'formal',
        examples: [
          { jp: '努力を余すところなく準備した。', romaji: 'Doryoku o amasu tokoro naku junbi shita.', vi: 'Chuẩn bị hết sức không chừa nỗ lực nào.' },
          { jp: '説明の機会を余すところなく与えた。', romaji: 'Setsumei no kikai o amasu tokoro naku ataeta.', vi: 'Đã cho cơ hội giải thích đầy đủ.' },
        ],
      },
      {
        pattern: 'N + に充てる / N + に充当する',
        meaning: 'dành ~ cho ~, dùng ~ cho ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '余剰金を設備投資に充てる。', romaji: 'Yojōkin o setsubi tōshi ni ateru.', vi: 'Dành tiền dư cho đầu tư thiết bị.' },
          { jp: '寄付金は被災地の復興に充当される。', romaji: 'Kifukin wa hisaichi no fukkō ni jūtō sareru.', vi: 'Tiền quyên góp được dùng cho tái thiết vùng thiên tai.' },
        ],
      },
      {
        pattern: 'N + に乏しい / N + が乏しい',
        meaning: 'thiếu ~, kém ~',
        formalityLevel: 'formal',
        examples: [
          { jp: 'この地域は医療資源に乏しい。', romaji: 'Kono chiiki wa iryō shigen ni toboshi.', vi: 'Vùng này thiếu nguồn lực y tế.' },
          { jp: '彼の説明は具体性に乏しかった。', romaji: 'Kare no setsumei wa gutaisei ni toboshi katta.', vi: 'Lời giải thích của anh ấy thiếu tính cụ thể.' },
        ],
      },
      {
        pattern: 'N + を余す',
        meaning: 'dư ra ~, còn thừa ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '時間を余して観光も楽しんだ。', romaji: 'Jikan o amashite kankō mo tanoshinda.', vi: 'Còn dư thời gian nên cũng đi tham quan.' },
          { jp: '予算に余裕を余す。', romaji: 'Yosan ni yoyū o amasu.', vi: 'Dư dả ngân sách.' },
        ],
      },
    ],
  },
  {
    lessonNumber: 506,
    jlptLevel: 'N1',
    title: 'N1 · Bài 6 — Phân tích, suy luận',
    sortOrder: 5060,
    items: [
      {
        pattern: 'N + から見れば / N + から見ると',
        meaning: 'xét từ góc độ ~',
        formalityLevel: 'neutral',
        examples: [
          { jp: '消費者から見れば、値段が重要だ。', romaji: 'Shōhisha kara mireba, nedan ga jūyō da.', vi: 'Xét từ phía người tiêu dùng, giá cả quan trọng.' },
          { jp: '歴史から見ると、繰り返されている。', romaji: 'Rekishi kara miru to, kurikaesarete iru.', vi: 'Nhìn từ lịch sử thì điều này lặp lại.' },
        ],
      },
      {
        pattern: 'N + に基づいて / N + に基づき',
        meaning: 'dựa trên ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '事実に基づいて判断する。', romaji: 'Jijitsu ni motozuite handan suru.', vi: 'Phán đoán dựa trên sự thật.' },
          { jp: '法律に基づき、処分が下された。', romaji: 'Hōritsu ni motozuki, shobun ga kudasareta.', vi: 'Dựa trên pháp luật, hình phạt được ban hành.' },
        ],
      },
      {
        pattern: 'N + を踏まえて / N + を踏まえ',
        meaning: 'căn cứ vào ~, xét đến ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '現状を踏まえて、計画を修正した。', romaji: 'Genjō o fumae te, keikaku o shūsei shita.', vi: 'Căn cứ hiện trạng, đã sửa kế hoạch.' },
          { jp: '前回の結果を踏まえ、対策を練る。', romaji: 'Zenkai no kekka o fumae, taisaku o neru.', vi: 'Căn cứ kết quả lần trước, lập biện pháp.' },
        ],
      },
      {
        pattern: 'N + を前提として / N + を前提に',
        meaning: 'lấy ~ làm tiền đề',
        formalityLevel: 'formal',
        examples: [
          { jp: '成長を前提に、人員を増やす。', romaji: "Seichō o zentei to shite, jin'in o fuyasu.", vi: 'Lấy tăng trưởng làm tiền đề, tăng nhân sự.' },
          { jp: '双方の合意を前提に交渉する。', romaji: 'Sōhō no gōi o zentei ni kōshō suru.', vi: 'Đàm phán trên tiền đề hai bên đồng ý.' },
        ],
      },
      {
        pattern: 'N + に即して / N + に即した',
        meaning: 'phù hợp với ~, theo ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '現場の実情に即した対応が必要だ。', romaji: 'Genba no jitsujō ni sokushita taiō ga hitsuyō da.', vi: 'Cần ứng phó phù hợp thực tế hiện trường.' },
          { jp: '時代に即して制度を見直す。', romaji: 'Jidai ni sokushite seido o minaosu.', vi: 'Xem xét lại thể chế cho phù hợp thời đại.' },
        ],
      },
      {
        pattern: 'N + を総合すると / N + を総合すれば',
        meaning: 'tổng hợp lại thì ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '各方面を総合すれば、計画は実行可能だ。', romaji: 'Kaku hōmen o sōgō sureba, keikaku wa jikkō kanō da.', vi: 'Tổng hợp các mặt thì kế hoạch khả thi.' },
          { jp: 'データを総合すると、傾向が見えてくる。', romaji: 'Dēta o sōgō suru to, keikō ga miete kuru.', vi: 'Tổng hợp dữ liệu thì thấy xu hướng.' },
        ],
      },
      {
        pattern: 'N + を推察する / N + が推察される',
        meaning: 'suy đoán ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '彼の表情から、不安を推察した。', romaji: 'Kare no hyōjō kara, fuan o suisoku shita.', vi: 'Từ biểu cảm anh ấy, tôi suy đoán sự lo lắng.' },
          { jp: '背景には政治的理由が推察される。', romaji: 'Haikei ni wa seiji teki riyū ga suisoku sareru.', vi: 'Có thể suy đoán phía sau là lý do chính trị.' },
        ],
      },
      {
        pattern: 'N + を見据える / N + を見据えて',
        meaning: 'nhìn về phía ~; hướng tới ~ (tương lai)',
        formalityLevel: 'formal',
        examples: [
          { jp: '将来を見据えて、スキルを身につける。', romaji: 'Shōrai o misuete, sukiru o mi ni tsukeru.', vi: 'Hướng tới tương lai, trau dồi kỹ năng.' },
          { jp: '彼は常に目標を見据えている。', romaji: 'Kare wa tsune ni mokuhyō o misuete iru.', vi: 'Anh ấy luôn hướng về mục tiêu.' },
        ],
      },
    ],
  },
  {
    lessonNumber: 507,
    jlptLevel: 'N1',
    title: 'N1 · Bài 7 — Văn hóa, đạo đức',
    sortOrder: 5070,
    items: [
      {
        pattern: 'N + を尊ぶ / N + を尊ぶ文化',
        meaning: 'tôn trọng ~',
        formalityLevel: 'formal',
        examples: [
          { jp: 'この国では自然を尊ぶ。', romaji: 'Kono kuni de wa shizen o tōtobu.', vi: 'Ở đất nước này người ta tôn trọng thiên nhiên.' },
          { jp: '伝統を尊ぶ考え方。', romaji: 'Dentō o tōtobu kangaekata.', vi: 'Quan niệm tôn trọng truyền thống.' },
        ],
      },
      {
        pattern: 'N + を誠意をもって',
        meaning: 'với thành ý ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '誠意をもって対応した。', romaji: 'Seii o motte taiō shita.', vi: 'Đã ứng xử với thành ý.' },
          { jp: '誠意をもってお詫び申し上げます。', romaji: 'Seii o motte owabi mōshiagemasu.', vi: 'Xin được xin lỗi chân thành.' },
        ],
      },
      {
        pattern: 'N + を装う / N + を装った',
        meaning: 'giả vờ ~, mang vẻ ~',
        formalityLevel: 'written',
        examples: [
          { jp: '彼は無関心を装った。', romaji: 'Kare wa mukanshin o yosoō ta.', vi: 'Anh ấy giả vờ không quan tâm.' },
          { jp: '知らないふりを装う。', romaji: 'Shiranai furi o yosoū.', vi: 'Giả vờ không biết.' },
        ],
      },
      {
        pattern: 'N + に背く / N + に背いた',
        meaning: 'phản bội ~, trái với ~',
        formalityLevel: 'written',
        examples: [
          { jp: '信念に背く行為は許されない。', romaji: 'Shinnen ni somuku kōi wa yurusarenai.', vi: 'Hành vi phản bội niềm tin không được tha thứ.' },
          { jp: '期待に背いた結果になった。', romaji: 'Kitai ni somuita kekka ni natta.', vi: 'Kết quả đã phụ lòng kỳ vọng.' },
        ],
      },
      {
        pattern: 'N + を顧みず / N + を顧みない',
        meaning: 'không màng ~, bất chấp ~',
        formalityLevel: 'written',
        examples: [
          { jp: '危険を顧みず、前進した。', romaji: 'Kiken o kae mirazu, zenshin shita.', vi: 'Bất chấp nguy hiểm, tiến lên.' },
          { jp: '周囲の目を顧みない。', romaji: 'Shūi no me o kaeriminai.', vi: 'Không màng ánh mắt xung quanh.' },
        ],
      },
      {
        pattern: 'N + に同調する / N + に同調しない',
        meaning: 'đồng điệu với ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '多数派に同調する必要はない。', romaji: 'Tasūha ni dōchō suru hitsuyō wa nai.', vi: 'Không cần đồng điệu với đa số.' },
          { jp: '世論に同調した政策。', romaji: 'Yoron ni dōchō shita seisaku.', vi: 'Chính sách theo dư luận.' },
        ],
      },
      {
        pattern: 'N + を異にする / N + とは異なる',
        meaning: 'khác với ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '従来の方法とは異なるアプローチ。', romaji: 'Jūrai no hōhō to wa koto naru apurōchi.', vi: 'Cách tiếp cận khác với phương pháp truyền thống.' },
          { jp: '見た目を異にしているが、中身は同じだ。', romaji: 'Mitame o koto ni shite iru ga, nakami wa onaji da.', vi: 'Bề ngoài khác nhưng bên trong giống nhau.' },
        ],
      },
      {
        pattern: 'N + を以て',
        meaning: 'bằng ~; coi ~ là ~ (văn viết)',
        formalityLevel: 'formal',
        examples: [
          { jp: '本日を以て、退任いたします。', romaji: 'Honjitsu o motte, tainin itashimasu.', vi: 'Kể từ hôm nay, tôi xin từ nhiệm.' },
          { jp: '実力を以て評価される。', romaji: 'Jitsuryoku o motte hyōka sareru.', vi: 'Được đánh giá bằng năng lực thực.' },
        ],
      },
    ],
  },
  {
    lessonNumber: 508,
    jlptLevel: 'N1',
    title: 'N1 · Bài 8 — Thời gian, bản chất',
    sortOrder: 5080,
    items: [
      {
        pattern: 'N + を経て / N + を経た',
        meaning: 'trải qua ~ (thời gian/quá trình)',
        formalityLevel: 'formal',
        examples: [
          { jp: '長い歳月を経て、再会した。', romaji: 'Nagai saigetsu o hete, saikai shita.', vi: 'Sau nhiều năm tháng, chúng tôi gặp lại.' },
          { jp: '議論を経て、結論に達した。', romaji: 'Giron o hete, ketsuron ni tasshita.', vi: 'Qua tranh luận, đã đi đến kết luận.' },
        ],
      },
      {
        pattern: 'N + 以来 / N + 以後',
        meaning: 'kể từ ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '入学以来、一度も欠席していない。', romaji: 'Nyūgaku irai, ichido mo kesseki shite inai.', vi: 'Kể từ khi nhập học chưa vắng lần nào.' },
          { jp: '改革以後、状況が改善した。', romaji: 'Kaisei ikō, jōkyō ga kaizen shita.', vi: 'Sau cải cách, tình hình được cải thiện.' },
        ],
      },
      {
        pattern: 'N + 末に / N + 末',
        meaning: 'cuối cùng sau ~ thì ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '悩んだ末に、転職を決意した。', romaji: 'Nayanda sue ni, tenshoku o ketsui shita.', vi: 'Sau khi băn khoăn, quyết định chuyển việc.' },
          { jp: '長い議論の末、案が可決された。', romaji: 'Nagai giron no sue, an ga kaketsu sareta.', vi: 'Sau tranh luận dài, đề án được thông qua.' },
        ],
      },
      {
        pattern: 'N + に先立ち / N + に先立って',
        meaning: 'trước khi ~ (chuẩn bị trang trọng)',
        formalityLevel: 'formal',
        examples: [
          { jp: '会議に先立ち、資料を配布した。', romaji: 'Kaigi ni sakidachi, shiryō o haifu shita.', vi: 'Trước cuộc họp, đã phát tài liệu.' },
          { jp: '出発に先立って、点検を行う。', romaji: 'Shuppatsu ni sakidatte, tenken o okonau.', vi: 'Trước khi khởi hành, tiến hành kiểm tra.' },
        ],
      },
      {
        pattern: 'N + を機に / N + を機として',
        meaning: 'lấy ~ làm dịp',
        formalityLevel: 'formal',
        examples: [
          { jp: '転勤を機に、家族で引っ越した。', romaji: 'Tenkin o ki ni, kazoku de hikkoshita.', vi: 'Nhân dịp chuyển công tác, cả nhà chuyển nhà.' },
          { jp: '記念日を機に、新しいプロジェクトを始める。', romaji: 'Kinenbi o ki to shite, atarashii purojekuto o hajimeru.', vi: 'Nhân ngày kỷ niệm, bắt đầu dự án mới.' },
        ],
      },
      {
        pattern: 'N + に即時 / N + 即時に',
        meaning: 'ngay lập tức ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '問題が発覚し、即時に対応した。', romaji: 'Mondai ga hakkaku shi, sokuji ni taiō shita.', vi: 'Vấn đề phát hiện ra, ứng phó ngay.' },
          { jp: '即時の報告が求められる。', romaji: 'Sokuji no hōkoku ga motomerareru.', vi: 'Yêu cầu báo cáo tức thì.' },
        ],
      },
      {
        pattern: 'N + の根底にある / N + が根底にある',
        meaning: 'nằm ở gốc rễ ~',
        formalityLevel: 'formal',
        examples: [
          { jp: 'その問題の根底にあるのは貧困だ。', romaji: 'Sono mondai no kontei ni aru no wa hinkon da.', vi: 'Nằm ở gốc rễ vấn đề đó là nghèo đói.' },
          { jp: '不信感が根底にある。', romaji: 'Fushinkan ga kontei ni aru.', vi: 'Sự không tin tưởng nằm ở gốc rễ.' },
        ],
      },
      {
        pattern: 'N + をもってして / N + もってして',
        meaning: 'ngay cả ~ cũng (không đủ/không thể)',
        formalityLevel: 'formal',
        examples: [
          { jp: '現在の設備もってしては、需要に応えられない。', romaji: 'Genzai no setsubi motte shite wa, juyō ni kotaerarenai.', vi: 'Với thiết bị hiện tại không đáp ứng được nhu cầu.' },
          { jp: '科学の力もってしても、すべては解明できない。', romaji: 'Kagaku no chikara motte shite mo, subete wa kaimei dekinai.', vi: 'Dù có sức mạnh khoa học cũng không giải thích hết được.' },
        ],
      },
    ],
  },
  {
    lessonNumber: 509,
    jlptLevel: 'N1',
    title: 'N1 · Bài 9 — Vật chất, tính chất trừu tượng',
    sortOrder: 5090,
    items: [
      {
        pattern: 'N + を覆す / N + が覆される',
        meaning: 'lật đổ ~; che phủ ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '政権が覆された。', romaji: 'Seiken ga kutsugaesareta.', vi: 'Chính quyền bị lật đổ.' },
          { jp: '雪が山を覆っている。', romaji: 'Yuki ga yama o ootte iru.', vi: 'Tuyết phủ kín núi.' },
        ],
      },
      {
        pattern: 'N + に浸る / N + に浸って',
        meaning: 'ngâm mình trong ~; đắm chìm ~',
        formalityLevel: 'written',
        examples: [
          { jp: '温泉に浸って疲れを癒す。', romaji: 'Onsen ni hitatte tsukare o iyasu.', vi: 'Ngâm mình trong suối nước nóng để xả mệt.' },
          { jp: '研究に浸っている。', romaji: 'Kenkyū ni hitatte iru.', vi: 'Đang đắm chìm nghiên cứu.' },
        ],
      },
      {
        pattern: 'N + に溶け込む / N + に溶け込んで',
        meaning: 'hòa nhập vào ~',
        formalityLevel: 'neutral',
        examples: [
          { jp: '彼は現地の文化に溶け込んだ。', romaji: 'Kare wa genchi no bunka ni tokekomu.', vi: 'Anh ấy hòa nhập văn hóa địa phương.' },
          { jp: '新入生がクラスに溶け込むのに時間がかかる。', romaji: 'Shinnyūsei ga kurasu ni tokekomu no ni jikan ga kakaru.', vi: 'Tân sinh viên mất thời gian hòa nhập lớp.' },
        ],
      },
      {
        pattern: 'N + を純化する / N + が純化される',
        meaning: 'tinh luyện ~, làm tinh khiết ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '技術により水が純化される。', romaji: 'Gijutsu ni yori mizu ga junka sareru.', vi: 'Nhờ công nghệ nước được tinh lọc.' },
          { jp: '思想を純化しようとする試み。', romaji: 'Shisō o junka shiyō to suru kokoromi.', vi: 'Nỗ lực tinh luyện tư tưởng.' },
        ],
      },
      {
        pattern: 'N + に乏しい / N + 乏しい',
        meaning: 'khan hiếm ~, thiếu ~',
        formalityLevel: 'formal',
        examples: [
          { jp: 'この地方は雨に乏しい。', romaji: 'Kono chihō wa ame ni toboshi.', vi: 'Vùng này khan hiếm mưa.' },
          { jp: '経験乏しい新人。', romaji: 'Keiken toboshi shinjinin.', vi: 'Nhân viên mới thiếu kinh nghiệm.' },
        ],
      },
      {
        pattern: 'N + を膨張させる / N + が膨張する',
        meaning: 'làm phình to ~; ~ phồng lên',
        formalityLevel: 'formal',
        examples: [
          { jp: '予算が膨張した。', romaji: 'Yosan ga bōchō shita.', vi: 'Ngân sách phình to.' },
          { jp: '期待を膨らませてしまった。', romaji: 'Kitai o fukuramasete shimatta.', vi: 'Đã làm kỳ vọng phình to.' },
        ],
      },
      {
        pattern: 'N + を緻密に / 緻密なN',
        meaning: 'tỉ mỉ ~, chặt chẽ ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '緻密な計画を立てた。', romaji: 'Chimitsu na keikaku o tateta.', vi: 'Đã lập kế hoạch tỉ mỉ.' },
          { jp: 'データを緻密に分析する。', romaji: 'Dēta o chimitsu ni bunseki suru.', vi: 'Phân tích dữ liệu chặt chẽ.' },
        ],
      },
      {
        pattern: 'N + をもって終わる / N + もって終わり',
        meaning: 'kết thúc bằng ~',
        formalityLevel: 'formal',
        examples: [
          { jp: '彼のスピーチをもって、式は終わった。', romaji: 'Kare no supīchi o motte, shiki wa owatta.', vi: 'Bài phát biểu của anh ấy kết thúc buổi lễ.' },
          { jp: 'これをもって、本日の会議を終了します。', romaji: 'Kore o motte, honjitsu no kaigi o shūryō shimasu.', vi: 'Với điều này, xin kết thúc cuộc họp hôm nay.' },
        ],
      },
    ],
  },
];
