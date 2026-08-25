"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/app-shell";

const chapters = ["序章　没有雨的城市", "第一章　记忆匣", "第二章　红鞋女孩", "第三章　被擦去的街道", "第四章　旧日回声"];

export default function ReadPage() {
  const [fontSize, setFontSize] = useState(18);
  const [chapterOpen, setChapterOpen] = useState(false);
  useEffect(() => { window.localStorage.setItem("eidolon-reading-progress", "雨城来信:2"); }, []);
  return <AppShell><main className="reader-page">
    <div className="reader-toolbar"><button onClick={() => setChapterOpen(!chapterOpen)}>☰　目录</button><span>雨城来信</span><div><button onClick={() => setFontSize(Math.max(15, fontSize - 1))}>字−</button><button onClick={() => setFontSize(Math.min(24, fontSize + 1))}>字＋</button><Link href="/studio">回到创作</Link></div></div>
    {chapterOpen && <aside className="chapter-drawer"><p className="eyebrow">章节目录</p><h2>雨城来信</h2>{chapters.map((chapter, index) => <button className={index === 1 ? "active" : ""} key={chapter}><span>{String(index).padStart(2, "0")}</span>{chapter}</button>)}</aside>}
    <article className="reading-paper" style={{ fontSize }}>
      <header><span>第一章</span><h1>记忆匣</h1><p>雨城来信 · 中篇小说</p></header>
      <p>雨从凌晨开始落，到了中午，街上的人已经忘记了晴天是什么样子。</p>
      <p>林默撑着伞走过长街。雨水沿着伞骨滑下来，在他脚边汇成细小的河流。街对面的钟楼停在十一点四十七分，那是城里所有时钟共同选择的沉默。</p>
      <p>记忆典当行藏在一条没有名字的巷子里。门楣很低，木牌被雨水洗得发白，只剩下一个模糊的“忆”字。林默推门进去，铜铃没有响。</p>
      <p>柜台上放着一只从未见过的匣子。</p>
      <p>它比寻常的记忆匣更小，表面没有编号，也没有典当人的姓名。林默戴上手套，将它转到光下，看见底部刻着一行几乎消失的小字。</p>
      <blockquote>给那个没有童年的人。</blockquote>
      <p>他站了很久。窗外的雨声渐渐远去，像有人隔着许多年，轻轻敲打另一扇窗。</p>
      <p>匣子里忽然传来一个孩子的笑声。</p>
      <p>那声音与他昨夜梦里的一模一样。</p>
      <footer><span>本章完</span><div><button>← 序章</button><button>第二章 →</button></div></footer>
    </article>
    <div className="reading-progress"><i /><span>阅读进度 18%</span></div>
  </main></AppShell>;
}
