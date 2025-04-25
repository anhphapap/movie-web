# 🎬 Needflex

**Needflex** là nền tảng xem phim trực tuyến lấy cảm hứng từ Netflix, nơi bạn có thể khám phá và thưởng thức hàng loạt bộ phim ngay trên trình duyệt – đơn giản, nhanh chóng và hoàn toàn miễn phí.
Dự án được xây dựng với mục tiêu học tập và thực hành các công nghệ hiện đại trong phát triển web frontend.

## 🚀 Demo

**Needflex** hiện đã được deploy tại: [movie-web-lake-eta.vercel.app](https://movie-web-lake-eta.vercel.app)

## 🛠️ Công nghệ sử dụng

- **React**: Thư viện JavaScript để xây dựng giao diện người dùng.
- **Vite**: Công cụ xây dựng dự án nhanh chóng và hiện đại.
- **Tailwind CSS**: Framework CSS tiện lợi cho việc thiết kế giao diện.
- **JavaScript**: Ngôn ngữ lập trình chính cho dự án.

## 📦 Cài đặt và chạy dự án

1. **Clone repository:**

   ```bash
   git clone https://github.com/anhphapap/movie-web.git
   cd movie-web
   ```

2. **Tạo file `.env` từ mẫu:**

   ```bash
   cp .env.example .env
   ```

   Để ứng dụng hoạt động chính xác, bạn cần cấu hình một số dịch vụ trong Firebase:

   - Kích hoạt **Authentication** với hai phương thức: **Email/Password** và **Google**
   - Tạo một **Cloud Firestore database**

   Sau đó điền đầy đủ thông tin Firebase vào file `.env`.

3. **Cài đặt dependencies:**

   ```bash
   npm install
   ```

4. **Chạy ứng dụng ở chế độ phát triển:**

   ```bash
   npm run dev
   ```

5. **Truy cập ứng dụng:**

   Mở trình duyệt và truy cập `http://localhost:5173` để xem ứng dụng.

## 🌐 Nguồn dữ liệu API

Ứng dụng sử dụng dữ liệu phim từ API công khai của [Ophim](https://ophim17.cc/api-document).
