// season.js - kompaktan za mobilni prikaz

function initializeSeasonToggle() {
  const toggle = document.getElementById('season-toggle');
  const iconsWrapper = document.getElementById('season-icons');
  const stopButton = document.getElementById('stop-season');
  if (!toggle || !iconsWrapper || !stopButton) return;
  let activeSeason = null;
  toggle.addEventListener('click', () => {
    iconsWrapper.classList.toggle('hidden');
    iconsWrapper.classList.toggle('visible');
  });
  document.querySelectorAll('.season-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const selected = icon.dataset.season;
      if (activeSeason === selected) {
        stopSeasonEffects(); return;
      }
      stopSeasonEffects();
      activeSeason = selected;
      document.body.classList.add(`season-${selected}`);
      stopButton.classList.remove('hidden');
      if (selected === 'winter') startWinterEffect();
      else if (selected === 'spring') startSpringEffect();
      else if (selected === 'autumn') startAutumnEffect();
      else if (selected === 'summer') startSummerEffect();
    });
  });
  stopButton.addEventListener('click', stopSeasonEffects);
}

function stopSeasonEffects() {
  document.body.classList.remove('season-winter', 'season-spring', 'season-autumn', 'season-summer');
  document.getElementById('stop-season').classList.add('hidden');
  const canvas = document.getElementById('season-canvas');
  if (canvas) canvas.remove();
}

function createSeasonCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'season-canvas';
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '99998'
  });
  document.body.appendChild(canvas);
  return canvas;
}

// ZIMA
// === REALISTIC WINTER EFFECT ===
function startWinterEffect() {
  const canvas = document.createElement('canvas');
  canvas.id = 'season-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '9999';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

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
    type: 'crumpled'
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
    type: 'ellipse'
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
    radius: 1.5,
    speedY: Math.random() * 1 + 2,
    drift: Math.random() * 0.8 - 0.4,
    rotation: Math.random() * Math.PI,
    opacity: Math.random() * 0.3 + 0.7,
    type: 'ellipse'
  });
}

  const windStates = [0.2, 0.5, 1.2, 2.5];
  let currentWind = windStates[0];

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

  for (let i = 0; i < totalFlakes; i++) {
    snowflakes.push(createFlake());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    snowflakes.forEach(flake => {
      flake.y += flake.speedY;
      flake.x += flake.drift + currentWind;
      flake.angle += flake.rotateSpeed;

      if (flake.y > window.innerHeight) flake.y = -10;
      if (flake.x > window.innerWidth) flake.x = -10;
      if (flake.x < -10) flake.x = window.innerWidth + 10;

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

    requestAnimationFrame(draw);
  }

  draw();

  // Vjetar svakih 10 sekundi
  let windIndex = 0;
  setInterval(() => {
    windIndex = (windIndex + 1) % windStates.length;
    currentWind = windStates[windIndex] * (Math.random() < 0.5 ? 1 : -1);
  }, 10000);

  // Resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  });
} 


function startSpringEffect() {
  const canvas = createSeasonCanvas();
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
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
  const canvas = createSeasonCanvas();
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
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
  const canvas = createSeasonCanvas();
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
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
