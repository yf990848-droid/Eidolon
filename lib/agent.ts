import type { TextModelProvider } from "./providers";

export type AgentTask = "style-analysis" | "idea" | "outline" | "chapter" | "rewrite";

export type AgentInput = {
  genre?: string;
  length?: string;
  style?: string;
  styleInstruction?: string;
  referenceText?: string;
  thought?: string;
  idea?: { title?: string; summary?: string };
  outline?: unknown;
  chapter?: string;
  selectedText?: string;
  instruction?: string;
};

const SYSTEM_PROMPTS: Record<AgentTask, string> = {
  "style-analysis": "TASK:style-analysis。你是纸境的文风分析编辑。只分析语言表达，不总结故事，不猜测作者，不复述原文，也不保留人名、地点或具体情节。只返回 JSON：{\"summary\":\"\",\"features\":{\"perspective\":\"\",\"rhythm\":\"\",\"sentenceStyle\":\"\",\"dialogue\":\"\",\"description\":\"\",\"emotion\":\"\",\"imagery\":\"\"},\"writingInstruction\":\"\"}。writingInstruction 必须是可复用的抽象写作指令，不得要求复制特定作者或原文措辞。",
  idea: "TASK:idea。你是纸境的小说策划编辑。只返回 JSON，格式为 {\"ideas\":[{\"label\":\"\",\"title\":\"\",\"summary\":\"\",\"sample\":\"\"}]}，必须恰好三个差异明确的原创方案。",
  outline: "TASK:outline。你是纸境的故事结构编辑。只返回 JSON，格式为 {\"premise\":\"\",\"tone\":\"\",\"acts\":[{\"title\":\"\",\"summary\":\"\"}]}，acts 必须恰好三幕。",
  chapter: "TASK:chapter。你是纸境的小说正文编辑。根据已确认信息写一段完整章节正文，不解释写作过程，不使用 Markdown 标题。",
  rewrite: "TASK:rewrite。你是纸境的文字编辑。只改写用户给出的文字，忠实保留事实、人物和情节，不解释。",
};

function clipped(value: unknown, max = 12000) {
  return JSON.stringify(value ?? "").slice(0, max);
}

function parseJson(content: string) {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned) as unknown;
}

export async function runAgent(provider: TextModelProvider, task: AgentTask, input: AgentInput) {
  const result = await provider.generate({
    system: SYSTEM_PROMPTS[task],
    prompt: `以下是用户已经确认的创作信息，请严格基于它完成任务：\n${clipped(input)}`,
    json: task === "style-analysis" || task === "idea" || task === "outline",
    maxTokens: task === "chapter" ? 3600 : task === "style-analysis" ? 1800 : 2200,
  });

  return {
    task,
    data: task === "style-analysis" || task === "idea" || task === "outline" ? parseJson(result.content) : result.content,
    model: result.model,
    usage: result.usage,
  };
}

export async function runCompanion(provider: TextModelProvider, input: { question: string; context?: string; selectedText?: string }) {
  const result = await provider.generate({
    system: "你是纸境的写作伴侣。用户正在坚持原创写作。你只回答明确提出的问题，给出简洁、可执行的建议；不主动续写，不直接声称已经修改正文。",
    prompt: `用户问题：${input.question.slice(0, 1200)}\n\n选中文字：${(input.selectedText ?? "").slice(0, 3000)}\n\n临近上下文：${(input.context ?? "").slice(-6000)}`,
    maxTokens: 1000,
  });
  return { suggestion: result.content, model: result.model, usage: result.usage };
}
