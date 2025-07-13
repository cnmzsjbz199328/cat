// 错误处理组件
class ErrorHandler {
  constructor(app) {
    this.app = app;
  }

  // 显示错误信息
  showError(message) {
    this.app.elements.errorDiv.textContent = message;
    this.app.elements.errorDiv.hidden = false;
    
    // 3秒后自动隐藏错误信息
    setTimeout(() => {
      this.hideError();
    }, 3000);
  }

  // 隐藏错误信息
  hideError() {
    this.app.elements.errorDiv.hidden = true;
  }
}
