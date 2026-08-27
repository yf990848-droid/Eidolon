"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "../../components/app-shell";

type Draft = { title: string; chapterTitle: string; content: string };
const EMPTY_DRAFT: Draft = { title: "未命名作品", chapterTitle: "第一章", content: "" };

export default function OriginalWritingPage() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [question, setQuestion] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [model, setModel] = useState("按需回应");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const insertionRef = useRef({ start: 0, end: 0 });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("paper-realm-original-draft");
      if (saved) setDraft({ ...EMPTY_DRAFT, ...JSON.parse(saved) });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("paper-realm-original-draft", JSON.stringify(draft));
    const timer = window.setTimeout(() => setSavedAt(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })), 0);
    return () => window.clearTimeout(timer);
  }, [draft]);

  async function askCompanion() {
    if (!question.trim()) return;
    const field = editorRef.current;
    const start = field?.selectionStart ?? draft.content.length;
    const end = field?.selectionEnd ?? start;
    insertionRef.current = { start, end };
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: draft.content, selectedText: draft.content.slice(start, end) }),
      });
      const payload = await response.json() as { suggestion?: string; model?: string; error?: string };
      if (!response.ok || !payload.suggestion) throw new Error(payload.error ?? "写作伴侣暂时没有回应");
      setSuggestion(payload.suggestion); setModel(payload.model ?? "写作伴侣"); setQuestion("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "询问失败"); }
    finally { setLoading(false); }
  }

  function insertSuggestion() {
    if (!suggestion) return;
    const { start, end } = insertionRef.current;
    const separator = start > 0 && !draft.content.slice(0, start).endsWith("\n") ? "\n\n" : "";
    setDraft({ ...draft, content: draft.content.slice(0, end) + separator + suggestion + draft.content.slice(end) });
    setSuggestion("");
  }

  return (
    <AppShell>
      <main className="writer-page">
        <section className="writer-paper">
          <header className="writer-header">
            <div><p className="eyebrow">原创写作 · 只属于你的稿纸</p><input aria-label="作品名称" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div>
            <div className="writer-status"><span>{draft.content.length} 字</span><span>{savedAt ? `${savedAt} 已保存` : "准备落笔"}</span></div>
          </header>
          <input className="chapter-title-input" aria-label="章节名称" value={draft.chapterTitle} onChange={(event) => setDraft({ ...draft, chapterTitle: event.target.value })} />
          <textarea
            ref={editorRef}
            className="original-editor"
            aria-label="原创正文"
            value={draft.content}
            onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            placeholder="请从一个声音、一扇门或一次告别开始。"
            spellCheck
          />
        </section>

        <aside className="companion-panel">
          <div className="agent-heading"><span className="agent-orb">✦</span><div><strong>写作伴侣</strong><small>{model}</small></div></div>
          <p className="companion-rule">它只在你主动询问时回应，不会替你规划故事或改动正文。</p>
          <div className="companion-prompts">
            {["这段话是否通顺？", "给我三个更准确的词", "检查人物语气是否一致"].map((prompt) => <button key={prompt} onClick={() => setQuestion(prompt)}>{prompt}</button>)}
          </div>
          {error && <div className="error-banner" role="alert">{error}</div>}
          {suggestion && <div className="companion-result"><span>伴侣的建议</span><p>{suggestion}</p><div><button onClick={() => setSuggestion("")}>放弃</button><button onClick={insertSuggestion}>插入到正文</button></div></div>}
          <div className="companion-compose">
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="选中文字后提问，或直接写下你的问题……" rows={4} />
            <button disabled={loading || !question.trim()} onClick={askCompanion}>{loading ? "正在斟酌…" : "询问伴侣"}</button>
          </div>
        </aside>
      </main>
    </AppShell>
  );
}
