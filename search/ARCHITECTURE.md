# 项目技术架构文档

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                     用户界面层 (UI Layer)                      │
├─────────────────────────────────────────────────────────────┤
│  index.html  │  style.css  │  多语言字体系统  │  响应式布局     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   应用控制层 (App Layer)                       │
├─────────────────────────────────────────────────────────────┤
│                   SearchApp (主应用类)                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ • 组件初始化管理  • 事件协调  • 业务流程控制            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    组件服务层 (Component Layer)                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ APIManager   │ │ UIManager    │ │ LanguageManager │     │
│  │ • API调用    │ │ • UI状态管理  │ │ • 多语言切换   │       │
│  │ • 错误重试   │ │ • 内容渲染   │ │ • 本地化文本   │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ImageUploadMgr│ │ ErrorHandler │ │ SlideRenderer│       │
│  │ • 文件处理   │ │ • 统一错误处理 │ │ • 幻灯片渲染  │       │
│  │ • 拖拽上传   │ │ • 用户提示    │ │ • 动画效果    │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     数据访问层 (Data Layer)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Google AI API│ │ LocalStorage │ │ File System  │       │
│  │ • Gemini模型 │ │ • 用户偏好    │ │ • 图片文件    │       │
│  │ • 内容分析   │ │ • 语言设置    │ │ • 文件验证    │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 组件交互关系图

```
SearchApp (主控制器)
    │
    ├── LanguageManager ──────┐
    │   │                     │
    │   ├── 语言切换事件        │
    │   ├── UI文本更新         │
    │   └── 翻译获取           │
    │                         │
    ├── UIManager ←───────────┘
    │   │
    │   ├── 输入验证
    │   ├── 内容渲染
    │   ├── 加载状态
    │   └── Markdown处理
    │
    ├── ImageUploadManager
    │   │
    │   ├── 文件选择
    │   ├── 拖拽处理
    │   ├── 预览生成
    │   └── Base64转换
    │
    ├── APIManager
    │   │
    │   ├── API初始化
    │   ├── 请求构建
    │   ├── 响应处理
    │   └── 错误处理
    │
    ├── ErrorHandler ←─────┐
    │   │                 │
    │   ├── 错误展示       │
    │   ├── 消息本地化     │
    │   └── 自动隐藏       │
    │                     │
    └── SlideRenderer ────┘
        │
        ├── 幻灯片创建
        ├── 布局管理
        └── 动画效果
```

## 数据流向图

```
用户输入
    │
    ▼
┌─────────────────┐
│   UI输入验证     │ ◄─── LanguageManager (多语言验证)
└─────────────────┘
    │ ✓
    ▼
┌─────────────────┐
│  数据预处理      │ ◄─── ImageUploadManager (图片处理)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   API请求构建    │ ◄─── APIManager (请求封装)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Google AI API  │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   响应处理       │ ◄─── ErrorHandler (错误处理)
└─────────────────┘
    │ ✓
    ▼
┌─────────────────┐
│   结果渲染       │ ◄─── UIManager (内容展示)
└─────────────────┘     SlideRenderer (幻灯片模式)
    │
    ▼
用户界面更新
```

## 核心设计模式

### 1. 组合模式 (Composite Pattern)
```javascript
class SearchApp {
  constructor() {
    // 组合所有子组件
    this.components = {
      languageManager: new LanguageManager(this),
      errorHandler: new ErrorHandler(this),
      imageUploadManager: new ImageUploadManager(this),
      // ... 其他组件
    };
  }
}
```

### 2. 观察者模式 (Observer Pattern)
```javascript
// 语言切换时通知所有组件更新
class LanguageManager {
  switchLanguage(lang) {
    this.currentLanguage = lang;
    this.updateUI(); // 通知UI更新
    this.app.uiManager.updateLanguage(); // 通知其他组件
  }
}
```

