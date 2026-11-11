# HƯỚNG DẪN BẢO VỆ DỮ LIỆU VŨ HIỆP

## Trạng thái
Đây là bản đề xuất, KHÔNG tự triển khai website đang hoạt động. Chỉ hợp nhất sau khi đã sao lưu dữ liệu từ trình duyệt và Supabase và kiểm thử.

### 1. Trước khi thay đổi hệ thống (BẮT BUỘC)
- Trên đúng trình duyệt đang hiển thị số liệu kho, mở Developer Tools > Console, chạy:
  `copy(localStorage.getItem('vuhiep_v8_cache'))`
  Dán vào tệp văn bản và cất ở nơi riêng tư (nội dung có thông tin khách hàng; KHÔNG dán vào issue/PR công khai).
- Kiểm tra tệp có các trường `imports`, `sales` và số dòng phù hợp thực tế.
- Trong Supabase Dashboard, nếu dự án đã Healthy, sao lưu riêng dữ liệu bảng `public.vuhiep_store` bằng công cụ được cấp quyền quản trị.
- **Không nhấn reset/xóa trình duyệt, không ghi đè bảng, không xóa cơ sở dữ liệu** trước khi có hai bản sao.

### 2. Theo dõi dự án miễn phí
Workflow `.github/workflows/supabase-health.yml` chỉ đọc dữ liệu có xác thực bốn lần/ngày.
Hoạt động định kỳ KHÔNG được Supabase bảo đảm sẽ ngăn tự tạm dừng Free; xem đây là giám sát.
GitHub Actions có thể chạy trễ hoặc bị tắt khi repository không hoạt động. Thông báo lỗi mặc định trong Actions phải được bật riêng.

### 3. Sao lưu mã hóa
Workflow `.github/workflows/supabase-encrypted-backup.yml` tạo snapshot mã hóa AES-256-GCM mỗi ngày.
Thêm vào GitHub Settings > Secrets and variables > Actions các bí mật:
- `VH_BACKUP_EMAIL`: tài khoản Supabase Auth riêng chỉ có quyền SELECT bảng `vuhiep_store`.
- `VH_BACKUP_PASSWORD`: mật khẩu của tài khoản trên.
- `VH_BACKUP_PASSPHRASE`: chuỗi bí mật ngẫu nhiên >= 32 ký tự, cất ngoài GitHub để khôi phục.

Các tệp backup mã hóa tồn tại 30 ngày trên GitHub Actions; cần TẢI BẢN SAO RA NGOÀI và kiểm tra khôi phục định kỳ.
Không đưa secret, JSON dữ liệu khách hàng hoặc service_role key vào mã nguồn, git repo hoặc đoạn chat.
Chỉ bật lịch sau khi tạo tài khoản chuyên dụng và chính sách SELECT hạn chế chính xác tài khoản đó.
Giải mã trên máy an toàn bằng:
`VH_BACKUP_PASSPHRASE="..." node scripts/decrypt-backup.mjs backup.enc.json restored.json`
Không commit tệp đã giải mã.

### 4. Quyền truy cập Supabase (PHẢI CẤU HÌNH TRỰC TIẾP TRONG DASHBOARD)
KHÔNG chạy chính sách RLS kiểu `USING (true)` cho bảng có thông tin khách hàng.
Tạo tài khoản chủ cửa hàng qua Supabase Auth, bật Row Level Security.
Chỉ cho phép UUID tài khoản chủ cửa hàng đọc/ghi bảng `public.vuhiep_store`.
Tài khoản backup riêng chỉ có quyền SELECT.
Ví dụ khung SQL để DBA rà soát (điền UUID thật trong Dashboard trước khi chạy):

```sql
alter table public.vuhiep_store enable row level security;
-- XÓA/THU HẸP các policy cũ cấp quyền rộng sau khi kiểm tra.
create policy "store owner read" on public.vuhiep_store
for select to authenticated using (auth.uid() = 'OWNER_UUID_HERE'::uuid);
create policy "store owner write" on public.vuhiep_store
for update to authenticated using (auth.uid() = 'OWNER_UUID_HERE'::uuid)
with check (auth.uid() = 'OWNER_UUID_HERE'::uuid);
create policy "backup user read" on public.vuhiep_store
for select to authenticated using (auth.uid() = 'BACKUP_UUID_HERE'::uuid);
```

Cần kiểm tra GRANT bảng, policies khác và cách website lấy JWT trước khi mở lại đồng bộ.
Khóa publishable trong website là khóa công khai, không phải quyền truy cập riêng.

### 5. Đồng bộ an toàn
Nhánh này vô hiệu hóa ghi online khi chưa có JWT và chặn đồng bộ tự động nếu local/cloud khác nhau.
**Chưa hoàn thiện đăng nhập + giải quyết xung đột**, do đó CHƯA THỂ coi là bản nâng cấp hoàn chỉnh cho môi trường sản xuất.
Không hợp nhất nhánh này lên main chỉ để "sửa mất kết nối". Hãy kiểm thử bằng dữ liệu giả trên bản sao trước.

### 6. Kiểm thử trước khi triển khai
- Bản cloud thiếu hoặc lỗi: kho trên máy giữ nguyên.
- Bản local có 15 đơn, cloud rỗng: không ghi đè bên nào.
- Supabase từ Coming up sang Healthy: kiểm tra bảng và quyền trước khi lưu đơn.
- Backup mã hóa tải về và giải mã đúng; tệp thuần không vào Actions logs.
- Người chưa đăng nhập không được đọc/ghi dữ liệu khách hàng.
- Người quản lý đăng nhập được, nhập hàng và bán hàng không nhân đôi số lượng.
