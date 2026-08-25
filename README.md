# Eidolon

Eidolon 是一个集 AI 小说创作、作品管理和沉浸式阅读于一体的个人写作网站。

当前为第一阶段交互原型：所有生成内容均为模拟数据，不会调用或消耗 DeepSeek、通义万相 API。

## 当前功能

- 文学化首页与每日灵感
- 题材选择和个人想法输入
- 三个模拟创意方案
- 模拟故事大纲
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

## 页面

- `/`：首页
- `/studio`：创作工作台
- `/library`：个人书架
- `/read`：在线阅读

## 下一阶段

1. 接入 DeepSeek 服务端 API。
2. 完成文风分析、大纲和正文生成。
3. 接入通义万相 `wanx2.0-t2i-turbo`。
4. 引入正式数据持久化和作品导出。

产品方案参见 `docs/MVP_DESIGN.md`，项目进度参见 `docs/PROJECT_CONTEXT.md`。
