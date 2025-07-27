class APIManager {
  constructor(app) {
    this.app = app;
    this.host = "https://search.tj15982183241.workers.dev";
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

    // 如果有图片，添加图片数据（Base64格式，不包含前缀）
    if (imageData) {
      body.image = imageData.base64.split(',')[1]; // 移除data:image前缀
    }

    try {
      // 使用generate-text端点进行内容生成
      const res = await fetch(`${this.host}/api/generate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }
      
      // 返回包含内容和会话ID的结果
      return {
        content: data.data.story_markdown || '无法获取分析结果',
        sessionId: data.session_id
      };
      
    } catch (error) {
      // 如果generate-text接口失败，降级使用generate-story接口
      console.warn('Generate-text API failed, falling back to generate-story:', error);
      return await this.fallbackToStoryGeneration(prompt, imageData, currentLang, sessionId);
    }
  }

  async fallbackToStoryGeneration(prompt, imageData, language, sessionId = null) {
    // 降级方案：使用generate-story接口
    const body = {
      prompt: prompt,
      language: language
    };

    // 如果有会话ID，添加到请求体
    if (sessionId) {
      body.session_id = sessionId;
    }

    if (imageData) {
      // 根据API文档，图片应该是Base64字符串（不包含前缀）
      body.image = imageData.base64.split(',')[1];
    }

    try {
      const res = await fetch(`${this.host}/api/generate-picture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }
      
      // 返回包含内容和会话ID的结果
      return {
        content: data.data.story_markdown || '分析完成，但未能获取结果内容。',
        sessionId: data.session_id
      };
      
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async generateImageStory(prompt, imageData, generateImages, animalType = 'cat', numImages = 2) {
    // 图文解释模式，调用generate-story接口
    const body = {
      prompt: prompt,
      language: this.app.languageManager.getCurrentLanguage()
    };

    if (imageData) {
      // 根据API文档，图片应该是Base64字符串（不包含前缀）
      body.image = imageData.base64.split(',')[1];
    }

    try {
      const res = await fetch(`${this.host}/api/generate-picture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Story generation failed');
      }
      
      // 返回符合API文档的数据格式
      return {
        success: true,
        data: {
          story_markdown: data.data.story_markdown,
          image_url: data.data.image_url
        }
      };
      
    } catch (error) {
      throw new Error(`Story generation failed: ${error.message}`);
    }
  }
}
