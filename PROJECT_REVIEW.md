# 项目全面审查报告

> 审查日期：2026-07-14
> 审查范围：主应用（根目录）与 search 内容分析工具的全部 HTML / JS / CSS / 文档
>
> **修复状态（2026-07-14）**：第一、二、三节中列出的问题已在后续提交中修复
> （XSS 转义、PHP 标签、图片字段统一、localStorage 缩略图化、重复方法删除、
> 死代码清理、配置中心化、debugLog 开关、i18n 补全、文档修正、LICENSE / .gitignore）。
> 第四节的中长期架构建议（ES Modules 共享组件、渲染管线统一等）尚未实施。

## 总体评价

项目整体思路清晰：组件化拆分（LanguageManager / APIManager / UIManager 等）职责明确，多语言与手写字体的设计有特色，用户输入渲染时做了 HTML 转义，会话管理有清理与配额降级重试的意识。作为纯静态前端项目，架构方向是对的。

但目前存在 **1 处安全隐患（XSS）、3 处会实际影响用户的功能性 Bug**，以及较多死代码、重复代码和文档失实问题。以下按严重程度排列。

---

## 一、严重问题（建议立即修复）

### 1.1 XSS 风险：自制 Markdown 渲染器不转义 HTML

`search/components/UIManager.js:80` 的 `processMarkdown()` 用正则做 Markdown → HTML 转换，**全程没有对原始文本做 HTML 转义**，结果直接写入 `innerHTML`（`ContentRenderer.js:43`、`UIManager.js:31` 等多处）。

- API 返回的 `story_markdown` 中若包含 `<img src=x onerror=...>` 或 `<script>`，会被原样执行。内容来自后端转发的大模型输出，属于不可完全信任的数据源。
- `ContentRenderer.js:137` 的 `renderStoryWithImage()` 把 `imageUrl` 直接拼进 HTML 字符串，URL 含引号即可注入属性。

**建议**：改用 `marked` 解析 + `DOMPurify` 过滤后再插入 DOM。讽刺的是 `index.html:12` 的 importmap 已声明了 `marked`，但代码从未使用它。

### 1.2 静态 HTML 中混入 PHP 模板语法，缓存清除完全无效

`search/index.html:107-118`：

```html
<script src="components/SessionManager.js?t=<?=Date.now()?>"></script>
```

这是 PHP 短标签写法，而项目是纯静态部署（GitHub Pages / Netlify）。浏览器会把 `?t=<?=Date.now()?>` 当作字面字符串请求，缓存清除完全不生效，URL 里还带着乱码。若想禁用缓存，应改为构建时注入版本号，或统一用 `?v=20250728` 这种手工版本号（`translations.js` 那行就是这么做的）。

### 1.3 会话历史中的图片永远显示不出来（字段名不一致）

图片上传后保存的结构是 `{ mime_type, data }`（`search/components/ImageUploadManager.js:86-89`），但渲染会话历史时：

- `ContentRenderer.js:82` 读取 `message.imageData.base64`
- `ContentRenderer.js:188,202` 读取 `message.imageData.preview`

这两个字段都不存在，用户消息里的图片要么 `src="undefined"` 要么根本不显示。三处需要统一为同一数据结构。

### 1.4 base64 原图存入 localStorage，很快撑爆配额

`SessionManager.addMessage()`（`SessionManager.js:82`）把整个 `imageData`（最大 4MB 的 base64，编码后约 5.3MB）随消息存进 localStorage 的 `sessions`。localStorage 配额通常只有 5–10MB，**上传一两张图后 `saveSessions()` 就会持续失败**，且 `cleanupOldSessions()` 按"保留 50 个会话"清理，对单个超大会话无效。

**建议**：消息里只存小尺寸缩略图（canvas 压缩）或干脆不持久化原图，只存"曾有图片"标记。

---

## 二、功能性 Bug 与代码质量问题

### 2.1 同一个类里重复定义方法，前一个被静默覆盖

- `search/components/UIManager.js`：`toggleSendButton` 定义了两次（第 7 行、第 110 行），`clearOutput` 定义了两次（第 53 行、第 140 行）。生效的是后者——第一个 `clearOutput` 会显示欢迎语，第二个只清空。`SessionManager.restoreSessionContent()` 调用时实际拿到的是"清空"版本，行为与命名意图可能不符。
- `search/components/ContentRenderer.js`：`escapeHtml` 定义了两次（第 125 行、第 243 行）；`showSessionHistory` 与 `renderSessionHistory` 是两套几乎重复的会话渲染逻辑，只有一套在用。

### 2.2 死代码 / 遗留文件较多

| 文件/代码 | 问题 |
|---|---|
| `script.js`（391 行） | 旧版单体实现，`index.html` 已不引用，但 README 仍将其列为"核心逻辑" |
| `components/DownloadUtils.js` | 未被任何 HTML 引用 |
| `font-backup.css` | 备份文件不应进仓库 |
| `search/style.css` | 0 字节空文件（实际用的是 `search/styles/main.css`） |
| `index.html:12-19` importmap | `@google/genai`、`marked` 均未被使用；`@google/genai` 的存在暗示早期曾打算在前端直连 Gemini，现在应删掉以免误导 |
| `search/script-refactored.js:131` `generateImageStory()` | "备用功能"的调用签名 `(prompt, animalType, numImages, language)` 与 `APIManager.generateImageStory(prompt, imageData, generateImages, sessionId)` 完全不匹配，调用即错 |
| `search/components/ImageUploadManager.js:60` GIF 分支 | `supportedTypes` 里没有 `image/gif`，第 54 行已把 GIF 拒掉，GIF 警告分支永远不可达 |

