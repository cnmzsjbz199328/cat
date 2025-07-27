# 项目对比分析：原项目 vs 复刻项目

## 概览对比

| 方面 | 原项目 (主目录) | 复刻项目 (search/) |
|------|----------------|-------------------|
| **主要用途** | 猫咪故事生成器 | 通用内容分析工具 |
| **目标用户** | 猫咪爱好者 | 教育工作者、研究人员、内容创作者 |
| **核心功能** | 生成猫咪主题故事 | 分析任意内容并提供解释 |
| **视觉主题** | 猫咪相关设计 | 专业通用设计 |
| **架构复杂度** | 单文件架构 | 模块化组件架构 |

## 详细功能对比

### 1. 用户界面差异

#### 原项目特征
- **主题色彩**: 温暖的橙色调，符合猫咪主题
- **示例内容**: 全部与猫咪相关
  - "一只橘猫的冒险故事"
  - "小猫咪学会游泳"
  - "流浪猫找到家的故事"
- **默认设置**: 图片生成默认开启
- **标题**: "猫咪故事生成器"

#### 复刻项目特征
- **主题色彩**: 专业蓝色调，通用商务风格
- **示例内容**: 教育和通用分析导向
  - "分析这段文字的主要观点"
  - "解释量子物理学的基本概念"
  - "总结这篇文章的核心内容"
- **默认设置**: 图片生成默认关闭（用户可选）
- **标题**: "智能内容分析工具"

### 2. 功能实现差异

#### API 调用策略

**原项目**:
```javascript
// 单一API端点，专用于故事生成
const response = await fetch(`${API_BASE}/api/generate-story`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: userInput,        // 注意：使用 prompt 字段
    image: base64ImageData,   // 注意：使用 image 字段
    num_images: 2,           // 图片数量参数
    animal: 'cat',           // 动物类型参数
    language: 'zh'           // 语言参数
  })
});
```

**复刻项目**:
```javascript
// 优先使用分析端点，有备用方案
async analyzeContent(text, imageData, generateImages) {
  try {
    // 主要端点（实际不存在于原后端）
    return await this.callAPI('/api/analyze-content', {
      text, imageData, generateImages
    });
  } catch (error) {
    // 备用端点 - 实际使用原项目的 generate-story
    return await this.callAPI('/api/generate-story', {
      prompt: text,           // 适配字段名
      image: imageData,       // 适配字段名
      num_images: generateImages ? 2 : 0,
      animal: 'cat',
      language: this.getCurrentLanguage()
    });
  }
}
```

#### 组件架构对比

**原项目结构**:
```
script.js (单一文件)
├── 全局变量定义
├── API调用函数
├── 界面更新函数
├── 事件监听器
└── 主要逻辑
```

**复刻项目结构**:
```
components/ (模块化)
├── APIManager.js          # API调用管理
├── LanguageManager.js     # 多语言管理
├── ImageUploadManager.js  # 图片上传处理
├── UIManager.js           # 界面状态管理
├── ErrorHandler.js        # 错误处理
├── SlideRenderer.js       # 内容渲染
└── script-refactored.js   # 主控制逻辑
```

### 3. 用户体验差异

#### 交互流程对比

**原项目用户流程**:
1. 进入页面 → 看到猫咪主题界面
2. 选择猫咪相关示例或输入猫咪内容
3. 上传猫咪图片（可选）
4. 默认生成带图片的猫咪故事
5. 享受猫咪主题的故事内容

**复刻项目用户流程**:
1. 进入页面 → 看到专业分析工具界面
2. 选择通用分析示例或输入任意内容
3. 上传任意主题图片（可选）
4. 选择是否需要图片解释
5. 获得专业的内容分析结果

#### 界面布局优化

**原项目布局**:
```html
<!-- 传统分离式布局 -->
<div class="upload-area">...</div>
<div class="options-area">
  <input type="checkbox"> 生成图片
</div>
<div class="input-area">...</div>
```

