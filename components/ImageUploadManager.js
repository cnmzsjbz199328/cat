// 图片上传管理组件
class ImageUploadManager {
  constructor(app) {
    this.app = app;
    this.uploadedImage = null;
    this.maxFileSize = 4 * 1024 * 1024; // 4MB
    this.allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  }

  // 设置图片上传事件监听器
  setupImageUploadListeners() {
    this.app.elements.fileUpload.addEventListener('change', (e) => {
      this.handleImageUpload(e);
    });

    this.app.elements.removeImageBtn.addEventListener('click', () => {
      this.removeImage();
    });
  }

  // 处理图片上传
  async handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 1. 检查文件类型
    if (!this.allowedTypes.includes(file.type)) {
      const t = this.app.languageManager.getNestedTranslation('errorMessages', 'invalidFileType');
      this.app.errorHandler.showError(t || '仅支持 PNG 或 JPEG 图片格式');
      this.removeImage();
      return;
    }

    // 2. 检查文件大小
    if (file.size > this.maxFileSize) {
      const t = this.app.languageManager.getNestedTranslation('errorMessages', 'fileTooLarge');
      const sizeMB = Math.round(this.maxFileSize / (1024 * 1024));
      this.app.errorHandler.showError(t || `图片过大，最大支持 ${sizeMB}MB`);
      this.removeImage();
      return;
    }

    // 3. 显示上传进度
    this.showUploadProgress(true);

    try {
      // 4. 读取并处理图片
      const imageData = await this.processImage(file);
      
      // 5. 验证图片数据
      if (!imageData) {
        const t = this.app.languageManager.getNestedTranslation('errorMessages', 'imageProcessFailed');
        this.app.errorHandler.showError(t || '图片处理失败，请重试');
        this.removeImage();
        return;
      }

      // 6. 保存图片数据和显示预览
      this.uploadedImage = imageData;
      this.app.elements.previewImg.src = `data:${imageData.mime_type};base64,${imageData.data}`;
      this.app.elements.imagePreview.hidden = false;
      
      // 7. 隐藏上传进度
      this.showUploadProgress(false);
      
    } catch (error) {
      console.error('Image upload error:', error);
      const t = this.app.languageManager.getNestedTranslation('errorMessages', 'imageProcessFailed');
      this.app.errorHandler.showError(t || '图片处理失败，请重试');
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
          const result = evt.target.result;
          const match = result.match(/^data:(image\/(png|jpeg|jpg));base64,(.+)$/);
          if (!match) {
            reject(new Error('Invalid image data format'));
            return;
          }
          
          const mime_type = match[1];
          const data = match[3];
          
          if (!data || data.length === 0) {
            reject(new Error('Empty image data'));
            return;
          }
          
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
    const uploadArea = this.app.elements.fileUpload.parentElement;
    if (show) {
      uploadArea.classList.add('uploading');
    } else {
      uploadArea.classList.remove('uploading');
    }
  }

  // 移除图片
  removeImage() {
    this.app.elements.fileUpload.value = '';
    this.app.elements.imagePreview.hidden = true;
    this.uploadedImage = null;
    this.showUploadProgress(false);
    this.app.errorHandler.hideError();
  }

  // 获取上传的图片数据
  getUploadedImage() {
    return this.uploadedImage;
  }
}
