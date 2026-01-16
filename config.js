// 应用程序统一配置文件
const APP_CONFIG = {
  // 主应用后端 API 地址
  API: {
    HOST: 'https://animalapi.badtom.dpdns.org',
    GENERATE_STORY: '/api/generate-story',
    HEALTH: '/api/health'
  },

  // 搜索工具后端 API 地址
  SEARCH_API: {
    HOST: 'https://searchapi.badtom.dpdns.org',
    GENERATE_TEXT: '/api/generate-text',
    GENERATE_PICTURE: '/api/generate-picture'
  },

  // 应用常量
  APP: {
    MAX_FILE_SIZE: 4 * 1024 * 1024, // 4MB
    ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
    MAX_IMAGES: 10,
    MIN_IMAGES: 1,
    DEFAULT_LANGUAGE: 'zh',
    DEFAULT_ANIMAL: 'cat',
    DEFAULT_NUM_IMAGES: 2
  },

  // 调试模式
  DEBUG: false
};

// 导出给模块化环境使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONFIG;
}
