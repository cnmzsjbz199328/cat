// 语言管理组件
class LanguageManager {
  constructor(app) {
    this.app = app;
    const saved = localStorage.getItem('language');
    // 对未知语言值回退到默认语言，避免 translations 取值报错
    this.currentLanguage = translations[saved] ? saved : APP_CONFIG.APP.DEFAULT_LANGUAGE;
    document.documentElement.lang = this.currentLanguage;
  }

  // 切换语言
  changeLanguage(lang) {
    if (!translations[lang]) return;
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    this.app.updateUI();
  }

  // 获取当前语言
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // 获取翻译文本
  getTranslation(key) {
    return translations[this.currentLanguage][key] || key;
  }

  // 获取嵌套翻译文本
  getNestedTranslation(category, key) {
    return translations[this.currentLanguage][category]?.[key] || key;
  }

  // 设置语言按钮事件监听器
  setupLanguageButtons() {
    this.app.elements.languageBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.changeLanguage(e.target.dataset.lang);
      });
    });
  }

  // 更新语言按钮状态
  updateLanguageButtons() {
    this.app.elements.languageBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
    });
  }
}
