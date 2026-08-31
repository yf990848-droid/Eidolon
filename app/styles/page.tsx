"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent } from "react";
import { AppShell } from "../../components/app-shell";
import {
  AUTHOR_STYLE_PROFILES,
  createStyleId,
  deleteStyleProfile,
  loadStyleProfiles,
  saveStyleProfile,
  type StyleAnalysis,
  type StyleFeatures,
  type StyleProfile,
} from "../../lib/style-profiles";

const FEATURE_LABELS: Array<{ key: keyof StyleFeatures; label: string }> = [
  { key: "perspective", label: "叙述视角" },
  { key: "rhythm", label: "语言节奏" },
  { key: "sentenceStyle", label: "句式特点" },
  { key: "dialogue", label: "对话倾向" },
  { key: "description", label: "描写方式" },
  { key: "emotion", label: "情绪基调" },
  { key: "imagery", label: "常用意象" },
];

async function analyzeStyle(referenceText: string): Promise<{ data: StyleAnalysis; model: string }> {
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: "style-analysis", input: { referenceText } }),
  });
  const payload = await response.json() as { data?: StyleAnalysis; model?: string; error?: string };
  if (!response.ok || !payload.data) throw new Error(payload.error ?? "文风分析失败，请稍后重试");
  if (!payload.data.summary || !payload.data.features || !payload.data.writingInstruction || FEATURE_LABELS.some((item) => !payload.data?.features[item.key])) {
    throw new Error("文风分析结果不完整，请重新分析");
  }
  return { data: payload.data, model: payload.model ?? "unknown" };
}

