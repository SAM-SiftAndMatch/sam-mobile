# SAM Mobile

Ứng dụng Expo/React Native dùng Expo Router. Mobile hiện chạy bằng mock repository; các màn hình đã có nhận diện SAM và bố cục theo vai trò Client/Freelancer.

## Chạy dự án

```sh
npm ci
npm start
npm run web
```

Tài khoản mẫu: `customer@example.com` hoặc `freelancer@example.com`, mật khẩu `123456`. Đây là dữ liệu mẫu phục vụ phát triển.

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
