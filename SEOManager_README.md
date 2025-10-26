# SEOManager - Global SEO Management System

## Tổng quan

SEOManager là một hệ thống quản lý SEO global được thiết kế để giải quyết vấn đề xung đột SEO giữa các modal (MovieModal và ListModal) trong ứng dụng Movie Web.

## Vấn đề được giải quyết

- **Xung đột SEO**: Trước đây, MovieModal và ListModal đều sử dụng SEO component riêng biệt, gây ra xung đột khi cả hai modal cùng mở
- **Không có cơ chế phục hồi**: Khi modal đóng, SEO không được phục hồi về trạng thái trước đó

## Cách hoạt động

### 1. SEOManager Context (`src/context/SEOManagerContext.jsx`)

- **currentSEO**: SEO hiện tại đang được áp dụng
- **seoStack**: Stack lưu trữ các SEO trước đó để phục hồi
- **pushSEO(seoData)**: Push SEO mới vào stack và set làm current
- **popSEO()**: Pop SEO từ stack và restore SEO trước đó
- **clearSEO()**: Clear toàn bộ stack và reset về null

### 2. Luồng hoạt động

```
Trang chủ (SEO mặc định)
    ↓
Mở MovieModal → pushSEO(movieSEO) → SEO của phim được áp dụng
    ↓
Mở ListModal → pushSEO(listSEO) → SEO của danh sách được áp dụng
    ↓
Đóng ListModal → popSEO() → SEO của phim được phục hồi
    ↓
Đóng MovieModal → popSEO() → SEO trang chủ được phục hồi
```

### 3. Các component được cập nhật

#### MovieModalProvider

- Import `useSEOManager`
- Gọi `pushSEO(seoOnPage)` khi modal mở
- Gọi `popSEO()` khi modal đóng

#### ListModalProvider

- Import `useSEOManager`
- Gọi `pushSEO(seoOnPage)` khi modal mở
- Gọi `popSEO()` khi modal đóng

#### MovieModal & ListModal

- Xóa SEO component trực tiếp
- Sử dụng `pushSEO()` thông qua useEffect

#### App.jsx

- Wrap toàn bộ app với `SEOManagerProvider`
- Thêm `SEOGlobal` component để render SEO từ SEOManager

### 4. SEOGlobal Component (`src/components/SEOGlobal.jsx`)

- Component đơn giản sử dụng `useSEOManager`
- Render SEO component với `currentSEO` từ SEOManager
- Được đặt ở level cao nhất trong App để đảm bảo SEO được áp dụng global

## Lợi ích

1. **Không xung đột**: Chỉ có một SEO được áp dụng tại một thời điểm
2. **Phục hồi tự động**: SEO được phục hồi về trạng thái trước đó khi modal đóng
3. **Quản lý tập trung**: Tất cả SEO được quản lý thông qua một context duy nhất
4. **Dễ mở rộng**: Có thể dễ dàng thêm modal mới mà không lo xung đột SEO

## Cách sử dụng

### Thêm modal mới

1. Import `useSEOManager` trong provider của modal
2. Gọi `pushSEO(seoData)` khi modal mở
3. Gọi `popSEO()` khi modal đóng

### Ví dụ

```jsx
const { pushSEO, popSEO } = useSEOManager();

const openModal = (seoData) => {
  // Logic mở modal
  pushSEO(seoData);
};

const closeModal = () => {
  // Logic đóng modal
  popSEO();
};
```

## Kết luận

SEOManager đã giải quyết thành công vấn đề xung đột SEO giữa các modal, đảm bảo SEO được quản lý một cách nhất quán và có thể phục hồi tự động.
