import { ParticleField } from './components/ParticleField.js';

// ============================================
// 1. LOADER
// ============================================
// Hide loader as soon as possible
const hideLoader = () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }
};

// Try to hide loader on multiple events to ensure it disappears
window.addEventListener('load', hideLoader);
window.addEventListener('DOMContentLoaded', () => {
  // Also hide after a timeout as a fallback
  setTimeout(hideLoader, 100);
});

// Failsafe: hide loader after 3 seconds no matter what
setTimeout(hideLoader, 3000);

// ============================================
// 2. THEME TOGGLE (Dark/Light Mode)
// ============================================
const themeToggle = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-toggle-label');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// Helper to update theme display
const updateThemeDisplay = (theme) => {
  if (themeLabel) {
    themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }
  if (sunIcon && moonIcon) {
    sunIcon.style.display = theme === 'light' ? 'inline-block' : 'none';
    moonIcon.style.display = theme === 'dark' ? 'inline-block' : 'none';
  }
};

// Get initial theme from localStorage or default to dark
let currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeDisplay(currentTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeDisplay(currentTheme);
  });
}

// ============================================
// 3. PARTICLE FIELD
// ============================================
try {
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const particleField = new ParticleField(canvas);
  }
} catch (error) {
  console.warn('ParticleField initialization failed:', error);
}

// ============================================
// 4. SMOOTH SCROLLING FOR CTA BUTTONS
// ============================================
const ctaVision = document.getElementById('cta-vision');
if (ctaVision) {
  ctaVision.addEventListener('click', () => {
    document.getElementById('vision-mission')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  });
}

// ============================================
// 5. VISION SECTION ANIMATION
// ============================================
function animateVisionSection() {
  const title = document.getElementById('vision-title');
  const content = document.querySelector('.vm-col');
  
  if (!title || !content) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(title);
  observer.observe(content);
}

