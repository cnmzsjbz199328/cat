# Tiny Animals Explanation Tool 🐾

> *Explain anything using cute tiny animals as metaphors*

A multilingual web application that uses adorable tiny animals to explain complex concepts and topics through engaging stories and illustrations.

## ✨ Features

- 🌍 **Multilingual Support**: English, Chinese, Japanese, Korean
- 🎨 **Handwriting Fonts**: Unique handwritten fonts for each language
  - English: Indie Flower, Caveat (Casual handwriting)
  - Chinese: Ma Shan Zheng, Long Cang (Chinese calligraphy)
  - Japanese: Zen Kurenaido, Kosugi Maru (Japanese handwriting)
  - Korean: Nanum Pen Script, Gaegu (Korean handwriting)
- 🐱 **Multiple Animals**: Cats, rabbits, dogs, birds, pandas, foxes
- 🖼️ **Custom Image Count**: Generate 1-10 illustrations per story
- 📸 **Smart Image Processing**: 
  - PNG/JPEG format support
  - Automatic format validation
  - 4MB size limit
  - Real-time error feedback
  - Gemini API compatible format
- 📱 **Responsive Design**: Mobile and desktop optimized
- 💾 **Smart Memory**: Auto-save user language preferences
- 🎨 **Quality Experience**: Upload progress, animations, error handling
- 🔧 **Dual Architecture**: 
  - Main tool for animal story generation
  - Search tool for general content analysis

## 🗂️ Project Structure

```
cat/
├── 📁 Main Application (Animal Story Generator)
│   ├── index.html                           # Main HTML file
│   ├── style.css                            # Main stylesheet
│   ├── config.js                            # Centralized configuration
│   ├── script-refactored.js                 # Application entry point
│   ├── translations.js                      # Multilingual translations
│   └── components/                          # Modular components
│       ├── APIManager.js                    # API communication
│       ├── ErrorHandler.js                  # Error management
│       ├── ImageUploadManager.js            # Image handling
│       ├── LanguageManager.js               # Language switching
│       ├── SlideRenderer.js                 # Slide rendering
│       └── UIManager.js                     # UI state management
├── 📁 search/ (Content Analysis Tool)
│   ├── index.html                           # Analysis tool interface
│   ├── styles/                              # Modular stylesheets
│   ├── script-refactored.js                 # Analysis logic
│   ├── translations.js                      # Analysis tool translations
│   └── components/                          # Analysis components
│       ├── APIManager.js                    # Analysis API calls
│       ├── ContentRenderer.js               # Content rendering
│       ├── SessionManager.js                # Session persistence
│       ├── SidebarManager.js                # Session sidebar UI
│       ├── DataExportManager.js             # Session export
│       └── ... (other components)
└── 📄 Documentation
    ├── README.md                            # This file
    ├── README_ZH.md                         # Chinese documentation
    ├── PROJECT_DOCUMENTATION.md             # Technical documentation
    ├── CONFIG_MANAGEMENT.md                 # Configuration guide
    └── PROJECT_REVIEW.md                    # Code review report
```

## 🚀 Quick Start

### Main Application (Animal Stories)
1. **Select Language**: Click language buttons in the top-right
2. **Configure Settings**: 
   - Choose number of images (1-10)
   - Select animal type (cat, rabbit, dog, etc.)
3. **Input Content**: 
   - Type your topic in the text box
   - Or upload an image for analysis
   - Or click example questions
4. **Get Results**: Press Enter or click submit to generate your story

### Search Tool (Content Analysis)
1. **Navigate**: Open `search/index.html`
2. **Choose Language**: Select your preferred interface language
3. **Analysis Options**:
   - Toggle image generation on/off
   - Input text or upload images
4. **Analyze**: Get professional content analysis results

## 🛠️ Technical Features

### Frontend Architecture
- **Modular Design**: Separated CSS, JS, and translation files
- **Object-Oriented**: ES6 classes for code organization
- **Local Storage**: Remember user preferences
- **Responsive Layout**: Adaptive to all screen sizes
- **Multilingual API**: Frontend-backend language synchronization

### API Integration
Request format (Gemini API compatible with multilingual support):
```json
{
  "prompt": "What is machine learning?",
  "num_images": 2,
  "animal": "cat",
  "language": "en",
  "image": {
    "mime_type": "image/png",
    "data": "base64_encoded_image_data"
  }
}
```

**Language Codes:**
- `zh`: Chinese responses
- `en`: English responses  
- `ja`: Japanese responses
- `ko`: Korean responses

### Image Processing Features
- **Format Support**: PNG, JPEG formats
- **Size Limit**: Maximum 4MB
- **Auto Conversion**: Standardized MIME types
- **Error Handling**: Real-time validation with multilingual error messages
- **Progress Feedback**: Upload processing animations
- **Preview Function**: Instant image preview and removal

### Language Support
- **Chinese (zh)**: 简体中文界面
- **English (en)**: English interface  
- **Japanese (ja)**: 日本語インターフェース
- **Korean (ko)**: 한국어 인터페이스

## 🔧 Development Guide

### Adding New Languages
1. Add new language object in `translations.js`
2. Add language switch button in `index.html`
3. Adjust language button styles in `style.css` (if needed)
4. Update font families for the new language

### Adding New Animals
1. Add animal names for each language in `translations.js`
2. Ensure backend API supports the new animal type
3. Update animal selection UI components

### Customizing Styles
- Modify color variables in `style.css`
- Adjust responsive breakpoints
- Modify fonts and layouts
- Customize handwriting font combinations

### Component Development
```javascript
// Example: Creating a new component
class NewComponent {
  constructor(app) {
    this.app = app;
  }
  
  init() {
    // Initialize component
  }
  
  // Component methods...
}
```

## 🌐 Deployment

### Requirements
- Static web hosting (GitHub Pages, Netlify, Vercel)
- Modern web browser with ES6 support
- Internet connection for Google Fonts and APIs

### Quick Deploy
1. Clone the repository
2. Upload files to your hosting service
3. Configure environment variables for API keys
4. Access via your domain

### Environment Setup
```bash
# Clone the repository
git clone [repository-url]

# Navigate to project
cd cat

# Serve locally (using any static server)
python -m http.server 8000
# or
npx serve .
```

## 📊 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Standards
- Use ES6+ features
- Follow modular component architecture
- Maintain multilingual support
- Test across different browsers
- Document new features

## 📝 API Documentation

For detailed API documentation, see:
- [Main API Documentation](PROJECT_DOCUMENTATION.md)
- [Configuration Guide](CONFIG_MANAGEMENT.md)

## 🐛 Troubleshooting

### Common Issues
- **Image Upload Fails**: Check file format (PNG/JPEG) and size (<4MB)
- **Language Not Switching**: Clear browser cache and localStorage
- **Fonts Not Loading**: Check internet connection and Google Fonts availability
- **API Errors**: Verify API keys and network connectivity

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Google Fonts for multilingual typography
- Gemini API for AI content generation
- Community contributors and testers

---

**Made with 🐾 and lots of tiny animals**
