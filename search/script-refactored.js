class SearchApp {
  constructor() {
    this.initializeComponents();
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
      const generateImages = document.getElementById('generate-images').checked;

      // 显示加载状态
      this.uiManager.showLoading();
      this.uiManager.toggleSendButton(true);
      this.errorHandler.hideError();

      if (generateImages) {
        // 如果勾选了生成图片，使用图文解释模式
        const slides = await this.apiManager.generateImageStory(
          textInput, 
          'cat', // 默认使用猫咪
          3, // 默认3张图片
          this.languageManager.getCurrentLanguage()
        );
        
        // 使用幻灯片渲染
        this.slideRenderer.renderSlides(slides);
      } else {
        // 否则使用纯文本分析
        const result = await this.apiManager.analyzeContent(textInput, imageData);
        
        // 显示文本结果
        this.uiManager.showOutput(result, true);
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
