// 错误处理组件
class ErrorHandler {
  constructor(app) {
    this.app = app;
    this.hideTimer = null;
  }

  // 显示错误信息
  showError(message) {
    this.app.elements.errorDiv.textContent = message;
    this.app.elements.errorDiv.hidden = false;

    // 3秒后自动隐藏错误信息（先清除上一个定时器，避免新错误被提前隐藏）
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    this.hideTimer = setTimeout(() => {
      this.hideError();
    }, 3000);
  }

  // 隐藏错误信息
  hideError() {
    this.app.elements.errorDiv.hidden = true;
  }
}
