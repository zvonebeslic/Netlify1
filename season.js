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
  const strike = document.getElementById('season-strike');
  
  document.querySelectorAll('.season-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const selected = icon.dataset.season;

      stopSeasonEffects(); // Zaustavi sve prethodne

      activeSeason = selected;
      seasonIsRunning = true;

      document.body.classList.add(`season-${selected}`);
      toggle.classList.add('active-season');
      iconsWrapper.classList.remove('visible');

      if (strike) strike.classList.remove('hidden');

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
      if (strike) strike.classList.add('hidden');
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

  const snowflakes = [];
  const targetCounts = [
    { count: 150, type: 'ellipse', radiusRange: [0.2, 0.7] },
    { count: 120, type: 'crumpled', radius: 0.4},
    { count: 100, type: 'ellipse', radius: 0.7},
    { count: 40,  type: 'ellipse', radius: 0.85 },
    { count: 10,  type: 'crumpled', radius: 0.9 }
  ];
  let currentCounts = [0, 0, 0, 0, 0];
  let snowSpawnTimer = 0;

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
      gustDuration = Math.random() * 5000 + 6000;
      targetWind = (Math.random() < 0.5 ? -1 : 1) * maxWindStrength * 3;
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

  function spawnSnowflake() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const isDesktop = width >= 1024;
    const baseSize = isDesktop ? height / 1000 : 1;

    for (let i = 0; i < targetCounts.length; i++) {
      if (currentCounts[i] < targetCounts[i].count) {
        const conf = targetCounts[i];

        let radius = conf.radius
          ? conf.radius * baseSize
          : (Math.random() * (conf.radiusRange[1] - conf.radiusRange[0]) + conf.radiusRange[0]) * baseSize;

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

        const baseSpeed = (height / 800) + Math.random() * (height / 1200);
        const baseDrift = (Math.random() * 2 - 1) * (width / 600);

        snowflakes.push({
          x: Math.random() * width,
          y: -Math.random() * 30,
          radius,
          speedY: baseSpeed,
          drift: baseDrift,
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
      flake.x += flake.drift * timeScale;

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


// LJETO
function startSummerEffect() {
  cancelAllSeasonAnimations();
  setupSeasonCanvas();
  spawnBirdFlock(); // odmah prvo jato

  const ctx = seasonCanvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  seasonCanvas.width = window.innerWidth * dpr;
  seasonCanvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const isDesktop = width >= 1024;
  const baseScale = isDesktop ? height / 1000 : 1;
  const baseMM = 3.78 * baseScale;

  const birds = [];
  let birdSpawnTimer = 0;
  let birdSpawnInterval = 10000 + Math.random() * 10000;

  class Bird {
    constructor() {
      this.sizeMM = 3 + Math.random() * 3;
      this.pixelSize = this.sizeMM * baseMM;
      this.x = -this.pixelSize - Math.random() * 100;
      this.y = Math.random() * (height * 0.5);
      this.speed = (0.6 + Math.random()) * baseScale;
      this.frame = Math.floor(Math.random() * 5);
      this.frameTimer = 0;
      this.frameInterval = 50;
      this.offsetY = Math.random() * 8 - 4;
    }

    update(delta) {
      this.x += this.speed;
      this.y += Math.sin(this.x * 0.01) * 0.3;

      this.frameTimer += delta;
      if (this.frameTimer > this.frameInterval) {
        this.frame = (this.frame + 1) % 5;
        this.frameTimer = 0;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y + this.offsetY);
      ctx.scale(this.pixelSize / 20, this.pixelSize / 20);
      drawBirdShape(ctx, this.frame);
      ctx.restore();
    }

    isOffScreen() {
      return this.x > width + 100;
    }
  }

  function spawnBirdFlock() {
    const count = 3 + Math.floor(Math.random() * 13);
    for (let i = 0; i < count; i++) {
      setTimeout(() => birds.push(new Bird()), i * 120);
    }
  }

  function drawBirdShape(ctx, frame) {
    ctx.lineWidth = 0.5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.ellipse(0, 0, 2.3, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.arc(2.3, -0.3, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.ellipse(-1, -0.4, 2.5, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(-2.5, -0.4);
    ctx.lineTo(1.5, -0.4);
    ctx.stroke();

    const wingAngles = [-0.9, -0.45, 0, 0.45, 0.9];
    const angle = wingAngles[frame];

    ctx.save();
    ctx.fillStyle = '#2255cc';
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -5.5);
    ctx.lineTo(1.5, -2.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(-1, 1);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -5.5);
    ctx.lineTo(1.5, -2.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const rays = [];
  const totalRays = 7;
  const sharedAngle = Math.PI * 0.6;

  class SunRay {
    constructor(x) {
      this.x = x;
      this.y = 0;
      this.length = height * 1.2;
      this.baseWidthTop = 3 * baseMM;
      this.baseWidthBottom = 14 * baseMM;
      this.opacity = 0;
      this.opacityMax = 0.06;
      this.appeared = false;
      this.life = 0;
      this.maxLife = 60000 + Math.random() * 8000;
      this.fadingOut = false;
      this.pulseOffset = Math.random() * 10000;
      this.pulseSpeed = 0.00008 + Math.random() * 0.00005;
      this.offsetX = 0;
    }

    update(delta, time) {
      this.life += delta;

      if (!this.appeared) {
        this.opacity += delta * 0.00005;
        if (this.opacity >= this.opacityMax) {
          this.opacity = this.opacityMax;
          this.appeared = true;
        }
      }

      if (this.life > this.maxLife) {
        this.fadingOut = true;
      }

      if (this.fadingOut) {
        this.opacity -= delta * 0.00002;
        if (this.opacity < 0) this.opacity = 0;
      }

      this.offsetX = Math.sin((time + this.pulseOffset) * this.pulseSpeed) * 10;

      if (this.opacity <= 0.001) {
        this.life = 0;
        this.appeared = false;
        this.fadingOut = false;
        this.opacity = 0;
        this.maxLife = 60000 + Math.random() * 8000;
        this.pulseOffset = Math.random() * 10000;
        this.x = Math.random() * width;
      }
    }

    draw(ctx) {
      if (this.opacity <= 0) return;

      const angleX = Math.cos(sharedAngle);
      const angleY = Math.sin(sharedAngle);

      const endX = this.x + angleX * this.length + this.offsetX;
      const endY = this.y + angleY * this.length;

      const normalX = -angleY;
      const normalY = angleX;

      const topHalf = this.baseWidthTop / 2;
      const bottomHalf = this.baseWidthBottom / 2;

      const p1x = this.x + normalX * topHalf;
      const p1y = this.y + normalY * topHalf;
      const p2x = this.x - normalX * topHalf;
      const p2y = this.y - normalY * topHalf;
      const p3x = endX - normalX * bottomHalf;
      const p3y = endY - normalY * bottomHalf;
      const p4x = endX + normalX * bottomHalf;
      const p4y = endY + normalY * bottomHalf;

      const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
      gradient.addColorStop(0.0, `rgba(255,255,220,${this.opacity})`);
      gradient.addColorStop(0.6, `rgba(255,255,200,${this.opacity * 0.4})`);
      gradient.addColorStop(0.85, `rgba(255,255,200,${this.opacity * 0.2})`);
      gradient.addColorStop(1.0, `rgba(255,255,200,0)`);

      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
      ctx.lineTo(p4x, p4y);
      ctx.closePath();

      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  for (let i = 0; i < totalRays; i++) {
    rays.push(new SunRay(Math.random() * width));
  }

  let lastTime = performance.now();
  function animate() {
    summerAnimationId = requestAnimationFrame(animate);
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    birdSpawnTimer += delta;
    if (birdSpawnTimer > birdSpawnInterval) {
      spawnBirdFlock();
      birdSpawnInterval = 10000 + Math.random() * 10000;
      birdSpawnTimer = 0;
    }

    birds.forEach(bird => bird.update(delta));
    birds.forEach(bird => bird.draw(ctx));
    for (let i = birds.length - 1; i >= 0; i--) {
      if (birds[i].isOffScreen()) birds.splice(i, 1);
    }

    const time = now;
    for (let ray of rays) {
      ray.update(delta, time);
      ray.draw(ctx);
    }

    ctx.restore();
  }

  animate();
}


// PROLJEĆE
function startSpringEffect() {
  cancelAllSeasonAnimations();
  setupSeasonCanvas(); 

  const isDesktop = window.innerWidth >= 1024;
  const baseSize = isDesktop ? window.innerHeight / 1000 : 1;

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
    const scale = baseSize * (1 + Math.random() * 0.6);
    const w = 14 * scale;
    const h = 14 * scale;

    const yPos = Math.random() * height;
    const xStart = width + Math.random() * 10;
    const speed = (0.01 + Math.random() * 0.04) * baseSize;
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
      swayRange: (8 + Math.random() * 10) * baseSize,
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
  cancelAllSeasonAnimations();
  setupSeasonCanvas();

  ctx = seasonCanvas.getContext('2d');

  const screenFactor = window.innerWidth > 1024 ? 1.3 : 1;
  let width = seasonCanvas.width / dpr;
  let height = seasonCanvas.height / dpr;

  const drops = [];
  const dropLayers = 5;
  const layerConfigs = [
    { count: 150, speed: 8, opacity: 0.15, width: 0.7 },
    { count: 120, speed: 11, opacity: 0.25, width: 1 },
    { count: 120, speed: 12, opacity: 0.35, width: 1.5 },
    { count: 80,  speed: 9,  opacity: 0.20, width: 1 },
    { count: 80,  speed: 10, opacity: 0.25, width: 1.2 },
  ];

  let lightning = null;
  let lightningCooldown = 0;

  function drawLightning(x, y, depth = 0, angle = Math.PI / 2) {
    if (depth > 4 || y > height * 0.5) return;
    const segmentLength = (13 + Math.random() * 18) * screenFactor;
    const deviation = (Math.random() - 0.5) * Math.PI / 3;
    const newAngle = angle + deviation;

    const x2 = x + Math.cos(newAngle) * segmentLength;
    const y2 = y + Math.sin(newAngle) * segmentLength;

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.7 * screenFactor;
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (depth < 2) {
      const branchCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < branchCount; i++) {
        const branchAngle = newAngle + ((Math.random() < 0.5 ? -1 : 1) * Math.random() * Math.PI / 3);
        const branchLength = segmentLength * (0.4 + Math.random() * 0.4);
        const bx = x2 + Math.cos(branchAngle) * branchLength;
        const by = y2 + Math.sin(branchAngle) * branchLength;
        if (by < height * 0.5) {
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }
    }

    if (Math.random() < 0.85 && y2 < height * 0.5) {
      drawLightning(x2, y2, depth + 1, newAngle);
    }
  }

  function triggerLightning() {
    lightning = {
      created: performance.now(),
      flashes: [{ x: Math.random() * width, y: Math.random() * height * 0.1 + 10 }]
    };
    if (Math.random() < 0.2) {
      lightning.flashes.push({ x: Math.random() * width, y: Math.random() * height * 0.1 + 10 });
    }
  }

  function createDrop(layer) {
    const config = layerConfigs[layer];
    return {
      x: Math.random() * width + Math.sin(Math.random() * 1000) * 5,
      y: Math.random() * -height * 0.3,
      length: (3 + Math.random() * 5) * screenFactor,
      speed: (config.speed + Math.random() * 1) * screenFactor,
      width: config.width * screenFactor,
      opacity: config.opacity,
      layer: layer
    };
  }

  let dropSpawnTimer = 0;
  const totalLayers = layerConfigs.length;
  const maxDropsPerLayer = layerConfigs.map(c => Math.round(c.count * screenFactor));

  function drawRain(timestamp) {
    width = seasonCanvas.width / dpr;
    height = seasonCanvas.height / dpr;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(70, 70, 70, 0.25)';
    ctx.fillRect(0, 0, width, height);

    const elapsed = lightning ? timestamp - lightning.created : 0;
    if (lightningCooldown <= 0 && Math.random() < 0.002) {
      triggerLightning();
      lightningCooldown = 5000;
    } else {
      lightningCooldown -= 16.66;
    }

    if (lightning) {
      if (elapsed < 180) {
        lightning.flashes.forEach(p => drawLightning(p.x, p.y));
      } else if (elapsed < 600) {
        const alpha = (600 - elapsed) / 420 * 0.25;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(0, 0, width, height);
      } else {
        lightning = null;
      }
    }

    dropSpawnTimer++;
    if (dropSpawnTimer >= 2) {
      dropSpawnTimer = 0;
      for (let layer = 0; layer < totalLayers; layer++) {
        const currentCount = drops.filter(d => d.layer === layer).length;
        if (currentCount < maxDropsPerLayer[layer]) {
          drops.push(createDrop(layer));
        }
      }
    }

    drops.forEach(drop => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(60,60,60,${drop.opacity})`;
      ctx.lineWidth = drop.width;
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();

      drop.y += drop.speed;
      if (drop.y > height + 20) {
        drop.y = -20;
        drop.x = Math.random() * width;
      }
    });

    autumnAnimationId = requestAnimationFrame(drawRain);
  }

  autumnAnimationId = requestAnimationFrame(drawRain);
}

