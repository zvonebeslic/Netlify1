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
  const canvas = document.createElement('canvas');
  canvas.id = 'snow-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const snowflakes = [];
  const maxFlakes = 280;
  let globalWind = 0;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function updateWind() {
    const intensity = Math.random() * 2 - 1;
    globalWind = intensity * 2.5;
    setTimeout(updateWind, 2500 + Math.random() * 3000);
  }
  updateWind();

  function drawIrregularFlake(flake) {
    ctx.save();
    ctx.translate(flake.x, flake.y);
    ctx.rotate(flake.rotationAngle);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = flake.size + Math.random() * flake.size * 0.5;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`;
    ctx.shadowBlur = 1;
    ctx.shadowColor = 'rgba(255,255,255,0.4)';
    ctx.fill();
    ctx.restore();
  }

  function createFlake(type) {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: type === 'big' ? random(10, 14) : type === 'medium' ? random(6, 9) : random(3, 5),
      speed: random(1.5, 3.5),
      drift: random(-0.3, 0.3),
      alpha: random(0.3, 0.8),
      type,
      rotationAngle: random(0, Math.PI * 2),
      rotationSpeed: type === 'irregular' ? random(0.2, 0.6) : 0
    };
  }

  for (let i = 0; i < maxFlakes; i++) {
    if (i < 10) snowflakes.push(createFlake('big'));
    else if (i < 50) snowflakes.push(createFlake('medium'));
    else if (i < 130) snowflakes.push(createFlake('small'));
    else snowflakes.push(createFlake('irregular'));
  }

  function drawFlake(flake) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`;
    ctx.shadowBlur = 1;
    ctx.shadowColor = 'rgba(255,255,255,0.3)';

    if (flake.type === 'irregular') {
      drawIrregularFlake(flake);
      return;
    }

    ctx.ellipse(flake.x, flake.y, flake.size, flake.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function update() {
    ctx.clearRect(0, 0, width, height);
    for (const flake of snowflakes) {
      flake.y += flake.speed;
      flake.x += flake.drift + globalWind * 0.1;
      if (flake.rotationSpeed) flake.rotationAngle += flake.rotationSpeed;

      if (flake.y > height) {
        flake.y = -flake.size;
        flake.x = Math.random() * width;
        flake.rotationAngle = random(0, Math.PI * 2);
      }
      if (flake.x > width) flake.x = 0;
      if (flake.x < 0) flake.x = width;

      drawFlake(flake);
    }
    requestAnimationFrame(update);
  }

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  update();
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