### 2.3 配置中心化名不副实

`config.js` 与 `CONFIG_MANAGEMENT.md` 声称统一配置，但实际上：

- 4MB 大小限制在 `components/ImageUploadManager.js:6` 和 `search/components/ImageUploadManager.js:66` 各硬编码了一份，没有引用 `APP_CONFIG.APP.MAX_FILE_SIZE`；
- 允许的图片类型同样各写各的（两处清单还不一致：主应用只收 PNG/JPEG，search 额外收 webp/heic/heif）；
- `APP_CONFIG.DEBUG` 定义了但全项目从未读取。

### 2.4 生产环境日志过多，且泄露请求体

search 各组件充斥 `console.log`（SidebarManager 尤甚），`APIManager.js:37,89` 会把**含 base64 图片的完整请求体**打到控制台。建议用 `APP_CONFIG.DEBUG` 做统一开关，默认关闭。

### 2.5 国际化不彻底

界面号称支持中/英/日/韩，但大量文案硬编码为中文，切到其他语言时仍显示中文：

- `search/components/ErrorHandler.js:29-38`（API 错误提示全部中文）
- `search/components/ContentRenderer.js`：'图片加载失败'、'开始新的对话吧！'、'出现错误'、'重试'
- `search/components/UIManager.js`：'处理中...'、'发送消息'
- `index.html:39,45,67,80`：初始标签是中文，依赖 JS 启动后覆盖（JS 加载失败时英文页面显示中文）

另外 `ContentRenderer.formatTime()` 固定用 `'zh-CN'` locale。

### 2.6 其他小问题

- `index.html:2` 固定 `lang="en"`，语言切换时未同步更新 `<html lang>`，影响无障碍与搜索引擎。
- `index.html:60` `accept="image/*"` 与实际只支持 PNG/JPEG 不符，用户选了 webp 才被报错，体验不佳；应写 `accept="image/png,image/jpeg"`。
- `components/ErrorHandler.js:13`：`setTimeout` 句柄未保存，连续两次报错时，第一个定时器会提前隐藏第二条错误；search 版同样问题。
- `components/LanguageManager.js:22`：`translations[this.currentLanguage][key]`，若 localStorage 里存了不受支持的语言值会直接抛 TypeError（search 版有 `|| translations.zh` 兜底，主应用没有）。
- `ContentRenderer.js:303`：错误重试按钮 `onclick="location.reload()"` 整页刷新过于粗暴，会丢失当前输入。
- 主应用回车即发送（`UIManager.js:102`），search 是 Ctrl+Enter 发送（`script-refactored.js:38`），两个工具交互不一致。

---

## 三、文档与工程化

1. **README 大量失实**：引用的 `LICENSE`、`DEPLOYMENT.md`、`TESTING_SUMMARY.md`、`search/API_DOCUMENTATION.md`、`ARCHITECTURE.md`、`PROJECT_COMPARISON.md`、`layout-preview.html` 等文件均不存在；声明 MIT 协议但仓库没有 LICENSE 文件；项目结构图与实际目录不符（缺 `config.js`、`search/styles/`、`SessionManager` 等，多列了已删除的文件）。
2. **无任何工程化设施**：没有 `package.json`、ESLint、格式化配置、测试、CI。像 2.1 的重复方法定义，一条 `no-dupe-class-members` 规则就能拦住。建议最低限度加上 ESLint + 一个简单的 GitHub Actions 检查。
3. **没有 `.gitignore`**（`.vscode/settings.json` 已入库，视团队约定决定去留）。

---

## 四、架构建议（中长期）

1. **消除两套组件的重复**：根目录与 `search/` 各维护一份 APIManager、ImageUploadManager、ErrorHandler、LanguageManager，逻辑大同小异。建议改用 ES Modules（`<script type="module">`），抽出 `shared/` 目录共享，行为差异用参数/子类表达。
2. **统一渲染管线**：所有写 `innerHTML` 的地方收敛到一个经过转义/过滤的渲染函数，杜绝散落的字符串拼接。
3. **会话存储层抽象**：localStorage 读写、配额处理、迁移逻辑集中到一个 storage 模块；图片单独降采样存储。
4. **翻译键全面覆盖 UI 文案**，组件内禁止出现裸中文字符串，可写个简单脚本扫描。

---

## 五、值得肯定的地方

- 组件化拆分自然，主流程（`script-refactored.js`）短小易读；
- 用户输入渲染前做了 `escapeHtml`（`ContentRenderer.js:125`），有安全意识；
- `SessionManager` 有空临时会话清理、存储失败后清旧会话重试的降级逻辑；
- 图片上传的类型/大小校验、base64 提取的防御性写法比较扎实；
- 多语言 + 分语言手写字体的产品设计有想法。

## 修复优先级建议

| 优先级 | 事项 |
|---|---|
| P0 | 1.1 XSS（marked + DOMPurify）；1.2 移除 PHP 标签 |
| P1 | 1.3 图片字段统一；1.4 localStorage 图片瘦身；2.1 删除重复方法 |
| P2 | 2.2 清理死代码；2.3 配置真正中心化；2.4 日志开关；2.5 i18n 补全 |
| P3 | 三、四中的文档修正与工程化建设 |