**复刻项目布局**:
```html
<!-- 整合式布局 -->
<div id="image-upload-area">
  <label class="upload-label">...</label>
  <label class="checkbox-label">
    <input type="checkbox"> 生成图片解释
  </label>
</div>
<div class="input-container">...</div>
```

### 4. 技术实现差异

#### 后端架构分析

**重要发现**: 经过对原项目后端代码的审查，发现了关键的架构信息：

**原项目后端真实情况**:
- **唯一端点**: 只有 `/api/generate-story` 端点
- **专用参数**: 
  - `prompt` (不是 `text`)
  - `image` (不是 `imageData`) 
  - `num_images` (图片生成数量)
  - `animal` (动物类型，默认 'cat')
  - `language` (输出语言)
- **复杂处理流程**: 
  1. Gemini 2.5-flash 生成分步故事结构
  2. 智谱AI (Zhipu) 生成插图 (主要)
  3. Gemini 图像生成作为备用
- **输出格式**: 结构化的故事步骤数组，每步包含句子和对应图片

**复刻项目的适配策略**:
- **假设的 `/api/analyze-content`**: 实际上不存在于原后端
- **备用策略**: 实际上总是使用 `/api/generate-story`
- **参数映射**: 需要将前端参数映射到后端期望的格式
- **响应适配**: 需要处理后端返回的分步故事格式

#### 错误处理策略

**原项目**:
- 基础错误提示
- 简单的try-catch处理
- 有限的用户反馈

**复刻项目**:
- 专门的ErrorHandler组件
- 分层错误处理机制
- 详细的多语言错误消息
- 用户友好的错误恢复建议

#### 状态管理

**原项目**:
```javascript
// 简单的全局状态
let isLoading = false;
let currentLanguage = 'zh';
```

**复刻项目**:
```javascript
// 组件化状态管理
class UIManager {
  constructor() {
    this.state = {
      isLoading: false,
      hasContent: false,
      currentView: 'input'
    };
  }
}
```

### 5. 扩展性对比

#### 添加新功能的难易程度

**原项目**:
- ❌ 需要修改单一大文件
- ❌ 功能耦合度高
- ❌ 测试困难
- ✅ 结构简单，理解容易

**复刻项目**:
- ✅ 可独立添加新组件
- ✅ 低耦合，高内聚
- ✅ 便于单元测试
- ✅ 遵循设计模式

#### 维护性分析

**原项目维护挑战**:
1. 代码集中在单文件中，修改影响面大
2. 功能间相互依赖，难以独立调试
3. 添加新语言需要修改多个地方

**复刻项目维护优势**:
1. 组件化架构，修改影响局部化
2. 单一职责原则，便于定位问题
3. 配置化的多语言支持

### 6. 性能对比

#### 加载性能

**原项目**:
- ✅ 单文件加载，初始请求少
- ❌ 所有代码一次性加载
- 总体积：约 15KB

**复刻项目**:
- ❌ 多文件加载，初始请求多
- ✅ 可按需加载组件
- 总体积：约 25KB（但模块化）

#### 运行时性能
两个项目在运行时性能方面相似，主要瓶颈都在API调用和图片处理上。

### 7. 适用场景对比

#### 原项目最适合
- 🐱 猫咪爱好者社区
- 🎯 特定主题内容生成
- 📱 简单快速的故事创作
- 👶 技术要求不高的用户

#### 复刻项目最适合
- 🎓 教育培训机构
- 📊 内容分析需求
- 🔬 研究和学术用途
- 💼 商业内容创作
- 🌐 需要多语言支持的场景

### 8. 迁移建议

#### 从原项目迁移到复刻项目
```javascript
// 旧的API调用方式
generateStory(text, image, true);

// 新的API调用方式
apiManager.analyzeContent(text, image, userWantsImages);
```

#### 反向兼容性
复刻项目保持了与原项目API的兼容性，可以无缝处理原项目的数据格式。

