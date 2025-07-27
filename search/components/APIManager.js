class APIManager {
  constructor(app) {
    this.app = app;
    this.host = "https://catbackend.tj15982183241.workers.dev";
  }

  async analyzeContent(prompt, imageData = null) {
    const currentLang = this.app.languageManager.getCurrentLanguage();
    
    // 构建请求体 - 适配search项目的通用分析需求
    const body = {
      prompt: prompt,
      language: currentLang,
      analysis_type: 'general', // 通用分析类型
      output_format: 'text' // 文本输出格式
    };

    // 如果有图片，添加图片数据
    if (imageData) {
      body.image = {
        mime_type: imageData.file.type,
        data: imageData.base64
      };
    }

    try {
      const res = await fetch(`${this.host}/api/analyze-content`, {
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
      
      return data.data.content || data.data;
      
    } catch (error) {
      // 如果新的分析接口不存在，降级使用原有的故事生成接口
      console.warn('Analysis API not available, falling back to story generation:', error);
      return await this.fallbackToStoryGeneration(prompt, imageData, currentLang);
    }
  }

  async fallbackToStoryGeneration(prompt, imageData, language) {
    // 降级方案：使用原有的故事生成接口进行通用分析
    const body = {
      prompt: prompt, // 直接使用原始prompt，不添加额外前缀
      num_images: 1, // 最少图片数量
      animal: 'cat', // 保持默认
      language: language
    };

    if (imageData) {
      // 根据原后端期望的格式发送图片数据
      body.image = {
        mime_type: imageData.file.type,
        data: imageData.base64
      };
    }

    try {
      const res = await fetch(`${this.host}/api/generate-story`, {
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
      
      // 处理原后端返回的分步故事格式
      if (data.data && Array.isArray(data.data)) {
        // 提取所有句子内容组成完整分析结果
        const analysisText = data.data.map(step => step.sentence).join('\n\n');
        return {
          content: analysisText,
          steps: data.data, // 保留原始分步数据
          hasImages: data.data.some(step => step.image_url)
        };
      }
      
      return {
        content: '分析完成，但未能获取结果内容。',
        steps: [],
        hasImages: false
      };
      
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async generateImageStory(prompt, imageData, generateImages, animalType = 'cat', numImages = 2) {
    // 图文解释模式，直接调用原有的故事生成接口
    const body = {
      prompt: prompt,
      num_images: generateImages ? parseInt(numImages) : 0,
      animal: animalType,
      language: this.app.languageManager.getCurrentLanguage()
    };

    if (imageData) {
      // 根据原后端期望的格式发送图片数据
      body.image = {
        mime_type: imageData.file.type,
        data: imageData.base64
      };
    }

    try {
      const res = await fetch(`${this.host}/api/generate-story`, {
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
      
      // 返回原后端的分步数据格式
      return {
        success: true,
        data: data.data // 这是分步故事数组
      };
      
    } catch (error) {
      throw new Error(`Story generation failed: ${error.message}`);
    }
  }
}
