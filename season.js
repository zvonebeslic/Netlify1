// season.js - kompaktan za mobilni prikaz

let seasonCanvas;
let ctx;
let dpr = window.devicePixelRatio || 1;

function setupSeasonCanvas() {
  // Ako već postoji, koristi ga ponovno
  if (!document.getElementById('season-canvas')) {
    seasonCanvas = document.createElement('canvas');
    seasonCanvas.id = 'season-canvas';
    Object.assign(seasonCanvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '99998'
    });
    document.body.insertBefore(seasonCanvas, document.body.firstChild);
  } else {
    seasonCanvas = document.getElementById('season-canvas');
  }

  ctx = seasonCanvas.getContext('2d');
  dpr = window.devicePixelRatio || 1;
  seasonCanvas.width = window.innerWidth * dpr;
  seasonCanvas.height = window.innerHeight * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
  ctx.scale(dpr, dpr);

  // Resize listener (poziva se samo jednom)
  if (!setupSeasonCanvas._resized) {
    window.addEventListener('resize', () => {
      seasonCanvas.width = window.innerWidth * dpr;
      seasonCanvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    });
    setupSeasonCanvas._resized = true;
  }
}

let activeSeason = null;
let seasonIsRunning = false;

function initializeSeasonToggle() {
  const toggle = document.getElementById('season-toggle');
  const iconsWrapper = document.getElementById('season-icons');

  if (!toggle || !iconsWrapper) return;

  toggle.addEventListener('click', () => {
    if (seasonIsRunning) {
      stopSeasonEffects();
      toggle.classList.remove('active-season');
      seasonIsRunning = false;
    } else {
      iconsWrapper.classList.toggle('visible');
    }
  });

  document.querySelectorAll('.season-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const selected = icon.dataset.season;

      stopSeasonEffects(); // osiguraj da sve staro stane

      document.body.classList.add(`season-${selected}`);
      toggle.classList.add('active-season');
      iconsWrapper.classList.remove('visible');

      else if (selected === 'winter') startWinterEffect();
      else if (selected === 'spring') startSpringEffect();
      else if (selected === 'summer') startSummerEffect();
      else if (selected === 'autumn') startAutumnEffect();
    
      activeSeason = selected;
      seasonIsRunning = true;
    });
  });
}

function stopSeasonEffects() {
  document.body.classList.remove('season-winter', 'season-spring', 'season-autumn', 'season-summer');

  const canvas = document.getElementById('season-canvas');
  if (canvas) canvas.remove();

  activeSeason = null;
  seasonIsRunning = false;
}

// ZIMA
// === REALISTIC WINTER EFFECT ===
  
  cancelAllSeasonAnimations();
  
  setupSeasonCanvas();

let windStrength = 0;
let targetWind = 0;
let windTimer = 0;
let windInterval = Math.random() * 7000 + 8000;

let isGustActive = false;
let gustTimer = 0;
const gustCooldown = 10000;
let gustDuration = 0;
let lastGustTime = 0;
let maxWindStrength = 2.5; // možeš povećati na 3.5 za brutalnije udare

  let lastFrameTime = performance.now();
  
function updateWind(deltaTime) {
  // Redovni vjetar (lagani drift svakih 8–15 sekundi)
  windTimer += deltaTime;
  if (windTimer > windInterval) {
    windTimer = 0;
    windInterval = Math.random() * 10000 + 11000;
    targetWind = (Math.random() - 0.5) * 2 * maxWindStrength;
  }

  // Povremeni jaki nalet vjetra (gust)
    const now = Date.now();
      if (!isGustActive && now - lastGustTime > gustCooldown && Math.random() < 0.002) {
    isGustActive = true;
    gustDuration = Math.random() * 3000 + 4000;
    targetWind = (Math.random() < 0.5 ? -1 : 1) * maxWindStrength * 2; // jači gust
    gustTimer = 0;
    lastGustTime = now; 
  }

  if (isGustActive) {
    gustTimer += deltaTime;
    if (gustTimer > gustDuration) {
  isGustActive = false;

  setTimeout(() => {
    targetWind = 0;
      }, 2000);
    }
  }

  // Postepeni prijelaz (lerp)
  const transitionSpeed = 0.01; // sporiji prijelaz (oko 2 sekunde)
  windStrength += (targetWind - windStrength) * transitionSpeed;
}
  
  const snowflakes = [];
    // Generiraj 150 zguzvanih
