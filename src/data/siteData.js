/**
 * ==============================================================================
 * TỆP CẤU HÌNH DỮ LIỆU TOÀN TRANG (SITE DATA)
 * ==============================================================================
 * Bạn có thể dễ dàng thay đổi toàn bộ văn bản, hình ảnh, liên kết, số điện thoại,
 * mạng xã hội tại đây mà KHÔNG CẦN chỉnh sửa mã nguồn giao diện (JSX).
 * 
 * Lưu ý về hình ảnh:
 * - Để thay ảnh, bạn có thể copy ảnh thật vào thư mục `public/images/`
 *   rồi cập nhật lại đường dẫn tương đối (ví dụ: "./images/ten-anh-moi.jpg")
 * - Hoặc sử dụng link ảnh trực tiếp nếu muốn.
 * ==============================================================================
 */

export const siteData = {
  // 1. THÔNG TIN THƯƠNG HIỆU
  brand: {
    name: "Nhà Xơ Mướp",
    logoText: "Nhà Xơ Mướp",
    logoSub: "HANDMADE NATURAL SOAP",
    tagline: "Xà phòng xơ mướp thủ công tự nhiên - Chăm sóc làn da dịu lành",
    establishedYear: "2024",
  },

  // 2. THANH ĐIỀU HƯỚNG (HEADER / NAVBAR)
  navigation: [
    { id: "hero", label: "Trang chủ", href: "#hero" },
    { id: "about", label: "Giới thiệu", href: "#about" },
    { id: "product", label: "Sản phẩm", href: "#product" },
    { id: "features", label: "Đặc điểm", href: "#features" },
    { id: "ingredients", label: "Thành phần", href: "#ingredients" },
    { id: "process", label: "Quy trình", href: "#process" },
    { id: "usage", label: "Cách dùng", href: "#usage" },
    { id: "gallery", label: "Thư viện", href: "#gallery" },
    { id: "contact", label: "Liên hệ", href: "#contact" },
  ],

  // 3. HERO SECTION
  hero: {
    badge: "Thủ công từ thiên nhiên",
    title: "Xà phòng xơ mướp tự nhiên",
    // Ngắt dòng có chủ đích cho tiêu đề lớn; `emphasis` là dòng in nghiêng
    titleLines: [
      { text: "Xà phòng" },
      { text: "xơ mướp", emphasis: true },
      { text: "tự nhiên" },
    ],
    subtitle:
      "Sự kết hợp mộc mạc giữa phôi xà phòng thực vật dịu lành và xơ mướp mộc tự nhiên. Mang lại cảm giác sạch thoáng, tẩy tế bào chết nhẹ nhàng và thân thiện với môi trường.",
    ctaPrimary: {
      label: "Khám phá sản phẩm",
      href: "#product",
    },
    ctaSecondary: {
      label: "Xem quy trình làm",
      href: "#process",
    },
    image: "./images/hero-soap.svg",
    // Đặt đường dẫn ảnh chụp thật (vd: "./images/hero.webp") để thay minh họa dựng sẵn
    photo: "",
    // Chữ lấy đúng theo mặt trước bao bì
    caption: "Xà bông thiên nhiên · 90 g",
    imageAlt: "Bánh xà phòng xơ mướp tự nhiên có dây treo mộc",
    tags: [
      "100% nguyên liệu tự nhiên",
      "Không vi hạt nhựa",
      "Phân hủy sinh học hoàn toàn",
    ],
  },

  // 4. GIỚI THIỆU SẢN PHẨM (ABOUT)
  about: {
    badge: "Về sản phẩm",
    title: "Sự kết hợp tinh tế giữa xà phòng lành tính và xơ mướp truyền thống",
    lead:
      "Lấy cảm hứng từ trái mướp hương già quen thuộc trong vườn nhà Việt, xà phòng xơ mướp là sự hòa quyện giữa nét mộc mạc dân gian và thói quen chăm sóc da hiện đại.",
    paragraphs: [
      "Xơ mướp tự nhiên đóng vai trò như một miếng bông tắm thực vật mềm mại, kết hợp cùng phôi xà phòng nguồn gốc thực vật giúp làm sạch bụi bẩn và tế bào chết một cách êm ái.",
      "Không hóa chất tạo bọt công nghiệp nặng nề, không hương liệu gắt – mỗi bánh xà phòng mang lại phút giây thư giãn mộc mạc, gần gũi với thiên nhiên trong chính phòng tắm của bạn.",
    ],
    image: "./images/photos/can-canh-banh-xa-bong.webp",
    imagePosition: "35% 50%",
    imageAlt: "Cận cảnh bánh xà bông với miếng xơ mướp nằm trong lòng bánh, đặt trên khoanh gỗ",
    values: [
      {
        title: "Xơ mướp tuyển chọn",
        desc: "Thu hoạch từ mướp già đượm nắng, làm sạch thủ công, không ngâm tẩy trắng bằng hóa chất.",
      },
      {
        title: "Phôi thực vật dịu nhẹ",
        desc: "Dầu dừa, dầu olive và glycerin thực vật nuôi dưỡng độ ẩm tự nhiên, không gây khô căng da.",
      },
      {
        title: "Lối sống xanh bền vững",
        desc: "Tự phân hủy sinh học 100%, thay thế bông tắm nhựa tổng hợp, bao bì giấy mộc thân thiện.",
      },
    ],
  },

  // 5. NỔI BẬT SẢN PHẨM (PRODUCT SHOWCASE)
  productShowcase: {
    badge: "Chi tiết sản phẩm",
    title: "Bánh xà phòng xơ mướp mộc",
    subtitle:
      "Từng bánh xà phòng được tạo tác tỉ mỉ, tích hợp dây treo tiện lợi giúp bánh luôn khô ráo sau mỗi lần dùng.",
    // Ảnh tĩnh chỉ dùng khi trình duyệt không chạy được mô hình 3D (xem `product3d`)
    mainImageTitle: "Hộp và bánh xà bông",
    mainImage: "./images/photos/hop-va-banh-xa-bong.webp",
    mainImageAlt: "Hộp giấy Nhà Xơ Mướp và bánh xà bông xơ mướp đặt trên khay gỗ",
    thumbnails: [
      {
        src: "./images/showcase-sub1.svg",
        alt: "Cấu trúc sợi xơ mướp mộc",
        title: "Sợi xơ mướp tự nhiên",
      },
      {
        src: "./images/showcase-sub2.svg",
        alt: "Lớp bọt mịn màng êm dịu",
        title: "Lớp bọt mịn dịu nhẹ",
      },
      {
        src: "./images/showcase-sub3.svg",
        alt: "Bao bì giấy mộc thân thiện",
        title: "Đóng gói thân thiện",
      },
    ],
    specs: [
      {
        label: "Thành phần chính",
        value: "Xơ mướp mộc, phôi xà phòng dầu dừa, dầu olive, glycerin thực vật",
      },
      {
        label: "Hương thơm",
        value: "Hương thơm tinh dầu thảo mộc dịu nhẹ (Tràm trà / Sả chanh / Tự nhiên)",
      },
      {
        label: "Trọng lượng",
        value: "100g ± 10g / bánh",
      },
      {
        label: "Thiết kế",
        value: "Bánh tròn hoặc bo góc kèm xơ mướp nguyên khối, tích hợp dây đay treo",
      },
      {
        label: "Bảo quản",
        value: "Treo nơi thoáng gió ráo nước sau khi tắm để bánh xà phòng bền lâu",
      },
    ],
    cta: {
      label: "Liên hệ tư vấn & đặt hàng",
      href: "#contact",
    },
  },

  // 5b. MÔ HÌNH 3D SẢN PHẨM (dùng ở Hero và mục Sản phẩm)
  product3d: {
    // GLB chính: hộp giấy + bánh xà bông, texture nhúng sẵn (public/nha-xo-muop-source/nha-xo-muop.glb)
    model: "./nha-xo-muop-source/nha-xo-muop.glb",
    // Dự phòng nếu GLB không tải được: dựng hộp từ sáu mặt in, kích thước thật (mm)
    sizeMm: [120, 84, 50],
    panels: {
      front: "./nha-xo-muop-source/art/out/panel_front.png",
      back: "./nha-xo-muop-source/art/out/panel_back.png",
      left: "./nha-xo-muop-source/art/out/panel_left.png",
      right: "./nha-xo-muop-source/art/out/panel_right.png",
      top: "./nha-xo-muop-source/art/out/panel_top.png",
      bottom: "./nha-xo-muop-source/art/out/panel_bottom.png",
    },
    alt: "Mô hình 3D: hộp xà bông Nhà Xơ Mướp và bánh xà bông gắn miếng xơ mướp đặt phía trước",
    fallbackAlt: "Mặt trước hộp xà bông Nhà Xơ Mướp",
    hint: "Kéo để xoay",
    // Góc nghỉ: yaw/pitch tính bằng radian, zoom là hệ số phóng, focus là bộ phận đưa vào giữa khung
    heroView: { yaw: -0.42, pitch: 0, zoom: 1.12 },
    views: [
      { id: "set", label: "Toàn cảnh", yaw: -0.42, pitch: 0, zoom: 1.1 },
      { id: "front", label: "Mặt trước", yaw: 0.36, pitch: 0.12, zoom: 1.22 },
      { id: "side", label: "Mặt bên", yaw: -1.2, pitch: -0.08, zoom: 1.12 },
      { id: "back", label: "Mặt sau", yaw: 3.1416, pitch: -0.1, zoom: 1.22 },
      { id: "soap", label: "Bánh xà bông", yaw: -0.55, pitch: 0.5, zoom: 1.85, focus: "soap" },
    ],
  },

  // 6. ĐẶC ĐIỂM NỔI BẬT (FEATURES)
  features: {
    badge: "Đặc điểm nổi bật",
    title: "Vì sao nên chọn xà phòng xơ mướp?",
    subtitle:
      "Trải nghiệm tắm sạch sâu, nhẹ nhàng và an tâm với nguồn gốc thực vật tự nhiên.",
    items: [
      {
        icon: "Sparkles",
        title: "Tẩy tế bào chết êm dịu",
        desc: "Sợi xơ mướp mềm dẻo khi thấm nước, giúp loại bỏ da chết nhẹ nhàng ở khuỷu tay, gót chân và lưng mà không gây rát da.",
      },
      {
        icon: "Leaf",
        title: "100% Sợi thực vật mộc",
        desc: "Giữ nguyên kết cấu xơ mướp tự nhiên, không pha tạp sợi nhân tạo và không qua xử lý tẩy trắng công nghiệp.",
      },
      {
        icon: "Droplets",
        title: "Bọt mịn giữ ẩm tự nhiên",
        desc: "Phôi thực vật kết hợp glycerin giúp tạo lớp bọt mịn màng, làm sạch mồ hôi và bã nhờn mà vẫn giữ ẩm cho da.",
      },
      {
        icon: "HeartHandshake",
        title: "Chế tác thủ công tỉ mỉ",
        desc: "Mỗi mẻ xà phòng được làm thủ công theo mẻ nhỏ (small batch) để đảm bảo chất lượng và độ hoàn thiện tinh tế.",
      },
      {
        icon: "Globe",
        title: "Thân thiện với đại dương",
        desc: "Hoàn toàn không có hạt vi nhựa (microbeads). Khi dùng hết, phần xơ mướp còn lại có thể ủ thành phân hữu cơ.",
      },
      {
        icon: "PackageCheck",
        title: "Dây treo tiện dụng",
        desc: "Dây thừng đay tự nhiên gắn sẵn giúp bạn treo xà phòng lên cao ráo sau mỗi lần sử dụng, chống nhão và tiết kiệm.",
      },
    ],
  },

  // 7. THÀNH PHẦN / NGUYÊN LIỆU (INGREDIENTS)
  ingredients: {
    badge: "Thành phần tự nhiên",
    title: "Nguyên liệu lành tính từ cỏ cây",
    subtitle:
      "Tối giản thành phần, chỉ giữ lại những gì dịu dàng và an toàn nhất cho làn da của bạn.",
    items: [
      {
        name: "Xơ mướp mộc tự nhiên",
        desc: "Thu hoạch từ vườn mướp già, phơi khô dưới nắng tự nhiên, giữ trọn độ dai và độ xốp thoáng khí.",
        image: "./images/photos/xo-muop-kho.webp",
      },
      {
        name: "Dầu thực vật lành tính",
        desc: "Nguồn gốc từ dầu dừa và dầu olive tự nhiên giúp làm sạch êm dịu và tạo bọt bồng bềnh.",
        image: "./images/photos/xo-muop-tinh-dau-thao-moc.webp",
        imagePosition: "0% 50%",
      },
      {
        name: "Tinh dầu thảo mộc",
        desc: "Chiết xuất tinh dầu tự nhiên mang lại hương thơm nhẹ nhàng, thư thái tinh thần sau ngày dài.",
        image: "./images/photos/xo-muop-va-xa-bong.webp",
        imagePosition: "10% 30%",
      },
      {
        name: "Glycerin thực vật giữ ẩm",
        desc: "Hợp chất dưỡng ẩm tự nhiên giúp giữ lại lượng ẩm cần thiết, cho bề mặt da luôn mềm mại.",
        image: "./images/photos/banh-xa-bong-ke-go.webp",
        imagePosition: "55% 50%",
      },
    ],
  },

  // 8. QUY TRÌNH SẢN XUẤT (PROCESS)
  process: {
    badge: "Quy trình làm xà phòng",
    title: "Từ quả mướp vườn nhà đến bánh xà phòng",
    subtitle:
      "Mỗi bước đều được thực hiện cẩn trọng và chuẩn bị tỉ mỉ để tạo ra sản phẩm chất lượng nhất.",
    steps: [
      {
        step: "01",
        title: "Tuyển chọn quả mướp",
        desc: "Lựa chọn những quả mướp hương già đạt độ khô chuẩn, xơ dai chắc và màu sắc vàng ngà tự nhiên.",
      },
      {
        step: "02",
        title: "Sơ chế & cắt định hình",
        desc: "Tách bỏ vỏ và hạt, ngâm nước sạch, phơi nắng tự nhiên rồi cắt thành từng khoanh tròn vừa vặn.",
      },
      {
        step: "03",
        title: "Nấu phôi dầu thực vật",
        desc: "Đun chảy phôi xà phòng thực vật ở nhiệt độ tiêu chuẩn, phối trộn glycerin và tinh dầu thảo mộc.",
      },
      {
        step: "04",
        title: "Đổ khuôn & luồn dây treo",
        desc: "Xếp xơ mướp vào khuôn, rót phôi xà phòng đều vào từng thớ xơ và lồng dây đay mộc tiện dụng.",
      },
      {
        step: "05",
        title: "Dưỡng bánh & đóng gói",
        desc: "Chờ xà phòng đông kết tự nhiên, kiểm tra chất lượng từng bánh và bọc gói trong giấy kraft mộc mạc.",
      },
    ],
  },

  // 9. HƯỚNG DẪN SỬ DỤNG (USAGE)
  usage: {
    badge: "Cách sử dụng",
    title: "Sử dụng & bảo quản đúng cách",
    subtitle:
      "Vài lưu ý nhỏ giúp bạn tận hưởng tối đa cảm giác sảng khoái và dùng bánh xà phòng được lâu hơn.",
    steps: [
      {
        number: 1,
        title: "Làm ướt bánh & cơ thể",
        desc: "Làm ướt cơ thể và để bánh xà phòng dưới làn nước ấm vài giây để các sợi xơ mướp nở mềm mại.",
      },
      {
        number: 2,
        title: "Xoa nhẹ tạo bọt",
        desc: "Xoa xà phòng giữa hai lòng bàn tay hoặc chà nhẹ trực tiếp lên da để kích hoạt lớp bọt mịn.",
      },
      {
        number: 3,
        title: "Massage nhẹ nhàng",
        desc: "Dùng mặt xơ mướp lướt nhẹ theo vòng tròn, tập trung vào những vùng da sần sùi như khuỷu tay, gót chân.",
      },
      {
        number: 4,
        title: "Tắm sạch & treo ráo",
        desc: "Xả sạch lại bằng nước mát. Treo bánh xà phòng lên móc bằng dây đay ở nơi khô thoáng, tránh đọng nước.",
      },
    ],
    tipTitle: "Lời khuyên bảo quản:",
    tipContent:
      "Xà phòng có chứa glycerin tự nhiên dễ hút ẩm, vì vậy việc treo bánh xà phòng nơi khô ráo sẽ giúp bánh không bị mềm nhão và kéo dài thời gian sử dụng thêm gấp đôi.",
  },

  // 10. BỘ SƯU TẬP (GALLERY)
  gallery: {
    badge: "Thư viện hình ảnh",
    title: "Khoảnh khắc mộc mạc từ xưởng làm",
    subtitle:
      "Những hình ảnh ghi lại nguyên liệu tự nhiên và thành phẩm của Nhà Xơ Mướp.",
    items: [
      {
        id: 1,
        image: "./images/photos/hop-va-banh-xa-bong.webp",
        title: "Hộp giấy và bánh xà bông Nhà Xơ Mướp",
        category: "Thành phẩm",
      },
      {
        id: 2,
        image: "./images/photos/xo-muop-kho.webp",
        title: "Xơ mướp khô cắt khoanh",
        category: "Nguyên liệu",
      },
      {
        id: 3,
        image: "./images/photos/banh-xa-bong-tach-nen.webp",
        title: "Bánh xà bông gắn miếng xơ mướp",
        category: "Thành phẩm",
        fit: "contain",
      },
      {
        id: 4,
        image: "./images/photos/banh-xa-bong-ke-go.webp",
        title: "Đặt bánh trên kệ gỗ cho ráo nước",
        category: "Đời sống",
      },
      {
        id: 5,
        image: "./images/photos/xo-muop-tinh-dau-thao-moc.webp",
        title: "Xơ mướp, tinh dầu và lá thảo mộc",
        category: "Nguyên liệu",
      },
      {
        id: 6,
        image: "./images/photos/xo-muop-va-xa-bong.webp",
        title: "Xơ mướp nguyên quả bên bánh xà bông",
        category: "Đời sống",
        position: "78% 50%",
      },
    ],
  },

  // 11. CÂU CHUYỆN THƯƠNG HIỆU (BRAND STORY)
  brandStory: {
    badge: "Câu chuyện thương hiệu",
    title: "Hành trình xanh bắt đầu từ góc vườn quê",
    quote:
      "\"Chúng tôi tin rằng sự chăm sóc tốt nhất cho làn da luôn bắt đầu từ những điều giản dị, thuần khiết nhất của đất trời.\"",
    paragraphs: [
      "Từ thuở nhỏ, hình ảnh những giàn mướp đơm hoa vàng rực rồi khô lại thành những chiếc xơ mộc mạc nơi góc bếp quê đã in sâu vào ký ức. Đó là món quà thiên nhiên ban tặng vừa bền bỉ, vừa lành tính.",
      "Nhà Xơ Mướp ra đời với mong muốn mang tinh thần mộc mạc ấy vào đời sống hiện đại. Không màu mè, không phô trương – chỉ là những bánh xà phòng làm từ tâm, nâng niu làn da của bạn và giữ trọn sự trong lành cho môi trường.",
    ],
    founder: "Người sáng lập Nhà Xơ Mướp",
    image: "./images/photos/xo-muop-tinh-dau-thao-moc.webp",
    imagePosition: "62% 50%",
    imageAlt: "Xơ mướp khô, lọ tinh dầu, lá thảo mộc và những bánh xà bông bày trên vải lanh",
  },

  // 12. LIÊN HỆ / KÊNH KẾT NỐI (CONTACT)
  contact: {
    badge: "Liên hệ & Tư vấn",
    title: "Bạn có câu hỏi hoặc muốn trải nghiệm sản phẩm?",
    subtitle:
      "Đừng ngần ngại nhắn tin hoặc liên hệ qua các kênh dưới đây. Chúng tôi luôn sẵn lòng lắng nghe và hỗ trợ bạn.",
    info: {
      phone: "0704 716 414",
      phoneRaw: "0704716414",
      email: "datnhce180797@fpt.com.vn",
      address: "600 Nguyễn Văn Cừ Nối Dài, An Bình, Cần Thơ, Việt Nam",
      workingHours: "08:00 - 18:00 (Thứ Hai - Thứ Bảy)",
    },
    socialLinks: {
      facebook: "https://www.facebook.com/nhaxomuop?locale=vi_VN",
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
      zalo: "https://zalo.me",
    },
    ctaButtons: [
      {
        label: "Nhắn tin qua Zalo",
        href: "https://zalo.me",
        type: "primary",
      },
      {
        label: "Gửi Email cho chúng tôi",
        href: "mailto:datnhce180797@fpt.com.vn",
        type: "secondary",
      },
      {
        label: "Gọi điện tư vấn",
        href: "tel:0704716414",
        type: "outline",
      },
    ],
  },

  // 13. CHÂN TRANG (FOOTER)
  footer: {
    description:
      "Thương hiệu xà phòng thủ công tự nhiên kết hợp xơ mướp mộc, mang lại giải pháp làm sạch lành tính và thân thiện với môi trường.",
    copyright: "© 2026 Nhà Xơ Mướp. Mọi quyền được bảo lưu.",
    disclaimer:
      "Sản phẩm được làm thủ công từ nguyên liệu tự nhiên. Thông tin trên website mang tính chất giới thiệu sản phẩm và trải nghiệm thực tế.",
  },
};
