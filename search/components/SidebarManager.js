class SidebarManager {
  constructor(app) {
    console.log('[SidebarManager] 构造函数开始', { app: !!app });
    this.app = app;
    this.isCollapsed = false;
    this.eventsbound = false;
    console.log('[SidebarManager] 开始调用 initializeSidebar');
    this.initializeSidebar();
    console.log('[SidebarManager] 构造函数完成');
    // bindEvents已在initializeSidebar中调用，不需要重复
  }

  initializeSidebar() {
    console.log('[SidebarManager] initializeSidebar 开始');
    this.createSidebarHTML();
    this.bindEvents();

    // 检查屏幕尺寸并设置相应模式
    this.checkScreenSize();
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });

    this.updateSessionList();
    console.log('[SidebarManager] initializeSidebar 完成');
  }

  updateLanguage(lang) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const translations = this.app.languageManager.getTranslations();

    sidebar.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });

    sidebar.querySelectorAll('[data-lang-key-placeholder]').forEach(element => {
        const key = element.getAttribute('data-lang-key-placeholder');
        if (translations[key]) {
            element.placeholder = translations[key];
        }
    });

    sidebar.querySelectorAll('[data-lang-key-title]').forEach(element => {
        const key = element.getAttribute('data-lang-key-title');
        if (translations[key]) {
            element.title = translations[key];
        }
    });

    // 更新会话列表以反映语言变化
    this.updateSessionList();
  }

  checkScreenSize() {
    if (window.innerWidth <= 768) {
      console.log('[SidebarManager] 检测到移动端屏幕，设置移动端侧边栏');
      this.setupMobileSidebar();
    } else {
      console.log('[SidebarManager] 检测到桌面端屏幕，设置桌面端侧边栏');
      this.removeMobileElements();
      const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      if (isCollapsed) {
        this.isCollapsed = true;
        this.applyCollapsedState(true);
      }
    }
  }

  removeMobileElements() {
    const mobileToggle = document.querySelector('.mobile-sidebar-toggle');
    const mobileOverlay = document.querySelector('.mobile-sidebar-overlay');
    
    if (mobileToggle) {
      mobileToggle.remove();
      console.log('[SidebarManager] 移动端切换按钮已移除');
    }
    
    if (mobileOverlay) {
      mobileOverlay.remove();
      console.log('[SidebarManager] 移动端遮罩层已移除');
    }
    
    // 重置侧边栏状态
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  }

  createSidebarHTML() {
    console.log('[SidebarManager] createSidebarHTML 开始');
    const container = document.querySelector('.container');
    if (!container) {
      console.error('[SidebarManager] 找不到 .container 元素');
      return;
    }

    // 防止重复创建：如果已存在sidebar，直接返回
    const existingSidebar = document.getElementById('sidebar');
    if (existingSidebar) {
      console.log('[SidebarManager] Sidebar 已存在，跳过创建');
      return;
    }

    console.log('[SidebarManager] 开始创建新的 sidebar 元素');
    // 创建侧边栏元素
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <h3 data-lang-key="sessionManagement">会话管理</h3>
        <div class="sidebar-controls">
          <button id="new-session-btn" class="control-btn" title="新建会话" data-lang-key-title="newSessionTooltip">
            ➕
          </button>
          <button id="toggle-sidebar-btn" class="control-btn" title="收起侧边栏" data-lang-key-title="collapseSidebarTooltip">
            ◀
          </button>
        </div>
      </div>
      
      <div class="sidebar-search">
        <input type="text" id="session-search" placeholder="搜索会话..." data-lang-key-placeholder="searchPlaceholder" />
      </div>
      
      <div class="session-list-container">
        <div id="session-list" class="session-list">
          <!-- 会话列表将在这里动态生成 -->
        </div>
      </div>
      
      <div class="sidebar-footer">
        <button id="export-all-btn" class="footer-btn" data-lang-key="exportAll">📤 导出数据</button>
        <button id="clear-sessions-btn" class="footer-btn" data-lang-key="clearStorage">🗑️ 清理存储</button>
      </div>
    `;

    // 将侧边栏插入到容器中（作为第一个子元素）
    const mainContent = container.querySelector('.main-content');
    container.insertBefore(sidebar, mainContent);

    // 确保主内容区域有正确的grid-area
    if (mainContent) {
      mainContent.style.gridArea = 'main';
    }

    console.log('[SidebarManager] Sidebar 创建并插入成功');
  }

  bindEvents() {
    console.log('[SidebarManager] bindEvents 开始', { eventsbound: this.eventsbound });
    // 防止重复绑定事件
    if (this.eventsbound) {
      console.log('[SidebarManager] 事件已绑定，跳过');
      return;
    }

    // 新建会话按钮
    const newSessionBtn = document.getElementById('new-session-btn');
    if (newSessionBtn) {
      newSessionBtn.addEventListener('click', () => {
        console.log('[SidebarManager] 新建会话按钮点击');
        this.createNewSession();
      });
      console.log('[SidebarManager] 新建会话按钮事件绑定成功');
    } else {
      console.warn('[SidebarManager] 找不到新建会话按钮');
    }

    // 切换侧边栏按钮
    const toggleBtn = document.getElementById('toggle-sidebar-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        console.log('[SidebarManager] 切换侧边栏按钮点击');
        this.toggleSidebar();
      });
      console.log('[SidebarManager] 切换侧边栏按钮事件绑定成功');
    } else {
      console.warn('[SidebarManager] 找不到切换侧边栏按钮');
    }

    // 搜索会话
    const searchInput = document.getElementById('session-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        console.log('[SidebarManager] 搜索输入:', e.target.value);
        this.filterSessions(e.target.value);
      });
      console.log('[SidebarManager] 搜索输入框事件绑定成功');
    } else {
      console.warn('[SidebarManager] 找不到搜索输入框');
    }

    // 导出所有数据
    const exportBtn = document.getElementById('export-all-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        console.log('[SidebarManager] 导出全部按钮点击');
        this.exportAllSessions();
      });
      console.log('[SidebarManager] 导出全部按钮事件绑定成功');
    } else {
      console.warn('[SidebarManager] 找不到导出全部按钮');
    }

    // 清理存储
    const clearBtn = document.getElementById('clear-sessions-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        console.log('[SidebarManager] 清理存储按钮点击');
        this.clearAllSessions();
      });
      console.log('[SidebarManager] 清理存储按钮事件绑定成功');
    } else {
      console.warn('[SidebarManager] 找不到清理存储按钮');
    }

    // 会话列表点击事件（事件委托）
    const sessionList = document.getElementById('session-list');
    if (sessionList) {
      sessionList.addEventListener('click', (e) => {
        console.log('[SidebarManager] 会话列表点击事件');
        this.handleSessionListClick(e);
      });
      console.log('[SidebarManager] 会话列表事件绑定成功');
    } else {
      console.warn('[SidebarManager] 找不到会话列表');
    }

    this.eventsbound = true;
    console.log('[SidebarManager] 所有事件绑定完成');
  }

  createNewSession() {
    const session = this.app.sessionManager.createSession();
    
    // 清空当前输入和输出
    this.app.uiManager.clearInput();
    this.app.uiManager.clearOutput();
    
    // 聚焦输入框
    this.app.uiManager.focusInput();
    
    // 手动更新侧边栏UI（因为createSession不再自动更新）
    this.updateSessionList();
    
    console.log('Created new session:', session.id);
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
        this.toggleMobileSidebar();
        return;
    }
    this.isCollapsed = !this.isCollapsed;
    this.applyCollapsedState(this.isCollapsed);
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }

  applyCollapsedState(isCollapsed) {
    const sidebar = document.getElementById('sidebar');
    const container = document.querySelector('.container');
    const toggleBtn = document.getElementById('toggle-sidebar-btn');

    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        container.style.gridTemplateColumns = '60px 1fr';
        toggleBtn.innerHTML = '▶';
        toggleBtn.title = '展开侧边栏';
    } else {
        sidebar.classList.remove('collapsed');
        container.style.gridTemplateColumns = '280px 1fr';
        toggleBtn.innerHTML = '◀';
        toggleBtn.title = '收起侧边栏';
    }
  }

  setupMobileSidebar() {
    console.log('[SidebarManager] setupMobileSidebar 开始');
    
    // 检查是否已经存在移动端按钮，防止重复创建
    const existingToggle = document.querySelector('.mobile-sidebar-toggle');
    const existingOverlay = document.querySelector('.mobile-sidebar-overlay');
    
    if (existingToggle && existingOverlay) {
      console.log('[SidebarManager] 移动端元素已存在，跳过创建');
      return;
    }

    // 创建移动端切换按钮
    if (!existingToggle) {
      const mobileToggle = document.createElement('button');
      mobileToggle.className = 'mobile-sidebar-toggle';
      mobileToggle.innerHTML = '☰';
      mobileToggle.setAttribute('aria-label', '打开菜单');
      mobileToggle.style.cssText = `
        position: fixed !important;
        background: #7B9A8E !important;
        color: white !important;
        border: none !important;
        border-radius: 50% !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 18px !important;
        cursor: pointer !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
      `;
      document.body.appendChild(mobileToggle);
      console.log('[SidebarManager] 移动端切换按钮已创建');
      
      mobileToggle.addEventListener('click', () => {
        console.log('[SidebarManager] 移动端切换按钮被点击');
        this.toggleMobileSidebar(true);
      });
    }

    // 创建遮罩层
    if (!existingOverlay) {
      const overlay = document.createElement('div');
      overlay.className = 'mobile-sidebar-overlay';
      document.body.appendChild(overlay);
      console.log('[SidebarManager] 移动端遮罩层已创建');
      
      overlay.addEventListener('click', () => {
        console.log('[SidebarManager] 遮罩层被点击，关闭侧边栏');
        this.toggleMobileSidebar(false);
      });
    }
    
    console.log('[SidebarManager] setupMobileSidebar 完成');
    
    // 调试信息：检查元素是否正确创建
    setTimeout(() => {
      const toggleBtn = document.querySelector('.mobile-sidebar-toggle');
      const overlay = document.querySelector('.mobile-sidebar-overlay');
      console.log('[SidebarManager] 移动端元素检查:', {
        toggleButton: toggleBtn ? '已创建' : '未找到',
        overlay: overlay ? '已创建' : '未找到',
        screenWidth: window.innerWidth,
        isMobile: window.innerWidth <= 768
      });
    }, 100);
  }

  toggleMobileSidebar(isOpen) {
    console.log('[SidebarManager] toggleMobileSidebar', { isOpen });
    
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.mobile-sidebar-overlay');
    
    if (!sidebar) {
      console.error('[SidebarManager] 找不到 sidebar 元素');
      return;
    }
    
    if (!overlay) {
      console.error('[SidebarManager] 找不到 overlay 元素');
      return;
    }

    if (isOpen) {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        console.log('[SidebarManager] 侧边栏已打开');
    } else {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // 恢复背景滚动
        console.log('[SidebarManager] 侧边栏已关闭');
    }
  }

  updateSessionList() {
    console.log('[SidebarManager] updateSessionList 开始');
    const sessionListElement = document.getElementById('session-list');
    if (!sessionListElement) {
      console.error('[SidebarManager] 找不到 session-list 元素');
      return;
    }

    const sessions = this.app.sessionManager.getSessions();
    console.log('[SidebarManager] 获取到会话数据:', { sessionCount: sessions.length });
    const sortedSessions = this.sortSessionsByDate(sessions);
    
    if (sortedSessions.length === 0) {
      sessionListElement.innerHTML = `
        <div class="empty-sessions">
          <p>暂无会话</p>
          <p class="empty-hint">点击 ➕ 创建新会话</p>
        </div>
      `;
      console.log('[SidebarManager] 显示空会话状态');
      return;
    }

    sessionListElement.innerHTML = sortedSessions
      .map(session => this.renderSessionItem(session))
      .join('');
    console.log('[SidebarManager] 会话列表渲染完成，共', sortedSessions.length, '个会话');
  }

  renderSessionItem(session) {
    const icons = this.getSessionIcons(session);
    const lastMessage = session.messages[session.messages.length - 1];
    const preview = this.generatePreview(lastMessage);
    const isActive = session.id === this.app.sessionManager.getCurrentSessionId();
    const t = this.app.languageManager.getTranslations();
    
    return `
      <div class="session-item ${isActive ? 'active' : ''}" 
           data-session-id="${session.id}">
        <div class="session-header">
          <span class="session-title" title="${session.title}">${session.title}</span>
          <div class="session-icons">${icons}</div>
        </div>
        <div class="session-preview">${preview}</div>
        <div class="session-meta">
          <span class="message-count">${session.metadata.messageCount} ${t.messagesCount}</span>
          <span class="last-updated">${this.formatDate(session.updatedAt)}</span>
        </div>
        <div class="session-actions">
          <button class="action-btn rename" data-action="rename" title="重命名">✏️</button>
          <button class="action-btn export" data-action="export" title="导出">📤</button>
          <button class="action-btn delete" data-action="delete" title="删除">🗑️</button>
        </div>
      </div>
    `;
  }

  getSessionIcons(session) {
    const icons = [];
    if (session.metadata.hasStoryContent) icons.push('📚');
    if (session.metadata.hasImageContent) icons.push('🖼️');
    if (session.metadata.apiUsed.includes('gemini')) icons.push('🤖');
    return icons.join(' ');
  }

  generatePreview(lastMessage) {
    const t = this.app.languageManager.getTranslations();
    
    if (!lastMessage) return t.newSessionTitle;
    
    let content = '';
    if (lastMessage.type === 'user') {
      content = lastMessage.content;
    } else if (lastMessage.type === 'assistant') {
      if (typeof lastMessage.content === 'object' && lastMessage.content.content) {
        content = lastMessage.content.content;
      } else {
        content = lastMessage.content;
      }
    }
    
    // 确保content是字符串类型
    if (typeof content !== 'string') {
      content = content ? String(content) : t.newSessionTitle;
    }
    
    // 提取纯文本并截断
    const plainText = content.replace(/[#*`\n]/g, '').trim();
    return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    const t = this.app.languageManager.getTranslations();
    const currentLang = this.app.languageManager.getCurrentLanguage();
    
    if (diffInHours < 1) {
      return t.justNow;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ${t.hoursAgo}`;
    } else if (diffInHours < 48) {
      return t.yesterday;
    } else {
      // 根据语言选择不同的日期格式
      if (currentLang === 'en') {
        return date.toLocaleDateString('en-US', { 
          month: 'numeric', 
          day: 'numeric' 
        });
      } else {
        return date.toLocaleDateString('zh-CN', { 
          month: 'numeric', 
          day: 'numeric' 
        });
      }
    }
  }

  sortSessionsByDate(sessions) {
    return sessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  updateActiveSession(sessionId) {
    // 移除所有活跃状态
    document.querySelectorAll('.session-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // 添加新的活跃状态
    const activeItem = document.querySelector(`[data-session-id="${sessionId}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  handleSessionListClick(event) {
    const sessionItem = event.target.closest('.session-item');
    if (!sessionItem) return;

    const sessionId = sessionItem.dataset.sessionId;
    const action = event.target.dataset.action;

    // 阻止事件冒泡
    event.stopPropagation();

    switch (action) {
      case 'rename':
        this.renameSession(sessionId);
        break;
      case 'export':
        this.exportSession(sessionId);
        break;
      case 'delete':
        this.deleteSession(sessionId);
        break;
      default:
        // 点击会话项目本身，切换到该会话
        if (!event.target.classList.contains('action-btn')) {
          this.switchToSession(sessionId);
        }
        break;
    }
  }

  switchToSession(sessionId) {
    this.app.sessionManager.setCurrentSessionId(sessionId);
    
    // 显示该会话的历史记录
    const session = this.app.sessionManager.getSession(sessionId);
    if (session && this.app.contentRenderer) {
      this.app.contentRenderer.showSessionHistory(session);
    }
    
    // 更新UI状态
    this.updateSessionList();
  }

  renameSession(sessionId) {
    const session = this.app.sessionManager.getSession(sessionId);
    if (!session) return;

    const newTitle = prompt('请输入新的会话名称:', session.title);
    if (newTitle && newTitle.trim() && newTitle.trim() !== session.title) {
      this.app.sessionManager.renameSession(sessionId, newTitle.trim());
    }
  }

  exportSession(sessionId) {
    if (this.app.dataExportManager) {
      this.app.dataExportManager.exportSession(sessionId);
    } else {
      console.warn('DataExportManager not available');
    }
  }

  deleteSession(sessionId) {
    const session = this.app.sessionManager.getSession(sessionId);
    if (!session) return;

    const confirmMessage = `确定要删除会话 "${session.title}" 吗？此操作不可恢复。`;
    if (confirm(confirmMessage)) {
      this.app.sessionManager.deleteSession(sessionId);
    }
  }

  filterSessions(searchTerm) {
    const sessionItems = document.querySelectorAll('.session-item');
    const term = searchTerm.toLowerCase().trim();

    sessionItems.forEach(item => {
      const title = item.querySelector('.session-title').textContent.toLowerCase();
      const preview = item.querySelector('.session-preview').textContent.toLowerCase();
      
      if (title.includes(term) || preview.includes(term)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  exportAllSessions() {
    if (this.app.dataExportManager) {
      this.app.dataExportManager.exportAllSessions();
    } else {
      console.warn('DataExportManager not available');
    }
  }

  clearAllSessions() {
    const stats = this.app.sessionManager.getSessionStats();
    const confirmMessage = `确定要清空所有会话吗？\n\n当前有 ${stats.totalSessions} 个会话，共 ${stats.totalMessages} 条消息。\n\n此操作不可恢复！`;
    
    if (confirm(confirmMessage)) {
      // 清空所有会话
      localStorage.removeItem('sessions');
      this.app.sessionManager.sessions = {};
      this.app.sessionManager.currentSessionId = null;
      
      // 清空界面
      this.app.uiManager.clearOutput();
      this.updateSessionList();
      
      console.log('All sessions cleared');
    }
  }
}
