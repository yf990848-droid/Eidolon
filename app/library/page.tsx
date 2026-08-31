"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { bookWordCount, downloadBook, loadBooks, type StoredBook } from "../../lib/local-books";

const FILTERS = ["全部", "创作中", "已完成"];

export default function LibraryPage() {
  const [filter, setFilter] = useState("全部");
  const [books, setBooks] = useState<StoredBook[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooks(loadBooks()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleBooks = useMemo(() => books.filter((book) => {
    if (filter === "创作中") return book.status === "writing";
    if (filter === "已完成") return book.status === "completed";
    return true;
  }), [books, filter]);

  return <AppShell><main className="page inner-page library-page">
    <header className="page-heading"><div><p className="eyebrow">私人藏书室</p><h1>我的书架</h1></div><p>这里收纳所有仍在生长，以及已经完成的故事。</p></header>
    <div className="library-toolbar"><div className="filter-tabs">{FILTERS.map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><Link className="button button-primary button-small" href="/studio">＋ 新建作品</Link></div>

    {visibleBooks.length > 0 && <section className="library-grid">{visibleBooks.map((book, index) => {
      const status = book.status === "completed" ? "已完成" : "创作中";
      const editHref = `${book.mode === "original" ? "/write" : "/studio"}?id=${encodeURIComponent(book.id)}`;
      const progress = book.status === "completed" ? 100 : Math.min(90, Math.max(12, book.chapters.length * 15));
      return <article className="library-book" key={book.id}>
        <Link href={`/read?id=${encodeURIComponent(book.id)}`} className={`book-cover cover-${["rain", "stars", "mountain", "harbor"][index % 4]}`}><span>{book.genre ?? (book.mode === "original" ? "原创作品" : "AI 共创")}</span><strong>{book.title}</strong><small>纸境</small></Link>
        <div className="library-book-meta"><span>{status}</span><h2>{book.title}</h2><p>{book.chapters.length} 章 · {bookWordCount(book)} 字</p><div className="progress-line"><i style={{ width: `${progress}%` }} /></div><small>{new Date(book.updatedAt).toLocaleDateString("zh-CN")} 更新</small><div className="library-book-actions"><Link href={editHref}>{book.status === "completed" ? "继续修改" : "继续创作"} →</Link><button onClick={() => downloadBook(book, "txt")}>TXT</button><button onClick={() => downloadBook(book, "md")}>Markdown</button></div></div>
      </article>;
    })}</section>}

    {visibleBooks.length === 0 && <div className="empty-shelf"><span>＋</span><div><strong>{books.length ? "这里暂时没有符合条件的作品" : "下一本书，会从什么开始？"}</strong><p>{books.length ? "切换分类即可查看其他作品。" : "一句话、一个梦，或某个不愿忘记的人。"}</p></div><Link href="/studio">开始构思 →</Link></div>}
  </main></AppShell>;
}
