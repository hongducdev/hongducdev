import type { Dictionary } from "./vi";

export const en: Dictionary = {
  meta: { title: "hongducdev", description: "Portfolio of Hong Duc — front-end developer at PixelArt Team." },
  nav: { label: "Main navigation", home: "home", projects: "projects", blogs: "blog", contact: "contact" },
  home: { greeting: "Hi, I'm Duc.", role: "Front-end developer at PixelArt Team." },
  projects: {
    title: "Projects",
    description: "Things I have built: WordPress themes on ThemeForest, web apps and Discord bots.",
    themeforest: "themeforest",
    github: "github",
  },
  blogs: {
    title: "Blog",
    description: "Notes on setups, tooling and front-end work.",
    empty: "No posts yet.",
    back: "← all posts",
    minutes: (n: number) => `${n} min read`,
    untranslated: "This post is only available in Vietnamese.",
  },
  contact: {
    title: "Contact",
    description: "Find me on social media.",
  },
  theme: { toggle: "Toggle theme", light: "light", dark: "dark" },
  switcher: { label: "Language" },
  settings: {
    button: "settings",
    title: "Pond settings",
    varieties: "koi varieties",
    lotus: "lotus",
    sakura: "cherry blossom",
    lockedOnLight: "Hard to see on a light background",
    lockedOnDark: "Hard to see on a dark background",
    lastVariety: "At least one variety must stay on",
  },
};