// ============================================
// 6. ROADMAP CIRCUIT BOARD ANIMATION
// ============================================
function initRoadmap() {
  const svg = document.getElementById('roadmap-svg');
  const path = document.getElementById('roadmap-path');
  const milestones = document.querySelectorAll('.milestone');
  const roadmapSection = document.querySelector('.roadmap');
  const roadmapTitle = document.getElementById('roadmap-title');
  const metricsSection = document.querySelector('.metrics');
  const metricCards = document.querySelectorAll('.metric-card');
  
  if (!svg || !path || !roadmapSection || milestones.length === 0) return;
  
  let animationStarted = false;
  
  // Start roadmap animation when roadmap title enters viewport
  const handleAnimationStart = () => {
    if (animationStarted) return;
    
    if (roadmapTitle) {
      const titleRect = roadmapTitle.getBoundingClientRect();
      // Start when roadmap title is at 75% of viewport
      if (titleRect.top <= window.innerHeight * 0.75) {
        animationStarted = true;
        roadmapTitle.classList.add('visible');
      }
    } else {
      // Fallback
      const roadmapRect = roadmapSection.getBoundingClientRect();
      if (roadmapRect.top <= window.innerHeight * 0.75) {
        animationStarted = true;
      }
    }
  };
  
  window.addEventListener('scroll', handleAnimationStart);
  handleAnimationStart(); // Check initial state
  
  // Create circuit pulse element
  const pulse = document.createElement('div');
  pulse.className = 'circuit-pulse';
  document.body.appendChild(pulse);
  
  // Create zoom circle overlay for pan/zoom effect
  const zoomOverlay = document.createElement('div');
  zoomOverlay.className = 'zoom-overlay';
  document.body.appendChild(zoomOverlay);
  
  // Store path info
  let pathLength = 0;
  
  // Create circuit path: starts below 'Roadmap', goes down, then to center of cards, then straight down
  const createCircuitPath = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    
    // Get roadmap title position
    let startX = width / 2;
    let startY = height * 0.1;
    
    if (roadmapTitle) {
      const titleRect = roadmapTitle.getBoundingClientRect();
      startX = titleRect.left + titleRect.width / 2; // Center of 'Roadmap'
      startY = titleRect.bottom + 5; // Just below the title
    }
    
    // Get the center position from the first milestone
    let lineX = width / 2; // Default fallback
    let lastMilestoneBottom = height * 0.8;
    
    if (milestones.length > 0) {
      const firstMilestone = milestones[0].getBoundingClientRect();
      lineX = firstMilestone.left + firstMilestone.width / 2; // Center of milestone cards
      
      const lastMilestone = milestones[milestones.length - 1].getBoundingClientRect();
      lastMilestoneBottom = lastMilestone.bottom + 20;
    }
    
    // Calculate center for diagonal endpoint
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Build path:
    // 1. Start at center below 'Roadmap'
    // 2. Go down 20px
    // 3. Go horizontally to center of cards
    // 4. Go straight down to last milestone
    // 5. Go diagonally to center of viewport
    const dropY = startY + 20;
    
    // Path goes from title, down, to center of cards, then down through cards, then diagonally to center
    const pathD = `M ${startX} ${startY} L ${startX} ${dropY} L ${lineX} ${dropY} L ${lineX} ${lastMilestoneBottom} L ${centerX} ${centerY}`;
    
    path.setAttribute('d', pathD);
    
    // Get path length for animation
    pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    
    return { pathLength, lineX };
  };
  
  createCircuitPath();
  
  let currentMilestoneIndex = 0;
  let lastRevealedIndex = -1;
  
  // Scroll-driven animation
  const handleScroll = () => {
    const roadmapRect = roadmapSection.getBoundingClientRect();
    const roadmapTop = roadmapRect.top;
    const roadmapBottom = roadmapRect.bottom;
    const windowHeight = window.innerHeight;
    
    // Recreate path on each scroll to follow milestones
    createCircuitPath();
    
    // Don't proceed if animation hasn't started or section is out of view
    if (!animationStarted || roadmapTop > windowHeight || roadmapBottom < 0) {
      pulse.classList.remove('active');
      return;
    }
    
    // Calculate progress based on how far through the roadmap section we've scrolled
    // Use tighter scroll range: start when title is at 75% of viewport
    // End when we've scrolled the roadmap section height (more controlled than full 300vh)
    const startThreshold = windowHeight * 0.75;
    const sectionHeight = roadmapRect.height;
    const scrolledIntoSection = startThreshold - roadmapTop;
    
    // Only use portion of section height for progress (e.g., first 80% of visible scrolling)
    // This keeps animation slower and more controlled
    const totalScrollRange = sectionHeight * 0.8;
    
    let progress = scrolledIntoSection / totalScrollRange;
    progress = Math.max(0, Math.min(1, progress));
    
    // Much slower easing: animations take time to complete
    // 0.6 means animation path completes at 60% of scroll progress
    // This leaves room to see the diagonal before zoom
    let easedProgress = progress * 0.6;
    
    // Animate path drawing
    const drawLength = pathLength * easedProgress;
    path.style.strokeDashoffset = pathLength - drawLength;
    
    // Position pulse at end of line
    if (progress > 0 && progress < 1) {
      const point = path.getPointAtLength(drawLength);
      pulse.style.left = `${point.x}px`;
      pulse.style.top = `${point.y}px`;
      pulse.classList.add('active');
      
      // Reveal milestones when circuit pulse reaches them (based on Y position)
      const pulseY = point.y;
      
      milestones.forEach((milestone, index) => {
        const rect = milestone.getBoundingClientRect();
        const milestoneTop = rect.top;
        
        // Reveal card and secondary card when pulse reaches the top of the milestone
        if (pulseY >= milestoneTop - 20) {
          if (!milestone.classList.contains('visible')) {
            milestone.classList.add('visible');
          }
          
          // Add powered state immediately (shows secondary card sliding out)
          if (!milestone.classList.contains('powered')) {
            milestone.classList.add('powered');
          }
        }
        
        // Remove powered state when scrolling back up
        if (pulseY < milestoneTop - 30) {
          milestone.classList.remove('powered');
        }
      });
      
      // Only trigger zoom effect after pulse has traveled significantly along diagonal
      // This happens when easedProgress exceeds ~0.5 (pulse at >50% of path, in diagonal section)
      if (easedProgress > 0.5) {
        // Calculate zoom progression: starts at 50%, completes at 60%
        const zoomProgress = Math.min(1, (easedProgress - 0.5) / 0.1);
        updatePanZoom(point.x, point.y, zoomProgress);
        
        // Fade line as zoom completes
        if (easedProgress > 0.55) {
          path.style.opacity = Math.max(0, 0.7 - (easedProgress - 0.55) * 1.4);
        }
      } else {
        // Before zoom phase - keep line visible
        zoomOverlay.classList.remove('active');
        path.style.opacity = '0.7';
      }
    } else {
      pulse.classList.remove('active');
      zoomOverlay.classList.remove('active');
      path.style.opacity = '0.7';
    }
  };
  
  // Pan and zoom into the circle
  const updatePanZoom = (pulseX, pulseY, progress) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;
    
    // Smooth ease-in curve for zoom acceleration
    const easedProgress = progress * progress * progress;
    
    // Circle position moves from pulse to center
    const circleX = pulseX + (centerX - pulseX) * easedProgress;
    const circleY = pulseY + (centerY - pulseY) * easedProgress;
    
    // Circle size grows from small to fill screen
    const minRadius = 12;
    const maxRadius = Math.max(windowWidth, windowHeight) * 2;
    const radius = minRadius + (maxRadius - minRadius) * easedProgress;
    
    // Update zoom overlay with CSS custom properties
    zoomOverlay.style.setProperty('--circle-x', `${circleX}px`);
    zoomOverlay.style.setProperty('--circle-y', `${circleY}px`);
    zoomOverlay.style.setProperty('--circle-radius', `${radius}px`);
    zoomOverlay.style.setProperty('--zoom-progress', easedProgress);
    
    // Fade out roadmap section
    roadmapSection.style.opacity = Math.max(0, 1 - easedProgress * 1.5);
    roadmapSection.style.pointerEvents = easedProgress > 0.5 ? 'none' : 'auto';
    
    zoomOverlay.classList.add('active');
    
    // Show metrics section when zoom is complete
    if (progress >= 0.95 && metricsSection) {
      metricsSection.classList.add('visible');
      metricsSection.style.opacity = Math.min(1, (progress - 0.95) * 20);
    }
  };
  
  // Counter animation function
  function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const duration = 2000;
    const startTime = performance.now();
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = target * easeOut;
      
      // Format number
      if (target >= 1 && target < 10) {
        element.textContent = current.toFixed(1);
      } else {
        element.textContent = Math.floor(current);
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }
  
  // Initial call
  handleScroll();
  
  // Throttled scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      createCircuitPath();
      handleScroll();
    }, 100);
  });
}

