class DataExportManager {
  constructor(app) {
    this.app = app;
  }

  // 导出单个会话为JSON格式
  exportSession(sessionId, format = 'json') {
    const session = this.app.sessionManager.getSession(sessionId);
    if (!session) {
      console.error('Session not found:', sessionId);
      this.showToast('会话未找到', 'error');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const safeTitle = session.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    const filename = `session_${safeTitle}_${timestamp}.json`;

    const exportData = {
      title: session.title,
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      metadata: {
        messageCount: session.metadata.messageCount,
        hasStoryContent: session.metadata.hasStoryContent,
        hasImageContent: session.metadata.hasImageContent,
        apiUsed: session.metadata.apiUsed
      },
      messages: session.messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
        model: msg.model || 'unknown',
        hasImage: !!msg.image,
        imageData: msg.image || null
      })),
      exportInfo: {
        exportedAt: new Date().toISOString(),
        exportFormat: 'JSON',
        exportType: 'single_session',
        appVersion: '1.0'
      }
    };

    this.downloadFile(
      JSON.stringify(exportData, null, 2),
      filename,
      'application/json'
    );

    this.showToast(`会话 "${session.title}" 已导出`);
    console.log('Single session exported:', sessionId);
  }

  // 导出所有会话为JSON格式
  exportAllSessions() {
    const sessions = this.app.sessionManager.getSessions();
    if (sessions.length === 0) {
      this.showToast('没有可导出的会话', 'warning');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `all_sessions_${timestamp}.json`;

    const exportData = {
      metadata: {
        totalSessions: sessions.length,
        exportedAt: new Date().toISOString(),
        exportFormat: 'JSON',
        exportType: 'all_sessions',
        appVersion: '1.0'
      },
      statistics: this.app.sessionManager.getSessionStats(),
      sessions: sessions.map(session => ({
        title: session.title,
        id: session.id,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        metadata: {
          messageCount: session.metadata.messageCount,
          hasStoryContent: session.metadata.hasStoryContent,
          hasImageContent: session.metadata.hasImageContent,
          apiUsed: session.metadata.apiUsed
        },
        messages: session.messages.map(msg => ({
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp,
          model: msg.model || 'unknown',
          hasImage: !!msg.image,
          imageData: msg.image || null
        }))
      }))
    };

    this.downloadFile(
      JSON.stringify(exportData, null, 2),
      filename,
      'application/json'
    );

    this.showToast(`已导出 ${sessions.length} 个会话`);
    console.log('All sessions exported:', sessions.length);
  }

  // 通用下载文件方法
  downloadFile(content, filename, mimeType) {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      console.log(`文件已导出: ${filename}`);
      return true;
    } catch (error) {
      console.error('导出文件失败:', error);
      this.showToast('导出失败，请重试', 'error');
      return false;
    }
  }

  // 显示提示消息
  showToast(message, type = 'success') {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 样式
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d4edda'};
      color: ${type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#155724'};
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#c3e6cb'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-size: 14px;
      max-width: 300px;
      animation: slideInRight 0.3s ease;
    `;

    // 添加动画样式
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // 3秒后自动消失
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // 导入会话功能（将来可能用到）
  async importSessions(fileContent) {
    try {
      const data = JSON.parse(fileContent);
      
      if (data.exportType === 'single_session') {
        // 导入单个会话
        this.app.sessionManager.importSession(data);
        this.showToast(`会话 "${data.title}" 已导入`);
      } else if (data.exportType === 'all_sessions') {
        // 导入所有会话
        let imported = 0;
        data.sessions.forEach(session => {
          if (this.app.sessionManager.importSession(session)) {
            imported++;
          }
        });
        this.showToast(`已导入 ${imported} 个会话`);
      }
      
      // 更新UI
      if (this.app.sidebarManager) {
        this.app.sidebarManager.updateSessionList();
      }
      
      return true;
    } catch (error) {
      console.error('导入失败:', error);
      this.showToast('导入失败，文件格式不正确', 'error');
      return false;
    }
  }
}
