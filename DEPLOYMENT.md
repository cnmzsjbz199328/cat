# 部署脚本

## 切换到重构版本

### 1. 备份原始文件
```bash
# 备份原始文件
cp index.html index-original.html
cp script.js script-original.js
```

### 2. 部署新版本
```bash
# 替换主文件
cp index-refactored.html index.html
cp script-refactored.js script.js

# 创建组件目录（如果不存在）
mkdir -p components

# 确保所有组件文件都在正确位置
# 文件应该已经在 components/ 目录下
```

### 3. 验证部署
- 打开 `index.html` 确认页面正常加载
- 测试语言切换功能
- 测试图片上传功能
- 测试幻灯片生成功能
- **测试下载功能**：悬停在幻灯片上应该显示下载按钮

### 4. 回滚方案（如果需要）
```bash
# 如果需要回滚到原始版本
cp index-original.html index.html
cp script-original.js script.js
```

## 新功能测试清单

- [ ] 页面正常加载
- [ ] 语言切换正常工作
- [ ] 图片上传功能正常
- [ ] API请求正常
- [ ] 幻灯片渲染正常
- [ ] 下载按钮在悬停时显示
- [ ] 点击下载按钮可以下载PNG图片
- [ ] 移动端响应正常
- [ ] 错误处理正常工作

## 注意事项

1. 确保 html2canvas 库正确加载
2. 检查网络连接，确保CDN资源可访问
3. 如果在本地开发，确保所有文件路径正确
4. 测试不同浏览器的兼容性
