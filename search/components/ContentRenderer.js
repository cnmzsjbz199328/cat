class ContentRenderer {
  constructor(app) {
    this.app = app;
  }

  showContent(result, apiType = 'gemini') {
    const output = document.getElementById('output');
    const slideshow = document.getElementById('slideshow');
    
    // 隐藏幻灯片，显示文本输出
    slideshow.hidden = true;
    output.style.display = 'block';
    output.classList.remove('welcome', 'loading');
    
    if (apiType === 'story' && result.imageUrl) {
      // 故事+图片的特殊渲染
      output.innerHTML = this.renderStoryWithImage(result.content, result.imageUrl);
    } else {
      // 普通Markdown渲染 - 确保内容是字符串
      let content = typeof result === 'object' && result.content ? result.content : result;
      if (typeof content !== 'string') {
        content = content ? String(content) : '无可显示的内容';
      }
      output.innerHTML = this.app.uiManager.processMarkdown(content);
    }
    
    // 滚动到结果区域
    output.scrollIntoView({ behavior: 'smooth' });
  }

  renderStoryWithImage(storyMarkdown, imageUrl) {
    const markdownContent = this.app.uiManager.processMarkdown(storyMarkdown);
    
    return `
      <div class="story-container">
        <div class="story-image">
          <img src="${imageUrl}" alt="故事配图" loading="lazy" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
          <div class="image-error" style="display: none;">
            <p>📷 图片加载失败</p>
            <p class="error-hint">图片链接可能已过期</p>
          </div>
        </div>
        <div class="story-content">
          ${markdownContent}
        </div>
      </div>
    `;
  }

  // 渲染会话历史（用于会话切换时显示完整对话）
  renderSessionHistory(session) {
    const output = document.getElementById('output');
    const slideshow = document.getElementById('slideshow');
    
    slideshow.hidden = true;
    output.style.display = 'block';
    output.classList.remove('welcome', 'loading');
    
    if (!session || session.messages.length === 0) {
      output.innerHTML = `
        <div class="session-history">
          <div class="welcome-message">开始新的对话吧！</div>
        </div>
      `;
      return;
    }

    const historyHTML = session.messages.map(message => {
      if (message.type === 'user') {
        return this.renderUserMessage(message);
      } else {
        return this.renderAssistantMessage(message);
      }
    }).join('');

    output.innerHTML = `
      <div class="session-history">
        ${historyHTML}
      </div>
    `;
    
    // 滚动到最底部
    output.scrollTop = output.scrollHeight;
  }

  renderUserMessage(message) {
    const hasImage = message.imageData && message.imageData.preview;
    const timestamp = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="message user-message">
        <div class="message-header">
          <span class="message-role">👤 用户</span>
          <span class="message-time">${timestamp}</span>
        </div>
        <div class="message-content">
          ${hasImage ? `
            <div class="message-image">
              <img src="${message.imageData.preview}" alt="用户上传的图片" />
            </div>
          ` : ''}
          <div class="message-text">${this.escapeHtml(message.content)}</div>
        </div>
      </div>
    `;
  }

  renderAssistantMessage(message) {
    const timestamp = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const apiIcon = message.apiType === 'story' ? '📚' : '🤖';
    const apiName = message.apiType === 'story' ? '故事生成' : '智能分析';

    let contentHTML = '';
    if (message.apiType === 'story' && typeof message.content === 'object' && message.content.imageUrl) {
      contentHTML = this.renderStoryWithImage(message.content.content, message.content.imageUrl);
    } else {
      const content = typeof message.content === 'object' && message.content.content 
        ? message.content.content 
        : message.content;
      contentHTML = `<div class="message-text">${this.app.uiManager.processMarkdown(content)}</div>`;
    }

    return `
      <div class="message assistant-message">
        <div class="message-header">
          <span class="message-role">${apiIcon} ${apiName}</span>
          <span class="message-time">${timestamp}</span>
        </div>
        <div class="message-content">
          ${contentHTML}
        </div>
      </div>
    `;
  }

  // HTML转义函数
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 显示加载状态（会话专用）
  showSessionLoading(sessionId) {
    const output = document.getElementById('output');
    const t = this.app.languageManager.getTranslations();
    
    output.innerHTML = `
      <div class="session-loading">
        <div class="loading-message">
          <div class="loading-spinner"></div>
          <p>${t.generatingMessage || '正在生成内容...'}</p>
        </div>
      </div>
    `;
  }

  // 显示错误状态
  showError(error, sessionId = null) {
    const output = document.getElementById('output');
    
    output.innerHTML = `
      <div class="session-error">
        <div class="error-message">
          <h3>❌ 出现错误</h3>
          <p>${error.message || '未知错误'}</p>
          <button class="retry-btn" onclick="location.reload()">重试</button>
        </div>
      </div>
    `;
  }
}
