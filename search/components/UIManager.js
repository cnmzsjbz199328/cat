class UIManager {
  constructor(app) {
    this.app = app;
    this.isGenerating = false;
  }

  toggleSendButton(isLoading) {
    const sendBtn = document.getElementById('send-btn');
    const sendIcon = sendBtn.querySelector('.send-icon');
    const loadingIcon = sendBtn.querySelector('.loading-icon');
    const t = this.app.languageManager.getTranslations();

    sendBtn.disabled = isLoading;

    if (isLoading) {
      sendBtn.classList.add('loading');
      sendIcon.style.display = 'none';
      loadingIcon.style.display = 'inline-block';
      sendBtn.title = t.processingTooltip;
    } else {
      sendBtn.classList.remove('loading');
      sendIcon.style.display = 'inline-block';
      loadingIcon.style.display = 'none';
      sendBtn.title = t.sendTooltip;
    }

    this.isGenerating = isLoading;
  }

  showContent(content, isMarkdown = true) {
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
    this.toggleSendButton(true);
  }

  hideLoading() {
    this.toggleSendButton(false);
  }

  scrollToBottom() {
    const output = document.getElementById('output');
    output.scrollTop = output.scrollHeight;
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

  hideWelcomeMessage() {
    const output = document.getElementById('output');
    const welcomeMessage = output.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
      output.classList.remove('welcome');
    }
  }

  shouldGenerateImages() {
    const checkbox = document.getElementById('generate-images');
    return !!(checkbox && checkbox.checked);
  }

  // HTML 转义：Markdown 渲染前必须先调用，防止 API 返回内容注入脚本
  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  processMarkdown(text) {
    // 确保text是字符串类型
    if (typeof text !== 'string') {
      text = text ? String(text) : '';
    }

    // 先整体转义，所有原始 HTML 都会以文本形式显示，之后再生成受控标签
    return this.escapeHtml(text)
      // Code blocks（先于行内 code 处理）
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Lists
      .replace(/^[\s]*[-*+] (.*)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/^[\s]*\d+\. (.*)$/gim, '<li>$1</li>')
      // Blockquotes
      .replace(/^&gt; (.*)$/gim, '<blockquote>$1</blockquote>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h1-6]|<ul|<ol|<blockquote|<pre)(.+)$/gim, '<p>$1</p>')
      // Line breaks
      .replace(/\n/g, '<br>');
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
