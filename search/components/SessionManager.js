class SessionManager {
  constructor(app) {
    this.app = app;
    this.currentSessionId = null;
    this.sessions = this.loadSessions();
  }

  // 生成唯一的会话ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 生成消息ID
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 生成会话标题
  generateSessionTitle() {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const date = now.toLocaleDateString('zh-CN', { 
      month: 'numeric', 
      day: 'numeric' 
    });
    return `会话 ${date} ${time}`;
  }

  // 创建新会话
  createSession(title = null) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      title: title || this.generateSessionTitle(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      metadata: {
        language: this.app.languageManager.getCurrentLanguage(),
        messageCount: 0,
        apiUsed: [], // 记录使用过的API类型
        hasStoryContent: false, // 是否包含故事内容
        hasImageContent: false  // 是否包含图片内容
      }
    };
    
    this.sessions[sessionId] = session;
    this.currentSessionId = sessionId;
    this.saveSession(session);
    
    // 更新侧边栏显示
    if (this.app.sidebarManager) {
      this.app.sidebarManager.updateSessionList();
    }
    
    return session;
  }

  // 添加消息到会话
  addMessage(sessionId, type, content, imageData = null, apiType = 'gemini') {
    const session = this.sessions[sessionId];
    if (!session) {
      console.warn(`Session ${sessionId} not found`);
      return null;
    }

    const message = {
      id: this.generateMessageId(),
      type: type, // 'user' | 'assistant'
      content: content,
      imageData: imageData,
      apiType: apiType, // 'gemini' | 'story'
      timestamp: new Date().toISOString()
    };

    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
    session.metadata.messageCount = session.messages.length;
    
    // 更新元数据
    if (!session.metadata.apiUsed.includes(apiType)) {
      session.metadata.apiUsed.push(apiType);
    }
    
    if (apiType === 'story') {
      session.metadata.hasStoryContent = true;
    }
    
    if (imageData) {
      session.metadata.hasImageContent = true;
    }
    
    this.saveSession(session);
    
    // 更新侧边栏显示
    if (this.app.sidebarManager) {
      this.app.sidebarManager.updateSessionList();
    }
    
    return message;
  }

  // 获取当前会话ID
  getCurrentSessionId() {
    return this.currentSessionId;
  }

  // 设置当前会话ID
  setCurrentSessionId(sessionId) {
    if (this.sessions[sessionId]) {
      this.currentSessionId = sessionId;
      
      // 更新侧边栏活跃状态
      if (this.app.sidebarManager) {
        this.app.sidebarManager.updateActiveSession(sessionId);
      }
      
      // 恢复会话内容
      this.restoreSessionContent(sessionId);
    }
  }

  // 恢复会话内容到主界面
  restoreSessionContent(sessionId) {
    const session = this.sessions[sessionId];
    if (!session || session.messages.length === 0) {
      // 清空输出区域
      this.app.uiManager.clearOutput();
      return;
    }

    // 显示最后一条助手消息
    const lastAssistantMessage = session.messages
      .filter(msg => msg.type === 'assistant')
      .pop();

    if (lastAssistantMessage) {
      if (lastAssistantMessage.apiType === 'story' && lastAssistantMessage.content.imageUrl) {
        this.app.contentRenderer.showContent(lastAssistantMessage.content, 'story');
      } else {
        this.app.contentRenderer.showContent(lastAssistantMessage.content, lastAssistantMessage.apiType);
      }
    }
  }

  // 获取所有会话
  getSessions() {
    return Object.values(this.sessions);
  }

  // 获取特定会话
  getSession(sessionId) {
    return this.sessions[sessionId];
  }

  // 删除会话
  deleteSession(sessionId) {
    if (this.sessions[sessionId]) {
      delete this.sessions[sessionId];
      
      // 如果删除的是当前会话，清空当前会话ID
      if (this.currentSessionId === sessionId) {
        this.currentSessionId = null;
        this.app.uiManager.clearOutput();
      }
      
      this.saveSessions();
      
      // 更新侧边栏显示
      if (this.app.sidebarManager) {
        this.app.sidebarManager.updateSessionList();
      }
    }
  }

  // 重命名会话
  renameSession(sessionId, newTitle) {
    const session = this.sessions[sessionId];
    if (session) {
      session.title = newTitle;
      session.updatedAt = new Date().toISOString();
      this.saveSession(session);
      
      // 更新侧边栏显示
      if (this.app.sidebarManager) {
        this.app.sidebarManager.updateSessionList();
      }
    }
  }

  // 从LocalStorage加载会话
  loadSessions() {
    try {
      const sessionsData = localStorage.getItem('sessions');
      return sessionsData ? JSON.parse(sessionsData) : {};
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return {};
    }
  }

  // 保存单个会话
  saveSession(session) {
    this.sessions[session.id] = session;
    this.saveSessions();
  }

  // 保存所有会话到LocalStorage
  saveSessions() {
    try {
      localStorage.setItem('sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Failed to save sessions:', error);
      
      // 如果存储空间不足，尝试清理旧会话
      this.cleanupOldSessions();
      try {
        localStorage.setItem('sessions', JSON.stringify(this.sessions));
      } catch (retryError) {
        console.error('Failed to save sessions after cleanup:', retryError);
      }
    }
  }

  // 清理旧会话（保留最近50个）
  cleanupOldSessions() {
    const sessions = Object.values(this.sessions);
    if (sessions.length <= 50) return;

    // 按更新时间排序，保留最新的50个
    const sortedSessions = sessions.sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    const sessionsToKeep = sortedSessions.slice(0, 50);
    const newSessions = {};
    
    sessionsToKeep.forEach(session => {
      newSessions[session.id] = session;
    });

    this.sessions = newSessions;
    
    console.log(`Cleaned up old sessions, kept ${sessionsToKeep.length} sessions`);
  }

  // 获取会话统计信息
  getSessionStats() {
    const sessions = Object.values(this.sessions);
    return {
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, session) => sum + session.metadata.messageCount, 0),
      storySessions: sessions.filter(session => session.metadata.hasStoryContent).length,
      imageSessions: sessions.filter(session => session.metadata.hasImageContent).length
    };
  }
}
