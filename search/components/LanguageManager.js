class LanguageManager {
  constructor(app) {
    this.app = app;
    this.currentLanguage = this.loadLanguagePreference();
    this.bindEvents();
  }

  bindEvents() {
    // 语言切换按钮事件
    document.querySelectorAll('.language-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.target.dataset.lang;
        this.switchLanguage(lang);
      });
    });
  }

  switchLanguage(lang) {
    this.currentLanguage = lang;
    this.saveLanguagePreference(lang);
    this.updateActiveButton(lang);
    this.updateUI();
  }

  updateActiveButton(lang) {
    document.querySelectorAll('.language-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  updateUI() {
    const t = this.getTranslations();
    
    // 更新标题
    document.querySelector('h1').textContent = t.title;
    
    // 更新示例
    const examples = document.getElementById('examples');
    examples.innerHTML = '';
    t.examples.forEach(example => {
      const li = document.createElement('li');
      li.textContent = example;
      li.addEventListener('click', () => {
        document.getElementById('input').value = example;
      });
      examples.appendChild(li);
    });
    
    // 更新占位符
    document.getElementById('input').placeholder = t.inputPlaceholder;
    
    // 更新发送按钮文字
    document.querySelector('.send-text').textContent = t.sendButtonText;
    
    // 更新图片生成选项文字
    document.querySelector('.option-text').textContent = t.generateImagesOption;
    
    // 更新欢迎消息（如果没有内容）
    const output = document.getElementById('output');
    if (!output.innerHTML || output.classList.contains('welcome')) {
      output.innerHTML = `<div class="welcome-message">${t.welcomeMessage}</div>`;
      output.classList.add('welcome');
    }
  }

  getTranslations() {
    return translations[this.currentLanguage] || translations.zh;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  loadLanguagePreference() {
    return localStorage.getItem('search-language') || 'zh';
  }

  saveLanguagePreference(lang) {
    localStorage.setItem('search-language', lang);
  }

  // 初始化
  init() {
    this.updateActiveButton(this.currentLanguage);
    this.updateUI();
  }
}
