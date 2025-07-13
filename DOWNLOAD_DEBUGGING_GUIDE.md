# 下载功能问题分析和解决方案

## 问题总结
1. **图片显示空白**: 跨域图片加载失败
2. **文字显示不完整**: 文本换行和绘制逻辑有问题

## 具体问题分析

### 1. 图片问题
- **原因**: 
  - 外部图片资源的CORS限制
  - `crossOrigin='anonymous'` 设置但服务器不支持
  - 图片加载超时或失败

- **解决方案**:
  - 优先使用已经加载的图片
  - 设置加载超时机制
  - 失败时绘制占位符

### 2. 文字问题
- **原因**:
  - `ctx.fillText()` 只能绘制单行文本
  - 长文本没有正确换行
  - 文本定位和样式获取有问题

- **解决方案**:
  - 实现正确的文本换行逻辑
  - 获取实际的CSS样式
  - 改进文本定位和行高计算

## 代码修复要点

### 1. 图片绘制修复
```javascript
drawImageOnCanvas(ctx, img, slide) {
  return new Promise((resolve) => {
    // 优先使用已加载的图片
    if (img.complete && img.naturalWidth > 0) {
      try {
        ctx.drawImage(img, x, y, imgRect.width, imgRect.height);
        resolve();
        return;
      } catch (error) {
        // 继续尝试其他方法
      }
    }
    
    // 备用方案：重新加载图片
    const tempImg = new Image();
    
    // 设置超时防止无限等待
    const timeout = setTimeout(() => {
      this.drawImagePlaceholder(ctx, img, slide);
      resolve();
    }, 3000);
    
    tempImg.onload = () => {
      clearTimeout(timeout);
      ctx.drawImage(tempImg, x, y, imgRect.width, imgRect.height);
      resolve();
    };
    
    tempImg.onerror = () => {
      clearTimeout(timeout);
      this.drawImagePlaceholder(ctx, img, slide);
      resolve();
    };
    
    tempImg.crossOrigin = 'anonymous';
    tempImg.src = img.src;
  });
}
```

### 2. 文本绘制修复
```javascript
drawTextOnCanvas(ctx, textDiv, slide) {
  // 获取实际的CSS样式
  const computedStyle = window.getComputedStyle(textDiv);
  const fontSize = parseInt(computedStyle.fontSize) || 18;
  const fontFamily = computedStyle.fontFamily || 'Arial, sans-serif';
  const color = computedStyle.color || '#2c3e50';
  const lineHeight = parseInt(computedStyle.lineHeight) || fontSize * 1.2;
  
  // 设置Canvas文本样式
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // 文本换行处理
  const maxWidth = textRect.width;
  const lines = this.wrapText(ctx, text, maxWidth);
  
  // 计算垂直居中位置
  const totalTextHeight = lines.length * lineHeight;
  const startY = y + (textRect.height - totalTextHeight) / 2;
  
  // 绘制每一行
  lines.forEach((line, index) => {
    const lineY = startY + (index * lineHeight);
    ctx.fillText(line, x + textRect.width / 2, lineY);
  });
}
```

### 3. 改进的文本换行
```javascript
wrapText(ctx, text, maxWidth) {
  // 如果文本很短，直接返回
  if (ctx.measureText(text).width <= maxWidth) {
    return [text];
  }
  
  // 对于中文文本，按字符换行
  const words = text.split('');
  const lines = [];
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i];
    const testWidth = ctx.measureText(testLine).width;
    
    if (testWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  
  return lines;
}
```

## 调试功能

### 1. 日志输出
- 添加详细的控制台日志
- 显示当前使用的下载方法
- 记录图片加载状态
- 输出文本绘制信息

### 2. 占位符处理
- 图片加载失败时显示占位符
- 占位符包含错误信息
- 保持界面的完整性

## 测试方法

### 1. 使用测试页面
```bash
# 打开测试页面
# 访问 download-test.html
# 点击"添加下载按钮"
# 悬停在幻灯片上测试下载功能
```

### 2. 查看控制台
- 打开浏览器开发者工具
- 查看Console选项卡
- 观察下载过程中的日志信息

### 3. 验证下载结果
- 检查下载的图片是否包含完整内容
- 验证文字是否正确换行
- 确认图片是否正确显示（或显示占位符）

## 性能优化

### 1. 图片处理优化
- 优先使用已加载的图片
- 设置合理的超时时间
- 避免重复加载相同图片

### 2. 文本处理优化
- 缓存计算后的样式
- 减少不必要的DOM查询
- 优化文本测量操作

## 下一步改进

1. **图片代理服务**: 实现服务器端图片代理
2. **缓存机制**: 缓存已转换的图片
3. **进度反馈**: 显示下载进度
4. **格式选择**: 支持不同的下载格式

## 兼容性

- 支持所有现代浏览器
- Canvas API 广泛支持
- 文本绘制功能稳定
- 图片处理有合理的回退机制
