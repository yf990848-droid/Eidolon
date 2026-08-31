import { runAgent, type AgentTask } from "../../../lib/agent";
import { createTextProvider } from "../../../lib/deepseek-provider";
import { agentLog } from "../../../lib/logger";

const TASKS = new Set<AgentTask>(["style-analysis", "idea", "outline", "chapter-outline", "short-story", "chapter", "rewrite", "memory-update"]);

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let task: AgentTask | undefined;
  try {
    const body = await request.json() as { task?: AgentTask; input?: Record<string, unknown> };
    task = body.task;
    if (!body.task || !TASKS.has(body.task) || !body.input) {
      agentLog("warn", "agent.request.invalid", { requestId, task: body.task, durationMs: Date.now() - startedAt });
      return Response.json({ requestId, error: "无效的创作请求" }, { status: 400 });
    }
    agentLog("info", "agent.request.started", {
      requestId,
      task: body.task,
      inputLength: JSON.stringify(body.input).length,
    });
    const result = await runAgent(createTextProvider(), body.task, body.input, requestId);
    agentLog("info", "agent.request.completed", {
      requestId,
      task: body.task,
      model: result.model,
      durationMs: Date.now() - startedAt,
      totalTokens: result.usage?.totalTokens,
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "故事暂时没有找到下一句话";
    agentLog("error", "agent.request.failed", {
      requestId,
      task,
      durationMs: Date.now() - startedAt,
      error: message,
    });
    return Response.json({ requestId, error: message }, { status: 502 });
  }
}
