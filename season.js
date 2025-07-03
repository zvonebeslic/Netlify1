// season.js - kompaktan za mobilni prikaz

let seasonCanvas;
let ctx;
let dpr = window.devicePixelRatio || 1;

// ID-jevi animacija za upravljanje (za cancelAnimationFrame)
let winterAnimationId = null;
let springAnimationId = null;
let summerAnimationId = null;
let autumnAnimationId = null;

// === FUNKCIJA ZA PREKID SVIH AKTIVNIH SEZONSKIH ANIMACIJA ===
function cancelAllSeasonAnimations() {
  if (winterAnimationId !== null) {
    cancelAnimationFrame(winterAnimationId);
    winterAnimationId = null;
  }
  if (springAnimationId !== null) {
    cancelAnimationFrame(springAnimationId);
    springAnimationId = null;
  }
  if (summerAnimationId !== null) {
    cancelAnimationFrame(summerAnimationId);
    summerAnimationId = null;
  }
  if (autumnAnimationId !== null) {
    cancelAnimationFrame(autumnAnimationId);
    autumnAnimationId = null;
  }

  // Ukloni canvas iz DOM-a ako postoji
  const canvas = document.getElementById('season-canvas');
  if (canvas) {
    canvas.remove();
  }
}

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

  document.querySelectorAll('.season-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const selected = icon.dataset.season;

      stopSeasonEffects(); // Zaustavi sve prethodne

      activeSeason = selected;
      seasonIsRunning = true;

      document.body.classList.add(`season-${selected}`);
      toggle.classList.add('active-season');
      iconsWrapper.classList.remove('visible');

      if (selected === 'winter') {
        startWinterEffect();
      } else if (selected === 'spring') {
        startSpringEffect();
      } else if (selected === 'summer') {
        startSummerEffect();
      } else if (selected === 'autumn') {
        startAutumnEffect();
      }
    });
  });
  
  if (!toggle || !iconsWrapper) return;

  toggle.addEventListener('click', () => {
    if (seasonIsRunning) {
      stopSeasonEffects();
      toggle.classList.remove('active-season');
    } else {
      iconsWrapper.classList.toggle('visible');
    }
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
function startWinterEffect() {
  
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

// PROLJEĆE
function startSpringEffect() {
  
  cancelAllSeasonAnimations();
  
  setupSeasonCanvas();

  const mm = 3.78; // 1 mm = 3.78 px

  const seeds = [];
  const totalSeeds = 100;
  const width = seasonCanvas.width;
  const height = seasonCanvas.height;

  // POVJETARAC
  let wind = 0;
  let targetWind = 0;
  let windTimer = 0;
  let windInterval = Math.random() * 6000 + 6000;

  function updateWind(deltaTime) {
    windTimer += deltaTime;
    if (windTimer > windInterval) {
      windTimer = 0;
      windInterval = Math.random() * 8000 + 6000;
      targetWind = (Math.random() - 0.5) * 1.2;
    }
    wind += (targetWind - wind) * 0.005;
  }

  // SJEMENKE
  for (let i = 0; i < totalSeeds; i++) {
    const startInsideView = i < 20;
    seeds.push({
      x: width * 0.5 + Math.random() * (width * 0.5),
      y: startInsideView
        ? height - 100 - Math.random() * 100
        : height + Math.random() * 80,
      baseDriftY: -0.3 - Math.random() * 0.3,
      driftX: (Math.random() - 0.3) * 0.5,
      size: 1,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.002,
      floatOffset: Math.random() * 1000,
      time: 0
    });
  }

  function drawSeed(seed, time) {
    const float = Math.sin((time + seed.floatOffset) / 300) * mm * 0.2;
    const tiltX = Math.sin((time + seed.floatOffset) / 600) * 0.15;
    const tiltY = Math.cos((time + seed.floatOffset) / 800) * 0.15;

    ctx.save();
    ctx.translate(seed.x, seed.y + float);
    ctx.rotate(seed.angle);
    ctx.scale(seed.size * (1 + tiltX), seed.size * (1 + tiltY));

    // === STABLjIKA ===
    ctx.beginPath();
    ctx.strokeStyle = '#8B5A2B';
    ctx.lineWidth = 3;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-0.6, mm * 1, -0.3, mm * 2, 0, mm * 2.5);
    ctx.stroke();

    // === SJEME ===
    ctx.beginPath();
    ctx.fillStyle = '#5C432A';
    ctx.ellipse(0, mm * 2.8, mm * 0.6, mm * 1, 0, 0, 2 * Math.PI);
    ctx.fill();

    // === TICALA ===
    const count = 30;
    const radius = mm * 2;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 1.2) * (i / (count - 1)) - Math.PI * 0.6;
      const cx = Math.cos(angle) * radius * 0.4;
      const cy = Math.sin(angle) * radius * 0.4;
      const x2 = Math.cos(angle) * radius;
      const y2 = Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(cx, cy, x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  let lastTime = performance.now();

  function animate(currentTime) {
    const delta = currentTime - lastTime;
    lastTime = currentTime;

    ctx.clearRect(0, 0, width, height);
    updateWind(delta);

    for (let i = seeds.length - 1; i >= 0; i--) {
      const s = seeds[i];
      s.time += delta;

      const oscillationY = Math.sin((s.time + s.floatOffset) / 900) * 0.25;
      const finalDriftY = s.baseDriftY + oscillationY + wind * 0.05;

      s.y += finalDriftY;
      s.x += s.driftX + wind * 0.4;
      s.angle += s.rotationSpeed;

      drawSeed(s, currentTime);

      if (
        s.x < -100 || s.x > width + 100 ||
        s.y < -150 || s.y > height + 150
      ) {
        seeds.splice(i, 1);
        seeds.push({
          x: width * 0.5 + Math.random() * (width * 0.5),
          y: height + Math.random() * 60,
          baseDriftY: -0.3 - Math.random() * 0.3,
          driftX: (Math.random() - 0.3) * 0.5,
          size: 1,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.002,
          floatOffset: Math.random() * 1000,
          time: 0
        });
      }
    }

    springAnimationId = requestAnimationFrame(animate);
  }

  animate();
}

    
// LJETO
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
    summerAnimationId = requestAnimationFrame(animate);
  }
  animate();
}

// JESEN
function startAutumnEffect() {
  const canvas = document.createElement('canvas');
  canvas.id = 'season-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '99998';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const drops = [];
  const dropLayers = 3; // pozadina, sredina, prednji sloj
  const layerConfigs = [
    { count: 80, speed: 2, opacity: 0.15, width: 0.7 },
    { count: 100, speed: 4, opacity: 0.25, width: 1 },
    { count: 80, speed: 6, opacity: 0.35, width: 1.5 }
  ];

  for (let layer = 0; layer < dropLayers; layer++) {
    const config = layerConfigs[layer];
    for (let i = 0; i < config.count; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 10 + Math.random() * 15,
        speed: config.speed + Math.random() * 1,
        width: config.width,
        opacity: config.opacity
      });
    }
  }

  let lightningTimer = 0;

  function drawRain() {
    ctx.clearRect(0, 0, width, height);

    // povremeni bljesak
    if (Math.random() < 0.002 && lightningTimer <= 0) {
      lightningTimer = 5;
    }
    if (lightningTimer > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.1 * lightningTimer})`;
      ctx.fillRect(0, 0, width, height);
      lightningTimer--;
    }

    drops.forEach(drop => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${drop.opacity})`;
      ctx.lineWidth = drop.width;
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();

      drop.y += drop.speed;
      if (drop.y > height) {
        drop.y = -20;
        drop.x = Math.random() * width;
      }
    });

    requestAnimationFrame(drawRain);
  }

  drawRain();
}