### 9. 总结

#### 重要架构发现

通过对原项目后端代码的深入分析，发现了几个关键事实：

1. **单一端点架构**: 原后端只有 `/api/generate-story` 一个端点，不存在 `/api/analyze-content`
2. **复杂AI流水线**: 后端使用 Gemini 2.5-flash + 智谱AI + Gemini图像生成的多重AI服务
3. **参数适配需求**: 复刻项目需要进行前端到后端的参数映射
4. **响应格式处理**: 需要处理后端返回的分步故事格式并转换为分析结果

#### 技术债务与改进

**复刻项目的技术债务**:
- 假设了不存在的API端点
- 需要额外的参数映射层
- 响应格式转换开销

**建议的后端改进**:
```javascript
// 建议在原后端添加真正的分析端点
if (url.pathname === '/api/analyze-content' && request.method === 'POST') {
  return await handleAnalyzeContent(request, GOOGLE_API_KEY);
}

// 专门的分析处理函数
async function handleAnalyzeContent(request, GOOGLE_API_KEY) {
  // 直接返回分析文本，而不是分步故事
  // 简化的响应格式
}
```

#### 选择建议

**选择原项目，如果你：**
- 只需要猫咪主题的内容生成
- 希望简单快速上手
- 不需要复杂的功能扩展
- 偏好单文件部署

**选择复刻项目，如果你：**
- 需要通用的内容分析功能
- 计划长期维护和扩展
- 需要专业的界面和用户体验
- 有团队协作开发需求
- 需要灵活的功能配置

**原项目后端 workers**
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const GOOGLE_API_KEY = env.GOOGLE_API_KEY;
    const ZHIPU_API_KEY_1 = env.ZHIPU_API_KEY_1;
    const ZHIPU_API_KEY_2 = env.ZHIPU_API_KEY_2;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/generate-story' && request.method === 'POST') {
      return await handleGenerateStory(request, GOOGLE_API_KEY, [ZHIPU_API_KEY_1, ZHIPU_API_KEY_2]);
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};

