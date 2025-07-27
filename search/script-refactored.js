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

      // 获取当前会话ID，如果没有则传递null让API创建新会话
      let sessionId = this.sessionManager.getCurrentSessionId();

      // 显示加载状态
      this.uiManager.showLoading();
      this.uiManager.toggleSendButton(true);
      this.errorHandler.hideError();

      // 使用API进行内容分析，传递现有的会话ID（如果有）
      const result = await this.apiManager.analyzeContent(textInput, imageData, sessionId);

      // 如果API返回了新的会话ID，使用它；否则创建本地会话
      if (result.sessionId) {
        // 使用API返回的会话ID
        if (!sessionId || sessionId !== result.sessionId) {
          // 创建或更新会话
          const session = this.sessionManager.createSession();
          this.sessionManager.setCurrentSessionId(result.sessionId);
          sessionId = result.sessionId;
        }
      } else if (!sessionId) {
        // 如果API没有返回会话ID，创建本地会话
        const session = this.sessionManager.createSession();
        sessionId = session.id;
      }

      // 添加用户消息到会话
      this.sessionManager.addMessage(sessionId, 'user', textInput, imageData, 'analysis');

      // 添加助手回复到会话
      this.sessionManager.addMessage(sessionId, 'assistant', result.content, null, 'analysis');

      // 显示结果
      this.contentRenderer.showContent(result.content, 'analysis');

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
