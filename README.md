# Nhà Xơ Mướp — Website Giới Thiệu Sản Phẩm Xà Phòng Xơ Mướp

Website landing page giới thiệu sản phẩm **Xà phòng xơ mướp thủ công tự nhiên**. Dự án được xây dựng bằng **React** + **Vite**, thiết kế theo phong cách tự nhiên, tối giản, organic và sẵn sàng tự động deploy lên **GitHub Pages**.

---

## 1. Cài đặt & Khởi chạy (Quick Start)

### Cài đặt thư viện
```bash
npm install
```

### Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Truy cập trình duyệt tại địa chỉ: `http://localhost:5173/`

### Đóng gói dự án (Production Build)
```bash
npm run build
```
Kết quả build được lưu trong thư mục `dist/`.

### Xem trước bản build (Preview)
```bash
npm run preview
```

---

## 2. Hướng dẫn thay đổi nội dung & hình ảnh (Dễ dàng nhất)

Toàn bộ nội dung của trang đã được **tách rời hoàn toàn khỏi mã nguồn giao diện**. Bạn chỉ cần cập nhật dữ liệu tại một nơi duy nhất:

📍 **Tệp dữ liệu:** `src/data/siteData.js`

### 2.1 Thay đổi văn bản & tên thương hiệu
Mở tệp `src/data/siteData.js` và chỉnh sửa các mục tương ứng:
- **Tên thương hiệu & Slogan**: Tìm phần `brand` (`name`, `logoText`, `logoSub`, `tagline`).
- **Hero Section**: Tìm phần `hero` (`title`, `subtitle`, `tags`).
- **Giới thiệu sản phẩm**: Tìm phần `about` (`lead`, `paragraphs`, `values`).
- **Chi tiết sản phẩm**: Tìm phần `productShowcase` (`title`, `specs`).
- **Đặc điểm nổi bật**: Tìm phần `features` (`items`).
- **Nguyên liệu / Thành phần**: Tìm phần `ingredients` (`items`).
- **Quy trình sản xuất**: Tìm phần `process` (`steps`).
- **Hướng dẫn sử dụng**: Tìm phần `usage` (`steps`, `tipContent`).
- **Câu chuyện thương hiệu**: Tìm phần `brandStory` (`quote`, `paragraphs`).

### 2.2 Thay đổi hình ảnh & Logo
Tất cả hình ảnh được quản lý tập trung trong thư mục:
📁 **`public/images/`**

Các bước thay ảnh thật:
1. Đặt ảnh sản phẩm thật của bạn vào thư mục `public/images/` (ví dụ: `my-soap.jpg`).
2. Mở `src/data/siteData.js`, thay thế tên tệp ở các trường hình ảnh:
   ```javascript
   // Ví dụ trong hero:
   image: "./images/my-soap.jpg",
   
   // Ví dụ trong showcase:
   mainImage: "./images/my-soap-showcase.jpg",
   ```
3. **Mô hình 3D sản phẩm** (hero và mục "Sản phẩm") được nạp từ `public/nha-xo-muop-source/nha-xo-muop.glb`. Đường dẫn, góc nhìn và nhãn các nút nằm ở mục `product3d` trong `siteData.js`. Mã nguồn cảnh 3D: `src/components/three/`.
   - Muốn dùng ảnh chụp thay mô hình ở hero: đặt `hero.photo: "./images/hero.webp"`.
   - Trình duyệt không có WebGL sẽ thấy ảnh mặt trước bao bì (`product3d.panels.front`).
   - **Ảnh sản phẩm**: đặt ảnh gốc vào `public/new-images/`, khai báo trong `scripts/optimize-images.mjs` rồi chạy `npm run images` để tạo bản WebP nhẹ trong `public/images/photos/`. `siteData.js` trỏ tới các bản WebP này; `imagePosition` / `position` chỉnh điểm neo khi ảnh bị cắt cúp.
4. Tiêu đề lớn ở hero ngắt dòng theo `hero.titleLines` (dòng có `emphasis: true` được in nghiêng).
5. Nếu muốn thay logo favicon trên tab trình duyệt, chỉ cần thay tệp `public/favicon.svg`.

### 2.3 Thay đổi thông tin liên hệ & Mạng xã hội
Trong `src/data/siteData.js`, tìm mục `contact`:
```javascript
contact: {
  info: {
    phone: "0901 234 567",         // Số hiển thị
    phoneRaw: "0901234567",       // Số khi bấm gọi điện
    email: "lienhe@nhaxomuop.vn",
    address: "Địa chỉ của bạn",
    workingHours: "08:00 - 18:00 (Thứ 2 - Thứ 7)",
  },
  socialLinks: {
    facebook: "https://facebook.com/trang-cua-ban",
    instagram: "https://instagram.com/trang-cua-ban",
    tiktok: "https://tiktok.com/@trang-cua-ban",
    zalo: "https://zalo.me/0901234567",
  }
}
```

