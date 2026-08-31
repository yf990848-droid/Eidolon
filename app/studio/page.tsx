"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../../components/app-shell";
import {
  createLocalId,
  getBook,
  saveBook,
  type BookStatus,
  type ConsistencyIssue,
  type NovelMemory,
  type StoredBook,
  type StoredChapter,
  type StoredChapterOutline,
} from "../../lib/local-books";
import { GENRES, IDEAS as FALLBACK_IDEAS } from "../../lib/mock-data";
import {
  AUTHOR_STYLE_PROFILES,
  BUILT_IN_STYLE_PROFILES,
  SYSTEM_STYLE_PROFILES,
  findStyleProfileByName,
  loadStyleProfiles,
  type StyleProfile,
} from "../../lib/style-profiles";

type Stage = "brief" | "ideas" | "outline" | "chapter-outline" | "chapter";
type Idea = { label: string; title: string; summary: string; sample: string };
type Outline = { premise: string; tone: string; acts: Array<{ title: string; summary: string }> };
type MemoryUpdateResult = {
  chapterSummary: string;
  memory: NovelMemory;
  issues: ConsistencyIssue[];
};

async function callAgent<T>(task: string, input: Record<string, unknown>): Promise<{ data: T; model: string }> {
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, input }),
  });
  const payload = await response.json() as { data?: T; model?: string; error?: string };
  if (!response.ok || payload.data === undefined) throw new Error(payload.error ?? "生成失败，请稍后重试");
  return { data: payload.data, model: payload.model ?? "unknown" };
}

