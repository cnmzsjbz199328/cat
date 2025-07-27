class UIManager {
  constructor(app) {
    this.app = app;
    this.isGenerating = false;
  }

  showOutput(content, isMarkdown = true) {
    const output = document.getElementById('output');
    const slideshow = document.getElementById('slideshow');
    
    // 隐藏幻灯片，显示文本输出
    slideshow.hidden = true;
    output.style.display = 'block';
    output.classList.remove('welcome', 'loading');
    
    if (isMarkdown) {
      output.innerHTML = this.processMarkdown(content);
    } else {
      output.innerHTML = content;
    }
    
    // 滚动到结果区域
    output.scrollIntoView({ behavior: 'smooth' });
  }

  showLoading() {
    const output = document.getElementById('output');
    const slideshow = document.getElementById('slideshow');
    const t = this.app.languageManager.getTranslations();
    
    slideshow.hidden = true;
    output.style.display = 'block';
    output.classList.add('loading');
    output.classList.remove('welcome');
    output.innerHTML = `<div class="loading-message">📊 ${t.generatingMessage}</div>`;
  }

  hideLoading() {
    const output = document.getElementById('output');
    output.classList.remove('loading');
  }

  clearOutput() {
    const output = document.getElementById('output');
    const slideshow = document.getElementById('slideshow');
    const t = this.app.languageManager.getTranslations();
    
    slideshow.hidden = true;
    output.style.display = 'block';
    output.classList.add('welcome');
    output.innerHTML = `<div class="welcome-message">${t.welcomeMessage}</div>`;
  }

  isImageGenerationEnabled() {
    return document.getElementById('generate-images').checked;
  }

  processMarkdown(text) {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Lists
      .replace(/^[\s]*[-*+] (.*)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/^[\s]*\d+\. (.*)$/gim, '<li>$1</li>')
      // Blockquotes
      .replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h1-6]|<ul|<ol|<blockquote|<pre)(.+)$/gim, '<p>$1</p>')
      // Line breaks
      .replace(/\n/g, '<br>');
  }

  toggleSendButton(isLoading) {
    const sendBtn = document.getElementById('send-btn');
    const sendIcon = sendBtn.querySelector('.send-icon');
    const loadingIcon = sendBtn.querySelector('.loading-icon');
    
    sendBtn.disabled = isLoading;
    
    if (isLoading) {
      sendIcon.style.display = 'none';
      loadingIcon.style.display = 'block';
    } else {
      sendIcon.style.display = 'block';
      loadingIcon.style.display = 'none';
    }
    
    this.isGenerating = isLoading;
  }

  getInputValue() {
    return document.getElementById('input').value.trim();
  }

  clearInput() {
    document.getElementById('input').value = '';
  }

  focusInput() {
    document.getElementById('input').focus();
  }

  validateInput() {
    const textInput = this.getInputValue();
    const hasImage = this.app.imageUploadManager.hasImage();
    
    return textInput.length > 0 || hasImage;
  }

  showWelcomeMessage() {
    const t = this.app.languageManager.getTranslations();
    const output = document.getElementById('output');
    
    output.innerHTML = `<div class="welcome-message">${t.welcomeMessage}</div>`;
    output.classList.add('welcome');
  }
}
