// 幻灯片渲染和下载组件
class SlideRenderer {
  constructor(app) {
    this.app = app;
  }

  // 渲染幻灯片
  renderSlides(steps) {
    this.app.elements.slideshow.innerHTML = '';
    
    steps.forEach((step, index) => {
      const slide = this.createSlide(step, index);
      this.app.elements.slideshow.appendChild(slide);
    });
    
    this.app.elements.slideshow.hidden = false;
  }

  // 创建单个幻灯片
  createSlide(step, index) {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.classList.add(`font-handwriting-${this.app.languageManager.getCurrentLanguage()}`);
    
    const img = document.createElement('img');
    img.src = step.image_url;
    img.alt = step.image_prompt || step.sentence;
    
    const txt = document.createElement('div');
    txt.textContent = step.sentence;
    
    slide.appendChild(img);
    slide.appendChild(txt);
    
    return slide;
}
}
