# 小动物解释工具 🐾

> *用可爱的小动物比喻来解释任何事物*

一个多语言网页应用，通过引人入胜的故事和插图，使用可爱的小动物来解释复杂的概念和主题。

## ✨ 功能特色

- 🌍 **多语言支持**: 中文、英文、日文、韩文
- 🎨 **手写字体**: 每种语言都有独特的手写字体
  - 英文: Indie Flower, Caveat (休闲手写体)
  - 中文: 马善政体, 龙藏体 (中式书法)
  - 日文: 禅暮霭体, 小杉丸体 (日式手写)
  - 韩文: 나눔펜스크립트, 개구체 (韩式手写)
- 🐱 **多种动物**: 猫咪、兔子、狗狗、小鸟、熊猫、狐狸
- 🖼️ **自定义图片数量**: 每个故事生成1-10张插图
- 📸 **智能图片处理**: 
  - 支持PNG/JPEG格式
  - 自动格式验证
  - 4MB大小限制
  - 实时错误反馈
  - Gemini API兼容格式
- 📱 **响应式设计**: 移动端和桌面端优化
- 💾 **智能记忆**: 自动保存用户语言偏好
- 🎨 **优质体验**: 上传进度、动画效果、错误处理
- 🔧 **双重架构**: 
  - 主工具用于动物故事生成
  - 搜索工具用于通用内容分析

## 🗂️ 项目结构

```
cat/
├── 📁 主应用 (动物故事生成器)
│   ├── index.html                           # 主HTML文件
│   ├── style.css                            # 主样式表
│   ├── script.js                            # 核心JavaScript逻辑
│   ├── translations.js                      # 多语言翻译
│   └── components/                          # 模块化组件
│       ├── APIManager.js                    # API通信
│       ├── ImageUploadManager.js            # 图片处理
│       ├── LanguageManager.js               # 语言切换
│       └── UIManager.js                     # UI状态管理
├── 📁 search/ (内容分析工具)
│   ├── index.html                           # 分析工具界面
│   ├── style.css                            # 分析工具样式
│   ├── script-refactored.js                # 分析逻辑
│   ├── translations.js                     # 分析工具翻译
│   └── components/                          # 分析组件
│       ├── APIManager.js                    # 分析API调用
│       ├── ErrorHandler.js                 # 错误管理
│       ├── SlideRenderer.js                # 内容渲染
│       └── ... (其他组件)
├── 📄 文档
│   ├── README.md                            # 英文文档
│   ├── README_ZH.md                         # 中文文档
│   ├── PROJECT_DOCUMENTATION.md             # 技术文档
│   ├── DEPLOYMENT.md                        # 部署指南
│   └── search/
│       ├── API_DOCUMENTATION.md             # API参考
│       ├── ARCHITECTURE.md                  # 架构指南
│       └── PROJECT_COMPARISON.md            # 工具对比
└── 🧪 测试与开发
    ├── layout-preview.html                  # 布局测试
    ├── modern-design-preview.html           # 设计预览
    └── TESTING_SUMMARY.md                   # 测试结果
```

## 🚀 快速开始

### 主应用 (动物故事)
1. **选择语言**: 点击右上角的语言按钮
2. **配置设置**: 
   - 选择图片数量 (1-10张)
   - 选择动物类型 (猫、兔子、狗等)
3. **输入内容**: 
   - 在文本框中输入您的主题
   - 或上传图片进行分析
   - 或点击示例问题
4. **获取结果**: 按回车键或点击提交生成您的故事

### 搜索工具 (内容分析)
1. **导航**: 打开 `search/index.html`
2. **选择语言**: 选择您偏好的界面语言
3. **分析选项**:
   - 开启/关闭图片生成
   - 输入文本或上传图片
4. **分析**: 获得专业的内容分析结果

## 🛠️ 技术特性

### 前端架构
- **模块化设计**: 分离的CSS、JS和翻译文件
- **面向对象**: ES6类用于代码组织
- **本地存储**: 记住用户偏好
- **响应式布局**: 适应所有屏幕尺寸
- **多语言API**: 前后端语言同步

### API集成
请求格式 (Gemini API兼容，支持多语言):
```json
{
  "prompt": "什么是机器学习？",
  "num_images": 2,
  "animal": "cat",
  "language": "zh",
  "image": {
    "mime_type": "image/png",
    "data": "base64_encoded_image_data"
  }
}
```

**语言代码:**
- `zh`: 中文回复
- `en`: 英文回复  
- `ja`: 日文回复
- `ko`: 韩文回复

### 图片处理功能
- **格式支持**: PNG、JPEG格式
- **大小限制**: 最大4MB
- **自动转换**: 标准化MIME类型
- **错误处理**: 实时验证与多语言错误消息
- **进度反馈**: 上传处理动画
- **预览功能**: 即时图片预览和删除

### 语言支持
- **中文 (zh)**: 简体中文界面
- **英文 (en)**: English interface  
- **日文 (ja)**: 日本語インターフェース
- **韩文 (ko)**: 한국어 인터페이스

## 🔧 开发指南

### 添加新语言
1. 在 `translations.js` 中添加新语言对象
2. 在 `index.html` 中添加语言切换按钮
3. 在 `style.css` 中调整语言按钮样式 (如需要)
4. 为新语言更新字体族

### 添加新动物
1. 在 `translations.js` 中为每种语言添加动物名称
2. 确保后端API支持新的动物类型
3. 更新动物选择UI组件

### 自定义样式
- 修改 `style.css` 中的颜色变量
- 调整响应式断点
- 修改字体和布局
- 自定义手写字体组合

### 组件开发
```javascript
// 示例: 创建新组件
class NewComponent {
  constructor(app) {
    this.app = app;
  }
  
  init() {
    // 初始化组件
  }
  
  // 组件方法...
}
```

## 🌐 部署

### 要求
- 静态网页托管 (GitHub Pages, Netlify, Vercel)
- 支持ES6的现代浏览器
- 互联网连接用于Google字体和API

### 快速部署
1. 克隆仓库
2. 上传文件到您的托管服务
3. 配置API密钥的环境变量
4. 通过您的域名访问

### 环境设置
```bash
# 克隆仓库
git clone [repository-url]

# 导航到项目
cd cat

# 本地服务 (使用任何静态服务器)
python -m http.server 8000
# 或
npx serve .
```

## 📊 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 贡献

1. Fork 仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 开发标准
- 使用ES6+功能
- 遵循模块化组件架构
- 维护多语言支持
- 跨浏览器测试
- 记录新功能

## 📝 API文档

详细的API文档请参见:
- [主API文档](PROJECT_DOCUMENTATION.md)
- [搜索工具API](search/API_DOCUMENTATION.md)
- [架构指南](search/ARCHITECTURE.md)

## 🐛 故障排除

### 常见问题
- **图片上传失败**: 检查文件格式 (PNG/JPEG) 和大小 (<4MB)
- **语言不切换**: 清除浏览器缓存和localStorage
- **字体不加载**: 检查网络连接和Google字体可用性
- **API错误**: 验证API密钥和网络连接

更多故障排除，请参见 [TESTING_SUMMARY.md](TESTING_SUMMARY.md)

## 📄 许可证

MIT License - 详情请参见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- Google字体提供多语言排版
- Gemini API提供AI内容生成
- 社区贡献者和测试者

---

**用 🐾 和大量小动物制作**