---

## 3. Cấu trúc thư mục dự án

```text
nha-xo-muop/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions tự động build & deploy Pages
├── public/
│   ├── favicon.svg             # Favicon xà phòng xơ mướp
│   └── images/                 # Kho ảnh placeholder & ảnh sản phẩm
├── src/
│   ├── assets/                 # Tài nguyên tĩnh nội bộ
│   ├── components/
│   │   ├── common/             # Các component dùng chung
│   │   │   ├── Navbar.jsx      # Thanh điều hướng sticky & menu mobile
│   │   │   ├── Footer.jsx      # Chân trang & liên kết nhanh
│   │   │   ├── SectionTitle.jsx# Tiêu đề chuẩn hóa các section
│   │   │   ├── FeatureCard.jsx # Thẻ đặc điểm nổi bật
│   │   │   └── ImagePlaceholder.jsx # Khung giữ ảnh kèm cơ chế fallback an toàn
│   │   └── sections/           # Các section nội dung
│   │       ├── Hero.jsx        # Khối mở đầu thu hút
│   │       ├── About.jsx       # Giới thiệu & giá trị sản phẩm
│   │       ├── ProductShowcase.jsx # Trưng bày & đổi ảnh chi tiết
│   │       ├── Features.jsx    # 6 đặc điểm nổi bật
│   │       ├── Ingredients.jsx # 4 nhóm nguyên liệu tự nhiên
│   │       ├── Process.jsx     # 5 bước quy trình sản xuất
│   │       ├── Usage.jsx       # Hướng dẫn dùng & mẹo bảo quản
│   │       ├── Gallery.jsx     # Thư viện ảnh + bộ lọc danh mục + phóng to ảnh
│   │       ├── BrandStory.jsx  # Câu chuyện thương hiệu & trích dẫn
│   │       └── Contact.jsx     # Kênh kết nối + Form đăng ký tư vấn nhanh
│   ├── data/
│   │   └── siteData.js         # Toàn bộ dữ liệu chữ & link của website
│   ├── styles/
│   │   ├── variables.css       # Biến màu sắc, font chữ, hiệu ứng CSS
│   │   └── global.css          # CSS toàn cục & layout
│   ├── App.jsx                 # Lắp ghép toàn bộ website & nút cuộn lên đầu trang
│   ├── index.css
│   └── main.jsx
├── index.html                  # Thẻ SEO meta, Google Fonts tiếng Việt
├── package.json
└── vite.config.js              # Cấu hình đường dẫn linh hoạt cho GitHub Pages
```

---

## 4. Hướng dẫn Deploy lên GitHub Pages

Dự án đã được cấu hình sẵn sàng 100% để deploy tự động thông qua **GitHub Actions**.

### Bước 1: Đẩy mã nguồn lên GitHub
Khởi tạo git và push lên repository của bạn:
```bash
git init
git add .
git commit -m "feat: landing page xa phong xo muop"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
git push -u origin main
```

### Bước 2: Kích hoạt GitHub Pages trên GitHub
1. Vào repository trên GitHub.
2. Nhấp vào tab **Settings** > **Pages** (ở menu bên trái).
3. Tại phần **Build and deployment** > **Source**, chọn:
   👉 **`GitHub Actions`** (thay vì "Deploy from a branch").

### Bước 3: Hoàn tất
- Khi bạn push code vào nhánh `main`, workflow `.github/workflows/deploy.yml` sẽ tự động kích hoạt, chạy lệnh build và đưa website lên mạng trong vòng 1-2 phút.
- Website của bạn sẽ hoạt động tại địa chỉ:
  `https://<tai-khoan-cua-ban>.github.io/<ten-repo>/`

### Xử lý đường dẫn `base` trong `vite.config.js`
Trong `vite.config.js`, cấu hình đường dẫn đã được thiết kế tối ưu:
```javascript
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : (process.env.VITE_BASE_PATH || './'),
}))
```
- Khi chạy dev ở máy bạn: `base` là `/` giúp nạp trang siêu tốc.
- Khi build cho GitHub Pages: `base` là `./` (đường dẫn tương đối) giúp website **hoạt động ngay lập tức dưới bất kỳ tên repository nào** mà bạn không cần phải sửa đổi file cấu hình thủ công.
