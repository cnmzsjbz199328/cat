# 开发者指南 (Developer Guide)

## 🚀 快速开始

### 环境要求
- 现代浏览器支持ES6+模块
- HTTP/HTTPS服务器环境
- Google AI API密钥

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd search
```

2. **配置API密钥**
编辑 `components/APIManager.js` 文件：
```javascript
getAPIKey() {
  // 替换为您的Google AI API密钥
  return 'YOUR_GOOGLE_AI_API_KEY';
}
```

3. **启动开发服务器**
```bash
# 使用Python
python -m http.server 8000

# 或使用Node.js
npx http-server

# 或使用VS Code Live Server扩展
```

4. **访问应用**
打开浏览器访问 `http://localhost:8000`

## 📁 项目结构详解

```
search/
├── index.html                 # 主页面 - 应用入口
├── script-refactored.js      # 主应用逻辑 - SearchApp类
├── style.css                 # 全局样式 - 响应式设计
├── translations.js           # 多语言配置 - 翻译文本
└── components/               # 组件目录
    ├── APIManager.js         # API管理 - Google AI接口
    ├── ErrorHandler.js       # 错误处理 - 统一错误管理
    ├── ImageUploadManager.js # 图片上传 - 文件处理
    ├── LanguageManager.js    # 语言管理 - 多语言切换
    ├── SlideRenderer.js      # 幻灯片渲染 - 展示组件
    └── UIManager.js          # UI管理 - 界面状态控制
```

## 🔧 核心组件开发

### 1. SearchApp 主应用类

**文件**: `script-refactored.js`

```javascript
class SearchApp {
  constructor() {
    this.initializeComponents();  // 初始化所有组件
    this.bindEvents();           // 绑定全局事件
    this.init();                 // 应用初始化
  }

  // 组件初始化 - 依赖注入模式
  initializeComponents() {
    this.languageManager = new LanguageManager(this);
    this.errorHandler = new ErrorHandler(this);
    this.imageUploadManager = new ImageUploadManager(this);
    this.slideRenderer = new SlideRenderer(this);
    this.apiManager = new APIManager(this);
    this.uiManager = new UIManager(this);
  }
}
```

**开发要点**：
- 采用依赖注入模式，所有组件通过构造函数接收app实例
- 统一的事件绑定和生命周期管理
- 异步错误处理和状态恢复

### 2. APIManager API管理组件

**文件**: `components/APIManager.js`

**核心功能**：
```javascript
class APIManager {
  // API初始化
  async initializeAPI() {
    const { GoogleGenerativeAI } = await import('@google/genai');
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  // 内容分析 - 支持文本和图像
  async analyzeContent(prompt, imageData = null) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const enhancedPrompt = this.buildPrompt(prompt, currentLang);
    
    if (imageData) {
      // 图文分析
      return await model.generateContent([enhancedPrompt, imagePart]);
    } else {
      // 纯文本分析
      return await model.generateContent(enhancedPrompt);
    }
  }
}
```

**开发要点**：
- 支持动态API模块加载
- 多模态输入处理（文本+图像）
- 智能提示词构建
- 错误重试和超时机制

### 3. UIManager 界面管理组件

**文件**: `components/UIManager.js`

**核心功能**：
```javascript
class UIManager {
  // Markdown渲染
  processMarkdown(text) {
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // ... 更多Markdown规则
  }

  // 加载状态管理
  showLoading() {
    output.classList.add('loading');
    output.innerHTML = `<div class="loading-message">📊 ${t.generatingMessage}</div>`;
  }
}
```

**开发要点**：
- 自定义Markdown解析器
- 响应式状态管理
- 动画和过渡效果
- 可访问性支持

### 4. LanguageManager 语言管理组件

**文件**: `components/LanguageManager.js`

**核心功能**：
```javascript
class LanguageManager {
  switchLanguage(lang) {
    this.currentLanguage = lang;
    this.saveLanguagePreference(lang);     // 持久化保存
    this.updateActiveButton(lang);         // UI更新
    this.updateUI();                       // 全局UI更新
  }

  updateFontFamily(lang) {
    const fontStrategies = {
      'zh': 'var(--font-handwriting-zh)',
      'en': 'var(--font-handwriting-en)',
      'ja': 'var(--font-handwriting-ja)',
      'ko': 'var(--font-handwriting-ko)'
    };
    return fontStrategies[lang] || fontStrategies['en'];
  }
}
```

