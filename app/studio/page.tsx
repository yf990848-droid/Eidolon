"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { GENRES, IDEAS } from "../../lib/mock-data";

type Stage = "brief" | "ideas" | "outline";

export default function StudioPage() {
  const [stage, setStage] = useState<Stage>("brief");
  const [genre, setGenre] = useState("悬疑推理");
  const [length, setLength] = useState("中篇");
  const [style, setStyle] = useState("雨夜独白");
  const [thought, setThought] = useState("");
  const [selectedIdea, setSelectedIdea] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const queryGenre = params.get("genre");
      if (queryGenre) setGenre(queryGenre);
      if (params.get("idea") === "rain") setThought("一座不下雨的城市里，只有一把遗失的黑伞是湿的。");
      const draft = window.localStorage.getItem("eidolon-draft-brief");
      if (draft && !params.toString()) {
        const parsed = JSON.parse(draft);
        setGenre(parsed.genre ?? "悬疑推理"); setLength(parsed.length ?? "中篇"); setStyle(parsed.style ?? "雨夜独白"); setThought(parsed.thought ?? "");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("eidolon-draft-brief", JSON.stringify({ genre, length, style, thought }));
    const showTimer = window.setTimeout(() => setSaved(true), 0);
    const hideTimer = window.setTimeout(() => setSaved(false), 1200);
    return () => { window.clearTimeout(showTimer); window.clearTimeout(hideTimer); };
  }, [genre, length, style, thought]);

  const progress = useMemo(() => stage === "brief" ? 1 : stage === "ideas" ? 2 : 3, [stage]);

  return (
    <AppShell>
      <main className="studio-page">
        <aside className="studio-rail">
          <div className="rail-title"><span>新作</span><strong>尚未命名</strong></div>
          <ol className="stage-list">
            {["故事起点", "创意方案", "故事大纲", "章节细纲", "正文创作"].map((label, index) => (
              <li className={index + 1 === progress ? "current" : index + 1 < progress ? "done" : ""} key={label}>
                <span>{String(index + 1).padStart(2, "0")}</span>{label}
              </li>
            ))}
          </ol>
          <div className="rail-note"><span>创作札记</span><p>好的故事并不急于回答，它先留下一个值得追问的问题。</p></div>
        </aside>

        <section className="studio-canvas">
          <header className="studio-header">
            <div><p className="eyebrow">创作工作台 · 第 {progress} 步</p><h1>{stage === "brief" ? "从哪里开始？" : stage === "ideas" ? "选择故事的命运" : "搭起故事的骨骼"}</h1></div>
            <span className={`save-state ${saved ? "visible" : ""}`}>文字已落定</span>
          </header>

          {stage === "brief" && <div className="brief-form reveal">
            <fieldset><legend>选择题材</legend><div className="choice-grid genres">{GENRES.map((item) => <button className={genre === item.name ? "selected" : ""} onClick={() => setGenre(item.name)} key={item.name}><span>{item.symbol}</span>{item.name}</button>)}</div></fieldset>
            <fieldset><legend>你的想法 <small>可以只写一句话，也可以暂时留白</small></legend><textarea value={thought} onChange={(event) => setThought(event.target.value)} placeholder="例如：一个替别人保管记忆的人，发现自己没有童年……" rows={5} /><span className="writing-hint">故事会从你留下的线索中生长</span></fieldset>
            <div className="form-pair">
              <fieldset><legend>篇幅</legend><div className="segmented">{["短篇", "中篇", "长篇"].map((item) => <button className={length === item ? "selected" : ""} onClick={() => setLength(item)} key={item}>{item}</button>)}</div></fieldset>
              <fieldset><legend>个人文风</legend><select value={style} onChange={(event) => setStyle(event.target.value)}><option>雨夜独白</option><option>古典叙事</option><option>都市冷峻</option><option>轻盈青春</option></select></fieldset>
            </div>
            <div className="studio-actions"><p>本阶段使用模拟内容，不会产生模型费用。</p><button className="button button-primary" onClick={() => setStage("ideas")}>生成三个创意方案</button></div>
          </div>}

          {stage === "ideas" && <div className="idea-stage reveal">
            <p className="stage-intro">根据“{genre} · {length} · {style}”生成。你可以选择一个方向，稍后仍能自由修改。</p>
            <div className="idea-list">{IDEAS.map((idea, index) => <article className={`idea-card ${selectedIdea === index ? "selected" : ""}`} key={idea.title} onClick={() => setSelectedIdea(index)}>
              <div className="idea-number">方案 {String(index + 1).padStart(2, "0")}</div><p className="eyebrow">{idea.label}</p><h2>{idea.title}</h2><p className="idea-summary">{idea.summary}</p><blockquote>{idea.sample}</blockquote><button>{selectedIdea === index ? "已选择" : "选择这个故事"}</button>
            </article>)}</div>
            <div className="studio-actions"><button className="button button-ghost" onClick={() => setStage("brief")}>返回修改</button><button className="button button-primary" onClick={() => setStage("outline")}>以《{IDEAS[selectedIdea].title}》生成大纲</button></div>
          </div>}

          {stage === "outline" && <div className="outline-stage reveal">
            <div className="outline-title"><div><span>暂定书名</span><h2>{IDEAS[selectedIdea].title}</h2></div><button className="button button-small button-quiet">修改书名</button></div>
            <div className="outline-grid">
              <section><span>核心命题</span><textarea defaultValue="当记忆可以被保存、交换乃至伪造，一个人究竟凭什么确认自己是谁？" rows={3} /></section>
              <section><span>故事基调</span><textarea defaultValue="潮湿、克制而微带暖意的都市寓言；真相逐层揭开，情感在细节中缓慢显现。" rows={3} /></section>
              <section className="wide"><span>故事结构</span>{["第一幕 · 缺失", "第二幕 · 追索", "第三幕 · 认领"].map((title, index) => <div className="act" key={title}><strong>{title}</strong><p>{["林默在记忆典当行发现一枚与自己梦境相同的童年记忆，平静生活出现裂缝。", "他沿着记忆原主人的线索调查城市旧案，却发现每个证人都记得一个不同的自己。", "城市记忆系统即将重置，他必须在真实的过去与主动选择的人生之间作出决定。"][index]}</p></div>)}</section>
            </div>
            <div className="studio-actions"><button className="button button-ghost" onClick={() => setStage("ideas")}>重选方案</button><button className="button button-primary">确认大纲，生成章节细纲</button></div>
          </div>}
        </section>

        <aside className="agent-panel">
          <div className="agent-heading"><span className="agent-orb">✦</span><div><strong>写作伴侣</strong><small>模拟模式</small></div></div>
          <div className="agent-message"><p>{stage === "brief" ? "告诉我你想写什么。不完整的念头也很好，那通常是故事最有生命力的开始。" : stage === "ideas" ? "三个方案共享同一颗种子，却会长成不同的树。先选最让你想继续读下去的那个。" : "大纲不是牢笼，而是一张在迷雾里可以随时修改的地图。"}</p></div>
          <div className="style-card"><span>当前文风</span><strong>{style}</strong><p>克制冷峻 · 环境映照心理<br />中短句 · 弱修辞 · 对话驱动</p><button>查看文风卡片 →</button></div>
          <div className="agent-input"><input aria-label="询问写作伴侣" placeholder="问问写作伴侣……" /><button aria-label="发送">↑</button></div>
        </aside>
      </main>
    </AppShell>
  );
}
