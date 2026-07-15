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
    this.dataExportManager = new DataExportManager(this);
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
    if (this.uiManager.isGenerating) return;
    if (!this.uiManager.validateInput()) {
      this.errorHandler.handleInputError();
      return;
    }

    this.uiManager.toggleSendButton(true);
    const textInput = this.uiManager.getInputValue();
    const imageData = this.imageUploadManager.getUploadedImage();
    let sessionKey = this.sessionManager.getCurrentSessionId();

    if (!sessionKey || !this.sessionManager.getSession(sessionKey)) {
      const newSession = this.sessionManager.createSession();
      sessionKey = this.sessionManager.getCurrentSessionId();
      this.sidebarManager.updateSessionList();
    }

    // 会话历史里只保存小尺寸缩略图，完整 base64 原图仅用于本次 API 请求，
    // 避免超出 localStorage 配额（原图最大 4MB）
    const persistedImageData = imageData && imageData.preview
      ? { preview: imageData.preview }
      : null;
    const userMessage = this.sessionManager.addMessage(sessionKey, 'user', textInput, persistedImageData);
    
    // 隐藏欢迎消息（如果存在）
    this.uiManager.hideWelcomeMessage();
    
    this.contentRenderer.appendMessage(userMessage);
    this.contentRenderer.showAssistantLoadingPlaceholder();
    this.uiManager.clearInput();
    this.imageUploadManager.removeImage();

    try {
      const shouldGenerateImages = this.uiManager.shouldGenerateImages();
      const apiSessionId = this.sessionManager.getSession(sessionKey).id;
      let result;

      if (shouldGenerateImages) {
        result = await this.apiManager.generateImageStory(textInput, imageData, true, apiSessionId);
      } else {
        result = await this.apiManager.analyzeContent(textInput, imageData, apiSessionId);
      }

      if (result.sessionId && result.sessionId !== apiSessionId) {
        this.sessionManager.updateSessionId(sessionKey, result.sessionId);
        sessionKey = result.sessionId;
      }

      // 图文模式时把 content 与 imageUrl 打包成对象，保证渲染层拿到统一结构
      let assistantContent = result.content;
      if (typeof result.content === 'string' && result.imageUrl) {
        assistantContent = {
          content: result.content,
          imageUrl: result.imageUrl
        };
      }
      const assistantMessage = this.sessionManager.addMessage(
        sessionKey,
        'assistant',
        assistantContent,
        null,
        shouldGenerateImages ? 'story' : 'analysis'
      );
      this.contentRenderer.removeAssistantLoadingPlaceholder();
      this.contentRenderer.appendMessage(assistantMessage);

    } catch (error) {
      this.errorHandler.handleAPIError(error);
      this.contentRenderer.removeAssistantLoadingPlaceholder();
    } finally {
      this.uiManager.toggleSendButton(false);
      this.sidebarManager.updateSessionList(); // Update sidebar to reflect new message
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

    // 确保发送按钮初始状态正确
    this.uiManager.toggleSendButton(false);

    // 强制检查移动端设置
    setTimeout(() => {
      this.checkMobileSetup();
    }, 500);

    debugLog('Search App initialized successfully');
  }

  checkMobileSetup() {
    const isMobile = window.innerWidth <= 768;
    debugLog('[SearchApp] 移动端检查:', {
      screenWidth: window.innerWidth,
      isMobile: isMobile
    });

    if (isMobile) {
      const mobileToggle = document.querySelector('.mobile-sidebar-toggle');
      const sidebar = document.getElementById('sidebar');
      
      debugLog('[SearchApp] 移动端元素检查:', {
        mobileToggle: mobileToggle ? '已找到' : '未找到',
        sidebar: sidebar ? '已找到' : '未找到'
      });

      if (!mobileToggle && this.sidebarManager) {
        debugLog('[SearchApp] 强制重新设置移动端侧边栏');
        this.sidebarManager.setupMobileSidebar();
      }
    }
  }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.searchApp = new SearchApp();
});
