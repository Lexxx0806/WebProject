# 🌱 Lite - Digital Sustainability Web App

## 📋 Project Overview

A comprehensive web application that educates users about digital carbon emissions and promotes sustainable web practices through interactive tools, real-time analysis, and gamification.

## 🎯 Core Purpose

Lite helps users understand and reduce their digital carbon footprint through:
- **Carbon Footprint Calculator**: Estimate personal digital emissions
- **Web Inspector**: Audit websites for environmental impact
- **Interactive Game**: Learn about data cleanup through gameplay
- **Educational Content**: Awareness about internet's environmental impact

## 🛠️ Technical Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Vanilla web technologies
- **Three.js**: 3D wireframe Earth visualization
- **Font Awesome**: Icon library
- **Google Fonts (Outfit)**: Typography

### Backend
- **Node.js + Express.js**: Server framework
- **Puppeteer**: Browser automation for scanning
- **Axios**: HTTP client for API calls

### APIs
- **Green Web Foundation API**: Green hosting verification
- **Google PageSpeed Insights**: Page performance metrics

## 📱 Features

### 🏠 Home Page (`index.html`)
- Hero section with animated SVG underline
- Navigation menu with light/dark theme toggle
- Interactive 3D Earth background
- Custom cursor effects
- Scroll reveal animations

### 🧮 Carbon Calculator (`calculator.html`)
- **Inputs**: Cloud storage (GB), streaming hours/week, emails/week
- **Calculation**: Annual CO₂ emissions using Sustainable Web Design model
- **Output**: Equivalent tree absorption requirements
- **Tools**: Email cleanup links for Gmail/Outlook/Yahoo
- **Validation**: Real-time input sanitization

### 🔍 Web Inspector (`inspector.html`)
- **URL Analysis**: Input field for website URLs
- **Green Hosting Check**: API verification of sustainable hosting
- **Page Weight Measurement**: Breakdown by images/scripts/fonts
- **Eco-Grade Rating**: A+ to F scale based on emissions
- **Fallback System**: Manual estimation when scanning fails

### 🎮 Data Stream Defense (`game.html`)
- **Gameplay**: Click falling digital file icons before they reach bottom
- **Scoring**: Track files "deleted" and server temperature
- **Difficulty**: Progressive speed increase
- **Education**: Metaphor for unchecked data growth
- **States**: Start screen, gameplay, game over with restart

### 📊 Mission Report (`report.html`)
- Technical methodology documentation
- Sustainable Web Design principles
- API integration explanations
- Carbon calculation formulas

## ⚙️ Backend API

### `POST /api/scan`
Scans a website for carbon emissions and hosting sustainability.

**Parameters:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "isGreen": false,
  "hostName": "Standard Grid",
  "bytes": {
    "total": 2200000,
    "image": 0,
    "script": 0,
    "font": 0
  },
  "isEstimate": false
}
```

**Features:**
- Rate limiting (1 req/sec per IP)
- URL validation and sanitization
- Fallback estimation for blocked sites
- CORS enabled with security headers

## 🎨 Design System

### Themes
- **Dark Mode** (Default): Deep navy backgrounds, cyan accents
- **Light Mode**: Clean grays, blue accents
- **Persistence**: localStorage saves user preference

### Color Palette
```css
/* Dark Mode */
--bg: #0b0d17;           /* Deep navy */
--card-bg: #15192b;      /* Dark blue-gray */
--text: #ffffff;         /* White */
--text-muted: #94a3b8;   /* Light gray */
--accent: #22d3ee;       /* Cyan */
--success: #34d399;      /* Green */
--danger: #f87171;       /* Red */

/* Light Mode */
--bg: #f1f5f9;           /* Light gray */
--card-bg: #ffffff;      /* White */
--text: #1e293b;         /* Dark blue */
--text-muted: #64748b;   /* Medium gray */
--accent: #0284c7;       /* Blue */
```

### Typography
- **Font Family**: Outfit (Google Fonts)
- **Weights**: 300 (light), 500 (medium), 800 (bold)
- **Responsive Sizing**: Clamp functions for scalability

### Components
- **Cards**: Rounded containers with subtle shadows
- **Buttons**: Primary/outline styles with hover effects
- **Inputs**: Consistent styling with focus states
- **Animations**: Smooth transitions, reveal effects

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WebProject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   # or
   node server.js
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Development
```bash
npm run dev  # Same as start
```

## 📂 Project Structure

```
WebProject/
├── index.html          # Home page with hero section
├── calculator.html     # Carbon footprint calculator
├── inspector.html      # Website sustainability inspector
├── game.html          # Data cleanup mini-game
├── report.html        # Technical documentation
├── style.css          # Main stylesheet with themes
├── script.js          # Frontend JavaScript logic
├── server.js          # Express.js backend server
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## 🎮 User Journey

1. **Landing**: Hero section explains digital emissions problem
2. **Education**: Learn about data hoarding, dirty hosting, bloated web
3. **Action**: Use calculator to check personal impact
4. **Tools**: Audit websites with the inspector
5. **Engagement**: Play game to understand data cleanup
6. **Deep Dive**: Read technical report for methodology

## 📈 Methodology

### Carbon Calculations
- **Cloud Storage**: 0.2 kg CO₂ per GB annually
- **Streaming**: 0.055 kg CO₂ per hour × 52 weeks
- **Email**: 0.004 kg CO₂ per email × 52 weeks
- **Page Weight**: 0.81 kWh per GB transferred
- **Green Hosting**: 50 gCO₂/kWh vs Standard: 442 gCO₂/kWh

### Data Sources
- Sustainable Web Design model (Wholegrain Digital)
- Green Web Foundation hosting database
- Google PageSpeed Insights API
- Real-time browser automation with Puppeteer

## 🔧 Recent Updates

- ✅ Fixed menu toggle button functionality
- ✅ Added game CSS and click interactions
- ✅ Enhanced server security and validation
- ✅ Improved code documentation and comments
- ✅ Added accessibility attributes
- ✅ Performance optimizations

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Contact

For questions about digital sustainability or the application, feel free to explore the tools and learn more about reducing your digital carbon footprint!
