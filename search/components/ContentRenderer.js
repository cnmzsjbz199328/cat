class ContentRenderer {
  constructor(app) {
    this.app = app;
  }

  init() {
    debugLog('ContentRenderer initialized');
  }

  showContent(result, apiType = 'analysis') {
    const output = document.getElementById('output');
    const slideshow = document.getElementById('slideshow');

    // 隐藏幻灯片，显示文本输出
    slideshow.hidden = true;
    output.style.display = 'block';
    output.classList.remove('welcome', 'loading');

    // 处理不同的结果格式，兼容 story_markdown/image_url 结构
    let content, imageUrl;
    if (typeof result === 'object') {
      if (result.story_markdown && result.image_url) {
        content = result.story_markdown;
        imageUrl = result.image_url;
      } else {
        content = result.content || result;
        imageUrl = result.imageUrl;
      }
    } else {
      content = result;
    }

    if (imageUrl) {
      // 有图片的渲染（图文模式）
      output.innerHTML = this.renderStoryWithImage(content, imageUrl);
    } else {
      // 普通Markdown渲染
      output.innerHTML = this.app.uiManager.processMarkdown(content);
    }

    // 滚动到结果区域
    output.scrollIntoView({ behavior: 'smooth' });
  }

  // 显示完整的会话历史
  showSessionHistory(session) {
    const output = document.getElementById('output');
    if (!output || !session) return;

    // 清空当前内容
    output.innerHTML = '';
    output.classList.remove('welcome', 'loading');

    // 为每条消息创建元素
    session.messages.forEach((message, index) => {
      const messageElement = this.createMessageElement(message, index);
      output.appendChild(messageElement);
    });

    // 滚动到底部
    output.scrollTop = output.scrollHeight;
  }

  // 创建单条消息的DOM元素
  createMessageElement(message, index) {
    const t = this.app.languageManager.getTranslations();
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${message.type}`;
    messageDiv.setAttribute('data-message-id', message.id);

    if (message.type === 'user') {
      // 用户消息：图片只保留小尺寸预览（message.imageData.preview）
      const preview = message.imageData && message.imageData.preview
        ? this.sanitizeUrl(message.imageData.preview)
        : '';
      messageDiv.innerHTML = `
        <div class="message-header">
          <span class="message-time">${this.formatTime(message.timestamp)}</span>
        </div>
        <div class="message-content">
          ${preview ? `<img src="${preview}" alt="${t.uploadedImageAlt}" class="message-image">` : ''}
          <p>${this.escapeHtml(message.content)}</p>
        </div>
      `;
    } else {
      let assistantContent;
      if (message.content && typeof message.content === 'object' && message.content.imageUrl) {
        assistantContent = this.renderStoryWithImage(message.content.content, message.content.imageUrl);
      } else {
        assistantContent = this.app.uiManager.processMarkdown(
          message.content && typeof message.content === 'object' && message.content.content
            ? message.content.content
            : message.content
        );
      }
      messageDiv.innerHTML = `
        <div class="message-header">
          <span class="message-time">${this.formatTime(message.timestamp)}</span>
        </div>
        <div class="message-content">
          ${assistantContent}
        </div>
      `;
    }

    return messageDiv;
  }

  formatTime(timestamp) {
    const localeMap = { zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR' };
    const locale = localeMap[this.app.languageManager.getCurrentLanguage()] || 'zh-CN';
    const date = new Date(timestamp);
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // HTML转义函数
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 仅允许 http(s) 与 data:image 协议的 URL，并转义引号，防止属性注入
  sanitizeUrl(url) {
    if (typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!/^(https?:\/\/|data:image\/)/i.test(trimmed)) return '';
    return trimmed.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  renderStoryWithImage(storyMarkdown, imageUrl) {
    const t = this.app.languageManager.getTranslations();
    const markdownContent = this.app.uiManager.processMarkdown(storyMarkdown);
    const safeUrl = this.sanitizeUrl(imageUrl);

    return `
      <div class="story-container">
        <div class="story-image">
          ${safeUrl ? `<img src="${safeUrl}" alt="${t.storyImageAlt}" loading="lazy"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />` : ''}
          <div class="image-error" style="display: ${safeUrl ? 'none' : 'block'};">
            <p>📷 ${t.imageLoadFailed}</p>
            <p class="error-hint">${t.imageExpiredHint}</p>
          </div>
        </div>
        <div class="story-content">
          ${markdownContent}
        </div>
      </div>
    `;
  }

  appendMessage(message) {
    const output = document.getElementById('output');
    const messageElement = this.createMessageElement(message);
    output.appendChild(messageElement);
    this.app.uiManager.scrollToBottom();
  }

  showAssistantLoadingPlaceholder() {
    const output = document.getElementById('output');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.className = 'loading-indicator';

    const t = this.app.languageManager.getTranslations();

    loadingIndicator.innerHTML = `
      <div class="loading-spinner"></div>
      <p>${t.thinkingPlaceholder}</p>
    `;
    output.appendChild(loadingIndicator);
    this.app.uiManager.scrollToBottom();
  }

  removeAssistantLoadingPlaceholder() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }

  // 显示加载状态（会话专用）
  showSessionLoading(sessionId) {
    const output = document.getElementById('output');
    const t = this.app.languageManager.getTranslations();

    output.innerHTML = `
      <div class="session-loading">
        <div class="loading-message">
          <div class="loading-spinner"></div>
          <p>${t.generatingMessage}</p>
        </div>
      </div>
    `;
  }

  // 显示错误状态
  showError(error, sessionId = null) {
    const output = document.getElementById('output');
    const t = this.app.languageManager.getTranslations();

    output.innerHTML = `
      <div class="session-error">
        <div class="error-message">
          <h3>❌ ${t.errorTitle}</h3>
          <p>${this.escapeHtml(error.message || t.apiErrors.unknown)}</p>
          <button class="retry-btn" onclick="location.reload()">${t.retryButton}</button>
        </div>
      </div>
    `;
  }
}
