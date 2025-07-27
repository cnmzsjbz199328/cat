class ErrorHandler {
  constructor(app) {
    this.app = app;
    this.errorElement = document.getElementById('error');
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.errorElement.hidden = false;
    
    // 自动隐藏错误消息
    setTimeout(() => {
      this.hideError();
    }, 5000);
  }

  hideError() {
    this.errorElement.hidden = true;
  }

  handleAPIError(error) {
    console.error('API Error:', error);
    
    const t = this.app.languageManager.getTranslations();
    let errorMessage;

    if (error.message) {
      if (error.message.includes('API key')) {
        errorMessage = 'API密钥错误，请检查配置';
      } else if (error.message.includes('rate limit')) {
        errorMessage = '请求频率过高，请稍后再试';
      } else if (error.message.includes('network')) {
        errorMessage = '网络连接错误，请检查网络';
      } else {
        errorMessage = `API错误: ${error.message}`;
      }
    } else {
      errorMessage = '发生未知错误，请重试';
    }

    this.showError(errorMessage);
  }

  handleImageError(errorType) {
    const t = this.app.languageManager.getTranslations();
    let errorMessage;

    switch (errorType) {
      case 'invalidFileType':
        errorMessage = t.errorMessages.invalidFileType;
        break;
      case 'gifNotSupported':
        errorMessage = t.errorMessages.gifNotSupported;
        break;
      case 'fileTooLarge':
        errorMessage = t.errorMessages.fileTooLarge;
        break;
      case 'imageProcessFailed':
        errorMessage = t.errorMessages.imageProcessFailed;
        break;
      default:
        errorMessage = '图片处理错误';
    }

    this.showError(errorMessage);
  }

  handleInputError() {
    const t = this.app.languageManager.getTranslations();
    this.showError(t.errorMessages.noInput);
  }
}
