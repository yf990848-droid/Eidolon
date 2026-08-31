export type StyleFeatures = {
  perspective: string;
  rhythm: string;
  sentenceStyle: string;
  dialogue: string;
  description: string;
  emotion: string;
  imagery: string;
};

export type StyleAnalysis = {
  summary: string;
  features: StyleFeatures;
  writingInstruction: string;
};

export type StyleProfile = StyleAnalysis & {
  id: string;
  name: string;
  type: "personal" | "preset";
  createdAt: string;
  updatedAt: string;
};

const PRESET_DATE = "2026-08-31T00:00:00.000Z";
const STORAGE_KEY = "paper-realm-style-profiles";

function preset(id: string, name: string, summary: string, features: StyleFeatures, writingInstruction: string): StyleProfile {
  return { id, name, type: "preset", summary, features, writingInstruction, createdAt: PRESET_DATE, updatedAt: PRESET_DATE };
}

export const SYSTEM_STYLE_PROFILES: StyleProfile[] = [
  preset("system-rain-night", "雨夜独白", "潮湿、克制，以环境映照人物没有说出口的情绪。", {
    perspective: "贴近人物的有限视角", rhythm: "舒缓中带短暂停顿", sentenceStyle: "中短句交替", dialogue: "少而含蓄", description: "重视光影、雨声与室内细节", emotion: "克制、孤独而温柔", imagery: "雨、窗、灯与旧物",
  }, "使用克制的中短句，以环境细节映照人物心理；减少直白解释，让情绪通过动作、停顿和意象自然显现。"),
  preset("system-classic", "古典叙事", "沉静端正，讲究叙事秩序与含蓄余韵。", {
    perspective: "稳定的第三人称", rhythm: "从容舒展", sentenceStyle: "整饬而有层次", dialogue: "简洁得体", description: "重视人物礼仪与环境秩序", emotion: "含蓄平稳", imagery: "庭院、器物与四时",
  }, "保持从容清晰的叙事秩序，语言端正但不过度仿古；通过器物、动作和四时变化表现关系与情绪。"),
  preset("system-urban", "都市冷峻", "清醒利落，用具体细节呈现城市生活的距离感。", {
    perspective: "近距离有限视角", rhythm: "紧凑直接", sentenceStyle: "短句为主", dialogue: "简短、有潜台词", description: "选择性描写城市空间", emotion: "冷静疏离", imagery: "玻璃、霓虹、电梯与街道",
  }, "用准确的短句和具体城市细节推进叙事，控制抒情；人物关系主要通过对话潜台词与行为反差呈现。"),
  preset("system-youth", "轻盈青春", "明亮敏捷，在日常细节里保留成长的微小刺痛。", {
    perspective: "贴近年轻人物的第一或第三人称", rhythm: "轻快有弹性", sentenceStyle: "自然口语与短句", dialogue: "鲜活、密度较高", description: "校园与日常生活细节", emotion: "明亮中带惆怅", imagery: "风、树影、车站与夏日",
  }, "语言自然轻盈，对话鲜活但不过度网络化；在日常动作和季节细节中呈现成长、友情与未说出口的情感。"),
];

