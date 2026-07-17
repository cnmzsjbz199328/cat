import js from '@eslint/js';
import globals from 'globals';

// 项目为纯静态站点：所有 JS 以 <script> 直接加载，跨文件通过全局名共享。
// 下面的 globals 列出各文件对外暴露的类与函数，供 no-undef 检查使用。
const sharedGlobals = {
  // config.js
  APP_CONFIG: 'readonly',
  debugLog: 'readonly',
  // translations.js / search/translations.js
  translations: 'readonly',
  // 主应用组件
  AnimalStoryApp: 'readonly',
  // search 工具组件
  SearchApp: 'readonly',
  SessionManager: 'readonly',
  SidebarManager: 'readonly',
  ContentRenderer: 'readonly',
  DataExportManager: 'readonly',
  // 两套应用同名的组件类
  LanguageManager: 'readonly',
  ErrorHandler: 'readonly',
  ImageUploadManager: 'readonly',
  SlideRenderer: 'readonly',
  APIManager: 'readonly',
  UIManager: 'readonly'
};

export default [
  {
    ignores: ['node_modules/']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...sharedGlobals,
        // config.js 末尾的 CommonJS 导出分支
        module: 'readonly'
      }
    },
    rules: {
      // 类定义文件本身会"重新声明"上面列出的共享全局名，这是脚本直载模式的常态
      'no-redeclare': ['error', { builtinGlobals: false }],
      // 类与函数在别的文件里通过全局名使用，定义处本身不视为未使用；
      // 回调参数按签名保留（如 (e) =>）也不强制使用
      'no-unused-vars': ['error', {
        args: 'none',
        caughtErrors: 'none',
        varsIgnorePattern: '^(AnimalStoryApp|SearchApp|SessionManager|SidebarManager|ContentRenderer|DataExportManager|LanguageManager|ErrorHandler|ImageUploadManager|SlideRenderer|APIManager|UIManager|debugLog|APP_CONFIG|translations)$'
      }]
    }
  }
];