export default function StylesPage() {
  const [profiles, setProfiles] = useState<StyleProfile[]>([]);
  const [profileName, setProfileName] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState<StyleAnalysis | null>(null);
  const [model, setModel] = useState("等待分析");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setProfiles(loadStyleProfiles()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) {
      setError("目前只支持 TXT 和 Markdown 文件");
      return;
    }
    try {
      const content = await file.text();
      setReferenceText(content.slice(0, 12000));
      setFileName(file.name);
      setAnalysis(null);
      setMessage(content.length > 12000 ? "文件较长，已读取前 12,000 字用于分析。" : `已读取 ${file.name}`);
      setError("");
    } catch {
      setError("文件读取失败，请重新选择");
    }
  }

  async function runAnalysis() {
    const source = referenceText.trim();
    if (source.length < 500) {
      setError("请提供至少 500 字参考文字，以获得较稳定的分析结果");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await analyzeStyle(source.slice(0, 12000));
      setAnalysis(result.data);
      setModel(result.model);
      setMessage("文风卡已生成，可以修改后保存。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "文风分析失败");
    } finally {
      setLoading(false);
    }
  }

  function updateFeature(key: keyof StyleFeatures, value: string) {
    if (!analysis) return;
    setAnalysis({ ...analysis, features: { ...analysis.features, [key]: value } });
  }

  function persistProfile() {
    if (!analysis) return;
    if (!profileName.trim()) {
      setError("请为这张文风卡命名");
      return;
    }
    const now = new Date().toISOString();
    const profile = saveStyleProfile({
      ...analysis,
      id: createStyleId(),
      name: profileName.trim(),
      type: "personal",
      createdAt: now,
      updatedAt: now,
    });
    setProfiles((current) => [profile, ...current]);
    setProfileName("");
    setReferenceText("");
    setFileName("");
    setAnalysis(null);
    setError("");
    setMessage("文风卡已保存，参考原文没有被保留。");
  }

  function removeProfile(id: string) {
    if (!window.confirm("确定删除这张个人文风卡吗？已有作品中保存的文风快照不会受影响。")) return;
    deleteStyleProfile(id);
    setProfiles((current) => current.filter((item) => item.id !== id));
  }

  return (
    <AppShell>
      <main className="page inner-page styles-page">
        <header className="page-heading">
          <div><p className="eyebrow">STYLE LIBRARY</p><h1>个人文风库</h1></div>
          <p>从自己的文字中提炼可复用的表达习惯，或选择一张文学特征卡进入创作。参考原文不会保存。</p>
        </header>

        <section className="style-analyzer">
          <div className="style-source-panel">
            <div className="style-section-title"><span>01</span><div><h2>提供参考文字</h2><p>粘贴文字，或上传 TXT、Markdown；建议 500–12,000 字。</p></div></div>
            <textarea value={referenceText} onChange={(event) => { setReferenceText(event.target.value.slice(0, 12000)); setFileName(""); setAnalysis(null); }} rows={12} placeholder="粘贴一段能代表你写作习惯的文字……" aria-label="参考文字" />
            <div className="style-source-meta">
              <label className="button button-quiet">上传 TXT / Markdown<input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={readFile} /></label>
              <span>{fileName || "未选择文件"} · {referenceText.length.toLocaleString()} 字</span>
            </div>
            <button className="button button-primary style-analyze-button" disabled={loading} onClick={runAnalysis}>{loading ? "正在辨认文字的呼吸……" : "识别这段文字的文风"}</button>
            {error && <div className="error-banner" role="alert">{error}</div>}
            {message && <p className="style-message">{message}</p>}
          </div>

          <div className="style-result-panel">
            <div className="style-section-title"><span>02</span><div><h2>整理为文风卡</h2><p>{analysis ? `分析模型：${model}` : "分析结果会出现在这里，并允许保存前修改。"}</p></div></div>
            {!analysis ? <div className="style-result-empty"><span>✦</span><p>文字留下的不只是内容，也有节奏、距离与光线。</p></div> : <div className="style-analysis-form reveal">
              <label>文风卡名称<input value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="例如：我的清冷叙事" /></label>
              <label>文风概述<textarea rows={3} value={analysis.summary} onChange={(event) => setAnalysis({ ...analysis, summary: event.target.value })} /></label>
              <div className="style-feature-fields">{FEATURE_LABELS.map((item) => <label key={item.key}>{item.label}<input value={analysis.features[item.key]} onChange={(event) => updateFeature(item.key, event.target.value)} /></label>)}</div>
              <label>生成时使用的写作指令<textarea rows={5} value={analysis.writingInstruction} onChange={(event) => setAnalysis({ ...analysis, writingInstruction: event.target.value })} /></label>
              <button className="button button-primary" onClick={persistProfile}>保存文风卡</button>
            </div>}
          </div>
        </section>

        <section className="style-library-section">
          <div className="section-heading"><div><p className="eyebrow">MY VOICE</p><h2>我的文风</h2></div><p>只保存结构化文风卡，不保存你粘贴或上传的参考原文。</p></div>
          {profiles.length === 0 ? <div className="empty-shelf"><span>◇</span><div><strong>还没有个人文风卡</strong><p>完成上方分析并保存后，它会出现在这里。</p></div></div> : <div className="style-profile-grid">{profiles.map((profile) => <article className="style-profile-card" key={profile.id}>
            <p className="eyebrow">个人文风</p><h3>{profile.name}</h3><p>{profile.summary}</p>
            <div className="style-tags"><span>{profile.features.rhythm}</span><span>{profile.features.emotion}</span><span>{profile.features.imagery}</span></div>
            <footer><Link href={`/studio?style=${encodeURIComponent(profile.id)}`}>用于 AI 共创</Link><button onClick={() => removeProfile(profile.id)}>删除</button></footer>
          </article>)}</div>}
        </section>

        <section className="style-library-section">
          <div className="section-heading"><div><p className="eyebrow">LITERARY REFERENCES</p><h2>中外文学特征</h2></div><p>用于理解和选择抽象文学特征，不复刻原作段落；在世作者预设不要求模型直接模仿本人。</p></div>
          <div className="style-profile-grid">{AUTHOR_STYLE_PROFILES.map((profile) => <article className="style-profile-card preset" key={profile.id}>
            <p className="eyebrow">文学特征参考</p><h3>{profile.name}</h3><p>{profile.summary}</p>
            <div className="style-tags"><span>{profile.features.rhythm}</span><span>{profile.features.emotion}</span><span>{profile.features.imagery}</span></div>
            <footer><Link href={`/studio?style=${encodeURIComponent(profile.id)}`}>选择并开始创作</Link></footer>
          </article>)}</div>
        </section>
      </main>
    </AppShell>
  );
}
