# SAM Mobile

Ứng dụng Expo/React Native dùng Expo Router. Có hai chế độ: xem trước bằng mock khi chưa đặt API URL, hoặc dùng backend thật cho đăng nhập và các luồng dự án, chat, tài chính, bảo trì khi đã cấu hình API. Giao diện chia theo vai trò Client/Freelancer.

## Chạy dự án

```sh
npm ci
npm start
npm run web
```

Chỉ trong chế độ mock, tài khoản mẫu: `customer@example.com` hoặc `freelancer@example.com`, mật khẩu `123456`. Đây là dữ liệu mẫu phục vụ phát triển.

## Dùng API thật

Sao chép `.env.example` vào `.env`, đặt `EXPO_PUBLIC_API_URL` là origin backend (không thêm `/api/v1`) và `EXPO_PUBLIC_AUTH_ORIGIN` là origin được backend cho phép trong CORS. Production bắt buộc HTTPS. Khởi động lại Expo sau khi đổi biến môi trường.

Dùng tài khoản thật của backend. Freelancer mở Tài chính từ hồ sơ; khách hàng mở Bảo trì trong không gian dự án đã hoàn thành. Không đặt khóa Pay2S hoặc khóa mã hóa ngân hàng trong app. Chi tiền thật do backend kiểm soát và mặc định tắt.

Hướng dẫn Pay2S/giải ngân đầy đủ nằm tại `sam-be/docs/PAY2S_FINANCE_SETUP.md` trong workspace SAM. Thanh toán mở trình duyệt ngoài; quay lại app và tải lại để xem trạng thái backend. Cần kiểm thử cookie phiên và luồng trình duyệt trên thiết bị iOS/Android trước phát hành. Danh sách API dự án/chat hiện lấy trang đầu, chưa có phân trang toàn bộ lịch sử trong adapter mới.

## Kiểm tra trước khi bàn giao

```sh
npm run check
```

Lệnh này chạy lint, typecheck, kiểm tra format và model tests. Dùng `npm run format` để định dạng mã. Các kiểm thử model chạy được trên Node, không cần emulator. Môi trường đã kiểm tra: Node 22.22.1.

Thay đổi Expo/React Native cần đối chiếu SDK đang dùng theo [AGENTS.md](AGENTS.md); thêm package bằng `npx expo install`.

## Đọc source

- [Kiến trúc và quy tắc bảo trì](docs/ARCHITECTURE.md)
- [Thiết kế và phần tích hợp backend còn lại](docs/MOBILE_REDESIGN.md)
- [Kết quả rà giao diện mobile](docs/MOBILE_UI_AUDIT.md)

`package.json` trỏ trực tiếp vào `expo-router/entry`; `src/app/_layout.js` là layout gốc. Không có entry `App.js` thứ hai.
