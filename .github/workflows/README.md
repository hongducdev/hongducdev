# 🤖 GitHub Actions Workflows

Repository này sử dụng GitHub Actions để tự động commit các thay đổi.

## 📋 Danh sách Workflows

### 1. Auto Commit Changes (`auto-commit.yml`)

**Trigger:** Khi có push vào branch `main` với các file:

-   `*.html`
-   `*.js`
-   `input.css`
-   `tailwind.config.js`

**Chức năng:**

-   ✅ Tự động build Tailwind CSS từ `input.css` → `output.css`
-   ✅ Minify CSS để tối ưu kích thước
-   ✅ Cập nhật timestamp
-   ✅ Auto commit file `output.css` và `.last-updated`

**Cách sử dụng:**

-   Workflow tự động chạy khi bạn push code
-   Hoặc chạy thủ công từ tab **Actions** → **Auto Commit Changes** → **Run workflow**

---

### 2. Daily Auto Update (`daily-update.yml`)

**Trigger:** Chạy tự động mỗi ngày lúc 00:00 UTC (7:00 sáng giờ Việt Nam)

**Chức năng:**

-   ✅ Cập nhật file `.last-updated` với timestamp mới
-   ✅ Tạo thống kê repository (số lượng file HTML, JS, CSS)
-   ✅ Auto commit thay đổi

**Cách sử dụng:**

-   Workflow tự động chạy hàng ngày
-   Hoặc chạy thủ công từ tab **Actions** → **Daily Auto Update** → **Run workflow**

---

## 🚀 Cách chạy thủ công

1. Vào repository trên GitHub
2. Click tab **Actions**
3. Chọn workflow muốn chạy (Auto Commit hoặc Daily Update)
4. Click **Run workflow** → **Run workflow**

---

## 🔧 Cấu hình

Các workflow sử dụng:

-   **stefanzweifel/git-auto-commit-action@v5**: Action để tự động commit
-   **actions/checkout@v4**: Checkout repository
-   **actions/setup-node@v4**: Setup Node.js environment

---

## 📝 Lưu ý

-   Workflows sử dụng `GITHUB_TOKEN` mặc định (không cần thêm secrets)
-   Branch mặc định: `main`
-   Node.js version: 20

---

## 🛠️ Tùy chỉnh

Để tùy chỉnh workflows, edit file `.yml` tương ứng trong thư mục `.github/workflows/`

Các thông số có thể thay đổi:

-   `commit_message`: Nội dung commit
-   `file_pattern`: Pattern các file cần commit
-   `cron`: Lịch chạy tự động (cho daily update)
-   `branches`: Branch để trigger workflow
