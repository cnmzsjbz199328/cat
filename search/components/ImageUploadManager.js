class ImageUploadManager {
  constructor(app) {
    this.app = app;
    this.uploadedImage = null;
    this.bindEvents();
  }

  bindEvents() {
    const fileUpload = document.getElementById('file-upload');
    const removeButton = document.getElementById('remove-image');

    fileUpload.addEventListener('change', (e) => {
      this.handleFileSelect(e.target.files[0]);
    });

    removeButton.addEventListener('click', () => {
      this.removeImage();
    });

    // 拖拽上传
    const uploadArea = document.getElementById('image-upload-area');
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        this.handleFileSelect(file);
      }
    });
  }

  handleFileSelect(file) {
    if (!file) return;

    // 特别检查GIF格式并给出针对性提示（需在通用类型检查之前）
    if (file.type === 'image/gif') {
      this.app.errorHandler.handleImageError('gifNotSupported');
      return;
    }

    // 检查文件类型 - 支持Google Gemini推荐的格式（统一配置见 config.js）
    if (!APP_CONFIG.APP.SEARCH_ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.app.errorHandler.handleImageError('invalidFileType');
      return;
    }

    // 检查文件大小
    if (file.size > APP_CONFIG.APP.MAX_FILE_SIZE) {
      this.app.errorHandler.handleImageError('fileTooLarge');
      return;
    }

    this.processImage(file);
  }

  processImage(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const dataUrl = e.target.result;
        // 安全移除data URI前缀，确保获得纯净的Base64字符串
        const base64Data = this.extractBase64(dataUrl);
        if (!base64Data) {
          throw new Error('Invalid Base64 data');
        }
        // mime_type/data 供 API 使用；preview 为小尺寸缩略图，供会话历史持久化
        this.uploadedImage = {
          mime_type: file.type,
          data: base64Data,
          preview: null
        };
        this.createThumbnail(dataUrl, (thumbnail) => {
          if (this.uploadedImage) {
            this.uploadedImage.preview = thumbnail;
          }
        });
        this.showPreview(dataUrl);
      } catch (error) {
        console.error('Image processing error:', error);
        this.app.errorHandler.handleImageError('imageProcessFailed');
      }
    };

    reader.onerror = () => {
      this.app.errorHandler.handleImageError('imageProcessFailed');
    };

    reader.readAsDataURL(file);
  }

  // 生成小尺寸缩略图（最长边 160px，JPEG 压缩）。
  // 会话历史只持久化缩略图，避免 4MB 原图的 base64 撑爆 localStorage。
  createThumbnail(dataUrl, callback) {
    const img = new Image();
    img.onload = () => {
      try {
        const maxSize = 160;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.7));
      } catch (error) {
        // 缩略图失败不影响主流程，历史中不显示图片即可
        callback(null);
      }
    };
    img.onerror = () => callback(null);
    img.src = dataUrl;
  }

  // 安全提取Base64数据，移除data URI前缀
  extractBase64(dataUrl) {
    try {
      // 检查是否为有效的data URI
      if (!dataUrl.startsWith('data:')) {
        return null;
      }
      
      // 查找逗号位置，Base64数据在逗号之后
      const commaIndex = dataUrl.indexOf(',');
      if (commaIndex === -1) {
        return null;
      }
      
      // 提取纯净的Base64字符串（移除data:image/...;base64,前缀）
      const base64String = dataUrl.substring(commaIndex + 1);
      
      // 验证Base64字符串不为空
      if (!base64String || base64String.length === 0) {
        return null;
      }
      
      return base64String;
    } catch (error) {
      console.error('Base64 extraction error:', error);
      return null;
    }
  }

  showPreview(dataUrl) {
    const preview = document.getElementById('image-preview');
    const img = document.getElementById('preview-img');
    
    img.src = dataUrl;
    preview.hidden = false;
  }

  removeImage() {
    this.uploadedImage = null;
    document.getElementById('image-preview').hidden = true;
    document.getElementById('file-upload').value = '';
  }

  getUploadedImage() {
    return this.uploadedImage;
  }

  hasImage() {
    return this.uploadedImage !== null;
  }
}
