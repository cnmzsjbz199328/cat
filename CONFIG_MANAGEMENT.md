## 配置管理改进总结

### ✅ 完成的更改

已成功将项目配置集中化，创建了统一的配置管理系统。

### 📁 新增文件

**[config.js](config.js)** - 统一配置文件
- 主应用 API 配置（`APP_CONFIG.API`）
- 搜索工具 API 配置（`APP_CONFIG.SEARCH_API`）
- 应用常量（`APP_CONFIG.APP`）
- 调试模式标志

### 🔄 已更新的文件

#### 主应用
1. **[components/APIManager.js](components/APIManager.js)**
   - `this.host` 改为使用 `APP_CONFIG.API.HOST`
   - 端点改为 `APP_CONFIG.API.GENERATE_STORY`

2. **[components/ImageUploadManager.js](components/ImageUploadManager.js)**
   - `this.maxFileSize` 改为 `APP_CONFIG.APP.MAX_FILE_SIZE`
   - `this.allowedTypes` 改为 `APP_CONFIG.APP.ALLOWED_IMAGE_TYPES`

3. **[index.html](index.html)**
   - 在 `<head>` 中添加了 `<script src="config.js"></script>`

#### 搜索工具
1. **[search/components/APIManager.js](search/components/APIManager.js)**
   - `this.host` 改为使用 `APP_CONFIG.SEARCH_API.HOST`
   - 端点改为 `APP_CONFIG.SEARCH_API.GENERATE_TEXT`
   - 端点改为 `APP_CONFIG.SEARCH_API.GENERATE_PICTURE`

2. **[search/index.html](search/index.html)**
   - 在 `<head>` 中添加了 `<script src="../config.js"></script>`

### 🎯 优势

1. **集中管理**：所有配置在一个文件中，便于维护
2. **易于扩展**：添加新的配置项不需要修改多个文件
3. **降低风险**：减少硬编码值，降低出错概率
4. **版本控制**：可以在 git 中轻松追踪配置变更
5. **环境切换**：未来可轻松实现不同环境（开发、测试、生产）的配置切换

### 🔧 如何使用

修改任何配置，只需编辑 [config.js](config.js)，所有依赖配置的模块都会自动使用新值。

例如，要切换后端地址：
```javascript
// 在 config.js 中修改
API: {
  HOST: 'https://new-backend-url.com',
  GENERATE_STORY: '/api/generate-story',
  HEALTH: '/api/health'
}
```

### 📋 当前配置

```javascript
APP_CONFIG = {
  API: {
    HOST: 'https://animalapi.badtom.dpdns.org',
    GENERATE_STORY: '/api/generate-story',
    HEALTH: '/api/health'
  },
  SEARCH_API: {
    HOST: 'https://searchapi.badtom.xyz',
    GENERATE_TEXT: '/api/generate-text',
    GENERATE_PICTURE: '/api/generate-picture'
  },
  APP: {
    MAX_FILE_SIZE: 4 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
    DEFAULT_LANGUAGE: 'zh',
    DEFAULT_ANIMAL: 'cat'
  }
}
```