**开发要点**：
- 多语言字体策略
- LocalStorage偏好保存
- 实时UI更新
- 翻译文本管理

### 5. ImageUploadManager 图片管理组件

**文件**: `components/ImageUploadManager.js`

**核心功能**：
```javascript
class ImageUploadManager {
  // 文件验证
  validateFile(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 4 * 1024 * 1024; // 4MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('invalidFileType');
    }
    if (file.size > maxSize) {
      throw new Error('fileTooLarge');
    }
  }

  // Base64转换
  async convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
```

**开发要点**：
- 文件类型和大小验证
- 拖拽上传支持
- 图片预览生成
- Base64编码处理

## 🎨 样式系统开发

### CSS变量系统

```css
:root {
  /* 多语言字体 */
  --font-handwriting-en: 'Caveat', 'Kalam', 'Indie Flower', cursive;
  --font-handwriting-zh: 'Long Cang', 'ZCOOL XiaoWei', cursive;
  --font-handwriting-ja: 'Zen Kurenaido', 'Kosugi Maru', cursive;
  --font-handwriting-ko: 'Nanum Pen Script', 'Gaegu', cursive;
  
  /* 主题色彩 */
  --primary-color: #007bff;
  --background-color: #ffffff;
  --text-color: #343a40;
  --border-color: #dee2e6;
  
  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### 响应式设计

```css
/* 移动端优先 */
.container {
  max-width: 1000px;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 平板端适配 */
@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}

/* 桌面端优化 */
@media (min-width: 1024px) {
  .input-area {
    min-width: 400px;
  }
}
```

### 动画系统

```css
/* 加载动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-icon {
  animation: spin 1s linear infinite;
}

/* 过渡效果 */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 🌐 多语言开发

### 翻译文件结构

**文件**: `translations.js`

```javascript
const translations = {
  zh: {
    title: "智能内容分析工具",
    examples: [
      "分析这段文字的主要观点",
      "总结这篇文章的核心内容"
    ],
    inputPlaceholder: "输入您想要分析或解释的内容...",
    errorMessages: {
      invalidFileType: "仅支持 PNG 或 JPEG 图片格式",
      fileTooLarge: "图片过大，最大支持 4MB"
    }
  },
  en: { /* 英文翻译 */ },
  ja: { /* 日文翻译 */ },
  ko: { /* 韩文翻译 */ }
};
```

### 添加新语言支持

1. **更新翻译文件**
```javascript
// 在translations.js中添加新语言
const translations = {
  // 现有语言...
  fr: {
    title: "Outil d'Analyse de Contenu Intelligent",
    examples: ["Analyser les points principaux de ce texte"],
    // ... 其他翻译
  }
};
```

2. **添加字体支持**
```css
/* 在style.css中添加字体变量 */
:root {
  --font-handwriting-fr: 'French-Font', cursive;
}

.container[data-lang="fr"] .examples li {
  font-family: var(--font-handwriting-fr);
}
```

3. **更新HTML结构**
```html
<!-- 在index.html中添加语言按钮 -->
<button class="language-btn" data-lang="fr">Français</button>
```

## 🔧 API集成开发

### Google AI API配置

```javascript
class APIManager {
  constructor(app) {
    this.app = app;
    this.apiKey = this.getAPIKey();
    this.config = {
      model: "gemini-1.5-flash",
      maxRetries: 3,
      timeout: 30000,
      temperature: 0.7
    };
  }

  // 提示词工程
  buildPrompt(userInput, language) {
    const languageInstructions = {
      'zh': '请用中文回答',
      'en': 'Please respond in English',
      'ja': '日本語で回答してください',
      'ko': '한국어로 답변해 주세요'
    };

    return `
${languageInstructions[language]}

作为一个智能内容分析助手，请对以下内容进行分析：

${userInput}

请提供：
1. 内容主题和核心观点
2. 详细分析和解释
3. 相关背景信息
4. 实际应用建议

请确保回答准确、有用且易于理解。
`;
  }
}
```

### 错误处理策略

```javascript
class ErrorHandler {
  handleAPIError(error) {
    const errorMap = {
      'API_KEY_INVALID': 'API密钥无效',
      'RATE_LIMIT_EXCEEDED': '请求频率过高，请稍后重试',
      'QUOTA_EXCEEDED': 'API配额已用完',
      'NETWORK_ERROR': '网络连接错误',
      'TIMEOUT': '请求超时，请重试'
    };

    const message = errorMap[error.code] || '未知错误，请重试';
    this.showError(message);
  }

  async retryWithBackoff(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }
}
```

