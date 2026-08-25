"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "../../components/app-shell";
import { BOOKS } from "../../lib/mock-data";

export default function LibraryPage() {
  const [filter, setFilter] = useState("全部");
  return <AppShell><main className="page inner-page library-page">
    <header className="page-heading"><div><p className="eyebrow">私人藏书室</p><h1>我的书架</h1></div><p>这里收纳所有仍在生长、已经完成，以及暂时合上的故事。</p></header>
    <div className="library-toolbar"><div className="filter-tabs">{["全部", "构思中", "创作中", "已完成"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><Link className="button button-primary button-small" href="/studio">＋ 新建作品</Link></div>
    <section className="library-grid">{BOOKS.map((book, index) => <article className="library-book" key={book.title}>
      <Link href="/read" className={`book-cover cover-${book.cover}`}><span>{book.genre}</span><strong>{book.title}</strong><small>{book.author}</small></Link>
      <div className="library-book-meta"><span>{index === 2 ? "已完成" : index === 3 ? "构思中" : "创作中"}</span><h2>{book.title}</h2><p>{book.progress}</p><div className="progress-line"><i style={{ width: `${[58, 24, 100, 8][index]}%` }} /></div><small>{index === 2 ? "三日前完成" : "今日更新"}</small></div>
    </article>)}</section>
    <div className="empty-shelf"><span>＋</span><div><strong>下一本书，会从什么开始？</strong><p>一句话、一个梦，或某个不愿忘记的人。</p></div><Link href="/studio">开始构思 →</Link></div>
  </main></AppShell>;
}