// ============================================
// 7. METRICS COUNTER ANIMATION
// ============================================
function animateMetrics() {
  const metricsSection = document.querySelector('.metrics');
  const metricNumbers = document.querySelectorAll('.metric-number');
  
  // Add powered class when metrics section enters view
  if (metricsSection) {
    const metricsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          metricsSection.classList.add('powered');
        } else {
          metricsSection.classList.remove('powered');
        }
      });
    }, { threshold: 0.3 });
    
    metricsObserver.observe(metricsSection);
  }
  
  metricNumbers.forEach(number => {
    const target = parseFloat(number.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(counter);
            }
            
            // Format number
            if (target >= 1 && target < 10) {
              number.textContent = current.toFixed(1);
            } else {
              number.textContent = Math.floor(current);
            }
          }, 16);
          
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(number);
  });
}

// ============================================
// 8. INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize features that don't depend on specific elements
    animateVisionSection();
    animateMetrics();
    
    // Initialize roadmap with a small delay to ensure DOM is fully ready
    setTimeout(() => {
      try {
        initRoadmap();
      } catch (error) {
        console.warn('Roadmap initialization failed:', error);
      }
    }, 100);
  } catch (error) {
    console.warn('Initialization failed:', error);
  }
});

// Handle resize
window.addEventListener('resize', () => {
  // No resize needed for vision section anymore
});