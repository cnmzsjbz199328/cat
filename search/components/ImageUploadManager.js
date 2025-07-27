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

    // 检查文件类型 - 支持Google Gemini推荐的格式
    const supportedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif'
    ];
    
    if (!supportedTypes.includes(file.type)) {
      this.app.errorHandler.handleImageError('invalidFileType');
      return;
    }

    // 特别检查GIF格式并给出警告
    if (file.type === 'image/gif') {
      this.app.errorHandler.handleImageError('gifNotSupported');
      return;
    }

    // 检查文件大小 (4MB)
    if (file.size > 4 * 1024 * 1024) {
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
        // 只保留API需要的图片对象格式
        this.uploadedImage = {
          mime_type: file.type,
          data: base64Data
        };
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
