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
  canvas.id = 'winter-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 9999;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const snowflakes = [];
  const flakeCount = 300;

  let windForce = 0;
  let windDirection = 1; // 1 = s desna u lijevo
  let windTimer = 0;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createFlake(type = 'regular') {
    return {
      x: random(0, width),
      y: random(-height, 0),
      vx: random(-0.5, 0.5),
      vy: random(1.4, 2.5),
      size: type === 'irregular' ? random(3, 7) : random(2, 6),
      alpha: random(0.6, 1),
      rotationAngle: random(0, Math.PI * 2),
      rotationSpeed: type === 'irregular' ? random(0.02, 0.06) : 0,
      type,
    };
  }

  for (let i = 0; i < flakeCount; i++) {
    if (i < 30) snowflakes.push(createFlake('large'));
    else if (i < 180) snowflakes.push(createFlake('irregular'));
    else snowflakes.push(createFlake('regular'));
  }

  function drawFlake(flake) {
    if (flake.type === 'regular') {
      ctx.beginPath();
      ctx.ellipse(flake.x, flake.y, flake.size, flake.size * 0.9, 0, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255,255,255,${flake.alpha})`;
      ctx.fill();
    } else if (flake.type === 'large') {
      ctx.beginPath();
      ctx.ellipse(flake.x, flake.y, flake.size * 1.2, flake.size, 0, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255,255,255,${flake.alpha})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(255,255,255,0.5)';
      ctx.fill();
    } else if (flake.type === 'irregular') {
      drawIrregularFlake(flake);
    }
  }

  function drawIrregularFlake(flake) {
    ctx.save();
    ctx.translate(flake.x, flake.y);
    ctx.rotate(flake.rotationAngle);
    ctx.beginPath();

    const points = 12;
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 / points) * i + random(-0.2, 0.2);
      const radius = flake.size * random(0.6, 1.4);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.restore();
  }

  function updateWind() {
    windTimer--;
    if (windTimer <= 0) {
      windForce = random(1.0, 4.0); // jak nalet vjetra
      windDirection = -1; // s desna u lijevo
      windTimer = random(50, 150); // novi nalet za 1–3 sekunde
    }
  }

  function updateFlakes() {
    ctx.clearRect(0, 0, width, height);
    updateWind();

    for (let flake of snowflakes) {
      flake.x += flake.vx + windForce * windDirection * (flake.size / 6);
      flake.y += flake.vy;
      flake.rotationAngle += flake.rotationSpeed;

      if (flake.x > width + 50 || flake.x < -50 || flake.y > height + 50) {
        Object.assign(flake, createFlake(flake.type));
        flake.y = -10;
        flake.x = random(0, width);
      }

      drawFlake(flake);
    }

    requestAnimationFrame(updateFlakes);
  }

  updateFlakes();
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