export default function StudioPage() {
  const [stage, setStage] = useState<Stage>("brief");
  const [genre, setGenre] = useState("悬疑推理");
  const [length, setLength] = useState("中篇");
  const [style, setStyle] = useState("雨夜独白");
  const [styleId, setStyleId] = useState(SYSTEM_STYLE_PROFILES[0].id);
  const [styleInstruction, setStyleInstruction] = useState(SYSTEM_STYLE_PROFILES[0].writingInstruction);
  const [personalStyles, setPersonalStyles] = useState<StyleProfile[]>([]);
  const [thought, setThought] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>(FALLBACK_IDEAS);
  const [selectedIdea, setSelectedIdea] = useState(0);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [chapterCount, setChapterCount] = useState(8);
  const [chapterOutlines, setChapterOutlines] = useState<StoredChapterOutline[]>([]);
  const [chapter, setChapter] = useState("");
  const [bookId, setBookId] = useState("");
  const [chapters, setChapters] = useState<StoredChapter[]>([]);
  const [memory, setMemory] = useState<NovelMemory>();
  const [consistencyIssues, setConsistencyIssues] = useState<ConsistencyIssue[]>([]);
  const [chapterId, setChapterId] = useState("");
  const [chapterTitle, setChapterTitle] = useState("第一章");
  const [instruction, setInstruction] = useState("写出第一章开场，建立人物处境并留下悬念。");
  const [companionQuestion, setCompanionQuestion] = useState("");
  const [companionReply, setCompanionReply] = useState("");
  const [model, setModel] = useState("等待首次生成");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const chapterRef = useRef<HTMLTextAreaElement>(null);
  const allStyles = useMemo(() => [...BUILT_IN_STYLE_PROFILES, ...personalStyles], [personalStyles]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const savedStyles = loadStyleProfiles();
      const availableStyles = [...BUILT_IN_STYLE_PROFILES, ...savedStyles];
      setPersonalStyles(savedStyles);
      const applyStyle = (name?: string, id?: string, instruction?: string) => {
        const profile = availableStyles.find((item) => item.id === id) ?? findStyleProfileByName(name, savedStyles) ?? SYSTEM_STYLE_PROFILES[0];
        setStyle(name ?? profile.name);
        setStyleId(id ?? profile.id);
        setStyleInstruction(instruction ?? profile.writingInstruction);
      };
      const queryGenre = params.get("genre");
      if (queryGenre) setGenre(queryGenre);
      if (params.get("idea") === "rain") setThought("一座不下雨的城市里，只有一把遗失的黑伞是湿的。");
      const queryStyle = params.get("style");
      if (queryStyle) applyStyle(undefined, queryStyle);
      const savedBook = params.get("id") ? getBook(params.get("id")!) : undefined;
      if (savedBook?.mode === "ai") {
        setBookId(savedBook.id);
        setGenre(savedBook.genre ?? "悬疑推理");
        setLength(savedBook.length ?? "中篇");
        applyStyle(savedBook.style, savedBook.styleId, savedBook.styleInstruction);
        setThought(savedBook.thought ?? "");
        if (savedBook.idea) setIdeas([savedBook.idea]);
        setOutline(savedBook.outline ?? null);
        setChapterCount(savedBook.chapterCount ?? (savedBook.length === "短篇" ? 1 : Math.max(savedBook.chapters.length, savedBook.length === "长篇" ? 20 : 8)));
        setChapterOutlines(savedBook.chapterOutlines ?? []);
        setChapters(savedBook.chapters);
        setMemory(savedBook.memory);
        const lastChapter = savedBook.chapters.at(-1);
        if (lastChapter) {
          setChapterId(lastChapter.id);
          setChapterTitle(lastChapter.title);
          setChapter(lastChapter.content);
        }
        setStage("chapter");
        return;
      }
      const draft = window.localStorage.getItem("paper-realm-ai-draft");
      if (draft && !params.toString()) {
        const parsed = JSON.parse(draft);
        setGenre(parsed.genre ?? "悬疑推理");
        setLength(parsed.length ?? "中篇");
        applyStyle(parsed.style, parsed.styleId, parsed.styleInstruction);
        setThought(parsed.thought ?? "");
        setChapter(parsed.chapter ?? "");
        setChapterCount(parsed.chapterCount ?? (parsed.length === "长篇" ? 20 : parsed.length === "短篇" ? 1 : 8));
        setChapterOutlines(parsed.chapterOutlines ?? []);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("paper-realm-ai-draft", JSON.stringify({ genre, length, style, styleId, styleInstruction, thought, chapter, chapterCount, chapterOutlines }));
    const showTimer = window.setTimeout(() => setSaved(true), 0);
    const hideTimer = window.setTimeout(() => setSaved(false), 1200);
    return () => { window.clearTimeout(showTimer); window.clearTimeout(hideTimer); };
  }, [genre, length, style, styleId, styleInstruction, thought, chapter, chapterCount, chapterOutlines]);

  const stageLabels = useMemo(() => length === "长篇"
    ? ["故事起点", "创意方案", "故事大纲", "章节细纲", "正文创作"]
    : ["故事起点", "创意方案", length === "短篇" ? "故事大纲" : "大纲与章数", length === "短篇" ? "完整正文" : "逐章创作"], [length]);
  const stageOrder = useMemo<Stage[]>(() => length === "长篇"
    ? ["brief", "ideas", "outline", "chapter-outline", "chapter"]
    : ["brief", "ideas", "outline", "chapter"], [length]);
  const progress = Math.max(1, stageOrder.indexOf(stage) + 1);
  const titles: Record<Stage, string> = {
    brief: "从哪里开始？",
    ideas: "选择故事的命运",
    outline: "搭起故事的骨骼",
    "chapter-outline": "铺开每一章的路径",
    chapter: length === "短篇" ? "完整地写完这个故事" : "写下故事的第一声呼吸",
  };
  const chapterIndex = chapterId ? chapters.findIndex((item) => item.id === chapterId) : -1;
  const currentChapterNumber = chapterIndex >= 0 ? chapterIndex + 1 : chapters.length + 1;
  const canWriteNext = length !== "短篇" && currentChapterNumber < chapterCount;

  async function generateIdeas() {
    setLoading(true); setError("");
    try {
      const result = await callAgent<{ ideas: Idea[] }>("idea", { genre, length, style, styleInstruction, thought });
      if (!Array.isArray(result.data.ideas) || result.data.ideas.length !== 3) throw new Error("创意方案格式不完整，请重试");
      setIdeas(result.data.ideas); setSelectedIdea(0); setModel(result.model); setStage("ideas");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "生成失败"); }
    finally { setLoading(false); }
  }

  async function generateOutline() {
    setLoading(true); setError("");
    try {
      const result = await callAgent<Outline>("outline", { genre, length, style, styleInstruction, thought, idea: ideas[selectedIdea] });
      setOutline(result.data); setModel(result.model); setStage("outline");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "生成失败"); }
    finally { setLoading(false); }
  }

  function selectLength(nextLength: string) {
    setLength(nextLength);
    setChapterCount(nextLength === "短篇" ? 1 : nextLength === "长篇" ? 20 : 8);
    setChapterOutlines([]);
  }

  function validateChapterCount() {
    const min = length === "长篇" ? 10 : 3;
    const max = length === "长篇" ? 50 : 20;
    if (!Number.isInteger(chapterCount) || chapterCount < min || chapterCount > max) {
      setError(`${length}章节数需要设置为 ${min}～${max} 章`);
      return false;
    }
    return true;
  }

  async function generateShortStory() {
    setLoading(true); setError("");
    try {
      const result = await callAgent<string>("short-story", { genre, length, style, styleInstruction, thought, idea: ideas[selectedIdea], outline });
      setChapter(result.data); setChapterTitle("全文"); setModel(result.model); setStage("chapter");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "生成失败"); }
    finally { setLoading(false); }
  }

  async function generateChapterOutlines() {
    if (!validateChapterCount()) return;
    setLoading(true); setError("");
    try {
      const result = await callAgent<{ chapters: StoredChapterOutline[] }>("chapter-outline", {
        genre, length, style, styleInstruction, thought, idea: ideas[selectedIdea], outline, chapterCount,
      });
      if (!Array.isArray(result.data.chapters) || result.data.chapters.length !== chapterCount) throw new Error("章节细纲数量与设定章数不一致，请重试");
      setChapterOutlines(result.data.chapters); setModel(result.model); setStage("chapter-outline");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "生成失败"); }
    finally { setLoading(false); }
  }

  async function confirmOutline() {
    if (length === "短篇") await generateShortStory();
    else if (length === "长篇") await generateChapterOutlines();
    else if (validateChapterCount()) await generateChapter();
  }

  async function generateChapter() {
    if (length === "短篇") { await generateShortStory(); return; }
    setLoading(true); setError("");
    try {
      const editingIndex = chapterId ? chapters.findIndex((item) => item.id === chapterId) : -1;
      const chapterNumber = editingIndex >= 0 ? editingIndex + 1 : chapters.length + 1;
      const plan = length === "长篇" ? chapterOutlines[chapterNumber - 1] : undefined;
      const result = await callAgent<string>("chapter", {
        genre, length, style, styleInstruction, thought, idea: ideas[selectedIdea], outline, instruction,
        chapterCount,
        chapterNumber,
        chapterOutline: plan,
        memory,
        previousChapter: chapters[chapterNumber - 2]?.content,
      });
      setChapter(result.data);
      if (!chapterId) setChapterTitle(plan?.title || `第${chapterNumber}章`);
      setModel(result.model); setStage("chapter");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "生成失败"); }
    finally { setLoading(false); }
  }

  function updateChapterOutline(index: number, key: keyof StoredChapterOutline, value: string) {
    setChapterOutlines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }

  async function rewriteSelection() {
    const field = chapterRef.current;
    if (!field || !chapter.trim()) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const source = start === end ? chapter : chapter.slice(start, end);
    setLoading(true); setError("");
    try {
      const result = await callAgent<string>("rewrite", { style, styleInstruction, selectedText: source, instruction: instruction || "在不改变情节的情况下润色" });
      setChapter(start === end ? result.data : chapter.slice(0, start) + result.data + chapter.slice(end));
      setModel(result.model);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "改写失败"); }
    finally { setLoading(false); }
  }

  async function askCompanion() {
    if (!companionQuestion.trim()) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/companion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: companionQuestion, context: chapter || thought }) });
      const payload = await response.json() as { suggestion?: string; model?: string; error?: string };
      if (!response.ok || !payload.suggestion) throw new Error(payload.error ?? "写作伴侣暂时没有回应");
      setCompanionReply(payload.suggestion); setModel(payload.model ?? model); setCompanionQuestion("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "询问失败"); }
    finally { setLoading(false); }
  }

  async function persistBook(status: BookStatus, continueWriting = false) {
    if (!chapter.trim()) { setError("请先写下本章正文"); return; }
    const now = new Date().toISOString();
    const id = bookId || createLocalId("book");
    const currentChapter: StoredChapter = {
      id: chapterId || createLocalId("chapter"),
      title: chapterTitle.trim() || `第${chapters.length + 1}章`,
      content: chapter.trim(),
      updatedAt: now,
    };
    const chapterIndex = chapters.findIndex((item) => item.id === currentChapter.id);
    const nextChapters = chapterIndex === -1
      ? [...chapters, currentChapter]
      : chapters.map((item) => item.id === currentChapter.id ? currentChapter : item);
    const savedChapterNumber = chapterIndex === -1 ? nextChapters.length : chapterIndex + 1;
    const existing = getBook(id);
    const baseBook: StoredBook = {
      id,
      mode: "ai",
      title: ideas[selectedIdea]?.title?.trim() || "未命名作品",
      genre,
      length,
      style,
      styleId,
      styleInstruction,
      thought,
      idea: ideas[selectedIdea],
      outline: outline ?? undefined,
      chapterCount,
      chapterOutlines: length === "长篇" ? chapterOutlines : undefined,
      memory,
      status,
      chapters: nextChapters,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    saveBook(baseBook);
    setBookId(id);
    window.history.replaceState(null, "", `/studio?id=${encodeURIComponent(id)}`);
    setChapters(nextChapters);
    setChapterId(currentChapter.id);
    setSaved(true);
    setError("");

    let memoryUpdated = true;
    let finalChapters = nextChapters;
    if (length !== "短篇") {
      setLoading(true);
      try {
        const result = await callAgent<MemoryUpdateResult>("memory-update", {
          outline,
          chapterOutline: length === "长篇" ? chapterOutlines[savedChapterNumber - 1] : undefined,
          memory,
          chapterNumber: savedChapterNumber,
          chapter: currentChapter.content,
        });
        if (!result.data.memory || !Array.isArray(result.data.issues)) throw new Error("小说记忆格式不完整");
        finalChapters = nextChapters.map((item) => item.id === currentChapter.id
          ? { ...item, summary: result.data.chapterSummary || item.summary }
          : item);
        const updatedBook: StoredBook = {
          ...baseBook,
          chapters: finalChapters,
          memory: result.data.memory,
          updatedAt: new Date().toISOString(),
        };
        saveBook(updatedBook);
        setChapters(finalChapters);
        setMemory(result.data.memory);
        setConsistencyIssues(result.data.issues);
        setModel(result.model);
      } catch (cause) {
        memoryUpdated = false;
        const message = cause instanceof Error ? cause.message : "更新失败";
        setError(`正文已保存，但小说记忆更新失败：${message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setConsistencyIssues([]);
    }

    if (status === "completed" && memoryUpdated) {
      window.location.href = "/library";
    } else if (continueWriting && memoryUpdated) {
      const nextNumber = finalChapters.length + 1;
      const nextPlan = length === "长篇" ? chapterOutlines[nextNumber - 1] : undefined;
      setChapter("");
      setChapterId("");
      setChapterTitle(nextPlan?.title || `第${nextNumber}章`);
      setInstruction(nextPlan ? `按照“${nextPlan.goal}”推进本章，并落实当前章节细纲。` : "承接上一章继续推进情节，并在结尾留下新的悬念。");
    }
  }

  return (
    <AppShell>
      <main className="studio-page">
        <aside className="studio-rail">
          <div className="rail-title"><span>AI 共创</span><strong>{ideas[selectedIdea]?.title ?? "尚未命名"}</strong></div>
          <ol className="stage-list">
            {stageLabels.map((label, index) => (
              <li className={index + 1 === progress ? "current" : index + 1 < progress ? "done" : ""} key={label}><span>{String(index + 1).padStart(2, "0")}</span>{label}</li>
            ))}
          </ol>
          <div className="rail-note"><span>当前模型</span><p>{model}<br />没有配置密钥时自动使用模拟模式。</p></div>
        </aside>

        <section className="studio-canvas">
          <header className="studio-header">
            <div><p className="eyebrow">纸境 AI 共创 · 第 {progress} 步</p><h1>{titles[stage]}</h1></div>
            <span className={`save-state ${saved ? "visible" : ""}`}>文字已落定</span>
          </header>
          {error && <div className="error-banner" role="alert">{error}</div>}

          {stage === "brief" && <div className="brief-form reveal">
            <fieldset><legend>选择题材</legend><div className="choice-grid genres">{GENRES.map((item) => <button className={genre === item.name ? "selected" : ""} onClick={() => setGenre(item.name)} key={item.name}><span>{item.symbol}</span>{item.name}</button>)}</div></fieldset>
            <fieldset><legend>你的想法 <small>可以只写一句话，也可以暂时留白</small></legend><textarea value={thought} onChange={(event) => setThought(event.target.value)} placeholder="例如：一个替别人保管记忆的人，发现自己没有童年……" rows={5} /><span className="writing-hint">故事会从你留下的线索中生长</span></fieldset>
            <div className="form-pair">
              <fieldset><legend>篇幅</legend><div className="segmented">{["短篇", "中篇", "长篇"].map((item) => <button className={length === item ? "selected" : ""} onClick={() => selectLength(item)} key={item}>{item}</button>)}</div></fieldset>
              <fieldset><legend>创作文风</legend><select value={styleId} onChange={(event) => {
                const profile = allStyles.find((item) => item.id === event.target.value) ?? SYSTEM_STYLE_PROFILES[0];
                setStyleId(profile.id); setStyle(profile.name); setStyleInstruction(profile.writingInstruction);
              }}>
                {!allStyles.some((profile) => profile.id === styleId) && <option value={styleId}>{style}（作品快照）</option>}
                <optgroup label="系统文风">{SYSTEM_STYLE_PROFILES.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</optgroup>
                {personalStyles.length > 0 && <optgroup label="我的文风">{personalStyles.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</optgroup>}
                <optgroup label="中外文学特征">{AUTHOR_STYLE_PROFILES.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</optgroup>
              </select><a className="style-library-link" href="/styles">识别或管理个人文风 →</a></fieldset>
            </div>
            <div className="studio-actions"><p>每次点击只发起一次生成请求。</p><button disabled={loading} className="button button-primary" onClick={generateIdeas}>{loading ? "故事正在寻找方向…" : "生成三个创意方案"}</button></div>
          </div>}

          {stage === "ideas" && <div className="idea-stage reveal">
            <p className="stage-intro">根据“{genre} · {length} · {style}”生成。你可以选择一个方向，稍后仍能自由修改。</p>
            <div className="idea-list">{ideas.map((idea, index) => <article className={`idea-card ${selectedIdea === index ? "selected" : ""}`} key={`${idea.title}-${index}`} onClick={() => setSelectedIdea(index)}>
              <div className="idea-number">方案 {String(index + 1).padStart(2, "0")}</div><p className="eyebrow">{idea.label}</p><h2>{idea.title}</h2><p className="idea-summary">{idea.summary}</p><blockquote>{idea.sample}</blockquote><button>{selectedIdea === index ? "已选择" : "选择这个故事"}</button>
            </article>)}</div>
            <div className="studio-actions"><button className="button button-ghost" onClick={() => setStage("brief")}>返回修改</button><button disabled={loading} className="button button-primary" onClick={generateOutline}>{loading ? "正在搭建故事…" : `以《${ideas[selectedIdea]?.title}》生成大纲`}</button></div>
          </div>}

          {stage === "outline" && outline && <div className="outline-stage reveal">
            <div className="outline-title"><div><span>暂定书名</span><h2>{ideas[selectedIdea]?.title}</h2></div><button className="button button-small button-quiet" onClick={() => setStage("ideas")}>重选方案</button></div>
            <div className="outline-grid">
              <section><span>核心命题</span><textarea value={outline.premise} onChange={(event) => setOutline({ ...outline, premise: event.target.value })} rows={3} /></section>
              <section><span>故事基调</span><textarea value={outline.tone} onChange={(event) => setOutline({ ...outline, tone: event.target.value })} rows={3} /></section>
              <section className="wide"><span>故事结构</span>{outline.acts.map((act, index) => <div className="act" key={`${act.title}-${index}`}><strong>{act.title}</strong><p>{act.summary}</p></div>)}</section>
            </div>
            {length === "短篇" ? <p className="stage-intro">确认后将一次生成 3000～5000 字完整短篇，并作为“全文”保存。</p> : <div className="chapter-instruction">
              <label htmlFor="chapter-count">预计章节数</label>
              <input id="chapter-count" type="number" min={length === "长篇" ? 10 : 3} max={length === "长篇" ? 50 : 20} value={chapterCount} onChange={(event) => setChapterCount(Number(event.target.value))} />
              <span>{length === "长篇" ? "允许 10～50 章，确认后先生成章节细纲。" : "允许 3～20 章，确认后逐章生成。"}</span>
            </div>}
            <div className="chapter-instruction"><label htmlFor="chapter-instruction">正文要求</label><input id="chapter-instruction" value={instruction} onChange={(event) => setInstruction(event.target.value)} /></div>
            <div className="studio-actions"><button className="button button-ghost" onClick={() => setStage("ideas")}>返回方案</button><button disabled={loading} className="button button-primary" onClick={confirmOutline}>{loading ? "故事正在落笔…" : length === "短篇" ? "确认大纲，生成整篇" : length === "长篇" ? "确认大纲，生成章节细纲" : "确认大纲，生成第一章"}</button></div>
          </div>}

          {stage === "chapter-outline" && <div className="outline-stage reveal">
            <div className="outline-title"><div><span>长篇章节规划</span><h2>共 {chapterCount} 章</h2></div><button className="button button-small button-quiet" onClick={() => setStage("outline")}>返回大纲</button></div>
            <p className="stage-intro">逐章检查标题、目标和转折；正文生成时只读取当前章细纲、总体大纲与上一章。</p>
            <div className="chapter-outline-list">{chapterOutlines.map((item, index) => <article className="chapter-outline-card" key={index}>
              <span>第 {index + 1} 章</span>
              <input aria-label={`第${index + 1}章标题`} value={item.title} onChange={(event) => updateChapterOutline(index, "title", event.target.value)} />
              <label>本章目标<textarea rows={2} value={item.goal} onChange={(event) => updateChapterOutline(index, "goal", event.target.value)} /></label>
              <label>主要事件<textarea rows={2} value={item.events} onChange={(event) => updateChapterOutline(index, "events", event.target.value)} /></label>
              <label>冲突与转折<textarea rows={2} value={item.turn} onChange={(event) => updateChapterOutline(index, "turn", event.target.value)} /></label>
              <label>伏笔与回收<textarea rows={2} value={item.foreshadow} onChange={(event) => updateChapterOutline(index, "foreshadow", event.target.value)} /></label>
              <label>结尾钩子<textarea rows={2} value={item.hook} onChange={(event) => updateChapterOutline(index, "hook", event.target.value)} /></label>
            </article>)}</div>
            <div className="studio-actions"><button className="button button-ghost" onClick={() => setStage("outline")}>调整总大纲</button><button disabled={loading || chapterOutlines.length !== chapterCount} className="button button-primary" onClick={generateChapter}>{loading ? "故事正在落笔…" : "确认细纲，生成第一章"}</button></div>
          </div>}

          {stage === "chapter" && <div className="chapter-stage reveal">
            <div className="chapter-toolbar"><div><span>{length === "短篇" ? "完整短篇" : `第 ${currentChapterNumber} / ${chapterCount} 章`}</span><strong>{chapter.length} 字</strong></div><button disabled={loading || !chapter} className="button button-small button-quiet" onClick={rewriteSelection}>润色选中文字</button></div>
            <input className="chapter-title-input" aria-label="章节名称" value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} />
            <textarea ref={chapterRef} value={chapter} onChange={(event) => setChapter(event.target.value)} placeholder="故事正在寻找它的下一句话。" aria-label="章节正文" />
            <div className="chapter-instruction"><label htmlFor="rewrite-instruction">生成或改写要求</label><input id="rewrite-instruction" value={instruction} onChange={(event) => setInstruction(event.target.value)} /></div>
            <div className="studio-actions">
              <button disabled={loading} className="button button-ghost" onClick={generateChapter}>{loading ? "正在生成…" : chapter ? "按要求重新生成" : "生成本章"}</button>
              <button disabled={loading} className="button button-quiet" onClick={() => void persistBook("writing")}>保存到书架</button>
              {canWriteNext && <button disabled={loading} className="button button-quiet" onClick={() => void persistBook("writing", true)}>保存并写下一章</button>}
              <button disabled={loading} className="button button-primary" onClick={() => void persistBook("completed")}>完成作品</button>
            </div>
          </div>}
        </section>

        <aside className="agent-panel">
          <div className="agent-heading"><span className="agent-orb">✦</span><div><strong>写作伴侣</strong><small>{model}</small></div></div>
          <div className="agent-message"><p>{companionReply || (stage === "brief" ? "告诉我你想写什么。不完整的念头也很好。" : "我会回答你的具体问题，但故事的选择始终属于你。")}</p></div>
          {memory && <div className="agent-message"><p>小说记忆已更新至第 {memory.updatedThroughChapter} 章。</p></div>}
          {consistencyIssues.length > 0 && <div className="agent-message" role="status"><p><strong>一致性提醒</strong><br />{consistencyIssues.map((issue, index) => <span key={index}>{issue.description} 建议：{issue.suggestion}<br /></span>)}</p></div>}
          <div className="style-card"><span>当前文风</span><strong>{style}</strong><p>{styleInstruction}</p><a href="/styles">查看文风库</a></div>
          <div className="agent-input"><input value={companionQuestion} onChange={(event) => setCompanionQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void askCompanion(); }} aria-label="询问写作伴侣" placeholder="问问写作伴侣……" /><button disabled={loading} onClick={askCompanion} aria-label="发送">↑</button></div>
        </aside>
      </main>
    </AppShell>
  );
}
