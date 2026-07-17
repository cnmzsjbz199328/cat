class APIManager {
  constructor(app) {
    this.app = app;
    this.host = APP_CONFIG.SEARCH_API.HOST;
  }

  async analyzeContent(prompt, imageData = null, sessionId = null) {
    const currentLang = this.app.languageManager.getCurrentLanguage();
    
    // 根据API文档构建请求体
    const body = {
      prompt: prompt,
      language: currentLang
    };

    // 如果有会话ID，添加到请求体
    if (sessionId) {
      body.session_id = sessionId;
    }

    // 如果有图片，添加图片对象（包含mime_type和data）
    if (imageData) {
      if (
        typeof imageData === 'object' &&
        imageData.data &&
        imageData.mime_type
      ) {
        body.image = {
          mime_type: imageData.mime_type,
          data: imageData.data
        };
      }
    }

    try {
      // 使用generate-text端点进行纯文本内容生成（日志不输出 base64 图片数据）
      debugLog('[API调用] /generate-text 请求参数:', { ...body, image: body.image ? `<${body.image.mime_type}>` : undefined });
      const res = await fetch(`${this.host}${APP_CONFIG.SEARCH_API.GENERATE_TEXT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      debugLog('[API调用] /generate-text 响应状态:', res.status, res.statusText);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      debugLog('[API调用] /generate-text 响应数据:', data);
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }
      // 返回包含内容和会话ID的结果
      return {
        content: data.data.story_markdown || '无法获取分析结果',
        sessionId: data.session_id
      };
    } catch (error) {
      console.error('[API调用] /generate-text 错误:', error);
      throw new Error(`Text generation failed: ${error.message}`, { cause: error });
    }
  }

  async generateImageStory(prompt, imageData, generateImages = true, sessionId = null) {
    // 图文解释模式，调用generate-picture接口
    const body = {
      prompt: prompt,
      language: this.app.languageManager.getCurrentLanguage()
    };

    // 如果有会话ID，添加到请求体
    if (sessionId) {
      body.session_id = sessionId;
    }

    if (imageData) {
      if (
        typeof imageData === 'object' &&
        imageData.data &&
        imageData.mime_type
      ) {
        body.image = {
          mime_type: imageData.mime_type,
          data: imageData.data
        };
      }
    }

    try {
      debugLog('[API调用] /generate-picture 请求参数:', { ...body, image: body.image ? `<${body.image.mime_type}>` : undefined });
      const res = await fetch(`${this.host}${APP_CONFIG.SEARCH_API.GENERATE_PICTURE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      debugLog('[API调用] /generate-picture 响应状态:', res.status, res.statusText);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      debugLog('[API调用] /generate-picture 响应数据:', data);
      if (!data.success) {
        throw new Error(data.error || 'Story generation failed');
      }
      // 返回统一的格式，包含会话ID
      return {
        content: data.data.story_markdown,
        sessionId: data.session_id,
        imageUrl: data.data.image_url
      };
      
    } catch (error) {
      throw new Error(`Story generation failed: ${error.message}`, { cause: error });
    }
  }
}