export const AUTHOR_STYLE_PROFILES: StyleProfile[] = [
  preset("author-lu-xun", "鲁迅", "冷峻凝练，以讽刺、反差和细节揭示人物处境。", {
    perspective: "清醒的观察者视角", rhythm: "短促有力", sentenceStyle: "凝练、重反差", dialogue: "简短且暴露人物立场", description: "以少量关键细节见深意", emotion: "克制、警醒", imagery: "冷色空间与日常器物",
  }, "使用凝练清醒的语言，以反差和关键细节揭示人物处境；避免口号化，让讽刺来自事件、言行与叙述距离。"),
  preset("author-lao-she", "老舍", "平实生动，重视市井人物、口语节奏和生活质感。", {
    perspective: "贴近普通人物", rhythm: "自然流畅", sentenceStyle: "清楚朴实", dialogue: "富有生活气息", description: "重视街巷与日常劳动", emotion: "温厚中有辛酸", imagery: "街巷、茶馆与四季生活",
  }, "以清楚平实的语言描绘普通人的生活，增强自然口语和人物差异；在幽默与日常细节中保留现实的重量。"),
  preset("author-shen-congwen", "沈从文", "清澈舒缓，自然景物与人物命运彼此映照。", {
    perspective: "温和的叙述者视角", rhythm: "舒缓有水流感", sentenceStyle: "自然、富有韵律", dialogue: "质朴留白", description: "重视山水、风物与习俗", emotion: "纯净而略带哀愁", imagery: "河流、渡口、月色与乡野",
  }, "以清澈舒缓的语言书写人物与地方风物，让自然景象参与情绪表达；保持质朴和留白，避免华丽堆砌。"),
  preset("author-eileen-chang", "张爱玲", "精确敏锐，以衣饰、空间和反讽呈现复杂人情。", {
    perspective: "贴近人物又保持观察距离", rhythm: "从容中有突然转折", sentenceStyle: "精确、富有比照", dialogue: "礼貌表面下藏有锋芒", description: "重视衣饰、室内与感官细节", emotion: "清醒、苍凉", imagery: "镜面、灯影、衣料与旧宅",
  }, "以精确的物质细节和微妙反差表现人物关系，保持清醒的叙述距离；减少直接判断，让情感裂缝从对话和场景中显现。"),
  preset("author-jian-zhen", "简媜", "散文性、细腻而富有内在节奏，关注日常感受与精神经验。", {
    perspective: "内省的第一人称或贴近视角", rhythm: "舒展并带有段落呼吸", sentenceStyle: "细腻、富有节奏变化", dialogue: "低密度、服务于内心观察", description: "重视触觉、光线和生活片段", emotion: "温柔、澄澈而有思索", imagery: "植物、光、水与日常器物",
  }, "采用细腻内省的散文性叙述，以感官细节连接日常经验与精神思考；保持自然节奏和真切感受，避免复刻任何特定作品措辞。"),
  preset("author-liu-cixin", "刘慈欣", "宏阔理性，以科学设想、尺度反差和危机推动叙事。", {
    perspective: "兼顾个体与宏观尺度", rhythm: "事件驱动、逐步升级", sentenceStyle: "清晰直接，必要处展开技术想象", dialogue: "承担信息与价值冲突", description: "重视科学现象和尺度感", emotion: "冷静中保留人类震撼", imagery: "星空、工程、时间与文明遗迹",
  }, "用清晰理性的语言建立可信的科学设想，通过尺度变化和因果升级制造震撼；技术细节服务于人物选择，避免复刻任何特定作品设定或措辞。"),
  preset("author-hemingway", "海明威", "简洁克制，以可见行动承载未明说的情绪。", {
    perspective: "客观贴近人物", rhythm: "短句、稳定推进", sentenceStyle: "简洁具体", dialogue: "高密度且有潜台词", description: "只保留可感知细节", emotion: "克制坚韧", imagery: "天气、身体动作与简单物件",
  }, "使用简洁具体的句子，通过动作、对话和可见细节承载情绪；少做心理解释，让重要含义留在文本表面之下。"),
  preset("author-kafka", "卡夫卡", "冷静陈述荒诞处境，让制度与日常共同产生压迫感。", {
    perspective: "贴近困境中的人物", rhythm: "平静、持续收紧", sentenceStyle: "准确而略带逻辑迷宫", dialogue: "礼貌却无法沟通", description: "日常空间逐渐异化", emotion: "焦虑、疏离", imagery: "门、走廊、文件与封闭房间",
  }, "用冷静准确的语气描述逐渐失常的日常规则，让荒诞被人物当作现实处理；通过重复程序和空间阻隔形成压迫感。"),
  preset("author-jane-austen", "简·奥斯汀", "机智克制，通过社交礼仪、对话和反讽观察人情。", {
    perspective: "带判断力的第三人称", rhythm: "从容、逻辑清晰", sentenceStyle: "优雅而精确", dialogue: "机锋与误解并存", description: "聚焦社交场合与细微举止", emotion: "理性中有温度", imagery: "客厅、信件、舞会与拜访",
  }, "以清晰优雅的叙述观察人物关系，让反讽来自言行差距和社交规则；对话保持机智与分寸，并推动误解或认识发生变化。"),
  preset("author-chekhov", "契诃夫", "平静节制，在普通生活的停顿中显露人物遗憾。", {
    perspective: "不评判的观察视角", rhythm: "舒缓、留有停顿", sentenceStyle: "朴素准确", dialogue: "看似闲谈却含有错位", description: "关注日常环境与小动作", emotion: "淡淡哀愁与同情", imagery: "房间、天气、远方声响与琐碎物件",
  }, "以朴素准确的细节书写普通生活，不急于解释或收束；让人物的愿望、错过和关系变化从闲谈、停顿与小动作中浮现。"),
  preset("author-hermann-hesse", "黑塞", "内省而富有象征意味，关注自我寻找、精神成长与二元张力。", {
    perspective: "贴近精神旅程的内在视角", rhythm: "沉静、阶段性展开", sentenceStyle: "清晰中带哲思", dialogue: "承担观念碰撞但保持人物性", description: "现实景物具有象征回声", emotion: "孤独、求索与和解", imagery: "道路、河流、梦、光暗与门槛",
  }, "以沉静清晰的语言描写人物的自我寻找，让现实经历与象征意象彼此呼应；哲思必须扎根于具体选择和感受，避免空泛说理。"),
];

export const BUILT_IN_STYLE_PROFILES = [...SYSTEM_STYLE_PROFILES, ...AUTHOR_STYLE_PROFILES];

export function createStyleId() {
  const value = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `style-${value}`;
}

export function loadStyleProfiles(): StyleProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const profiles = value ? JSON.parse(value) : [];
    return Array.isArray(profiles) ? profiles.filter((item) => item?.type === "personal") : [];
  } catch {
    return [];
  }
}

export function saveStyleProfile(profile: StyleProfile) {
  const profiles = loadStyleProfiles();
  const index = profiles.findIndex((item) => item.id === profile.id);
  if (index === -1) profiles.unshift(profile);
  else profiles[index] = profile;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return profile;
}

export function deleteStyleProfile(id: string) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loadStyleProfiles().filter((item) => item.id !== id)));
}

export function findStyleProfileByName(name?: string, personalProfiles: StyleProfile[] = []) {
  return [...BUILT_IN_STYLE_PROFILES, ...personalProfiles].find((item) => item.name === name);
}
