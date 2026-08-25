"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type ThemeName = "clarity" | "voyage" | "ivory";
const THEMES: Array<{ id: ThemeName; name: string }> = [
  { id: "clarity", name: "澄心" }, { id: "voyage", name: "夜航星" }, { id: "ivory", name: "象牙塔" },
];
const NAV = [
  { href: "/", label: "今日" }, { href: "/studio", label: "创作" },
  { href: "/library", label: "书架" }, { href: "/read", label: "阅读" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeName>("clarity");
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("eidolon-theme") as ThemeName | null;
    if (saved && THEMES.some((item) => item.id === saved)) {
      const timer = window.setTimeout(() => setTheme(saved), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("eidolon-theme", theme);
  }, [theme]);

  return (
    <div className="site-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Eidolon 首页">
          <span className="brand-glyph">E</span>
          <span><strong>Eidolon</strong><small>故事的第二重生命</small></span>
        </Link>
        <nav className="main-nav" aria-label="主要导航">
          {NAV.map((item) => <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>
        <div className="theme-control">
          <button className="theme-button" onClick={() => setThemeOpen(!themeOpen)} aria-expanded={themeOpen}>
            <span className="theme-dot" />{THEMES.find((item) => item.id === theme)?.name}
          </button>
          {themeOpen && <div className="theme-menu">{THEMES.map((item) => (
            <button className={theme === item.id ? "selected" : ""} key={item.id} onClick={() => { setTheme(item.id); setThemeOpen(false); }}>
              <span className={`swatch swatch-${item.id}`} />{item.name}
            </button>
          ))}</div>}
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <span>Eidolon</span><p>愿你写下的每一个世界，都有人抵达。</p><span>个人创作空间 · 2026</span>
      </footer>
    </div>
  );
}