## 🧪 测试开发

### 单元测试示例

```javascript
// 测试LanguageManager
describe('LanguageManager', () => {
  let app, languageManager;

  beforeEach(() => {
    app = new SearchApp();
    languageManager = app.languageManager;
  });

  test('should switch language correctly', () => {
    languageManager.switchLanguage('en');
    expect(languageManager.getCurrentLanguage()).toBe('en');
  });

  test('should save language preference', () => {
    languageManager.switchLanguage('ja');
    const saved = localStorage.getItem('preferred-language');
    expect(saved).toBe('ja');
  });
});
```

### 集成测试示例

```javascript
// 测试完整用户流程
describe('User Flow', () => {
  test('should analyze text content', async () => {
    const app = new SearchApp();
    
    // 模拟用户输入
    const input = document.getElementById('input');
    input.value = '测试文本内容';
    
    // 模拟API响应
    jest.spyOn(app.apiManager, 'analyzeContent')
        .mockResolvedValue('分析结果');
    
    // 触发分析
    await app.handleSubmit();
    
    // 验证结果显示
    const output = document.getElementById('output');
    expect(output.innerHTML).toContain('分析结果');
  });
});
```

## 🚀 部署指南

### 静态部署

**GitHub Pages**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

**Netlify**:
```toml
# netlify.toml
[build]
  publish = "."
  
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

### 环境配置

```javascript
// 环境变量管理
class Config {
  static getAPIKey() {
    // 开发环境
    if (window.location.hostname === 'localhost') {
      return process.env.VITE_GOOGLE_AI_API_KEY;
    }
    // 生产环境
    return process.env.GOOGLE_AI_API_KEY;
  }

  static getEnvironment() {
    return window.location.hostname === 'localhost' ? 'development' : 'production';
  }
}
```

## 🔍 调试技巧

### 开发工具使用

```javascript
// 调试模式
class DebugMode {
  static enable() {
    window.DEBUG = true;
    console.log('Debug mode enabled');
  }

  static log(component, action, data) {
    if (window.DEBUG) {
      console.group(`[${component}] ${action}`);
      console.log(data);
      console.groupEnd();
    }
  }
}

// 在组件中使用
class APIManager {
  async analyzeContent(prompt, imageData) {
    DebugMode.log('APIManager', 'analyzeContent', { prompt, imageData });
    // ... 实际逻辑
  }
}
```

### 性能监控

```javascript
// 性能测量
class PerformanceMonitor {
  static measure(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }

  static async measureAsync(name, fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
}
```

## 📋 代码规范

### JavaScript规范

```javascript
// 1. 使用ES6+语法
class ComponentName {
  constructor(app) {
    this.app = app;
  }
}

// 2. 异步函数使用async/await
async handleSubmit() {
  try {
    const result = await this.apiManager.analyzeContent();
    return result;
  } catch (error) {
    this.errorHandler.handleAPIError(error);
  }
}

// 3. 使用解构赋值
const { languageManager, uiManager } = this.app;

// 4. 使用模板字符串
const message = `分析完成，用时 ${duration}ms`;
```

### CSS规范

```css
/* 1. 使用CSS变量 */
.component {
  color: var(--text-color);
  padding: var(--spacing-md);
}

/* 2. 使用BEM命名法 */
.search-app__input {
  /* 样式 */
}

.search-app__input--disabled {
  /* 修饰符样式 */
}

/* 3. 移动端优先 */
.component {
  /* 移动端样式 */
}

@media (min-width: 768px) {
  .component {
    /* 桌面端样式 */
  }
}
```

## 🤝 贡献指南

### Git工作流

```bash
# 1. Fork项目
git clone https://github.com/your-username/project.git

# 2. 创建功能分支
git checkout -b feature/new-feature

# 3. 提交更改
git add .
git commit -m "feat: add new feature"

# 4. 推送分支
git push origin feature/new-feature

# 5. 创建Pull Request
```

### 提交消息规范

```
feat: 新功能
fix: 错误修复
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或工具变动
```

---

此开发者指南提供了项目开发的完整指导，包括环境配置、组件开发、测试、部署等各个方面。