for (let i = 0; i < 150; i++) {
  snowflakes.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.2 + 0.3,
    speedY: Math.random() * 2 + 3,
    drift: Math.random() * 2 - 1,
    rotation: Math.random() * Math.PI,
    opacity: Math.random() * 0.5 + 0.5,
    type: 'ellipse'
  });
}

// 80 eliptičnih malih
for (let i = 0; i < 80; i++) {
  snowflakes.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: 0.6,
    speedY: Math.random() * 2.5 + 2,
    drift: Math.random() * 1.5 - 0.75,
    rotation: Math.random() * Math.PI,
    opacity: Math.random() * 0.4 + 0.4,
    type: 'crumpled'
  });
}

// 40 eliptičnih srednjih
for (let i = 0; i < 40; i++) {
  snowflakes.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: 0.8,
    speedY: Math.random() * 2.2 + 2,
    drift: Math.random() * 1.2 - 0.6,
    rotation: Math.random() * Math.PI,
    opacity: Math.random() * 0.4 + 0.5,
    type: 'ellipse'
  });
}

// 20 eliptičnih normalnih
for (let i = 0; i < 20; i++) {
  snowflakes.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: 1.0,
    speedY: Math.random() * 2 + 2.2,
    drift: Math.random() * 1.0 - 0.5,
    rotation: Math.random() * Math.PI,
    opacity: Math.random() * 0.3 + 0.6,
    type: 'ellipse'
  });
}

// 10 eliptičnih velikih
for (let i = 0; i < 10; i++) {
  snowflakes.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: 1.2,
    speedY: Math.random() * 1 + 2,
    drift: Math.random() * 0.8 - 0.4,
    rotation: Math.random() * Math.PI,
    opacity: Math.random() * 0.3 + 0.7,
    type: 'crumpled'
  });
}

  function createFlake() {
    const types = ['small', 'medium', 'tiny', 'large', 'crumpled'];
    const type = types[Math.floor(Math.random() * types.length)];
    let radius, shape;

    switch (type) {
      case 'large': radius = 1.3; break;
      case 'medium': radius = 0.6; break;
      case 'tiny': radius = 0.4; break;
      case 'crumpled': radius = 0.7; shape = 'crumpled'; break;
      default: radius = 1.0;
    }

    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius,
      shape: shape || 'ellipse',
      speedY: 2 + Math.random() * 3,
      speedX: 0,
      angle: Math.random() * Math.PI * 2,
      rotateSpeed: (Math.random() - 0.5) * 0.2,
      drift: (Math.random() - 0.5) * 0.5,
      alpha: 0.5 + Math.random() * 0.5
    };
  }

  function draw() {
    ctx.clearRect(0, 0, seasonCanvas.width / dpr, seasonCanvas.height / dpr);

    const now = performance.now();
const deltaTime = now - lastFrameTime;
lastFrameTime = now;

updateWind(deltaTime);
    
    snowflakes.forEach(flake => {
      const timeScale = deltaTime / 16.67; // normalizira na 60fps

flake.y += flake.speedY * timeScale;
flake.x += windStrength * flake.speedY * 0.5 * timeScale;
      flake.angle += flake.rotateSpeed;
      // Malo prirodnog njihanja (kao da vjetar puše neujednačeno)
flake.drift += (Math.random() - 0.5) * 0.05;
flake.drift = Math.max(-2, Math.min(2, flake.drift)); // ograniči

      // Ako ode previše desno (vjetar nosi ulijevo)
if (flake.x > window.innerWidth + 50) {
  flake.x = -20 - Math.random() * 30; // pojavi se slijeva
  flake.y = Math.random() * window.innerHeight;
}

// Ako ode previše lijevo (vjetar nosi udesno)
if (flake.x < -50) {
  flake.x = window.innerWidth + 20 + Math.random() * 30; // pojavi se sdesna
  flake.y = Math.random() * window.innerHeight;
}
      if (flake.y > window.innerHeight + 10) {
  flake.y = -10;
  flake.x = Math.random() * window.innerWidth;
}
      
      ctx.save();
      ctx.globalAlpha = flake.alpha;
      ctx.translate(flake.x, flake.y);
      ctx.rotate(flake.angle);

      if (flake.shape === 'crumpled') {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = i * (Math.PI * 2 / 6) + Math.random() * 0.5;
          const r = flake.radius * 4 + Math.random() * 2;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, flake.radius * 3, flake.radius * 2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      ctx.restore();
    });

    winterAnimationId = requestAnimationFrame(draw);
  }
  draw();
} 


