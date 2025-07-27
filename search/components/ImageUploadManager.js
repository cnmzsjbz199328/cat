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

    // 检查文件类型
    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      this.app.errorHandler.handleImageError('invalidFileType');
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
        // 匹配主项目的图片数据格式
        this.uploadedImage = {
          file: file,
          dataUrl: e.target.result,
          base64: e.target.result.split(',')[1],
          mime_type: file.type, // 匹配后端API格式
          data: e.target.result.split(',')[1] // 匹配后端API格式
        };
        
        this.showPreview(e.target.result);
      } catch (error) {
        this.app.errorHandler.handleImageError('imageProcessFailed');
      }
    };

    reader.onerror = () => {
      this.app.errorHandler.handleImageError('imageProcessFailed');
    };

    reader.readAsDataURL(file);
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
