import { MockTextProvider, type TextGenerationRequest, type TextGenerationResult, type TextModelProvider } from "./providers";

type DeepSeekResponse = {
  choices?: Array<{
    finish_reason?: string | null;
    message?: { content?: string | null; reasoning_content?: string | null };
  }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    completion_tokens_details?: { reasoning_tokens?: number };
  };
  error?: { message?: string };
};

export class DeepSeekProvider implements TextModelProvider {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    private readonly model = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
  ) {}

  async generate(request: TextGenerationRequest): Promise<TextGenerationResult> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: request.system },
          { role: "user", content: request.prompt },
        ],
        max_tokens: request.maxTokens ?? 2200,
        temperature: 0.8,
        thinking: { type: "disabled" },
        ...(request.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    const payload = await response.json() as DeepSeekResponse;
    if (!response.ok) {
      throw new Error(payload.error?.message ?? `DeepSeek 请求失败（${response.status}）`);
    }

    const choice = payload.choices?.[0];
    const content = choice?.message?.content?.trim();
    if (!content) {
      const finishReason = choice?.finish_reason;
      if (finishReason === "length") {
        throw new Error("DeepSeek 输出达到长度上限，未生成最终内容");
      }
      if (finishReason === "content_filter") {
        throw new Error("DeepSeek 返回内容被安全策略拦截");
      }
      if (finishReason === "insufficient_system_resource") {
        throw new Error("DeepSeek 服务资源暂时不足，请稍后重试");
      }

      const reason = finishReason ? `（结束原因：${finishReason}）` : "";
      throw new Error(`DeepSeek 未返回内容${reason}`);
    }

    return {
      content,
      model: payload.model ?? this.model,
      usage: payload.usage ? {
        promptTokens: payload.usage.prompt_tokens,
        completionTokens: payload.usage.completion_tokens,
        totalTokens: payload.usage.total_tokens,
      } : undefined,
    };
  }
}

export function createTextProvider(): TextModelProvider {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  return apiKey ? new DeepSeekProvider(apiKey) : new MockTextProvider();
}
