// UI 管理组件
class UIManager {
  constructor(app) {
    this.app = app;
  }

  // 设置发送按钮状态
  setSendButtonState(isLoading) {
    const t = translations[this.app.languageManager.getCurrentLanguage()];
    
    if (isLoading) {
      this.app.elements.sendBtn.disabled = true;
      this.app.elements.sendText.textContent = t.sendingText;
      this.app.elements.sendIcon.style.display = 'none';
      this.app.elements.loadingIcon.style.display = 'block';
    } else {
      this.app.elements.sendBtn.disabled = false;
      this.app.elements.sendText.textContent = t.sendButtonText;
      this.app.elements.sendIcon.style.display = 'block';
      this.app.elements.loadingIcon.style.display = 'none';
    }
  }

  // 更新UI文本
  updateUI() {
    const t = translations[this.app.languageManager.getCurrentLanguage()];
    
    // 更新标题
    this.app.elements.title.textContent = t.title;
    
    // 更新示例
    this.updateExamples(t.examples);
    
    // 更新标签
    this.updateLabels(t);
    
    // 更新选项
    this.updateOptions(t);
    
    // 更新语言按钮状态
    this.app.languageManager.updateLanguageButtons();
    
    // 更新欢迎消息
    this.app.elements.output.innerHTML = `<div class="welcome-message">${t.welcomeMessage}</div>`;
  }

  // 更新示例
  updateExamples(examples) {
    this.app.elements.examples.innerHTML = '';
    examples.forEach(example => {
      const li = document.createElement('li');
      li.textContent = example;
      this.app.elements.examples.appendChild(li);
    });
  }

  // 更新标签
  updateLabels(t) {
    this.app.elements.numImagesLabel.textContent = t.numImagesLabel;
    this.app.elements.animalTypeLabel.textContent = t.animalTypeLabel;
    this.app.elements.input.placeholder = t.inputPlaceholder;
    this.app.elements.sendText.textContent = t.sendButtonText;
  }

  // 更新选项
  updateOptions(t) {
    // 更新数量选项
    this.app.elements.numImagesSelect.innerHTML = '';
    Object.entries(t.imageCount).forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      if (value === '2') option.selected = true;
      this.app.elements.numImagesSelect.appendChild(option);
    });

    // 更新动物选项
    this.app.elements.animalTypeSelect.innerHTML = '';
    Object.entries(t.animals).forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      if (value === 'cat') option.selected = true;
      this.app.elements.animalTypeSelect.appendChild(option);
    });
  }

  // 设置示例点击事件
  setupExampleClickListener() {
    this.app.elements.examples.addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
        this.app.elements.input.value = e.target.textContent;
        this.app.elements.input.focus();
      }
    });
  }

  // 设置发送按钮和输入框事件
  setupSendEvents() {
    // 回车提交
    this.app.elements.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.app.apiManager.submitPrompt();
      }
    });

    // 发送按钮点击
    this.app.elements.sendBtn.addEventListener('click', () => {
      this.app.apiManager.submitPrompt();
    });
  }
}
