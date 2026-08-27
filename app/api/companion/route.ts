import { runCompanion } from "../../../lib/agent";
import { createTextProvider } from "../../../lib/deepseek-provider";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { question?: string; context?: string; selectedText?: string };
    if (!body.question?.trim()) return Response.json({ error: "请先写下你的问题" }, { status: 400 });
    return Response.json(await runCompanion(createTextProvider(), {
      question: body.question,
      context: body.context,
      selectedText: body.selectedText,
    }));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "写作伴侣暂时没有回应" }, { status: 502 });
  }
}
