class SlideRenderer {
  constructor(app) {
    this.app = app;
  }

  renderSlides(slides) {
    const slideshow = document.getElementById('slideshow');
    const output = document.getElementById('output');
    
    // 隐藏文本输出，显示幻灯片
    output.style.display = 'none';
    slideshow.hidden = false;
    slideshow.innerHTML = '';

    slides.forEach((slide, index) => {
      const slideDiv = this.createSlide(slide, index);
      slideshow.appendChild(slideDiv);
    });

    // 滚动到结果区域
    slideshow.scrollIntoView({ behavior: 'smooth' });
  }

  createSlide(slide, index) {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide';
    
    // 添加旋转效果
    if (index % 2 === 0) {
      slideDiv.style.transform = 'rotate(0.5deg)';
    } else {
      slideDiv.style.transform = 'rotate(-0.5deg)';
    }

    // 添加图片
    if (slide.imageUrl) {
      const img = document.createElement('img');
      img.src = slide.imageUrl;
      img.alt = `Slide ${index + 1}`;
      img.loading = 'lazy';
      slideDiv.appendChild(img);
    }

    // 添加文字
    if (slide.text) {
      const textDiv = document.createElement('div');
      textDiv.textContent = slide.text;
      
      // 应用多语言字体
      const currentLang = this.app.languageManager.getCurrentLanguage();
      textDiv.className = `font-handwriting-${currentLang}`;
      
      slideDiv.appendChild(textDiv);
    }

    return slideDiv;
  }

  clearSlides() {
    document.getElementById('slideshow').hidden = true;
    document.getElementById('slideshow').innerHTML = '';
  }
}
