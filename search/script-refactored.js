class SearchApp {
  constructor() {
    this.initializeComponents();
    this.initializeSessionComponents();
    this.bindEvents();
    this.init();
  }

  initializeComponents() {
    // 初始化所有组件
    this.languageManager = new LanguageManager(this);
    this.errorHandler = new ErrorHandler(this);
    this.imageUploadManager = new ImageUploadManager(this);
    this.slideRenderer = new SlideRenderer(this);
    this.apiManager = new APIManager(this);
    this.uiManager = new UIManager(this);
  }

  initializeSessionComponents() {
    // 初始化会话管理相关组件
    this.sessionManager = new SessionManager(this);
    this.sidebarManager = new SidebarManager(this);
    this.contentRenderer = new ContentRenderer(this);
    this.dataExportManager = null; // 将在阶段三实现
  }

  bindEvents() {
    // 发送按钮事件
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('input');

    sendBtn.addEventListener('click', () => {
      this.handleSubmit();
    });

    // 回车键提交
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.handleSubmit();
      }
    });

    // 示例点击事件（由LanguageManager处理）
    // 错误消息点击隐藏
    document.getElementById('error').addEventListener('click', () => {
      this.errorHandler.hideError();
    });
  }

  async handleSubmit() {
    // 检查是否正在生成
    if (this.uiManager.isGenerating) {
      return;
    }

    // 验证输入
    if (!this.uiManager.validateInput()) {
      this.errorHandler.handleInputError();
      return;
    }

    try {
      // 获取输入数据
      const textInput = this.uiManager.getInputValue();
      const imageData = this.imageUploadManager.getUploadedImage();
      console.log('[handleSubmit] 输入内容:', textInput);
      console.log('[handleSubmit] 图片数据:', imageData);

      // 显示加载状态
      this.uiManager.showLoading();
      this.uiManager.toggleSendButton(true);
      this.errorHandler.hideError();

      // 优先检查当前会话ID，保证连续对话
      let sessionKey = this.sessionManager.getCurrentSessionId();
      let currentSession = this.sessionManager.sessions[sessionKey];
      if (!currentSession) {
        currentSession = this.sessionManager.createSession();
        sessionKey = this.sessionManager.getCurrentSessionId();
        console.log('[handleSubmit] 新建会话:', sessionKey);
        
        // 触发侧边栏更新（因为createSession不再自动更新）
        if (this.sidebarManager) {
          this.sidebarManager.updateSessionList();
        }
      } else {
        console.log('[handleSubmit] 使用现有会话:', sessionKey);
      }

      // 只有后端返回的session_id才用于API请求
      let apiSessionId = currentSession.id;

      // 立即添加用户消息到会话历史
      this.sessionManager.addMessage(sessionKey, 'user', textInput, imageData, 'analysis');

      // 检查是否勾选了"生成图片解释"
      const shouldGenerateImages = this.uiManager.shouldGenerateImages();
      console.log('[handleSubmit] shouldGenerateImages:', shouldGenerateImages);
      let result;

      if (shouldGenerateImages) {
        // 勾选了图片解释，使用generate-picture端点（生成文本+图片）
        console.log('[handleSubmit] 调用 generateImageStory');
        result = await this.apiManager.generateImageStory(textInput, imageData, true, apiSessionId);
      } else {
        // 未勾选图片解释，使用generate-text端点（仅生成文本）
        console.log('[handleSubmit] 调用 analyzeContent');
        result = await this.apiManager.analyzeContent(textInput, imageData, apiSessionId);
      }

      // 如果API返回了新的会话ID，更新本地会话ID（首次API返回后）
      let renderSessionKey = sessionKey;
      if (result.sessionId && result.sessionId !== apiSessionId) {
        this.sessionManager.updateSessionId(sessionKey, result.sessionId);
        this.sessionManager.setCurrentSessionId(result.sessionId);
        apiSessionId = result.sessionId;
        renderSessionKey = result.sessionId;
        console.log('[handleSubmit] 会话ID已同步为后端:', apiSessionId);
      }

      // 添加助手回复到会话（用最新的会话ID），content 字段为对象，兼容图片和文本
      let assistantContent = result.content;
      let assistantImageUrl = result.imageUrl;
      // 兼容 story_markdown/image_url 结构
      if (result.story_markdown && result.image_url) {
        assistantContent = {
          content: result.story_markdown,
          imageUrl: result.image_url
        };
        assistantImageUrl = undefined;
      } else if (typeof result.content === 'string' && result.imageUrl) {
        assistantContent = {
          content: result.content,
          imageUrl: result.imageUrl
        };
        assistantImageUrl = undefined;
      }
      this.sessionManager.addMessage(renderSessionKey, 'assistant', assistantContent, assistantImageUrl, 'story');

      // 自动刷新会话历史，显示所有消息（包括助手回复）
      const session = this.sessionManager.sessions[renderSessionKey];
      if (session) {
        this.contentRenderer.showSessionHistory(session);
      } else {
        // 兜底显示结果
        this.contentRenderer.showContent(result, 'analysis');
      }

      // 清理输入（可选）
      // this.uiManager.clearInput();
      // this.imageUploadManager.removeImage();

    } catch (error) {
      this.errorHandler.handleAPIError(error);
      console.error('Analysis failed:', error);
    } finally {
      // 恢复UI状态
      this.uiManager.toggleSendButton(false);
      this.uiManager.hideLoading();
    }
  }

  // 支持图文解释模式（备用功能）
  async generateImageStory(prompt, animalType, numImages) {
    try {
      this.uiManager.showLoading();
      this.uiManager.toggleSendButton(true);

      const slides = await this.apiManager.generateImageStory(
        prompt, 
        animalType, 
        numImages, 
        this.languageManager.getCurrentLanguage()
      );

      this.slideRenderer.renderSlides(slides);

    } catch (error) {
      this.errorHandler.handleAPIError(error);
    } finally {
      this.uiManager.toggleSendButton(false);
      this.uiManager.hideLoading();
    }
  }

  init() {
    // 初始化语言管理器
    this.languageManager.init();
    
    // 初始化内容渲染器
    this.contentRenderer.init();
    
    // 显示欢迎消息
    this.uiManager.showWelcomeMessage();
    
    // 聚焦输入框
    this.uiManager.focusInput();

    console.log('Search App initialized successfully');
  }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.searchApp = new SearchApp();
});
