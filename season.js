// season.js - kompaktan za mobilni prikaz

let seasonCanvas;
let ctx;
let dpr = window.devicePixelRatio || 1;

const seedImage = new Image();
seedImage.src = 'images/maslacak.png';

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
    { count: 150, type: 'ellipse', radiusRange: [0.3, 1.5] },
    { count: 80, type: 'crumpled', radius: 0.6 },
    { count: 40, type: 'ellipse', radius: 0.8 },
    { count: 20, type: 'ellipse', radius: 1.0 },
    { count: 10, type: 'crumpled', radius: 1.2 }
  ];

  let currentCounts = [0, 0, 0, 0, 0];
  let snowSpawnTimer = 0;

  function spawnSnowflake() {
    for (let i = 0; i < targetCounts.length; i++) {
      if (currentCounts[i] < targetCounts[i].count) {
        const conf = targetCounts[i];
        let radius = conf.radius || (Math.random() * (conf.radiusRange[1] - conf.radiusRange[0]) + conf.radiusRange[0]);
        snowflakes.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight * 0.1),
          radius,
          speedY: Math.random() * 2 + 2,
          drift: Math.random() * 2 - 1,
          rotation: Math.random() * Math.PI,
          opacity: Math.random() * 0.5 + 0.5,
          type: conf.type,
          rotateSpeed: (Math.random() - 0.5) * 0.2,
          angle: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.4 + 0.6
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
    if (snowSpawnTimer > 50) { // dodaj jednu pahulju svakih 50ms
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
  cancelAllSeasonAnimations(); // Prekini sve prethodne animacije
  setupSeasonCanvas();         // Postavi canvas, ctx, dpr, width, height

  if (!ctx) {
    console.warn('⚠️ ctx nije dostupan — canvas nije inicijaliziran.');
    return;
  }

  const mm = 3.78;
  const seeds = [];
  const maxSeeds = 120;
  const burstStart = 20;
  let spawnTimer = 0;
  const spawnInterval = 220;

  // === POVJETARAC ===
  let wind = 0;
  let targetWind = 0;
  let windTimer = 0;
  let windInterval = Math.random() * 6000 + 6000;

  function updateWind(deltaTime) {
    windTimer += deltaTime;
    if (windTimer > windInterval) {
      windTimer = 0;
      windInterval = Math.random() * 8000 + 6000;
      targetWind = (Math.random() - 0.5) * 1.5;
    }
    wind += (targetWind - wind) * 0.003;
  }

  function createSeed(sizeGroup, insideViewport = false) {
    let size = 1.0;
    if (sizeGroup === 1) size += 1 / mm;
    if (sizeGroup === 2) size += 2 / mm;
    if (sizeGroup === 3) size += 3 / mm;

    return {
      x: insideViewport
        ? width - Math.random() * 100
        : width + Math.random() * 10,
      y: height * 0.6 + Math.random() * height * 0.4,
      baseDriftY: (Math.random() - 0.5) * 0.6,
      driftX: -0.4 - Math.random() * 0.8,
      speedFactor: 0.4 + Math.random() * 1.2,
      floatOffset: Math.random() * 3000,
      size,
      time: 0
    };
  }

  function spawnSeed() {
    if (seeds.length >= maxSeeds) return;
    const group = Math.floor(seeds.length / 30);
    seeds.push(createSeed(group));
  }

  function drawSeed(s) {
    const pxSize = 30 * s.size;

    ctx.save();
    ctx.translate(s.x, s.y);

    const swing = Math.sin((s.time + s.floatOffset) / 900);
    const tiltY = 1 + swing * 0.2;
    ctx.scale(1, tiltY);

    if (seedImage && seedImage.width > 0) {
      ctx.drawImage(seedImage, -pxSize / 2, -pxSize / 2, pxSize, pxSize);
    } else {
      // Fallback prikaz ako slika nije učitana
      ctx.beginPath();
      ctx.arc(0, 0, pxSize / 3, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
    }

    ctx.restore();
  }

  let lastTime = performance.now();

  function animate(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    const timeScale = deltaTime / 16.67;

    ctx.clearRect(0, 0, width, height);
    updateWind(deltaTime);

    spawnTimer += deltaTime;
    if (spawnTimer > spawnInterval) {
      spawnSeed();
      spawnTimer = 0;
    }

    for (let i = seeds.length - 1; i >= 0; i--) {
      const s = seeds[i];
      s.time += deltaTime;

      const oscillationY = Math.sin((s.time + s.floatOffset) / 1100) * 0.25;
      const driftY = s.baseDriftY + oscillationY + wind * 0.05;

      s.y += driftY * s.speedFactor * timeScale;
      s.x += (s.driftX + wind * 0.4) * s.speedFactor * timeScale;

      drawSeed(s);

      if (
        s.x < -100 || s.x > width + 150 ||
        s.y < -150 || s.y > height + 150
      ) {
        const group = Math.floor(i / 30);
        seeds[i] = createSeed(group);
      }
    }

    springAnimationId = requestAnimationFrame(animate);
  }

  // 📦 Pokreni burst sjeme + animaciju
  for (let i = 0; i < burstStart; i++) {
    const group = Math.floor(i / 30);
    seeds.push(createSeed(group, true));
  }

  if (!seedImage.complete || seedImage.width === 0) {
    seedImage.onload = () => {
      console.log('🌱 seedImage loaded.');
      animate();
    };
  } else {
    animate();
  }
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
    { count: 80, speed: 2, opacity: 0.15, width: 0.7 },
    { count: 100, speed: 4, opacity: 0.25, width: 1 },
    { count: 80, speed: 6, opacity: 0.35, width: 1.5 }
  ];

  // Funkcija za stvaranje kapi
  function createDrop(layer) {
    const config = layerConfigs[layer];
    return {
      x: Math.random() * width,
      y: Math.random() * (height * 0.1), // samo vrh ekrana
      length: 10 + Math.random() * 15,
      speed: config.speed + Math.random() * 1,
      width: config.width,
      opacity: config.opacity,
      layer: layer
    };
  }

  // Kontrola postepenog dodavanja kapi
  let dropSpawnTimer = 0;
  const totalLayers = layerConfigs.length;
  const maxDropsPerLayer = [80, 100, 80];

  let lightningTimer = 0;

  function drawRain() {
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
