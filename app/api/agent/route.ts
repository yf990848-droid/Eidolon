import { runAgent, type AgentTask } from "../../../lib/agent";
import { createTextProvider } from "../../../lib/deepseek-provider";

const TASKS = new Set<AgentTask>(["idea", "outline", "chapter", "rewrite"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { task?: AgentTask; input?: Record<string, unknown> };
    if (!body.task || !TASKS.has(body.task) || !body.input) {
      return Response.json({ error: "无效的创作请求" }, { status: 400 });
    }
    return Response.json(await runAgent(createTextProvider(), body.task, body.input));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "故事暂时没有找到下一句话" }, { status: 502 });
  }
}
