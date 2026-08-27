# 纸境 · Eidolon

纸境是一个集 AI 小说共创、原创写作、作品管理和沉浸式阅读于一体的个人写作网站。

> 白天属于面包，夜晚属于纸境。

## 当前功能

- 文学化首页与每日灵感
- 题材选择和个人想法输入
- DeepSeek 创意方案、故事大纲、章节正文和润色改写
- 无密钥时自动使用模拟生成
- 独立原创写作页面及按需写作伴侣
- 个人书架
- 沉浸式阅读页
- 澄心、夜航星、象牙塔三套主题
- 主题、创作简报和阅读进度本地保存
- DeepSeek 与通义万相 Provider 类型接口

## 本地运行

环境要求：Node.js `>=22.13.0`，支持 Windows PowerShell、macOS 和 Linux。

```bash
npm ci
npm run dev
```

生产构建：

```bash
npm run build
```

## 环境变量

复制 `.env.example` 为 `.env.local`，再填写自己的 API Key：

```bash
cp .env.example .env.local
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env.local
```

请勿提交 `.env.local`，也不要把长期有效的 API Key 放入前端代码。

DeepSeek 配置示例：

```env
DEEPSEEK_API_KEY=你的密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_PRO_MODEL=deepseek-v4-pro
```

## 页面

- `/`：首页
- `/studio`：AI 共创工作台
- `/write`：原创写作与按需写作伴侣
- `/library`：个人书架
- `/read`：在线阅读

## 下一阶段

1. 完成文风分析和长期小说记忆。
2. 接入通义万相 `wanx2.0-t2i-turbo`。
3. 引入正式数据持久化和作品导出。

产品方案参见 `docs/MVP_DESIGN.md`，项目进度参见 `docs/PROJECT_CONTEXT.md`。
