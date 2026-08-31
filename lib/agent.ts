import type { TextModelProvider } from "./providers";
import { agentLog, shouldLogRawAgentResponse } from "./logger";

export type AgentTask = "style-analysis" | "idea" | "outline" | "chapter-outline" | "short-story" | "chapter" | "rewrite";

export type AgentInput = {
  genre?: string;
  length?: string;
  style?: string;
  styleInstruction?: string;
  referenceText?: string;
  thought?: string;
  idea?: { title?: string; summary?: string };
  outline?: unknown;
  chapterCount?: number;
  chapterNumber?: number;
  chapterOutline?: unknown;
  previousChapter?: string;
  chapter?: string;
  selectedText?: string;
  instruction?: string;
};

const SYSTEM_PROMPTS: Record<AgentTask, string> = {
  "style-analysis": "TASK:style-analysis。你是纸境的文风分析编辑。只分析语言表达，不总结故事，不猜测作者，不复述原文，也不保留人名、地点或具体情节。只返回 JSON：{\"summary\":\"\",\"features\":{\"perspective\":\"\",\"rhythm\":\"\",\"sentenceStyle\":\"\",\"dialogue\":\"\",\"description\":\"\",\"emotion\":\"\",\"imagery\":\"\"},\"writingInstruction\":\"\"}。writingInstruction 必须是可复用的抽象写作指令，不得要求复制特定作者或原文措辞。",
  idea: "TASK:idea。你是纸境的小说策划编辑。只返回 JSON，格式为 {\"ideas\":[{\"label\":\"\",\"title\":\"\",\"summary\":\"\",\"sample\":\"\"}]}，必须恰好三个差异明确的原创方案。",
  outline: "TASK:outline。你是纸境的故事结构编辑。只返回 JSON，格式为 {\"premise\":\"\",\"tone\":\"\",\"acts\":[{\"title\":\"\",\"summary\":\"\"}]}，acts 必须恰好三幕。",
  "chapter-outline": "TASK:chapter-outline。你是纸境的长篇结构编辑。根据用户确认的总章数，为每一章生成可执行细纲。只返回 JSON，格式为 {\"chapters\":[{\"title\":\"\",\"goal\":\"\",\"events\":\"\",\"turn\":\"\",\"foreshadow\":\"\",\"hook\":\"\"}]}。chapters 数量必须与 chapterCount 完全一致，情节连续，并在全书范围内安排伏笔与回收。",
  "short-story": "TASK:short-story。你是纸境的短篇小说编辑。根据已经确认的创意和大纲，一次写完一篇完整的原创短篇小说，目标 3000 至 5000 个汉字，必须包含完整开端、发展、转折和结局。只输出小说正文，不解释创作过程，不使用 Markdown 标题。",
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function inspectStyleAnalysis(data: unknown) {
  const root = isRecord(data) ? data : {};
  const features = isRecord(root.features) ? root.features : {};
  const requiredFeatures = ["perspective", "rhythm", "sentenceStyle", "dialogue", "description", "emotion", "imagery"];
  const missingFields = [
    ...(typeof root.summary === "string" && root.summary.trim() ? [] : ["summary"]),
    ...(isRecord(root.features) ? [] : ["features"]),
    ...requiredFeatures.filter((key) => typeof features[key] !== "string" || !features[key].trim()),
    ...(typeof root.writingInstruction === "string" && root.writingInstruction.trim() ? [] : ["writingInstruction"]),
  ];

  return {
    topLevelKeys: Object.keys(root),
    featureKeys: Object.keys(features),
    missingFields,
  };
}

export async function runAgent(provider: TextModelProvider, task: AgentTask, input: AgentInput, requestId = crypto.randomUUID()) {
  const startedAt = Date.now();
  const result = await provider.generate({
    system: SYSTEM_PROMPTS[task],
    prompt: `以下是用户已经确认的创作信息，请严格基于它完成任务：\n${clipped(input)}`,
    json: task === "style-analysis" || task === "idea" || task === "outline" || task === "chapter-outline",
    maxTokens: task === "short-story" || task === "chapter-outline" ? 6000 : task === "chapter" ? 3600 : task === "style-analysis" ? 1800 : 2200,
  });

  if (task === "style-analysis" && shouldLogRawAgentResponse()) {
    agentLog("warn", "agent.style.raw_response", { requestId, model: result.model, content: result.content });
  }

  let data: unknown = result.content;
  if (task === "style-analysis" || task === "idea" || task === "outline" || task === "chapter-outline") {
    try {
      data = parseJson(result.content);
    } catch (error) {
      agentLog("error", "agent.response.invalid_json", {
        requestId,
        task,
        model: result.model,
        durationMs: Date.now() - startedAt,
        contentLength: result.content.length,
        error: error instanceof Error ? error.message : "JSON parse failed",
      });
      throw error;
    }
  }

  if (task === "style-analysis") {
    const shape = inspectStyleAnalysis(data);
    agentLog(shape.missingFields.length ? "warn" : "info", "agent.style.response_shape", {
      requestId,
      model: result.model,
      durationMs: Date.now() - startedAt,
      contentLength: result.content.length,
      ...shape,
    });
  }

  return {
    requestId,
    task,
    data,
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
