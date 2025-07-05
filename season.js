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
  seasonCanvas.style.height = '100vh';
  
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
  let maxWindStrength = 2.5;

  let lastFrameTime = performance.now();

  function updateWind(deltaTime) {
    windTimer += deltaTime;
    if (windTimer > windInterval) {
      windTimer = 0;
      windInterval = Math.random() * 10000 + 11000;
      targetWind = (Math.random() - 0.5) * 2 * maxWindStrength;
    }

    const now = Date.now();
    if (!isGustActive && now - lastGustTime > gustCooldown && Math.random() < 0.002) {
      isGustActive = true;
      gustDuration = Math.random() * 3000 + 4000;
      targetWind = (Math.random() < 0.5 ? -1 : 1) * maxWindStrength * 2;
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

    windStrength += (targetWind - windStrength) * 0.01;
  }

  const snowflakes = [];

  const targetCounts = [
    { count: 150, type: 'ellipse', radiusRange: [0.3, 1.3] },
    { count: 120, type: 'crumpled', radius: 0.6 },
    { count: 100, type: 'ellipse', radius: 0.8 },
    { count: 40, type: 'ellipse', radius: 1.0 },
    { count: 10, type: 'crumpled', radius: 1.1 }
  ];

  let currentCounts = [0, 0, 0, 0, 0];
  let snowSpawnTimer = 0;

  function spawnSnowflake() {
    for (let i = 0; i < targetCounts.length; i++) {
      if (currentCounts[i] < targetCounts[i].count) {
        const conf = targetCounts[i];
        let radius = conf.radius || (Math.random() * (conf.radiusRange[1] - conf.radiusRange[0]) + conf.radiusRange[0]);

        let points = [];
        if (conf.type === 'crumpled') {
          for (let j = 0; j < 6; j++) {
            const angle = j * (Math.PI * 2 / 6) + Math.random() * 0.5;
            const r = radius * 4 + Math.random() * 2;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            points.push({ x, y });
          }
        }

        snowflakes.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight * 0.1),
          radius,
          speedY: Math.random() * 2 + 2,
          drift: Math.random() * 2 - 1,
          opacity: Math.random() * 0.5 + 0.5,
          type: conf.type,
          alpha: Math.random() * 0.4 + 0.6,
          points
        });
        currentCounts[i]++;
        return;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, seasonCanvas.width / dpr, seasonCanvas.height / dpr);

    const now = performance.now();
    const deltaTime = now - lastFrameTime;
    lastFrameTime = now;

    updateWind(deltaTime);

    snowSpawnTimer += deltaTime;
    if (snowSpawnTimer > 50) {
      snowSpawnTimer = 0;
      spawnSnowflake();
    }

    snowflakes.forEach(flake => {
      const timeScale = deltaTime / 16.67;

      flake.y += flake.speedY * timeScale;
      flake.x += windStrength * flake.speedY * 0.5 * timeScale;
      flake.drift += (Math.random() - 0.5) * 0.05;
      flake.drift = Math.max(-2, Math.min(2, flake.drift));

      if (flake.x > window.innerWidth + 50) {
        flake.x = -20 - Math.random() * 30;
        flake.y = Math.random() * window.innerHeight;
      }

      if (flake.x < -50) {
        flake.x = window.innerWidth + 20 + Math.random() * 30;
        flake.y = Math.random() * window.innerHeight;
      }

      if (flake.y > window.innerHeight + 10) {
        flake.y = -10;
        flake.x = Math.random() * window.innerWidth;
      }

      ctx.save();
      ctx.globalAlpha = flake.alpha;
      ctx.translate(flake.x, flake.y);

      if (flake.type === 'crumpled') {
        ctx.beginPath();
        const pts = flake.points;
        if (pts && pts.length > 0) {
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
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

const screenFactor = window.innerWidth > 1024 ? 1.5 : 1; // povećaj za desktop
  
  const dpr = window.devicePixelRatio || 1;
  seasonCanvas.width = window.innerWidth * dpr;
  seasonCanvas.height = window.innerHeight * dpr;
  ctx = seasonCanvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const width = seasonCanvas.width / dpr;
  const height = seasonCanvas.height / dpr;

  const seedImage = new Image();
  seedImage.src = 'images/maslacak.png';

  const seeds = [];

  let windX = 0;
  let windY = 0;
  let targetWindX = 0;
  let targetWindY = 0;
  let windTimer = 0;
  let windInterval = Math.random() * 6000 + 8000;

  function updateWind(deltaTime) {
    windTimer += deltaTime;
    if (windTimer > windInterval) {
      windTimer = 0;
      windInterval = Math.random() * 8000 + 6000;
      targetWindX = (Math.random() - 0.5) * 0.9;
      targetWindY = (Math.random() - 0.5) * 0.6;
    }
    windX += (targetWindX - windX) * 0.002;
    windY += (targetWindY - windY) * 0.002;
  }

  function spawnSeed() {
    const scale = screenFactor * (1 + Math.random() * 0.6);
    const w = 15 * scale;
    const h = 15 * scale;

    const yPos = Math.random() * height;
    const xStart = width + Math.random() * 10;
    const speed = 0.01 + Math.random() * 0.04;
    const directionAngle = Math.random() * 2 * Math.PI;

    seeds.push({
      x: xStart,
      y: yPos,
      width: w,
      height: h,
      baseSpeed: speed,
      direction: directionAngle,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: 0.003 + Math.random() * 0.004,
      swayRange: 8 + Math.random() * 10,
      age: 0
    });
  }

  function updateAndDrawSeeds(deltaTime) {
    ctx.clearRect(0, 0, seasonCanvas.width, seasonCanvas.height);

    if (Math.random() < 0.4) spawnSeed();

    seeds.forEach(seed => {
      seed.age += deltaTime;

      const speed = seed.baseSpeed;
      const angle = seed.direction;

      const swayX = Math.sin(seed.swayOffset + seed.age * seed.swaySpeed) * (seed.swayRange / 100);
      const swayY = Math.cos(seed.swayOffset + seed.age * seed.swaySpeed) * (seed.swayRange / 100);

      const dx = Math.cos(angle) * speed * deltaTime + swayX + windX * 0.8;
      const dy = Math.sin(angle) * speed * deltaTime + swayY + windY * 0.8;

      seed.x += dx;
      seed.y += dy;

      ctx.drawImage(seedImage, seed.x - seed.width / 2, seed.y - seed.height / 2, seed.width + 1, seed.height + 1);
    });

    // Automatsko uklanjanje sjemenki izvan ekrana
    for (let i = seeds.length - 1; i >= 0; i--) {
      const s = seeds[i];
      if (s.x < -100 || s.x > width + 100 || s.y < -100 || s.y > height + 100) {
        seeds.splice(i, 1);
      }
    }
  }

  let lastFrame = performance.now();

  function animateSpring(now) {
    const deltaTime = now - lastFrame;
    lastFrame = now;

    updateWind(deltaTime);
    updateAndDrawSeeds(deltaTime);
    springAnimationId = requestAnimationFrame(animateSpring);
  }

  seedImage.onload = () => {
    lastFrame = performance.now();
    springAnimationId = requestAnimationFrame(animateSpring);
  };
}

// JESEN
function startAutumnEffect() {
  // Priprema canvasa
  const canvas = document.createElement('canvas');
  canvas.id = 'season-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '99998',
    pointerEvents: 'none'
  });
  document.body.appendChild(canvas);

  ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const drops = [];
  const dropLayers = 3;
  const layerConfigs = [
    { count: 250, speed: 8, opacity: 0.15, width: 0.7 },
    { count: 230, speed: 11, opacity: 0.25, width: 1 },
    { count: 230, speed: 12, opacity: 0.35, width: 1.5 }
  ];

  // Funkcija za stvaranje kapi
  function createDrop(layer) {
    const config = layerConfigs[layer];
    return {
      x: Math.random() * width,
      y: Math.random() * (height * 0.1), // samo vrh ekrana
      length: 3 + Math.random() * 5,
      speed: config.speed + Math.random() * 1,
      width: config.width,
      opacity: config.opacity,
      layer: layer
    };
  }

  // Kontrola postepenog dodavanja kapi
  let dropSpawnTimer = 0;
  const totalLayers = layerConfigs.length;
  const maxDropsPerLayer = [150, 130, 140];

  let lightningTimer = 0;

  function drawRain() {

    ctx.fillStyle = 'rgba(30, 30, 30, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.clearRect(0, 0, width, height);

    // Povremeni bljesak munje
    if (Math.random() < 0.002 && lightningTimer <= 0) {
      lightningTimer = 5;
    }
    if (lightningTimer > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.1 * lightningTimer})`;
      ctx.fillRect(0, 0, width, height);
      lightningTimer--;
    }

    // Dodavanje novih kapi svakih nekoliko frameova
    dropSpawnTimer += 1;
    if (dropSpawnTimer >= 2) {
      dropSpawnTimer = 0;
      for (let layer = 0; layer < totalLayers; layer++) {
        const config = layerConfigs[layer];
        const currentCount = drops.filter(d => d.layer === layer).length;
        if (currentCount < maxDropsPerLayer[layer]) {
          drops.push(createDrop(layer));
        }
      }
    }

    // Crtanje svake kapi
    drops.forEach(drop => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(60,60,60,${drop.opacity})`;
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
