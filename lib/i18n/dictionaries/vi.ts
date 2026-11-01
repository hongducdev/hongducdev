export const vi = {
  meta: { title: "hongducdev", description: "Portfolio của Hồng Đức — lập trình viên Front End tại PixelArt Team." },
  nav: { label: "Điều hướng chính", home: "trang chủ", projects: "dự án", blogs: "blog", books: "sách", contact: "liên hệ" },
  home: { greeting: "Xin chào, mình là Đức.", role: "Lập trình viên Front End tại PixelArt Team.", hobby: "Thích đọc sách." },
  projects: {
    title: "Dự án",
    description: "Các dự án mình đã làm: theme WordPress trên ThemeForest, ứng dụng web và bot Discord.",
    themeforest: "themeforest",
    github: "github",
  },
  blogs: {
    title: "Blog",
    description: "Ghi chép về setup, công cụ và kinh nghiệm làm Front End.",
    empty: "Chưa có bài viết nào.",
    back: "← tất cả bài viết",
    minutes: (n: number) => `${n} phút đọc`,
    untranslated: "Bài viết chỉ có tiếng Việt.",
  },
  books: {
    title: "Sách",
    description: "Sách mình đang đọc và mục tiêu đọc sách năm nay, đồng bộ từ Goodreads.",
    currentlyReading: "Đang đọc",
    nothingReading: "Hiện chưa đọc cuốn nào.",
    challenge: (year: number) => `Mục tiêu đọc sách ${year}`,
    progress: (read: number, goal: number) => `${read}/${goal} cuốn`,
    profile: "Xem hồ sơ Goodreads →",
  },
  contact: {
    title: "Liên hệ",
    description: "Tìm mình trên các mạng xã hội.",
  },
  theme: { toggle: "Đổi giao diện", light: "sáng", dark: "tối" },
  switcher: { label: "Ngôn ngữ" },
  settings: {
    button: "cài đặt",
    title: "Cài đặt hồ cá",
    varieties: "giống cá",
    lotus: "hoa sen",
    sakura: "hoa anh đào",
    lockedOnLight: "Khó thấy trên nền sáng",
    lockedOnDark: "Khó thấy trên nền tối",
    lastVariety: "Cần giữ lại ít nhất một giống",
  },
};

export type Dictionary = typeof vi;
