import './styles/main.css'
import { ParticleField } from './components/ParticleField.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

function onReady() {
  // Fade out loader smoothly, then remove it from layout
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hide');
    // Ensure we fully remove it after the opacity transition
    const onTransitionEnd = () => {
      loader.style.display = 'none';
    };
    loader.addEventListener('transitionend', onTransitionEnd, { once: true });
    // Fallback in case transitionend doesn’t fire
    setTimeout(() => {
      const style = getComputedStyle(loader);
      if (style.opacity === '0') loader.style.display = 'none';
    }, 700); // a bit longer than the 0.5s CSS transition
  }

  // Simple canvas test
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    // Initialize the particle field animation on the hero canvas
    const pf = new ParticleField(canvas);
    // Force hero mode on init
    window.dispatchEvent(new CustomEvent('pf:setMode', { detail: { mode: 'hero' } }));
    console.log('ParticleField initialized');
  } else {
    console.error('Canvas not found!');
  }

  // Initialize roadmap circuit-style scroll animation
  initRoadmapCircuit();

  // Initialize Vision & Mission animations
  initVisionAnimations();

  // CTA smooth scroll to Our Vision
  const cta = document.getElementById('cta-vision');
  if (cta) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('vision-mission');
      if (target) {
        const nav = document.querySelector('.navbar');
        const offset = nav ? nav.offsetHeight : 0;
        // Slower, eased scroll without delay (1.8s)
        smoothScrollTo(target, 1800, offset);
      }
    });
  }

  // Theme toggle
  const toggleBtn = document.getElementById('theme-toggle');
  const toggleLabel = document.getElementById('theme-toggle-label');
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    if (toggleLabel) toggleLabel.textContent = 'Light';
  } else {
    root.removeAttribute('data-theme');
    if (toggleLabel) toggleLabel.textContent = 'Dark';
  }
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark) {
        root.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (toggleLabel) toggleLabel.textContent = 'Dark';
      } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (toggleLabel) toggleLabel.textContent = 'Light';
      }
    });
  }
}

// Eased, slowed smooth scroll
function smoothScrollTo(element, duration = 1300, offsetTop = 0) {
  const startY = window.scrollY;
  const targetRect = element.getBoundingClientRect();
  const targetY = targetRect.top + window.scrollY - offsetTop;
  const diff = targetY - startY;
  let startTs = null;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  function step(ts) {
    if (startTs === null) startTs = ts;
    const elapsed = ts - startTs;
    const t = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(t);
    window.scrollTo(0, startY + diff * eased);
    if (elapsed < duration) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Run after DOM is ready, regardless of load order
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(onReady, 500));
} else {
  setTimeout(onReady, 500);
}

