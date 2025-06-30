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


function startWinterEffect() {
  const existing = document.getElementById('season-canvas');
  if (existing) existing.remove();
  const canvas = document.createElement('canvas');
  canvas.id = 'season-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99998';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  let wind = 0;
  let windTarget = 0;

  const flakes = [];
  for (let i = 0; i < 300; i++) {
    const isIrregular = Math.random() < 0.3;
    flakes.push({
      type: isIrregular ? 'irregular' : 'ellipse',
      x: Math.random() * width,
      y: Math.random() * height,
      rX: isIrregular ? Math.random() * 2 + 1 : Math.random() * 3 + 2,
      rY: isIrregular ? Math.random() * 1.5 + 1 : Math.random() * 2 + 1.5,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      speedY: Math.random() * 1 + 0.5,
      drift: Math.random() * 0.5 - 0.25,
      opacity: Math.random() * 0.4 + 0.4
    });
  }

  function updateWind() {
    windTarget = (Math.random() - 0.5) * 1.2;
    setTimeout(updateWind, Math.random() * 5000 + 3000);
  }
  updateWind();

  function animate() {
    ctx.clearRect(0, 0, width, height);
    wind += (windTarget - wind) * 0.01;
    flakes.forEach(f => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.angle);
      ctx.globalAlpha = f.opacity;
      ctx.beginPath();

      if (f.type === 'irregular') {
        const t = 16;
        const step = (Math.PI * 2) / t;
        ctx.moveTo(f.rX * (1 + 0.2 * Math.random()) * Math.cos(0), f.rY * (1 + 0.2 * Math.random()) * Math.sin(0));
        for (let a = step; a < Math.PI * 2; a += step) {
          const r1 = f.rX * (1 + 0.2 * Math.random());
          const r2 = f.rY * (1 + 0.2 * Math.random());
          ctx.lineTo(r1 * Math.cos(a), r2 * Math.sin(a));
        }
        ctx.closePath();
      } else {
        ctx.ellipse(0, 0, f.rX, f.rY, 0, 0, Math.PI * 2);
      }

      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.restore();

      f.y += f.speedY;
      f.x += wind + f.drift;
      f.angle += f.rotationSpeed;

      if (f.y > height + 10) f.y = -10;
      if (f.x > width + 20) f.x = -20;
      if (f.x < -20) f.x = width + 20;
    });
    requestAnimationFrame(animate);
  }
  animate();
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
