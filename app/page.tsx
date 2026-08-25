"use client";

import Link from "next/link";
import Image from "next/image";
import { AppShell } from "../components/app-shell";
import { BOOKS, GENRES } from "../lib/mock-data";

export default function Home() {
  return (
    <AppShell>
      <main className="page home-page">
        <section className="hero-grid">
          <div className="hero-copy reveal">
            <p className="eyebrow">你的私人写作室</p>
            <h1>让故事找到<br /><em>它的声音</em></h1>
            <p className="hero-lead">
              从一缕念头，到完整世界。Eidolon 会记住你的文风、人物与伏笔，陪你写完每一个尚未落笔的故事。
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/studio">开始一部新作品</Link>
              <Link className="button button-quiet" href="/library">翻开我的书架</Link>
            </div>
          </div>

          <aside className="daily-card reveal delay-1" aria-label="每日创作灵感">
            <div className="daily-art">
              <Image src="/eidolon-cover.webp" alt="星夜图书馆中的写作者" width={1086} height={1448} priority />
              <div className="daily-overlay">
                <span>每日灵感</span>
                <strong>一座不下雨的城，<br />只有遗失的黑伞是湿的。</strong>
              </div>
            </div>
            <div className="daily-meta">
              <span>08 · 25</span>
              <Link href="/studio?idea=rain">以此开始 →</Link>
            </div>
          </aside>
        </section>

        <section className="quote-strip reveal delay-2">
          <span className="quote-mark">“</span>
          <blockquote>所有的大人都曾经是小孩，虽然，只有少数的人记得。</blockquote>
          <cite>安托万·德·圣埃克苏佩里《小王子》</cite>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div><p className="eyebrow">从一个方向开始</p><h2>今天，想写什么？</h2></div>
            <p>选择题材，或带上你自己的念头进入创作工作台。</p>
          </div>
          <div className="genre-grid">
            {GENRES.map((genre, index) => (
              <Link className="genre-card" href={`/studio?genre=${encodeURIComponent(genre.name)}`} key={genre.name}>
                <span className="genre-index">0{index + 1}</span>
                <span className="genre-symbol" aria-hidden="true">{genre.symbol}</span>
                <h3>{genre.name}</h3>
                <p>{genre.description}</p>
                <span className="genre-link">开始构思 →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-block works-section">
          <div className="section-heading compact">
            <div><p className="eyebrow">案头近作</p><h2>故事仍在生长</h2></div>
            <Link href="/library">查看全部作品 →</Link>
          </div>
          <div className="book-row">
            {BOOKS.slice(0, 3).map((book) => (
              <article className="book-card" key={book.title}>
                <Link href="/read" className={`book-cover cover-${book.cover}`}>
                  <span>{book.genre}</span><strong>{book.title}</strong><small>{book.author}</small>
                </Link>
                <div><h3>{book.title}</h3><p>{book.progress}</p></div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