function initRoadmapCircuit() {
  const roadmap = document.getElementById('roadmap');
  const pin = document.querySelector('.roadmap-pin');
  const svg = document.getElementById('roadmap-svg');
  const pathEl = document.getElementById('roadmap-path');
  if (!roadmap || !pin || !svg || !pathEl) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Track which milestones have been reached at least once (to persist terminal circles)
  const visited = [];

  // Build vertical spine and per-milestone horizontal branches
  const buildPath = () => {
    const width = pin.clientWidth;
    const height = pin.clientHeight;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');

    const centerX = width / 2;
    const branch = Math.min(60, width * 0.12); // fallback lateral length (unused when extending to cards)

    // Collect milestone Y positions
    const pinRect = pin.getBoundingClientRect();
    const milestones = Array.from(document.querySelectorAll('.roadmap .milestone'))
      .map((el, i) => {
        const r = el.getBoundingClientRect();
        const y = (r.top - pinRect.top) + r.height * 0.5;
        return { el, y: Math.max(0, Math.min(height, y)), index: i };
      })
      .sort((a, b) => a.y - b.y);

    // Construct vertical spine path only
    let d = `M ${centerX},0 L ${centerX},${height}`;

    pathEl.setAttribute('d', d);

    const length = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${length}`;
    
    // Ensure SVG glow filter exists for terminal circles
    const ensureGlowFilter = () => {
      let defs = svg.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.prepend(defs);
      }
      let filter = svg.querySelector('#terminalGlow');
      if (!filter) {
        filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'terminalGlow');
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');
        const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur.setAttribute('in', 'SourceGraphic');
        blur.setAttribute('stdDeviation', '4'); // prominent glow
        blur.setAttribute('result', 'blur');
        const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const mergeNodeBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNodeBlur.setAttribute('in', 'blur');
        const mergeNodeSrc = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        mergeNodeSrc.setAttribute('in', 'SourceGraphic');
        merge.appendChild(mergeNodeBlur);
        merge.appendChild(mergeNodeSrc);
        filter.appendChild(blur);
        filter.appendChild(merge);
        defs.appendChild(filter);
      }
    };
    ensureGlowFilter();

    // Remove existing branches and terminals before rebuilding
    Array.from(svg.querySelectorAll('.roadmap-branch')).forEach(b => b.remove());
    Array.from(svg.querySelectorAll('.roadmap-terminal')).forEach(c => c.remove());
    // Compute stroke style from main path to match
    const computed = getComputedStyle(pathEl);
    const strokeColor = computed.stroke;
    const strokeWidth = computed.strokeWidth;
    const branchEls = [];
    milestones.forEach((m, i) => {
      const cardRect = m.el.getBoundingClientRect();
      // Determine if the card is on the left or right of the spine
      const cardCenterX = ((cardRect.left + cardRect.right) / 2) - pinRect.left;
      const isLeft = cardCenterX < centerX;
      // Responsive gap/overlap at card edge
      const isMobile = window.matchMedia('(max-width: 900px)').matches;
      const gap = 12; // desktop gap from card (comfortable padding)
      const overlap = 6; // mobile overlap behind card
      let endX;
      if (isLeft) {
        endX = (cardRect.right - pinRect.left) - (isMobile ? -overlap : gap);
        // For left side, subtract gap (or add overlap) so we stop before (or go behind) the card edge
      } else {
        endX = (cardRect.left - pinRect.left) - (isMobile ? -overlap : gap);
        // For right side, subtract gap (or add overlap) so we stop before (or go behind) the card edge
      }
      const bx = Math.max(0, Math.min(width, endX));
      const branchPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      branchPath.setAttribute('class', 'roadmap-branch');
      branchPath.setAttribute('d', `M ${centerX},${m.y.toFixed(2)} L ${bx.toFixed(2)},${m.y.toFixed(2)}`);
      branchPath.setAttribute('fill', 'none');
      branchPath.setAttribute('stroke', strokeColor);
      branchPath.setAttribute('stroke-width', strokeWidth);
      branchPath.setAttribute('opacity', '0.9');
      svg.appendChild(branchPath);
      const blen = branchPath.getTotalLength();
      branchPath.style.strokeDasharray = `${blen}`;
      branchPath.style.strokeDashoffset = `${blen}`;
      // Add terminal circle at branch end
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'roadmap-terminal');
      circle.setAttribute('cx', bx.toFixed(2));
      circle.setAttribute('cy', m.y.toFixed(2));
      circle.setAttribute('r', visited[m.index] ? '5' : '0');
      circle.setAttribute('fill', strokeColor); // solid terminal
      circle.setAttribute('stroke', strokeColor);
      circle.setAttribute('stroke-width', strokeWidth);
      circle.setAttribute('opacity', visited[m.index] ? '1' : '0'); // persist if visited
      if (visited[m.index]) circle.setAttribute('filter', 'url(#terminalGlow)');
      svg.appendChild(circle);
      branchEls.push({ el: branchPath, len: blen, index: m.index, terminal: circle });
    });
    
    return { length, milestones, height, branches: branchEls };
  };

  const { length, milestones, height, branches } = buildPath();
  // Start hidden (fully dashed)
  pathEl.style.strokeDashoffset = `${length}`;

  if (prefersReduced) {
    // Show static content without animations
    pathEl.style.strokeDashoffset = '0';
    document.querySelectorAll('.roadmap .milestone').forEach(el => el.classList.add('visible'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Create pinned scroll section
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: roadmap,
      // Start the roadmap line draw as soon as the section enters the viewport
      start: 'top bottom',
      end: () => '+=' + Math.round((pin?.clientHeight || window.innerHeight) * 3.5),
      pin: pin,
      scrub: true
    }
  });

  // Draw the vertical spine progressively on scroll and gate branches by spine progress
  tl.to(pathEl, { strokeDashoffset: 0, ease: 'none', onUpdate: function() {
    const prog = tl.scrollTrigger ? tl.scrollTrigger.progress : 0;
    // spine length already set in dasharray; compute current pixel length drawn
    const totalLen = pathEl.style.strokeDasharray ? parseFloat(pathEl.style.strokeDasharray) : pathEl.getTotalLength();
    const drawnLen = totalLen * prog; // approximate: 0..total
    const pathBBox = pathEl.getBBox();
    const topY = pathBBox.y;
    // For each milestone: if its Y is within drawn range, reveal; else hide if previously visible
    milestones.forEach((m, i) => {
      const mileY = m.y;
      const reached = (mileY - topY) <= (pathBBox.height * prog + 1);
      const branchRef = branches[i]?.el;
      const terminalRef = branches[i]?.terminal;
      if (reached) {
        if (branchRef) {
          // Draw branch; once complete, flag visited and show terminal + card
          gsap.to(branchRef, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', onComplete: () => {
            if (!visited[i]) visited[i] = true;
            if (terminalRef) {
              terminalRef.setAttribute('filter', 'url(#terminalGlow)');
              gsap.to(terminalRef, { opacity: 1, duration: 0.25, ease: 'power1.out' });
              gsap.to(terminalRef, { attr: { r: 7 }, duration: 0.2, yoyo: true, repeat: 1, ease: 'power1.inOut' });
            }
            if (!m.el.classList.contains('visible')) {
              // Reveal cards without vertical offset
              gsap.to(m.el, { opacity: 1, duration: 0.6, ease: 'power2.out' });
              const items = m.el.querySelectorAll('li');
              gsap.to(items, { opacity: 1, duration: 0.5, stagger: 0.12, ease: 'power2.out' });
              m.el.classList.add('visible');
              const header = m.el.querySelector('h4');
              if (header) {
                const r = header.getBoundingClientRect();
                window.dispatchEvent(new CustomEvent('pf:setMode', { detail: { mode: 'surround' } }));
                window.dispatchEvent(new CustomEvent('pf:setTarget', { detail: { rect: { x: r.left, y: r.top, w: r.width, h: r.height } } }));
              }
            }
          }});
        }
        // Brighten line as it reaches the card, then return
        gsap.to(pathEl, { stroke: 'var(--accent-blue-dark)', duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.out' });
        if (branchRef) {
          const current = getComputedStyle(branchRef).stroke;
          gsap.to(branchRef, { stroke: 'var(--accent-blue-dark)', duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.out', onComplete: () => {
            branchRef.setAttribute('stroke', current);
          }});
        }
      } else {
        if (branchRef) {
          const bl = branches[i].len;
          gsap.set(branchRef, { strokeDashoffset: bl });
        }
        if (terminalRef) {
          // Persist terminal circles after first reveal; only hide if never reached
          if (!visited[i]) {
            terminalRef.removeAttribute('filter');
            gsap.set(terminalRef, { opacity: 0, attr: { r: 0 } });
          } else {
            terminalRef.setAttribute('filter', 'url(#terminalGlow)');
            gsap.set(terminalRef, { opacity: 1, attr: { r: 5 } });
          }
        }
        if (m.el.classList.contains('visible')) {
          // Hide cards without vertical offset
          gsap.set(m.el, { opacity: 0 });
          m.el.classList.remove('visible');
        }
      }
    });
  }});

  // Branch/card reveal is gated by spine progress; remove per-card triggers

  // Remove roadmap flocking; only surround on milestone reveal

  // Rebuild path on resize and keep dashoffset aligned with progress
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const progress = tl.scrollTrigger ? tl.scrollTrigger.progress : 0;
      const rebuilt = buildPath();
      const newLen = rebuilt.length;
      pathEl.style.strokeDasharray = `${newLen}`;
      pathEl.style.strokeDashoffset = `${newLen * (1 - progress)}`;
      // For branches and terminals, set drawn state for already-visible cards
      rebuilt.branches.forEach((b, i) => {
        const card = rebuilt.milestones[i].el;
        const visible = card.classList.contains('visible');
        b.el.style.strokeDasharray = `${b.len}`;
        b.el.style.strokeDashoffset = visible ? '0' : `${b.len}`;
        if (b.terminal) {
          if (visible || visited[i]) {
            b.terminal.setAttribute('filter', 'url(#terminalGlow)');
            b.terminal.setAttribute('opacity', '1');
            b.terminal.setAttribute('r', '5');
          } else {
            b.terminal.removeAttribute('filter');
            b.terminal.setAttribute('opacity', '0');
            b.terminal.setAttribute('r', '0');
          }
        }
      });
    }, 150);
  });
}

function initVisionAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const titleEl = document.getElementById('vision-title');
  const underlineSvg = document.getElementById('vision-underline');
  const underlinePath = document.getElementById('vision-underline-path');
  const spineSvg = document.getElementById('vision-spine');
  const spinePath = document.getElementById('vision-spine-path');

  if (!titleEl || !underlineSvg || !underlinePath || !spineSvg || !spinePath) return;

  // Build underline path based on title width
  const buildUnderline = () => {
    const rect = titleEl.getBoundingClientRect();
    const width = Math.max(120, rect.width);
    underlineSvg.setAttribute('width', String(width));
    underlineSvg.setAttribute('height', '6');
    underlineSvg.setAttribute('viewBox', `0 0 ${width} 6`);
    underlinePath.setAttribute('d', `M 0 3 L ${width} 3`);
    const len = width;
    underlinePath.style.strokeDasharray = `${len}`;
    underlinePath.style.strokeDashoffset = `${len}`;
    return len;
  };

  // Build vertical spine from underline toward roadmap
  const buildSpine = () => {
    const container = spineSvg.parentElement;
    const width = container.clientWidth;
    const height = Math.max(200, container.clientHeight);
    spineSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    spineSvg.setAttribute('preserveAspectRatio', 'none');
    const centerX = Math.min(Math.max(width * 0.12, 80), width * 0.4); // left-aligned spine
    const nodes = 8;
    let d = `M ${centerX},0`;
    for (let i = 1; i <= nodes; i++) {
      const y = (height / nodes) * i;
      d += ` L ${centerX},${y}`;
      // tiny node tick
      d += ` M ${centerX - 6},${y} L ${centerX + 6},${y}`;
    }
    spinePath.setAttribute('d', d);
    const len = spinePath.getTotalLength();
    spinePath.style.strokeDasharray = `${len}`;
    spinePath.style.strokeDashoffset = `${len}`;
    return len;
  };

  const underlineLen = buildUnderline();
  const spineLen = buildSpine();

  if (prefersReduced) {
    underlinePath.style.strokeDashoffset = '0';
    spinePath.style.strokeDashoffset = '0';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Replace with fade/slide-in for the whole section
  const vmSection = document.getElementById('vision-mission');
  if (vmSection) {
    gsap.from(vmSection, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: vmSection,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Keep underline static (no draw)
  underlinePath.style.strokeDashoffset = '0';

  // Rebuild on resize
  let rTimer;
  window.addEventListener('resize', () => {
    clearTimeout(rTimer);
    rTimer = setTimeout(() => {
      const uLen = buildUnderline();
      underlinePath.style.strokeDasharray = `${uLen}`;
      underlinePath.style.strokeDashoffset = `${uLen}`;
      const sLen = buildSpine();
      spinePath.style.strokeDasharray = `${sLen}`;
      spinePath.style.strokeDashoffset = `${sLen}`;
    }, 150);
  });
}