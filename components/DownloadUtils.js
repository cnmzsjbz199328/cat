// 专门用于下载的工具类
class DownloadUtils {
  
  // 创建SVG版本的幻灯片用于下载
  static createSVGSlide(slide) {
    const slideRect = slide.getBoundingClientRect();
    const img = slide.querySelector('img');
    const text = slide.querySelector('div');
    
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${slideRect.width}" height="${slideRect.height}">
        <rect width="100%" height="100%" fill="white"/>
        ${img ? `<image x="10" y="10" width="${img.offsetWidth}" height="${img.offsetHeight}" href="${img.src}"/>` : ''}
        ${text ? `<text x="${slideRect.width / 2}" y="${slideRect.height - 50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#2c3e50">${text.textContent}</text>` : ''}
      </svg>
    `;
    
    return svgContent;
  }
  
  // 将SVG转换为PNG并下载
  static async downloadSVGAsImage(svgContent, filename) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve();
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load SVG'));
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      img.src = url;
    });
  }
  
  // 使用domtoimage库的备用方案
  static async downloadWithDomToImage(slide, filename) {
    if (typeof domtoimage === 'undefined') {
      throw new Error('domtoimage library not loaded');
    }
    
    const downloadBtn = slide.querySelector('.download-btn');
    if (downloadBtn) {
      downloadBtn.style.display = 'none';
    }
    
    try {
      const blob = await domtoimage.toBlob(slide, {
        bgcolor: '#ffffff',
        width: slide.offsetWidth,
        height: slide.offsetHeight,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left'
        }
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      if (downloadBtn) {
        downloadBtn.style.display = 'block';
      }
    }
  }
}