function startSpringEffect() {

  cancelAllSeasonAnimations();
  
  setupSeasonCanvas();

  const width = seasonCanvas.width / dpr;
  const height = seasonCanvas.height / dpr;
  
  const petals = Array.from({ length: 300 }, () => ({
    x: Math.random() * width, y: Math.random() * height,
    size: Math.random() * 5 + 4, drift: Math.random() * 1 - 0.5,
    fall: Math.random() * 0.8 + 0.2, angle: Math.random() * Math.PI * 2,
    rotation: (Math.random() - 0.5) * 0.01, opacity: Math.random() * 0.4 + 0.4
  }));
  function animate() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, 2 * Math.PI);
      ctx.fillStyle = 'pink'; ctx.fill(); ctx.restore();
      p.y += p.fall; p.x += p.drift; p.angle += p.rotation;
      if (p.y > height + 10) p.y = -10;
      if (p.x > width + 20) p.x = -20;
      if (p.x < -20) p.x = width + 20;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

function startSummerEffect() {

  cancelAllSeasonAnimations();
  
  setupSeasonCanvas();

  const width = seasonCanvas.width / dpr;
  const height = seasonCanvas.height / dpr;
  
  const rays = Array.from({ length: 200 }, () => ({
    x: Math.random() * width, y: Math.random() * height * 0.3,
    length: Math.random() * 60 + 40, alpha: Math.random() * 0.2 + 0.1,
    thickness: Math.random() * 1 + 0.5, fade: Math.random() * 0.01 + 0.005
  }));
  function animate() {
    ctx.clearRect(0, 0, width, height);
    rays.forEach(r => {
      ctx.save(); ctx.globalAlpha = r.alpha;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x, r.y + r.length);
      ctx.strokeStyle = 'rgba(255, 255, 150, 1)';
      ctx.lineWidth = r.thickness; ctx.stroke(); ctx.restore();
      r.alpha -= r.fade;
      if (r.alpha <= 0) {
        r.x = Math.random() * width;
        r.y = Math.random() * height * 0.3;
        r.length = Math.random() * 60 + 40;
        r.alpha = Math.random() * 0.2 + 0.1;
        r.thickness = Math.random() * 1 + 0.5;
        r.fade = Math.random() * 0.01 + 0.005;
      }
    });
    requestAnimationFrame(animate);
  }
  animate();
}

function startAutumnEffect() {

  cancelAllSeasonAnimations();
  
  setupSeasonCanvas();

  const width = seasonCanvas.width / dpr;
  const height = seasonCanvas.height / dpr;
  
  const leaves = Array.from({ length: 300 }, () => ({
    x: Math.random() * width, y: Math.random() * height,
    size: Math.random() * 5 + 4, drift: Math.random() * 1 - 0.5,
    fall: Math.random() * 0.8 + 0.4, angle: Math.random() * Math.PI * 2,
    rotation: (Math.random() - 0.5) * 0.02, opacity: Math.random() * 0.4 + 0.4
  }));
  function animate() {
    ctx.clearRect(0, 0, width, height);
    leaves.forEach(l => {
      ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.angle);
      ctx.globalAlpha = l.opacity;
      ctx.beginPath();
      ctx.ellipse(0, 0, l.size, l.size * 0.5, 0, 0, 2 * Math.PI);
      ctx.fillStyle = 'orange'; ctx.fill(); ctx.restore();
      l.y += l.fall; l.x += l.drift; l.angle += l.rotation;
      if (l.y > height + 10) l.y = -10;
      if (l.x > width + 20) l.x = -20;
      if (l.x < -20) l.x = width + 20;
    });
    requestAnimationFrame(animate);
  }
  animate();
}
