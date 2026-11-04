# Kiến trúc SAM Mobile

## Hướng phụ thuộc

```text
src/app (route + layout)
  → navigation/ScreenRoute (đọc ID, lấy dữ liệu cho screen cũ)
  → screens (giao diện, trạng thái hiển thị cục bộ)
  → features (provider, hook, nghiệp vụ/model)
  → services/repository.ts (chọn driver theo contract)
  → services/mock (driver JS + fixtures hiện tại)

components/common, design, constants: giao diện dùng chung
lib, features/*/model: logic độc lập React/native, kiểm thử bằng Node
```

ESLint chặn UI import trực tiếp repository/mock/fixtures và chặn model import React, React Native, Expo Router. Không có barrel export gom toàn bộ feature; import thẳng module cần dùng để dễ lần theo phụ thuộc.

## Thư mục và trách nhiệm

| Thư mục | Trách nhiệm |
| --- | --- |
| `app/` | File route mỏng; layout không chứa nghiệp vụ |
| `navigation/` | Route names, query params, route guards, adapter cho screen đang dùng props navigation |
| `providers/AppProviders.tsx` | Ghép provider và tạo ranh giới theo phiên đăng nhập |
| `screens/` | Giữ vị trí các màn hình hiện có theo nhóm chức năng |
| `features/auth/` | Khôi phục phiên, đăng nhập/đăng xuất, cập nhật hồ sơ |
| `features/marketplace/` | Dự án, categories, đề xuất; hook form và quyết định duyệt |
| `features/chat/` | Hội thoại, gửi/đọc; composer và thread; model lưu lịch sử |
| `features/notifications/` | Danh sách thông báo, số chưa đọc, đánh dấu đã đọc |
| `features/subscriptions/` | Danh mục gói, kích hoạt gói mẫu, đồng bộ hồ sơ và thông báo |
| `services/contracts.ts` | Giao diện dữ liệu mà feature sử dụng |
| `services/repository.ts` | Điểm duy nhất lựa chọn driver và cấu hình lưu trữ chat |
| `services/mock/` | Triển khai mock; fixtures không đi thẳng vào screen |
| `types/domain.ts` | Kiểu dữ liệu nội bộ của mobile |
| `hooks/` | Resource/action lifecycle dùng chung |
| `lib/` | Request gate, error normalization, lưu phiên; không phụ thuộc native |
| `tests/` | Model tests và helper nạp JS/TS độc lập runtime Expo |

## State và bất đồng bộ

Mỗi feature có loading/error riêng. Đang gửi đề xuất hoặc kích hoạt gói không bật spinner tải dữ liệu của toàn ứng dụng. Callback dùng trong effect được giữ ổn định theo ID tài khoản; cập nhật hồ sơ không tải lại mọi danh sách.

`useAsyncResource` giữ dữ liệu cũ khi refresh lỗi và chỉ nhận phản hồi của request mới nhất. `requestGate` vô hiệu hóa kết quả sau unmount hoặc thay đổi phiên. `AppProviders` dùng user ID và số phiên làm key: đăng xuất rồi đăng nhập lại cùng một tài khoản vẫn tạo resource mới.

Provider dữ liệu không điều hướng. `useProposalDecision` phối hợp cập nhật đề xuất, tải lại chat rồi mở workspace cho luồng mock hiện tại. `useChat` thêm thao tác mở hội thoại cho UI. `useMessageComposer` giữ ID khi thử gửi lại để không tạo tin trùng.

Phiên vẫn giữ key `user_session`, lịch sử chat vẫn giữ key `sam_project_chats_v1`. Phiên cũ được đọc và ghi lại dưới dạng public profile, bỏ password/token/field không thuộc profile. Các lần ghi phiên được tuần tự hóa để thao tác lưu chậm không khôi phục phiên sau logout. Cơ chế này phục vụ mock; authentication/token của backend chưa được triển khai.

## TypeScript và dữ liệu

Provider, hooks mới, session, navigation, form model và repository contract được kiểm tra strict bằng TypeScript. Các screen/component JS cũ được giữ để tránh chuyển đổi quá nhiều cùng lúc; `checkJs` hiện chưa bật cho toàn bộ source. Shared components có JSDoc props khi được gọi từ TSX.

Adapter mock có một số type assertion tại ranh giới JS. Đây là dữ liệu fixtures tin cậy trong repo, không phải validation cho HTTP responses. Khi viết API adapter, cần kiểm tra/chuẩn hóa response, enum backend và lỗi tại adapter; screen tiếp tục dùng domain types hiện tại.

## Thêm hoặc sửa tính năng

1. Bổ sung domain type và phương thức trong `Repository` nếu cần dữ liệu mới.
2. Triển khai adapter; không tạo fallback mock khi API lỗi.
3. Đặt quy tắc dữ liệu trong `features/<feature>/model`, thao tác state trong hook/provider, JSX trong screen/component.
4. Truyền ID trên URL; không serialize toàn bộ job, plan hoặc profile vào route.
5. Viết test cho quy tắc hoặc lỗi bất đồng bộ thực sự có nguy cơ hồi quy. Không test chỉ để khẳng định component gọi đúng setter.
6. Chạy `npm run check`; thay đổi route/provider cần thêm kiểm tra luồng người dùng và export bundle.

## Phạm vi refactor

Đã bỏ AppContext tổng hợp, modal chat và state modal không còn dùng, helper đổi tài khoản mẫu, các hook chỉ re-export context, entry App.js trùng, HTTP client/config ví dụ chưa có caller và style không còn được tham chiếu. Tách mock service/fixtures ra khỏi UI; tách logic form và chat khỏi JSX; thống nhất format bằng Prettier và EditorConfig.

Các screen vẫn nằm trong `screens/` và dùng adapter `ScreenRoute` trong giai đoạn chuyển đổi. Có thể chuyển từng screen sang route hooks trực tiếp sau này; không cần thay toàn bộ điều hướng cùng lúc. Backend API, VNPay và các nghiệp vụ chưa tích hợp được theo dõi riêng trong MOBILE_REDESIGN.md.

## Kiểm chứng refactor — 2026-11-05

- `npm run check` đạt: lint không có warning, typecheck, format check và 4 file model tests.
- Các test mới kiểm tra session bỏ credentials/field sai, thứ tự ghi phiên khi logout, phục hồi sau lỗi ghi, request cũ sau refresh/remount, route chỉ truyền ID, lọc dự án và đề xuất theo tài khoản.
- Export web và bundle Android/Hermes thành công.
- Smoke test bằng Chromium: đăng nhập và kiểm tra profile lưu không chứa password; gửi đề xuất; đăng xuất/đăng nhập tài khoản khác; duyệt đề xuất mở workspace; gửi tin, giữ bản nháp khi đổi tab và khôi phục lịch sử sau reload; lưu bản nháp dự án; kích hoạt gói mẫu mà không remount mất modal; quay lại tài khoản Freelancer.
- Chưa kiểm thử refactor trên thiết bị native thật. Bộ kiểm thử trình duyệt xác nhận luồng React Native Web; không thay thế kiểm tra bàn phím/cử chỉ trên thiết bị.
