export type TextGenerationRequest = {
  system: string;
  prompt: string;
  json?: boolean;
  maxTokens?: number;
};

export type TextGenerationResult = {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

export type CoverGenerationRequest = {
  prompt: string;
  negativePrompt?: string;
  count?: number;
};

export type CoverGenerationResult = {
  taskId: string;
  imageUrls: string[];
};

export interface TextModelProvider {
  generate(request: TextGenerationRequest): Promise<TextGenerationResult>;
}

export interface ImageModelProvider {
  generateCover(request: CoverGenerationRequest): Promise<CoverGenerationResult>;
}

/**
 * Phase-one provider: deterministic examples for UI development.
 * Real providers will live behind server-only route handlers in phase two.
 */
export class MockTextProvider implements TextModelProvider {
  async generate(request: TextGenerationRequest): Promise<TextGenerationResult> {
    if (request.system.includes("TASK:style-analysis")) {
      return {
        model: "paper-realm-mock",
        content: JSON.stringify({
          summary: "清冷克制，以中短句推进叙事，通过环境细节映照人物没有说出口的情绪。",
          features: {
            perspective: "贴近人物的有限视角",
            rhythm: "舒缓中带有短暂停顿",
            sentenceStyle: "中短句交替，较少解释",
            dialogue: "对话简洁，重视潜台词",
            description: "选择性描写光线、声音和小动作",
            emotion: "克制、安静，略带惆怅",
            imagery: "雨、窗、灯与旧物",
          },
          writingInstruction: "使用克制的中短句，以环境细节和人物动作呈现心理；减少直接解释，让情绪通过停顿、对话潜台词和反复意象自然显现。",
        }),
      };
    }
    if (request.system.includes("TASK:idea")) {
      return {
        model: "paper-realm-mock",
        content: JSON.stringify({ ideas: [
          { label: "城市寓言", title: "雨停以前", summary: "一名替陌生人保管记忆的店员，发现一段被典当的童年属于自己。", sample: "雨从凌晨开始落，像有人在城市上空反复擦去一个写错的名字。" },
          { label: "心理悬疑", title: "无声证词", summary: "每个证人都记得不同的真相，唯有一封没有署名的信保持沉默。", sample: "她把信纸对着灯，空白处渐渐浮出一条从未走过的街。" },
          { label: "温柔奇想", title: "借梦的人", summary: "人们可以租借梦境度过失眠之夜，而最后一位造梦者决定停止营业。", sample: "最后一个梦被装进玻璃瓶时，天边刚好亮起一线很淡的蓝。" },
        ] }),
      };
    }
    if (request.system.includes("TASK:outline")) {
      return {
        model: "paper-realm-mock",
        content: JSON.stringify({
          premise: "当记忆可以被保存、交换乃至伪造，一个人凭什么确认自己是谁？",
          tone: "潮湿、克制而微带暖意的都市寓言。",
          acts: [
            { title: "第一幕 · 缺失", summary: "主角发现一枚与自己梦境相同的童年记忆，平静生活出现裂缝。" },
            { title: "第二幕 · 追索", summary: "他沿线索调查旧案，却发现每个证人都记得一个不同的自己。" },
            { title: "第三幕 · 认领", summary: "系统即将重置，他必须在真实过去与主动选择的人生之间作出决定。" },
          ],
        }),
      };
    }
    if (request.system.includes("TASK:chapter-outline")) {
      const count = Math.max(1, Number(request.prompt.match(/\"chapterCount\":(\d+)/)?.[1] ?? 20));
      return {
        model: "paper-realm-mock",
        content: JSON.stringify({
          chapters: Array.from({ length: count }, (_, index) => ({
            title: `第${index + 1}章 · ${index === 0 ? "陌生的记忆" : index === count - 1 ? "主动选择的人生" : "线索继续延伸"}`,
            goal: index === 0 ? "建立人物处境并引出核心谜团" : index === count - 1 ? "完成核心选择并收束人物弧光" : "推进调查并改变人物关系",
            events: "主角沿新线索行动，并发现此前认知存在缺口。",
            turn: "一项看似可靠的证据指向相反结论。",
            foreshadow: index < count - 1 ? "留下与旧照片和雨夜有关的线索。" : "回收旧照片和雨夜线索。",
            hook: index < count - 1 ? "一个熟悉的名字出现在陌生人的记录中。" : "主角决定如何继续此后的人生。",
          })),
        }),
      };
    }
    if (request.system.includes("TASK:short-story")) {
      return {
        model: "paper-realm-mock",
        content: "雨是在黄昏以后落下来的。林默推开记忆典当行的门，发现柜台上多了一只没有标签的玻璃瓶。瓶中那场雪缓慢地下着，他认出了雪地尽头那扇只在梦里出现过的门。\n\n他沿着瓶中留下的线索找到旧城，终于明白自己典当掉的并不是童年，而是面对失去的勇气。天亮以前，他将记忆归还原处，也决定不再用遗忘保护自己。\n\n雨停时，玻璃瓶里最后一片雪落在门槛上。林默推门走进清晨，第一次记得自己要去哪里。",
      };
    }
    if (request.system.includes("TASK:chapter")) {
      return { model: "paper-realm-mock", content: "雨是在黄昏以后落下来的。林默推开记忆典当行的门时，铜铃没有响，柜台上却多了一只没有标签的玻璃瓶。瓶中那场雪缓慢地下着，他认出了雪地尽头那扇只在梦里出现过的门。" };
    }
    if (request.system.includes("TASK:rewrite")) {
      return { model: "paper-realm-mock", content: "雨从黄昏落到夜里。林默推门时，铜铃沉默着，柜台上却多了一只无名的玻璃瓶。" };
    }
    return { content: "我在。把你正在犹豫的句子或问题交给我，我只提供建议，决定权仍属于你。", model: "paper-realm-mock" };
  }
}
