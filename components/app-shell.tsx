"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type ThemeName = "clarity" | "voyage" | "ivory";
const THEMES: Array<{ id: ThemeName; name: string }> = [
  { id: "clarity", name: "澄心" }, { id: "voyage", name: "夜航星" }, { id: "ivory", name: "象牙塔" },
];
const NAV = [
  { href: "/", label: "今日" }, { href: "/studio", label: "AI 共创" }, { href: "/write", label: "原创写作" },
  { href: "/styles", label: "文风库" }, { href: "/library", label: "书架" }, { href: "/read", label: "阅读" },
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
        <Link href="/" className="brand" aria-label="纸境首页">
          <span className="brand-glyph" aria-hidden="true"><span className="brand-mark" /></span>
          <span><strong>纸境</strong><small>EIDOLON</small></span>
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
        <span>纸境 · Eidolon</span><p>白天属于面包，夜晚属于纸境</p><span>个人创作空间 · 2026</span>
      </footer>
    </div>
  );
}
