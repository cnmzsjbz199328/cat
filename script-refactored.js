// 重构后的应用程序主类
class AnimalStoryApp {
  constructor() {
    this.initializeElements();
    this.initializeComponents();
    this.setupEventListeners();
    this.updateUI();
  }

  // 初始化DOM元素引用
  initializeElements() {
    this.elements = {
      slideshow: document.getElementById('slideshow'),
      output: document.getElementById('output'),
      errorDiv: document.getElementById('error'),
      input: document.getElementById('input'),
      examples: document.getElementById('examples'),
      fileUpload: document.getElementById('file-upload'),
      imagePreview: document.getElementById('image-preview'),
      previewImg: document.getElementById('preview-img'),
      removeImageBtn: document.getElementById('remove-image'),
      numImagesSelect: document.getElementById('num-images'),
      animalTypeSelect: document.getElementById('animal-type'),
      title: document.querySelector('h1'),
      uploadLabel: document.querySelector('.upload-label span'),
      numImagesLabel: document.querySelector('label[for="num-images"]'),
      animalTypeLabel: document.querySelector('label[for="animal-type"]'),
      languageBtns: document.querySelectorAll('.language-btn'),
      sendBtn: document.getElementById('send-btn'),
      sendText: document.querySelector('.send-text'),
      sendIcon: document.querySelector('.send-icon'),
      loadingIcon: document.querySelector('.loading-icon')
    };
  }

  // 初始化组件
  initializeComponents() {
    this.languageManager = new LanguageManager(this);
    this.errorHandler = new ErrorHandler(this);
    this.imageUploadManager = new ImageUploadManager(this);
    this.slideRenderer = new SlideRenderer(this);
    this.apiManager = new APIManager(this);
    this.uiManager = new UIManager(this);
  }

  // 设置事件监听器
  setupEventListeners() {
    // 语言切换
    this.languageManager.setupLanguageButtons();
    
    // 示例点击
    this.uiManager.setupExampleClickListener();
    
    // 图片上传
    this.imageUploadManager.setupImageUploadListeners();
    
    // 发送按钮和输入框事件
    this.uiManager.setupSendEvents();
  }

  // 更新UI
  updateUI() {
    this.uiManager.updateUI();
  }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new AnimalStoryApp();
});
