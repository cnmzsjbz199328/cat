class ErrorHandler {
  constructor(app) {
    this.app = app;
    this.errorElement = document.getElementById('error');
    this.hideTimer = null;
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.errorElement.hidden = false;

    // 自动隐藏错误消息（先清除上一个定时器，避免新错误被提前隐藏）
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    this.hideTimer = setTimeout(() => {
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
        errorMessage = t.apiErrors.apiKey;
      } else if (error.message.includes('rate limit')) {
        errorMessage = t.apiErrors.rateLimit;
      } else if (error.message.includes('network')) {
        errorMessage = t.apiErrors.network;
      } else {
        errorMessage = `${t.apiErrors.prefix}: ${error.message}`;
      }
    } else {
      errorMessage = t.apiErrors.unknown;
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
