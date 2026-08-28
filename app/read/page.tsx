"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { getBook, type StoredBook } from "../../lib/local-books";

export default function ReadPage() {
  const [fontSize, setFontSize] = useState(18);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [book, setBook] = useState<StoredBook | null>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const savedBook = params.get("id") ? getBook(params.get("id")!) : undefined;
      setBook(savedBook ?? null);
      const savedProgress = savedBook ? Number(window.localStorage.getItem(`eidolon-reading-${savedBook.id}`)) : 0;
      if (savedBook?.chapters[savedProgress]) setChapterIndex(savedProgress);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function selectChapter(index: number) {
    setChapterIndex(index);
    setChapterOpen(false);
    if (book) window.localStorage.setItem(`eidolon-reading-${book.id}`, String(index));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!loaded) return <AppShell><main className="reader-page"><div className="empty-shelf"><div><strong>正在翻开作品……</strong></div></div></main></AppShell>;
  if (!book || book.chapters.length === 0) return <AppShell><main className="reader-page"><div className="empty-shelf"><div><strong>还没有可以阅读的正文</strong><p>请先从创作页保存至少一个章节。</p></div><Link href="/library">返回书架 →</Link></div></main></AppShell>;

  const chapter = book.chapters[chapterIndex] ?? book.chapters[0];
  const editHref = `${book.mode === "original" ? "/write" : "/studio"}?id=${encodeURIComponent(book.id)}`;
  const progress = Math.round(((chapterIndex + 1) / book.chapters.length) * 100);
  const paragraphs = chapter.content.split(/\n\s*\n/).filter(Boolean);

  return <AppShell><main className="reader-page">
    <div className="reader-toolbar"><button onClick={() => setChapterOpen(!chapterOpen)}>☰　目录</button><span>{book.title}</span><div><button onClick={() => setFontSize(Math.max(15, fontSize - 1))}>字−</button><button onClick={() => setFontSize(Math.min(24, fontSize + 1))}>字＋</button><Link href={editHref}>回到创作</Link></div></div>
    {chapterOpen && <aside className="chapter-drawer"><p className="eyebrow">章节目录</p><h2>{book.title}</h2>{book.chapters.map((item, index) => <button className={index === chapterIndex ? "active" : ""} onClick={() => selectChapter(index)} key={item.id}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}</button>)}</aside>}
    <article className="reading-paper" style={{ fontSize }}>
      <header><span>第 {chapterIndex + 1} 章</span><h1>{chapter.title}</h1><p>{book.title} · {book.status === "completed" ? "已完成" : "创作中"}</p></header>
      {paragraphs.map((paragraph, index) => <p key={`${chapter.id}-${index}`}>{paragraph}</p>)}
      <footer><span>本章完</span><div><button disabled={chapterIndex === 0} onClick={() => selectChapter(chapterIndex - 1)}>← 上一章</button><button disabled={chapterIndex === book.chapters.length - 1} onClick={() => selectChapter(chapterIndex + 1)}>下一章 →</button></div></footer>
    </article>
    <div className="reading-progress"><i style={{ width: `${progress}%` }} /><span>阅读进度 {progress}%</span></div>
  </main></AppShell>;
}
