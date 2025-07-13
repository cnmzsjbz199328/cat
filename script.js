// 应用程序主类
class AnimalStoryApp {
  constructor() {
    this.host = "https://catbackend.tj15982183241.workers.dev";
    this.currentLanguage = localStorage.getItem('language') || 'zh';
    this.uploadedImage = null; // { mime_type, data }
    this.maxFileSize = 4 * 1024 * 1024; // 4MB
    this.allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    this.initializeElements();
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

  // 设置事件监听器
  setupEventListeners() {
    // 语言切换
    this.elements.languageBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.changeLanguage(e.target.dataset.lang);
      });
    });

    // 示例点击
    this.elements.examples.addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
        this.elements.input.value = e.target.textContent;
        this.elements.input.focus();
      }
    });

    // 图片上传
    this.elements.fileUpload.addEventListener('change', (e) => {
      this.handleImageUpload(e);
    });

    // 移除图片
    this.elements.removeImageBtn.addEventListener('click', () => {
      this.removeImage();
    });

    // 回车提交
    this.elements.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.submitPrompt();
      }
    });

    // 发送按钮点击
    this.elements.sendBtn.addEventListener('click', () => {
      this.submitPrompt();
    });
  }

  // 切换语言
  changeLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    this.updateUI();
  }

  // 更新UI文本
  updateUI() {
    const t = translations[this.currentLanguage];
    
    // 更新标题
    this.elements.title.textContent = t.title;
    
    // 更新示例
    this.elements.examples.innerHTML = '';
    t.examples.forEach(example => {
      const li = document.createElement('li');
      li.textContent = example;
      this.elements.examples.appendChild(li);
    });

    // 更新标签
    this.elements.numImagesLabel.textContent = t.numImagesLabel;
    this.elements.animalTypeLabel.textContent = t.animalTypeLabel;
    this.elements.uploadLabel.textContent = t.uploadImageText;
    this.elements.input.placeholder = t.inputPlaceholder;
    this.elements.sendText.textContent = t.sendButtonText;

    // 更新数量选项
    this.elements.numImagesSelect.innerHTML = '';
    Object.entries(t.imageCount).forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      if (value === '2') option.selected = true;
      this.elements.numImagesSelect.appendChild(option);
    });

    // 更新动物选项
    this.elements.animalTypeSelect.innerHTML = '';
    Object.entries(t.animals).forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      if (value === 'cat') option.selected = true;
      this.elements.animalTypeSelect.appendChild(option);
    });

    // 更新语言按钮状态
    this.elements.languageBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
    });

    // 更新欢迎消息
    this.elements.output.innerHTML = `<div class="welcome-message">${t.welcomeMessage}</div>`;
  }

  // 处理图片上传
  async handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 1. 检查文件类型
    if (!this.allowedTypes.includes(file.type)) {
      const t = translations[this.currentLanguage];
      this.showError(t.errorMessages?.invalidFileType || '仅支持 PNG 或 JPEG 图片格式');
      this.removeImage();
      return;
    }

    // 2. 检查文件大小
    if (file.size > this.maxFileSize) {
      const t = translations[this.currentLanguage];
      const sizeMB = Math.round(this.maxFileSize / (1024 * 1024));
      this.showError(t.errorMessages?.fileTooLarge || `图片过大，最大支持 ${sizeMB}MB`);
      this.removeImage();
      return;
    }

    // 3. 显示上传进度（可选）
    this.showUploadProgress(true);

    try {
      // 4. 读取并处理图片
      const imageData = await this.processImage(file);
      
      // 5. 验证图片数据
      if (!imageData) {
        const t = translations[this.currentLanguage];
        this.showError(t.errorMessages?.imageProcessFailed || '图片处理失败，请重试');
        this.removeImage();
        return;
      }

      // 6. 保存图片数据和显示预览
      this.uploadedImage = imageData;
      this.elements.previewImg.src = `data:${imageData.mime_type};base64,${imageData.data}`;
      this.elements.imagePreview.hidden = false;
      
      // 7. 隐藏上传进度
      this.showUploadProgress(false);
      
    } catch (error) {
      console.error('Image upload error:', error);
      const t = translations[this.currentLanguage];
      this.showError(t.errorMessages?.imageProcessFailed || '图片处理失败，请重试');
      this.removeImage();
      this.showUploadProgress(false);
    }
  }

  // 处理图片文件
  processImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (evt) => {
        try {
          const result = evt.target.result; // data:image/png;base64,xxx
          
          // 解析数据URL格式
          const match = result.match(/^data:(image\/(png|jpeg|jpg));base64,(.+)$/);
          if (!match) {
            reject(new Error('Invalid image data format'));
            return;
          }
          
          const mime_type = match[1];
          const data = match[3];
          
          // 验证base64数据
          if (!data || data.length === 0) {
            reject(new Error('Empty image data'));
            return;
          }
          
          // 标准化MIME类型（将image/jpg转换为image/jpeg）
          const normalizedMimeType = mime_type === 'image/jpg' ? 'image/jpeg' : mime_type;
          
          resolve({
            mime_type: normalizedMimeType,
            data: data
          });
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // 显示上传进度
  showUploadProgress(show) {
    const uploadArea = this.elements.fileUpload.parentElement;
    if (show) {
      uploadArea.classList.add('uploading');
    } else {
      uploadArea.classList.remove('uploading');
    }
  }

  // 移除图片
  removeImage() {
    this.elements.fileUpload.value = '';
    this.elements.imagePreview.hidden = true;
    this.uploadedImage = null;
    this.showUploadProgress(false);
    this.hideError();
  }

  // 显示错误信息
  showError(message) {
    this.elements.errorDiv.textContent = message;
    this.elements.errorDiv.hidden = false;
    
    // 3秒后自动隐藏错误信息
    setTimeout(() => {
      this.hideError();
    }, 3000);
  }

  // 隐藏错误信息
  hideError() {
    this.elements.errorDiv.hidden = true;
  }

  // 设置发送按钮状态
  setSendButtonState(isLoading) {
    const t = translations[this.currentLanguage];
    
    if (isLoading) {
      this.elements.sendBtn.disabled = true;
      this.elements.sendText.textContent = t.sendingText;
      this.elements.sendIcon.style.display = 'none';
      this.elements.loadingIcon.style.display = 'block';
    } else {
      this.elements.sendBtn.disabled = false;
      this.elements.sendText.textContent = t.sendButtonText;
      this.elements.sendIcon.style.display = 'block';
      this.elements.loadingIcon.style.display = 'none';
    }
  }

  // 提交请求
  async submitPrompt() {
    const prompt = this.elements.input.value.trim();
    if (!prompt && !this.uploadedImage) {
      const t = translations[this.currentLanguage];
      this.showError(t.errorMessages?.noInput || '请输入文本或上传图片');
      return;
    }

    // 防止重复提交
    if (this.elements.sendBtn.disabled) {
      return;
    }

    this.elements.slideshow.hidden = true;
    this.hideError();
    
    // 设置加载状态
    this.setSendButtonState(true);

    const t = translations[this.currentLanguage];
    const animalName = t.animals[this.elements.animalTypeSelect.value];
    const loadingMessage = t.generatingMessage.replace('{animal}', animalName);
    this.elements.output.innerHTML = `<div class="welcome-message">${loadingMessage}</div>`;

    // 构建请求体，确保图片格式正确
    const body = {
      num_images: parseInt(this.elements.numImagesSelect.value),
      animal: this.elements.animalTypeSelect.value,
      language: this.currentLanguage // 添加当前语言设置
    };

    if (prompt) body.prompt = prompt;
    if (this.uploadedImage) {
      // 确保图片数据格式符合Gemini API要求
      body.image = {
        mime_type: this.uploadedImage.mime_type,
        data: this.uploadedImage.data
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
      
      this.renderSlides(data.data);
      this.elements.output.innerHTML = '';
      
    } catch (err) {
      console.error('Submit error:', err);
      this.showError(err.message);
      this.elements.output.innerHTML = '';
    } finally {
      // 恢复按钮状态
      this.setSendButtonState(false);
    }
  }

  // 渲染幻灯片
  renderSlides(steps) {
    this.elements.slideshow.innerHTML = '';
    
    steps.forEach(step => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      
      // 根据当前语言添加字体类
      slide.classList.add(`font-handwriting-${this.currentLanguage}`);
      
      const img = document.createElement('img');
      img.src = step.image_url;
      img.alt = step.image_prompt || step.sentence;
      
      const txt = document.createElement('div');
      txt.textContent = step.sentence;
      
      slide.appendChild(img);
      slide.appendChild(txt);
      this.elements.slideshow.appendChild(slide);
    });
    
    this.elements.slideshow.hidden = false;
  }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new AnimalStoryApp();
});