### 3. 策略模式 (Strategy Pattern)
```javascript
// 根据不同语言采用不同的字体和布局策略
updateFontFamily(lang) {
  const fontStrategies = {
    'zh': 'var(--font-handwriting-zh)',
    'en': 'var(--font-handwriting-en)',
    'ja': 'var(--font-handwriting-ja)',
    'ko': 'var(--font-handwriting-ko)'
  };
  return fontStrategies[lang] || fontStrategies['en'];
}
```

### 4. 工厂模式 (Factory Pattern)
```javascript
// 根据内容类型创建不同的分析请求
buildAnalysisRequest(textInput, imageData, language) {
  if (imageData) {
    return this.createMultimodalRequest(textInput, imageData, language);
  } else {
    return this.createTextRequest(textInput, language);
  }
}
```

## 关键技术实现

### 1. 模块化加载
```javascript
// 使用ES6 Import Maps实现动态加载
<script type="importmap">
{
  "imports": {
    "@google/genai": "https://esm.sh/@google/genai@^0.14.0",
    "marked": "https://esm.sh/marked@^15.0.7"
  }
}
</script>
```

### 2. 异步错误处理
```javascript
async handleSubmit() {
  try {
    const result = await this.apiManager.analyzeContent(textInput, imageData);
    this.uiManager.showOutput(result, true);
  } catch (error) {
    this.errorHandler.handleAPIError(error);
  } finally {
    this.uiManager.toggleSendButton(false);
  }
}
```

### 3. 多语言字体适配
```css
/* 动态字体切换 */
.container[data-lang="zh"] .content {
  font-family: var(--font-handwriting-zh);
}
.container[data-lang="en"] .content {
  font-family: var(--font-handwriting-en);
}
```

### 4. 响应式设计
```css
/* 移动端适配 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    padding: 10px;
  }
}
```

## 性能优化策略

### 1. 懒加载
- 组件按需初始化
- API模块动态导入
- 图片预览延迟生成

### 2. 内存管理
- 及时清理事件监听器
- 图片数据缓存控制
- DOM元素复用

### 3. 网络优化
- API请求去重
- 错误重试机制
- 请求超时控制

### 4. 用户体验优化
- 加载状态反馈
- 操作防抖处理
- 渐进式功能增强

## 扩展性设计

### 1. 插件化架构
```javascript
// 支持新组件的动态注册
registerComponent(name, componentClass) {
  this.components[name] = new componentClass(this);
}
```

### 2. 配置化管理
```javascript
// 集中式配置管理
const CONFIG = {
  API: {
    MODEL: 'gemini-1.5-flash',
    MAX_RETRIES: 3,
    TIMEOUT: 30000
  },
  UI: {
    ANIMATION_DURATION: 300,
    AUTO_HIDE_ERROR: 5000
  }
};
```

### 3. 主题系统
```css
/* 支持主题切换 */
:root {
  --primary-color: #007bff;
  --background-color: #ffffff;
  --text-color: #343a40;
}

[data-theme="dark"] {
  --primary-color: #4dabf7;
  --background-color: #1a1a1a;
  --text-color: #ffffff;
}
```

## 测试策略

### 1. 单元测试
- 各组件功能测试
- API请求模拟测试
- 错误处理测试

### 2. 集成测试
- 组件间交互测试
- 端到端用户流程测试
- 多语言切换测试

### 3. 性能测试
- 加载时间测试
- 内存使用测试
- 并发请求测试

### 4. 兼容性测试
- 浏览器兼容性
- 移动端适配
- 无障碍访问测试

## 安全架构

### 1. 输入安全
- 文件类型白名单
- 文件大小限制
- 输入内容过滤

### 2. API安全
- 密钥保护机制
- 请求频率限制
- 响应内容验证

### 3. 客户端安全
- XSS防护
- CSP策略配置
- 敏感信息保护

---

此架构文档展示了项目的整体技术架构、设计模式应用、关键技术实现以及未来的扩展规划。
