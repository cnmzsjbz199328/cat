// API 请求管理组件
class APIManager {
  constructor(app) {
    this.app = app;
    this.host = "https://catbackend.tj15982183241.workers.dev";
  }

  // 提交请求
  async submitPrompt() {
    const prompt = this.app.elements.input.value.trim();
    const uploadedImage = this.app.imageUploadManager.getUploadedImage();
    
    if (!prompt && !uploadedImage) {
      const t = this.app.languageManager.getNestedTranslation('errorMessages', 'noInput');
      this.app.errorHandler.showError(t || '请输入文本或上传图片');
      return;
    }

    // 防止重复提交
    if (this.app.elements.sendBtn.disabled) {
      return;
    }

    this.app.elements.slideshow.hidden = true;
    this.app.errorHandler.hideError();
    
    // 设置加载状态
    this.app.uiManager.setSendButtonState(true);

    const animalName = this.app.languageManager.getNestedTranslation('animals', this.app.elements.animalTypeSelect.value);
    const loadingMessage = this.app.languageManager.getTranslation('generatingMessage').replace('{animal}', animalName);
    this.app.elements.output.innerHTML = `<div class="welcome-message">${loadingMessage}</div>`;

    // 构建请求体
    const body = {
      num_images: parseInt(this.app.elements.numImagesSelect.value),
      animal: this.app.elements.animalTypeSelect.value,
      language: this.app.languageManager.getCurrentLanguage()
    };

    if (prompt) body.prompt = prompt;
    if (uploadedImage) {
      body.image = {
        mime_type: uploadedImage.mime_type,
        data: uploadedImage.data
      };
    }

    try {
      const res = await fetch(`${this.host}/api/generate-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }
      
      this.app.slideRenderer.renderSlides(data.data);
      this.app.elements.output.innerHTML = '';
      
    } catch (err) {
      console.error('Submit error:', err);
      this.app.errorHandler.showError(err.message);
      this.app.elements.output.innerHTML = '';
    } finally {
      // 恢复按钮状态
      this.app.uiManager.setSendButtonState(false);
    }
  }
}