// Gemini 文生图兜底方法
async function generateImageGemini(apiKey, prompt, animal) {
  const animalText = animal || 'cat';
  const enhancedPrompt = `${prompt}, cute minimal illustration, only use black ink (RGB: 0,0,0) lines on a pure white background (RGB: 255,255,255), simple, no shading, no color, no gray, no gradients, no textures, lots of tiny ${animalText}s as a metaphor, clear contrast, high clarity, focus on clean lines, no background elements except white`;

  const requestData = {
    contents: [{ parts: [{ text: enhancedPrompt }] }]
  };
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  const url = `${baseUrl}/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API request failed: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  if (
    json.candidates &&
    json.candidates[0] &&
    json.candidates[0].content &&
    json.candidates[0].content.parts &&
    json.candidates[0].content.parts[0] &&
    json.candidates[0].content.parts[0].inlineData &&
    json.candidates[0].content.parts[0].inlineData.data
  ) {
    const base64Data = json.candidates[0].content.parts[0].inlineData.data;
    return `data:image/png;base64,${base64Data}`;
  }
  throw new Error('Invalid response from Gemini image generation API');
}

async function callGoogleAI(apiKey, model, requestData) {
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  let url, body;
  if (model === 'gemini-2.5-flash') {
    url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    body = JSON.stringify(requestData);
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }
  return response.json();
}

async function generateStory(apiKey, prompt, image, numImages, animal, language) {
  const storySchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        sentence: { type: 'string' },
        image_prompt: { type: 'string' },
      },
      required: ['sentence', 'image_prompt'],
    },
  };
  const textPart = { text: `Explain the following topic or image: "${prompt}".` };
  let contents;
  if (image) {
    contents = { contents: [{ parts: [textPart, { inline_data: image }] }] };
  } else {
    contents = { contents: [{ parts: [textPart] }] };
  }

  // 语言映射表
  const languageMap = {
    zh: 'Chinese',
    ja: 'Japanese',
    en: 'English'
    // 可扩展更多语言
  };
  const langText = languageMap[language] || 'Chinese'; // 默认中文

  const animalText = animal || 'cat';
  const requestData = {
    ...contents,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: storySchema,
    },
    systemInstruction: {
      parts: [{
        text: `You are a creative storyteller. Your task is to explain a topic using a fun story about lots of tiny ${animalText}s as a metaphor. If an image is provided, the story must explain the concept in the image. Break the story down into exactly ${numImages} short, conversational, and engaging sentences. For each sentence, also create a simple but descriptive prompt for an image generation model to create a cute, minimal illustration with black ink on a white background, featuring ${animalText}s. Output the result as a JSON array of exactly ${numImages} objects, where each object has a "sentence" and an "image_prompt". **sentences must be strictly in ${langText}. Do not use any other language.**`
      }]
    }
  };
  const response = await callGoogleAI(apiKey, 'gemini-2.5-flash', requestData);
  if (response.candidates && response.candidates[0] && response.candidates[0].content) {
    const content = response.candidates[0].content.parts[0].text;
    return JSON.parse(content);
  } else {
    throw new Error('Invalid response from Gemini API');
  }
}

let zhipuKeyIndex = 0;
async function generateImageZhipu(prompt, zhipuApiKeys, animal) {
  const animalText = animal || 'cat';
  const enhancedPrompt = `${prompt}, cute minimal illustration, only use black ink (RGB: 0,0,0) lines on a pure white background (RGB: 255,255,255), simple, no shading, no color, no gray, no gradients, no textures, lots of tiny ${animalText}s as a metaphor, clear contrast, high clarity, focus on clean lines, no background elements except white`;
  const zhipuRequest = {
    model: "cogview-3-flash",
    prompt: enhancedPrompt
  };
  const apiKey = zhipuApiKeys[zhipuKeyIndex % zhipuApiKeys.length];
  zhipuKeyIndex++;
  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(zhipuRequest)
  });
  const responseBody = await response.json();
  if (responseBody.data && responseBody.data[0] && responseBody.data[0].url) {
    return responseBody.data[0].url;
  }
  throw new Error('Failed to generate image from Zhipu API');
}

async function handleGenerateStory(request, GOOGLE_API_KEY, ZHIPU_API_KEYS) {
  try {
    const requestData = await request.json();
    const { prompt, image, num_images, animal, language } = requestData;
    if (!prompt && !image) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Prompt or image is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    // 默认2步，默认cat
    const numImages = Math.max(1, Math.min(Number(num_images) || 2, 10)); // 限制1~10步
    const animalText = (animal || 'cat').toLowerCase();
    const lang = language || 'zh'; // 默认中文

    // 1. 生成分步故事结构
    const storyData = await generateStory(GOOGLE_API_KEY, prompt, image, numImages, animalText, lang);
    if (!storyData || storyData.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "The model didn't return a story. Please try another topic."
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    // 2. 轮询分配两个 Zhipu Key 生成图片，失败自动兜底 Gemini
    const results = [];
    for (let i = 0; i < storyData.length; i++) {
      const step = storyData[i];
      let imageUrl = null;
      try {
        imageUrl = await generateImageZhipu(step.image_prompt, ZHIPU_API_KEYS, animalText);
      } catch (e) {
        console.warn('Zhipu image generation failed, falling back to Gemini:', e.message);
        try {
          imageUrl = await generateImageGemini(GOOGLE_API_KEY, step.image_prompt, animalText);
        } catch (geminiError) {
          console.error('Gemini image generation also failed:', geminiError.message);
          imageUrl = null; // 或者设置为默认占位图
        }
      }
      results.push({
        sentence: step.sentence,
        image_prompt: step.image_prompt,
        image_url: imageUrl
      });
    }
    return new Response(JSON.stringify({
      success: true,
      data: results,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Generate story error:', error);
    let errorMessage = 'An unknown error occurred.';
    if (error.message) errorMessage = error.message;
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

**复刻项目理想后端 workers (建议实现)**
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const GOOGLE_API_KEY = env.GOOGLE_API_KEY;
    const ZHIPU_API_KEY_1 = env.ZHIPU_API_KEY_1;
    const ZHIPU_API_KEY_2 = env.ZHIPU_API_KEY_2;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 新增：专门的内容分析端点
    if (url.pathname === '/api/analyze-content' && request.method === 'POST') {
      return await handleAnalyzeContent(request, GOOGLE_API_KEY, [ZHIPU_API_KEY_1, ZHIPU_API_KEY_2]);
    }

    // 保留：原有的故事生成端点（向后兼容）
    if (url.pathname === '/api/generate-story' && request.method === 'POST') {
      return await handleGenerateStory(request, GOOGLE_API_KEY, [ZHIPU_API_KEY_1, ZHIPU_API_KEY_2]);
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};

// 新增：专门的内容分析处理函数
async function handleAnalyzeContent(request, GOOGLE_API_KEY, ZHIPU_API_KEYS) {
  try {
    const requestData = await request.json();
    const { text, imageData, generateImages, language, analysisType } = requestData;
    
    if (!text && !imageData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Text or image content is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const lang = language || 'zh';
    const analysis = analysisType || 'general';

    // 构建分析prompt
    let analysisPrompt = '';
    if (analysis === 'general') {
      analysisPrompt = `Please provide a comprehensive analysis and explanation of the following content: "${text}". Focus on key points, insights, and practical implications.`;
    } else if (analysis === 'educational') {
      analysisPrompt = `Please explain the following topic in an educational manner suitable for learning: "${text}". Break down complex concepts and provide clear explanations.`;
    } else if (analysis === 'summary') {
      analysisPrompt = `Please summarize the following content and highlight the main points: "${text}".`;
    }

    // 1. 生成文本分析
    const analysisResult = await generateAnalysis(GOOGLE_API_KEY, analysisPrompt, imageData, lang);
    
    if (!analysisResult) {
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to generate analysis. Please try again."
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    let responseData = {
      content: analysisResult,
      timestamp: new Date().toISOString(),
      analysisType: analysis,
      language: lang
    };

    // 2. 如果需要生成图片解释
    if (generateImages) {
      try {
        const imagePrompt = `Visual explanation of: ${text.substring(0, 100)}`;
        const imageUrl = await generateExplanationImage(imagePrompt, ZHIPU_API_KEYS);
        responseData.explanationImage = imageUrl;
      } catch (e) {
        console.warn('Image generation failed:', e.message);
        // 图片生成失败不影响主要分析结果
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Content analysis error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Analysis failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// 新增：专门的分析生成函数
async function generateAnalysis(apiKey, prompt, imageData, language) {
  const languageMap = {
    zh: 'Chinese',
    ja: 'Japanese', 
    en: 'English',
    ko: 'Korean'
  };
  const langText = languageMap[language] || 'Chinese';

  const textPart = { text: prompt };
  let contents;
  
  if (imageData) {
    contents = { 
      contents: [{ 
        parts: [
          textPart,
          { inline_data: {
              mime_type: imageData.mime_type || 'image/jpeg',
              data: imageData.data || imageData
            }
          }
        ] 
      }] 
    };
  } else {
    contents = { contents: [{ parts: [textPart] }] };
  }

  const requestData = {
    ...contents,
    systemInstruction: {
      parts: [{
        text: `You are an intelligent content analyst. Provide comprehensive, accurate, and insightful analysis of the given content. If an image is provided, analyze both the text and visual elements. Your response should be informative, well-structured, and educational. Always respond in ${langText}. Focus on clarity and practical value.`
      }]
    }
  };

  const response = await callGoogleAI(apiKey, 'gemini-2.5-flash', requestData);
  
  if (response.candidates && response.candidates[0] && response.candidates[0].content) {
    return response.candidates[0].content.parts[0].text;
  } else {
    throw new Error('Invalid response from Gemini API');
  }
}

// 新增：专门的解释图片生成函数
async function generateExplanationImage(prompt, zhipuApiKeys) {
  const enhancedPrompt = `${prompt}, educational illustration, clean minimalist design, professional diagram style, clear visual explanation, simple graphics, high contrast, informative layout, suitable for learning materials`;
  
  const zhipuRequest = {
    model: "cogview-3-flash",
    prompt: enhancedPrompt
  };
  
  const apiKey = zhipuApiKeys[Math.floor(Math.random() * zhipuApiKeys.length)];
  
  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(zhipuRequest)
  });
  
  const responseBody = await response.json();
  if (responseBody.data && responseBody.data[0] && responseBody.data[0].url) {
    return responseBody.data[0].url;
  }
  throw new Error('Failed to generate explanation image');
}

// 复用：Google AI调用函数（与原项目相同）
async function callGoogleAI(apiKey, model, requestData) {
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  let url, body;
  if (model === 'gemini-2.5-flash') {
    url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    body = JSON.stringify(requestData);
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }
  return response.json();
}

// 保留：原有的故事生成处理函数（完整实现，确保向后兼容）
async function handleGenerateStory(request, GOOGLE_API_KEY, ZHIPU_API_KEYS) {
  try {
    const requestData = await request.json();
    const { prompt, image, num_images, animal, language } = requestData;
    
    if (!prompt && !image) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Prompt or image is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    const numImages = Math.max(1, Math.min(Number(num_images) || 2, 10));
    const animalText = (animal || 'cat').toLowerCase();
    const lang = language || 'zh';

    // 使用原项目的故事生成逻辑
    const storyData = await generateStory(GOOGLE_API_KEY, prompt, image, numImages, animalText, lang);
    
    if (!storyData || storyData.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "The model didn't return a story. Please try another topic."
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const results = [];
    for (let i = 0; i < storyData.length; i++) {
      const step = storyData[i];
      let imageUrl = null;
      
      try {
        imageUrl = await generateImageZhipu(step.image_prompt, ZHIPU_API_KEYS, animalText);
      } catch (e) {
        console.warn('Zhipu image generation failed, falling back to Gemini:', e.message);
        try {
          imageUrl = await generateImageGemini(GOOGLE_API_KEY, step.image_prompt, animalText);
        } catch (geminiError) {
          console.error('Gemini image generation also failed:', geminiError.message);
          imageUrl = null;
        }
      }
      
      results.push({
        sentence: step.sentence,
        image_prompt: step.image_prompt,
        image_url: imageUrl
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: results,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
    
  } catch (error) {
    console.error('Generate story error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unknown error occurred.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// 原项目的其他辅助函数...
// (generateStory, generateImageZhipu, generateImageGemini 等)
```

## 后端架构对比总结

| 方面 | 原项目后端 | 复刻项目理想后端 |
|------|-----------|-----------------|
| **API端点** | `/api/generate-story` | `/api/analyze-content` + `/api/generate-story` |
| **主要用途** | 猫咪故事生成 | 通用内容分析 + 向后兼容 |
| **输入参数** | `prompt, image, num_images, animal, language` | `text, imageData, generateImages, language, analysisType` |
| **输出格式** | 分步故事数组 | 直接分析文本 + 可选图片 |
| **AI提示词** | 故事化，动物比喻 | 教育化，专业分析 |
| **图片风格** | 可爱动物插图 | 教育解释图表 |
| **系统指令** | 创意故事讲述者 | 智能内容分析师 |
| **兼容性** | 专用接口 | 双接口支持，完全兼容 |

这个理想的后端实现为复刻项目提供了专门优化的API支持，同时保持了与原项目的完全兼容性。
