import type { Locale } from "@/lib/i18n/config";

export interface Project {
  title: string;
  url: string;
  kind: "themeforest" | "github";
  year: number;
  stack: string[];
  description: Record<Locale, string>;
}

export const projects: Project[] = [
  {
    title: "Invadex",
    url: "https://themeforest.net/item/invadex-business-consulting-wordpress-theme/56656878",
    kind: "themeforest",
    year: 2025,
    stack: ["WordPress", "PHP", "JavaScript", "Bootstrap"],
    description: {
      vi: "Theme WordPress cho công ty tư vấn doanh nghiệp.",
      en: "WordPress theme for business consulting companies.",
    },
  },
  {
    title: "Safebyte",
    url: "https://themeforest.net/item/safebyte-it-solutions-services-wordpress-theme/57713885",
    kind: "themeforest",
    year: 2025,
    stack: ["WordPress", "PHP", "JavaScript", "jQuery"],
    description: {
      vi: "Theme WordPress cho dịch vụ và giải pháp CNTT.",
      en: "WordPress theme for IT solutions and services.",
    },
  },
  {
    title: "lofi",
    url: "https://github.com/hongducdev/lofi",
    kind: "github",
    year: 2024,
    stack: ["TypeScript"],
    description: {
      vi: "Nhạc lofi, âm thanh môi trường, đồng hồ tập trung và danh sách việc cần làm.",
      en: "Lofi music, ambient sounds, a focus timer and a todo list.",
    },
  },
  {
    title: "comic-web",
    url: "https://github.com/hongducdev/comic-web",
    kind: "github",
    year: 2024,
    stack: ["TypeScript"],
    description: { vi: "Web đọc truyện tranh.", en: "A comic reading website." },
  },
  {
    title: "Music-Bot-Discord.js-v14",
    url: "https://github.com/hongducdev/Music-Bot-Discord.js-v14",
    kind: "github",
    year: 2024,
    stack: ["JavaScript", "discord.js", "Distube"],
    description: {
      vi: "Bot nhạc Discord dùng discord.js v14, hỗ trợ slash command.",
      en: "Discord music bot on discord.js v14 with slash commands.",
    },
  },
  {
    title: "Bot-Music-Discord-v13",
    url: "https://github.com/hongducdev/Bot-Music-Discord-v13",
    kind: "github",
    year: 2024,
    stack: ["JavaScript", "discord.js", "Distube"],
    description: { vi: "Bot nhạc Discord dùng discord.js v13.", en: "Discord music bot on discord.js v13." },
  },
  {
    title: "LearnCodeApp",
    url: "https://github.com/hongducdev/LearnCodeApp",
    kind: "github",
    year: 2023,
    stack: ["Java", "Android"],
    description: {
      vi: "Ứng dụng học lập trình, bài tập lớn môn Lập trình thiết bị di động.",
      en: "A learn-to-code app, coursework for the mobile programming course.",
    },
  },
];
