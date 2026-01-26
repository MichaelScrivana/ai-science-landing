const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created: ${dirPath}`);
  }
}

// Write file with content
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`📄 Created: ${filePath}`);
}

// Create project structure
console.log('🚀 Setting up AI Science Landing Page...\n');

// Create directories
createDir('.vscode');
createDir('src');
createDir('src/components');
createDir('src/styles');
createDir('public');

// Create package.json
const packageJson = {
  "name": "ai-science-landing",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.10"
  },
  "dependencies": {
    "@studio-freight/lenis": "^1.0.29",
    "gsap": "^3.12.4",
    "three": "^0.160.0"
  }
};

writeFile('package.json', JSON.stringify(packageJson, null, 2));

// Create vite.config.js
const viteConfig = `import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist'
  },
  server: {
    port: 3000,
    open: true
  }
})`;

writeFile('vite.config.js', viteConfig);

// Create .gitignore
const gitignore = `node_modules
dist
.DS_Store`;

writeFile('.gitignore', gitignore);

// Create VS Code settings
const vscodeSettings = {
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
};

writeFile('.vscode/settings.json', JSON.stringify(vscodeSettings, null, 2));

// Create index.html
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bayer AI Science Lab</title>
  <link rel="stylesheet" href="./styles/main.css">
</head>
<body>
  <div class="loader" id="loader">
    <div class="binary">10110100</div>
  </div>
  
  <section class="hero">
    <canvas id="particle-canvas"></canvas>
    <div class="hero-content">
      <h1 class="hero-title">
        <span>Pioneering</span>
        <span>AI</span>
        <span>in</span>
        <span>Science</span>
      </h1>
      <p class="hero-subtitle">Transforming Discovery at Bayer</p>
      <button class="btn-primary">Explore</button>
    </div>
  </section>
  
  <script type="module" src="./main.js"></script>
</body>
</html>`;

writeFile('src/index.html', indexHTML);

// Create main.js
const mainJS = `import './styles/main.css'
import { ParticleField } from './components/ParticleField.js'

document.addEventListener('DOMContentLoaded', () => {
  // Hide loader
  setTimeout(() => {
    document.getElementById('loader').style.display = 'none';
  }, 1000);
  
  // Initialize particles
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    new ParticleField(canvas);
  }
});`;

writeFile('src/main.js', mainJS);

// Create ParticleField.js
const particleFieldJS = `export class ParticleField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.init();
  }
  
  init() {
    this.resize();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createParticles() {
    const count = 50;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 0.5 + 0.1,
        char: Math.random() > 0.5 ? '1' : '0'
      });
    }
  }
  
  animate() {
    this.ctx.fillStyle = 'rgba(12, 25, 41, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      this.ctx.fillStyle = '#00D4AA';
      this.ctx.font = p.size * 10 + 'px monospace';
      this.ctx.fillText(p.char, p.x, p.y);
      
      p.y -= p.speedY;
      if (p.y < 0) {
        p.y = this.canvas.height;
        p.x = Math.random() * this.canvas.width;
      }
    });
    
    requestAnimationFrame(() => this.animate());
  }
}`;

writeFile('src/components/ParticleField.js', particleFieldJS);

// Create main.css
const mainCSS = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-dark: #0C1929;
  --accent-green: #00D4AA;
  --accent-blue: #0066CC;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  background: var(--primary-dark);
  color: white;
  overflow-x: hidden;
}

.loader {
  position: fixed;
  inset: 0;
  background: var(--primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.binary {
  font-size: 2rem;
  font-family: monospace;
  color: var(--accent-green);
  animation: pulse 1s infinite;
}

.hero {
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

#particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero-title {
  font-size: 5rem;
  font-weight: 100;
  margin-bottom: 1rem;
}

.hero-title span {
  display: inline-block;
  opacity: 0;
  animation: fadeInUp 0.8s forwards;
}

.hero-title span:nth-child(1) { animation-delay: 0.1s; }
.hero-title span:nth-child(2) { animation-delay: 0.2s; }
.hero-title span:nth-child(3) { animation-delay: 0.3s; }
.hero-title span:nth-child(4) { animation-delay: 0.4s; }

.hero-subtitle {
  font-size: 1.5rem;
  color: #B8C5D6;
  margin-bottom: 2rem;
  opacity: 0;
  animation: fadeInUp 0.8s 0.5s forwards;
}

.btn-primary {
  padding: 1rem 2rem;
  font-size: 1rem;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-green));
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  opacity: 0;
  animation: fadeInUp 0.8s 0.7s forwards;
  transition: transform 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
  from {
    opacity: 0;
    transform: translateY(30px);
  }
}`;

writeFile('src/styles/main.css', mainCSS);

console.log('\n✨ Setup complete!\n');
console.log('Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
console.log('\nYour site will open at http://localhost:3000');