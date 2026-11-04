# Kiểm tra giao diện mobile — 2026-11-04

## Kết luận

Nhận diện đã thống nhất với web ở wordmark SAM, font Be Vietnam Pro, màu primary #1D4ED8, nền #F8FAFC, chữ #0F172A và viền #E2E8F0. Thẻ nội dung 12px và control 8px được áp dụng thêm cho form đăng dự án và ô nhập. Bố cục được điều chỉnh riêng cho điện thoại; ứng dụng chưa được xác nhận hoàn toàn trên Android/iOS thật.

## Vấn đề tìm thấy và đã sửa

| Vấn đề | Điều chỉnh |
| --- | --- |
| Nút hiện mật khẩu/xóa tìm kiếm nhỏ | Vùng chạm tối thiểu 44×44, nhãn đọc màn hình, tên nút hiện/ẩn theo trạng thái |
| Email tự viết hoa; input chưa dùng font chung | Email/mật khẩu không tự viết hoa/tự sửa; autocomplete; cỡ chữ input 16; font chung cho tìm kiếm/chat |
| Tiêu đề dài chen vào nút header | Khối tiêu đề co giãn và xuống dòng trong vùng còn lại |
| Tên khách hàng bị bóp cạnh badge trong thẻ việc ở 320px | Thông tin khách hàng và trạng thái tách thành hai hàng |
| Footer absolute có thể che nội dung khi chữ lớn | Footer nằm trong luồng bố cục; giữ padding đáy theo safe area |
| Nút trong màn chi tiết bị xuống từng từ | Xếp dọc ở chiều rộng <380 hoặc fontScale >1.15 |
| Số tiền hồ sơ tràn khỏi thẻ | Giá trị tiền có một hàng đầy đủ; hai chỉ số còn lại chia hàng phía trên |
| Nhãn badge chi tiết bị bóp thành cột | Cho category/status tự xuống hàng |
| Chat mất bản nháp khi đổi tab | Giữ thread được mount, ẩn khỏi đọc màn hình khi không hoạt động, đóng bàn phím khi đổi tab |
| Freelancer vào trang ẩn khỏi thanh tab | Trang đầu là Tìm việc và có tab đang chọn |
| Bộ lọc Bản nháp không có kết quả trong Tìm việc | Bỏ bộ lọc trạng thái; danh sách việc chỉ có dự án đang tuyển như web |
| Form đăng dự án thiếu nút quay lại ở bước đầu | Có nút quay về màn trước; các bước sau quay lại bước trước |
| Chữ lớn ở thanh tab có ít khoảng dọc | Chiều cao thanh tab tăng theo fontScale và safe area đáy |
| Nội dung kéo quá rộng trên tablet | Giới hạn cột nội dung 760px |

## Kiểm tra

Bản React Native Web được render bằng Chromium ở 320, 360, 390 và 768px. Kịch bản kiểm tra đăng nhập bằng form, tab đầu theo vai trò, nút hiện mật khẩu, kích thước vùng chạm các nút input, danh sách việc, bản nháp chat sau đổi tab, dashboard, dự án, chi tiết, đăng dự án, hồ sơ và gói mẫu. Có kiểm tra form ở viewport thấp 500px. Chữ được phóng 130% bằng CSS để kiểm tra bố cục hồ sơ và chi tiết; đây không phải kiểm thử Dynamic Type native.

Sau các sửa riêng cho hồ sơ/chi tiết, kiểm tra lại hai màn này ở 320/390px với chữ thường và chữ phóng lớn. Kết quả tổng quát được lưu trong [results.json](previews/audit-2026-11-04/results.json).

- [Tìm việc 320px](previews/audit-2026-11-04/jobs-320.png)
- [Đăng nhập 320px](previews/audit-2026-11-04/login-320.png)
- [Hồ sơ với chữ lớn](previews/audit-2026-11-04/profile-large-320.png)
- [Chi tiết với chữ lớn](previews/audit-2026-11-04/job-detail-large-320.png)
- [Dashboard tablet](previews/audit-2026-11-04/home-768.png)

Kiểm tra kỹ thuật: lint sạch, typecheck đạt, 2 bộ kiểm thử hiện có đạt; export web và Android thành công.

## Giới hạn

Cần kiểm tra thêm trên thiết bị hoặc simulator native: bàn phím thật, safe area/notch, cử chỉ quay lại, VoiceOver/TalkBack và Dynamic Type. Export bundle Android xác nhận đóng gói JavaScript, không thay thế các bước này.

Mobile vẫn dùng mock repository. Timeline, hợp đồng, thanh toán và nghiệm thu chưa tương đương nghiệp vụ của web/backend; phần này được theo dõi trong [MOBILE_REDESIGN.md](MOBILE_REDESIGN.md).
