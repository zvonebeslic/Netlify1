// === seasonchange.js (popravljena verzija, mobile optimized) ===
let activeSeason = null;

function initSeasonChange() {
  const seasonToggle = document.getElementById('season-toggle');
  const seasonIcons = document.getElementById('season-icons');
  const stopButton = document.getElementById('stop-season');

  seasonToggle.addEventListener('click', () => {
    seasonIcons.classList.toggle('visible');
  });

  document.querySelectorAll('.season-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const season = icon.dataset.season;

      if (activeSeason === season) {
        stopSeasonEffects();
        return;
      }

      stopSeasonEffects();
      activeSeason = season;
      stopButton.classList.remove('hidden');

      if (season === 'winter') startWinterEffect();
      if (season === 'spring') startSpringEffect();
      if (season === 'summer') startSummerEffect();
      if (season === 'autumn') startAutumnEffect();
    });
  });

  stopButton.addEventListener('click', stopSeasonEffects);
}

function stopSeasonEffects() {
  activeSeason = null;

  document.querySelectorAll('.season-layer, canvas, .animated-object, .snow-layer')
    .forEach(el => el.remove());

  document.getElementById('stop-season')?.classList.add('hidden');

  // Zaustavi sve specifične efekte
  if (typeof stopWinterEffect === 'function') stopWinterEffect();
  if (typeof stopSpringEffect === 'function') stopSpringEffect();
  if (typeof stopSummerEffect === 'function') stopSummerEffect();
  if (typeof stopAutumnEffect === 'function') stopAutumnEffect();
}


// === ZIMSKI EFEKT === (POČETAK ZIME)
let winterIntervals = [];

function startWinterEffect() {
  // === OSNOVNA POSTAVKA CANVASA ===
  const canvas = document.createElement('canvas');
  canvas.id = 'snow-canvas';
  canvas.classList.add('season-layer');
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '9998'
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // === PAHULJE - 6 SLOJEVA ===
  const layers = [
    { count: 100, size: [0.5, 1.5], speed: 0.4 },
    { count: 80, size: [1, 2], speed: 0.7 },
    { count: 60, size: [2, 3.5], speed: 1.0 },
    { count: 40, size: [3, 5], speed: 1.5 },
    { count: 20, size: [4, 6], speed: 2.0 },
    { count: 10, size: [5, 8], speed: 2.5 }
  ];
  const flakes = [];
  layers.forEach(layer => {
    for (let i = 0; i < layer.count; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * (layer.size[1] - layer.size[0]) + layer.size[0],
        d: layer.speed + Math.random(),
        wind: Math.random() * 1.5 - 0.75,
        layer: layer.speed
      });
    }
  });

  function drawFlakes() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    flakes.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      f.y += f.d;
      f.x += f.wind + Math.sin(f.y * 0.005);
      if (f.y > height || f.x < -50 || f.x > width + 50) {
        f.x = Math.random() * width;
        f.y = -10;
      }
    });
    requestAnimationFrame(drawFlakes);
  }
  drawFlakes();

  // === NAKUPLJANJE SNIJEGA ===
  const snowInterval = setInterval(() => {
    const snowLayers = document.querySelectorAll('.snow-layer');
    if (!snowLayers.length) return;
    const rand = snowLayers[Math.floor(Math.random() * snowLayers.length)];
    const h = parseFloat(rand.style.height || 0);
    if (h < 25) {
      rand.style.height = (h + 2) + 'px';
    } else {
      rand.style.transition = 'transform 1s ease, opacity 1s ease';
      rand.style.transform = 'translateY(100%)';
      rand.style.opacity = '0';
      setTimeout(() => {
        rand.style.height = '0px';
        rand.style.transform = 'none';
        rand.style.opacity = '0.6';
        rand.style.transition = 'height 2s ease';
      }, 1000);
    }
  }, 9500);
  winterIntervals.push(snowInterval);

  document.querySelectorAll('.content-box, .web-intro, .markacija, .blog-bubble, h1, h2, h3, p, .navbar, footer').forEach(el => {
    if (!el.querySelector('.snow-layer')) {
      const snow = document.createElement('div');
      snow.className = 'snow-layer';
      Object.assign(snow.style, {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '0px',
        background: 'white',
        opacity: '0.6',
        transition: 'height 2s ease',
        pointerEvents: 'none',
        zIndex: '4'
      });
      el.style.position = 'relative';
      el.appendChild(snow);
    }
  });

  // === ZALEĐENI KUTOVI ===
  ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(pos => {
    const ice = document.createElement('div');
    ice.className = 'animated-object';
    ice.textContent = '🧊';
    Object.assign(ice.style, {
      position: 'fixed',
      zIndex: '9999',
      fontSize: '28px',
      opacity: '0.65'
    });
    if (pos.includes('top')) ice.style.top = '0';
    if (pos.includes('bottom')) ice.style.bottom = '0';
    if (pos.includes('left')) ice.style.left = '0';
    if (pos.includes('right')) ice.style.right = '0';
    document.body.appendChild(ice);
  });

  // === MAGLA GORE I DOLJE ===
  ['top', 'bottom'].forEach(dir => {
    const fogInterval = setInterval(() => {
      const fog = document.createElement('div');
      fog.className = 'season-layer';
      Object.assign(fog.style, {
        position: 'fixed',
        [dir]: 0,
        left: 0,
        width: '100vw',
        height: '20vh',
        background: 'linear-gradient(to top, rgba(255,255,255,0.25), transparent)',
        zIndex: '9996',
        opacity: '0',
        transition: 'opacity 2s ease'
      });
      document.body.appendChild(fog);
      setTimeout(() => fog.style.opacity = '1', 200);
      setTimeout(() => fog.style.opacity = '0', 3000);
      setTimeout(() => fog.remove(), 5000);
    }, 45000);
    winterIntervals.push(fogInterval);
  });

  // === PUCAJ LED ===
  const crackInterval = setInterval(() => {
    const crack = document.createElement('div');
    crack.className = 'season-layer';
    Object.assign(crack.style, {
      position: 'fixed',
      top: Math.random() * 70 + 'vh',
      left: Math.random() * 80 + 'vw',
      width: '20vw',
      height: '20vh',
      background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4), transparent)',
      border: '1px solid rgba(255,255,255,0.4)',
      borderRadius: '50%',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 1s ease, transform 2s ease'
    });
    document.body.appendChild(crack);
    setTimeout(() => crack.style.opacity = '1', 100);
    setTimeout(() => {
      crack.style.transform = 'scale(1.5) rotate(20deg)';
      crack.style.opacity = '0';
    }, 1800);
    setTimeout(() => crack.remove(), 4000);
  }, 30000);
  winterIntervals.push(crackInterval);

  // === SHAKE BODY ===
  const shakeInterval = setInterval(() => {
    document.body.style.transition = 'transform 0.2s';
    document.body.style.transform = 'translateX(-2px)';
    setTimeout(() => document.body.style.transform = 'translateX(2px)', 100);
    setTimeout(() => document.body.style.transform = 'translateX(0)', 200);
  }, 20000);
  winterIntervals.push(shakeInterval);

  // === SNJEŠKO ===
  const snowmanInterval = setInterval(() => {
    const snowman = document.createElement('div');
    snowman.className = 'animated-object';
    snowman.innerHTML = '<span style="display:inline-block; transform: rotate(5deg);">⛄</span>';
    Object.assign(snowman.style, {
      position: 'fixed',
      top: (Math.random() * 60 + 20) + 'vh',
      left: '-10vw',
      fontSize: '32px',
      zIndex: '9999',
      transition: 'transform 10s ease-in-out',
      opacity: '0.9'
    });
    document.body.appendChild(snowman);
    setTimeout(() => snowman.style.transform = 'translateX(130vw) rotate(10deg)', 200);
    setTimeout(() => snowman.remove(), 11000);
  }, 20000);
  winterIntervals.push(snowmanInterval);
}

// === STOP WINTER EFFECT ===
window.stopWinterEffect = () => {
  document.getElementById('snow-canvas')?.remove();
  document.querySelectorAll('.snow-layer, .animated-object, .season-layer').forEach(el => el.remove());
  winterIntervals.forEach(id => clearInterval(id));
  winterIntervals = [];
  document.body.style.transform = 'none';
};

// === SUMMER EFFECT === (POČETAK LJETA)
let summerIntervals = [];
let summerStyleTag = null;

function startSummerEffect() {
  if (document.getElementById('summer-wrapper')) return;

  const summerWrapper = document.createElement('div');
  summerWrapper.id = 'summer-wrapper';
  summerWrapper.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none;
    z-index: 9998;
    overflow: hidden;
  `;
  document.body.appendChild(summerWrapper);

  const sunCore = document.createElement('div');
  sunCore.className = 'sun-core';
  sunCore.style.cssText = `
    position: absolute;
    top: -20vh;
    left: 50%;
    width: 180px;
    height: 180px;
    margin-left: -90px;
    background: radial-gradient(circle, rgba(255,255,150,0.8) 0%, rgba(255,255,255,0.3) 60%, transparent 100%);
    border-radius: 50%;
    filter: blur(10px);
    animation: sunPulse 10s ease-in-out infinite;
    z-index: 9992;
  `;
  summerWrapper.appendChild(sunCore);

  const rayColors = [
    'rgba(255,255,180,0.12)',
    'rgba(255,250,200,0.08)',
    'rgba(255,255,255,0.06)',
    'rgba(255,230,150,0.05)',
    'rgba(255,255,220,0.04)'
  ];

  for (let i = 0; i < 120; i++) {
    const ray = document.createElement('div');
    ray.className = 'sun-ray';
    const size = 90 + Math.random() * 160;
    const angle = Math.random() * 360;
    const distance = 100 + Math.random() * 250;
    const opacity = 0.03 + Math.random() * 0.08;
    const color = rayColors[i % rayColors.length];
    const delay = Math.random() * 3;

    ray.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 3px;
      height: ${size}px;
      margin-top: -${size / 2}px;
      margin-left: -1.5px;
      background: linear-gradient(to bottom, ${color}, transparent);
      transform: rotate(${angle}deg) translateY(-${distance}px);
      transform-origin: center bottom;
      opacity: ${opacity};
      animation: rayPulse ${5 + Math.random() * 5}s ease-in-out ${delay}s infinite;
      z-index: 9991;
    `;
    summerWrapper.appendChild(ray);
  }

  summerStyleTag = document.createElement('style');
  summerStyleTag.textContent = `
    @keyframes sunPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.85; }
    }

    @keyframes rayPulse {
      0%, 100% { opacity: 0.05; }
      50% { opacity: 0.25; }
    }

    @keyframes waveDrift {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(3vw); }
    }

    @keyframes auraPulse {
      0%, 100% { transform: scale(1); opacity: 0.15; }
      50% { transform: scale(1.05); opacity: 0.25; }
    }

    @keyframes flareSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    body.summer-active {
      filter: brightness(1.04) sepia(0.05) saturate(1.1);
      transition: filter 1s ease;
    }
  `;
  document.head.appendChild(summerStyleTag);

  for (let i = 0; i < 10; i++) {
    const wave = document.createElement('div');
    wave.className = 'heat-wave';
    wave.style.cssText = `
      position: absolute;
      bottom: ${i * 5}vh;
      left: 0;
      width: 100vw;
      height: 5vh;
      background: rgba(255,255,255,0.03);
      animation: waveDrift ${6 + i}s ease-in-out infinite;
      filter: blur(${1 + i % 2}px);
      z-index: ${9980 + i};
    `;
    summerWrapper.appendChild(wave);
  }

  for (let j = 0; j < 5; j++) {
    const radius = 300 + j * 80;
    const aura = document.createElement('div');
    aura.className = 'sun-aura';
    aura.style.cssText = `
      position: absolute;
      top: calc(50% - ${radius / 2}px);
      left: calc(50% - ${radius / 2}px);
      width: ${radius}px;
      height: ${radius}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,220,0.02), transparent 70%);
      z-index: 9985;
      animation: auraPulse ${10 + j * 2}s ease-in-out infinite;
      pointer-events: none;
    `;
    summerWrapper.appendChild(aura);
  }

  for (let k = 0; k < 30; k++) {
    const flare = document.createElement('div');
    const angle = Math.random() * 360;
    flare.className = 'sun-flare-line';
    flare.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 2px;
      height: ${150 + Math.random() * 100}px;
      margin-top: -75px;
      margin-left: -1px;
      background: rgba(255,255,255,0.04);
      transform: rotate(${angle}deg);
      transform-origin: center bottom;
      animation: flareSpin ${15 + Math.random() * 10}s linear infinite;
      z-index: 9990;
    `;
    summerWrapper.appendChild(flare);
  }

  function spawnBird(isGroup = false) {
    const bird = document.createElement('div');
    bird.textContent = '🐦';
    bird.className = 'summer-bird';
    Object.assign(bird.style, {
      position: 'fixed',
      top: `${Math.random() * 50 + 10}vh`,
      left: '-10vw',
      fontSize: isGroup ? '14px' : '20px',
      zIndex: '9999',
      transition: `transform ${14 + Math.random() * 5}s linear`,
      pointerEvents: 'none'
    });
    document.body.appendChild(bird);
    setTimeout(() => bird.style.transform = 'translateX(120vw)', 100);
    setTimeout(() => bird.remove(), 17000);
  }

  summerIntervals.push(setInterval(() => spawnBird(false), 20000));
  summerIntervals.push(setInterval(() => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => spawnBird(true), i * 250);
    }
  }, 45000));

  summerIntervals.push(setInterval(() => {
    const flare = document.createElement('div');
    flare.className = 'sun-flare';
    Object.assign(flare.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at center, rgba(255,255,220,0.06), transparent)',
      opacity: '0',
      zIndex: '9994',
      transition: 'opacity 2s ease'
    });
    document.body.appendChild(flare);
    setTimeout(() => flare.style.opacity = '1', 100);
    setTimeout(() => flare.style.opacity = '0', 2500);
    setTimeout(() => flare.remove(), 5000);
  }, 30000));

  summerIntervals.push(setInterval(() => {
    const elements = document.querySelectorAll('.content-box, .web-intro, .markacija');
    elements.forEach(el => {
      el.style.transition = 'filter 2s';
      el.style.filter = 'brightness(1.12) sepia(0.08)';
      setTimeout(() => el.style.filter = '', 4000);
    });
  }, 12000));

  summerIntervals.push(setInterval(() => {
    const cloudShadow = document.createElement('div');
    cloudShadow.className = 'summer-shadow';
    Object.assign(cloudShadow.style, {
      position: 'fixed',
      top: 0,
      left: '-100vw',
      width: '200vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.03)',
      zIndex: 9991,
      transition: 'transform 25s linear'
    });
    document.body.appendChild(cloudShadow);
    setTimeout(() => cloudShadow.style.transform = 'translateX(100vw)', 100);
    setTimeout(() => cloudShadow.remove(), 27000);
  }, 50000));

  document.body.classList.add('summer-active');
}

function stopSummerEffect() {
  document.getElementById('summer-wrapper')?.remove();
  document.querySelectorAll('.sun-flare, .summer-shadow, .summer-bird').forEach(el => el.remove());
  document.body.classList.remove('summer-active');
  summerStyleTag?.remove();

  if (window.summerIntervals) {
    window.summerIntervals.forEach(id => clearInterval(id));
    window.summerIntervals = [];
  }
}
// === SUMMER EFFECT === (KRAJ LJETA)

  // === AUTUMN EFFECT === (POČETAK JESENI)
let autumnIntervals = [];
let autumnStyleTag = null;

function startAutumnEffect() {
  if (document.getElementById('autumn-wrapper')) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'autumn-wrapper';
  Object.assign(wrapper.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: '9990'
  });
  document.body.appendChild(wrapper);

  const leafImages = [
    'images/leaf-maple-yellow.png',
    'images/leaf-oak-brown.png',
    'images/leaf-birch-orange.png',
    'images/leaf-dry-crackled.png',
    'images/leaf-curled.png'
  ];

  let activeLeaves = [];

  function createLeafLayer(count = 20, speedMin = 4, speedMax = 9, zIndex = 9991) {
    for (let i = 0; i < count; i++) {
      const leaf = document.createElement('img');
      leaf.src = leafImages[Math.floor(Math.random() * leafImages.length)];
      leaf.className = 'autumn-leaf';
      const size = 30 + Math.random() * 40;
      const duration = speedMin + Math.random() * (speedMax - speedMin);
      const delay = Math.random() * 3;

      Object.assign(leaf.style, {
        position: 'absolute',
        top: `-10vh`,
        left: `${Math.random() * 100}vw`,
        width: `${size}px`,
        height: 'auto',
        opacity: 0.85,
        zIndex,
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `fallLeaf ${duration}s linear ${delay}s forwards, spinLeaf ${3 + Math.random() * 3}s ease-in-out infinite`
      });

      wrapper.appendChild(leaf);
      activeLeaves.push(leaf);

      setTimeout(() => {
        leaf.remove();
        activeLeaves = activeLeaves.filter(l => l !== leaf);
      }, (duration + delay + 1) * 1000);
    }
  }

  autumnIntervals.push(setInterval(() => {
    createLeafLayer(5, 6, 9, 9991);
  }, 1000));

  function createMiniLeafLayer(count = 40, speedMin = 10, speedMax = 20, zIndex = 9988) {
    for (let i = 0; i < count; i++) {
      const miniLeaf = document.createElement('img');
      miniLeaf.src = leafImages[i % leafImages.length];
      const size = 10 + Math.random() * 20;
      const duration = speedMin + Math.random() * (speedMax - speedMin);
      const delay = Math.random() * 6;

      Object.assign(miniLeaf.style, {
        position: 'absolute',
        top: `${Math.random() * 100}vh`,
        left: `${Math.random() * 100}vw`,
        width: `${size}px`,
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex,
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `miniFall ${duration}s linear ${delay}s infinite`
      });

      wrapper.appendChild(miniLeaf);
    }
  }

  createMiniLeafLayer();

  autumnStyleTag = document.createElement('style');
  autumnStyleTag.textContent = `
    @keyframes fallLeaf {
      0% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
      100% { transform: translateY(110vh) rotate(360deg); opacity: 0.4; }
    }

    @keyframes spinLeaf {
      0% { transform: rotateY(0deg) rotateX(0deg); }
      50% { transform: rotateY(180deg) rotateX(90deg); }
      100% { transform: rotateY(360deg) rotateX(0deg); }
    }

    @keyframes miniFall {
      0% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
      100% { transform: translateY(120vh) rotate(720deg); opacity: 0.1; }
    }

    @keyframes fogFloat {
      0% { transform: translateX(0); }
      100% { transform: translateX(10vw); }
    }

    @keyframes dripFall {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(20px); opacity: 0; }
    }
  `;
  document.head.appendChild(autumnStyleTag);

  // === TURBULENTNI VJETAR ===
  function triggerTurbulentWind() {
    activeLeaves.forEach(leaf => {
      const drift = (Math.random() - 0.5) * 100;
      const rotate = (Math.random() - 0.5) * 90;
      leaf.style.transition = 'transform 2s ease-out';
      leaf.style.transform += ` translateX(${drift}px) rotate(${rotate}deg)`;
    });
  }
  autumnIntervals.push(setInterval(() => {
    if (Math.random() < 0.5) triggerTurbulentWind();
  }, 9000));

  // === MAGLA ===
  function createFogLayer(opacity, blur, zIndex, delay) {
    const fog = document.createElement('div');
    fog.className = 'autumn-fog-layer';

    Object.assign(fog.style, {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100vw',
      height: '30vh',
      background: 'linear-gradient(to top, rgba(200,200,200,0.2), transparent)',
      opacity: '0',
      filter: `blur(${blur}px)`,
      zIndex,
      transition: 'opacity 2s ease',
      animation: `fogFloat ${10 + Math.random() * 10}s ease-in-out ${delay}s infinite alternate`
    });

    wrapper.appendChild(fog);
    setTimeout(() => fog.style.opacity = opacity, 300);
  }

  createFogLayer(0.2, 8, 9980, 0);
  createFogLayer(0.15, 12, 9981, 4);
  createFogLayer(0.1, 16, 9982, 8);

  // === KIŠA ===
  const rainCanvas = document.createElement('canvas');
  rainCanvas.id = 'autumn-rain-canvas';
  Object.assign(rainCanvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 9985
  });
  document.body.appendChild(rainCanvas);
  const ctx = rainCanvas.getContext('2d');
  rainCanvas.width = window.innerWidth;
  rainCanvas.height = window.innerHeight;

  const drops = [];
  function spawnRainDrop() {
    drops.push({
      x: Math.random() * rainCanvas.width,
      y: 0,
      length: 10 + Math.random() * 15,
      speed: 4 + Math.random() * 3
    });
  }

  autumnIntervals.push(setInterval(() => {
    if (Math.random() < 0.8) {
      for (let i = 0; i < 6; i++) spawnRainDrop();
    }
  }, 100));

  function drawRain() {
    ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();
      drop.y += drop.speed;
      if (drop.y > rainCanvas.height) drops.splice(i, 1);
    }

    requestAnimationFrame(drawRain);
  }
  drawRain();

  // === MUNJE ===
  function triggerLightningFlash() {
    const flash = document.createElement('div');
    flash.className = 'autumn-lightning';
    Object.assign(flash.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255,255,255,0.7)',
      opacity: '0',
      zIndex: 9999,
      pointerEvents: 'none',
      transition: 'opacity 0.15s ease'
    });
    document.body.appendChild(flash);
    setTimeout(() => (flash.style.opacity = '1'), 50);
    setTimeout(() => (flash.style.opacity = '0'), 200);
    setTimeout(() => flash.remove(), 400);
  }

  autumnIntervals.push(setInterval(() => {
    if (Math.random() < 0.3) triggerLightningFlash();
  }, 25000));

  // === REFLEKSIJE I KAPANJE ===
  function dripOnElement(el) {
    const drop = document.createElement('div');
    drop.className = 'autumn-drip';
    Object.assign(drop.style, {
      position: 'absolute',
      top: '0',
      left: `${Math.random() * 80 + 10}%`,
      width: '3px',
      height: '12px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '2px',
      zIndex: 10,
      animation: 'dripFall 2s linear forwards',
      pointerEvents: 'none'
    });

    el.style.position = 'relative';
    el.appendChild(drop);
    setTimeout(() => drop.remove(), 2100);
  }

  autumnIntervals.push(setInterval(() => {
    document.querySelectorAll('.content-box, .markacija, .web-intro').forEach(el => {
      if (Math.random() < 0.4) dripOnElement(el);
      el.style.transition = 'filter 1s';
      el.style.filter = 'brightness(0.95) saturate(0.9)';
      setTimeout(() => (el.style.filter = ''), 3000);
    });
  }, 6000));
}

function stopAutumnEffect() {
  document.getElementById('autumn-wrapper')?.remove();
  document.getElementById('autumn-rain-canvas')?.remove();

  document.querySelectorAll('.autumn-lightning, .autumn-drip, .autumn-leaf, .autumn-fog-layer')
    .forEach(el => el.remove());

  document.querySelectorAll('.content-box, .markacija, .web-intro').forEach(el => {
    el.style.filter = '';
    el.style.position = '';
  });

  if (autumnStyleTag) autumnStyleTag.remove();

  if (autumnIntervals.length > 0) {
    autumnIntervals.forEach(id => clearInterval(id));
    autumnIntervals = [];
  }
}
// === KRAJ FUNKCIJE startAutumnEffect()

// === SPRING START === (POCETAK PROLJECA)
function startSpringEffect() {
  const targets = document.querySelectorAll('.content-box, .web-intro, .web-subintro, .blog-bubble, .markacija-wrapper');
  const flowers = [];

  // === SVG cvjetovi ===
  const runolistSVG = `<svg viewBox="0 0 64 64" width="24" height="24"><circle cx="32" cy="32" r="6" fill="#f8f8f8"/><path d="M32 10 L36 30 L58 32 L36 34 L32 54 L28 34 L6 32 L28 30 Z" fill="#e0e0e0"/></svg>`;
  const maslacakSVG = `<svg viewBox="0 0 64 64" width="22" height="22"><circle cx="32" cy="32" r="8" fill="#fdf168"/><g stroke="#fce205" stroke-width="1.5"><line x1="32" y1="4" x2="32" y2="20"/><line x1="32" y1="44" x2="32" y2="60"/><line x1="4" y1="32" x2="20" y2="32"/><line x1="44" y1="32" x2="60" y2="32"/><line x1="14" y1="14" x2="26" y2="26"/><line x1="50" y1="14" x2="38" y2="26"/><line x1="14" y1="50" x2="26" y2="38"/><line x1="50" y1="50" x2="38" y2="38"/></g></svg>`;
  const visibabaSVG = `<svg viewBox="0 0 64 64" width="20" height="20"><path d="M32 4 Q35 20 32 32 Q29 20 32 4" fill="#d3f9d8"/><circle cx="32" cy="38" r="4" fill="#a5d6a7"/></svg>`;

  function createFlower(svg, target) {
    const flower = document.createElement('div');
    flower.innerHTML = svg;
    flower.classList.add('spring-flower');
    Object.assign(flower.style, {
      position: 'absolute',
      opacity: '0',
      transform: 'scale(0.1)',
      transition: 'transform 2s ease-out, opacity 2s',
      pointerEvents: 'none',
      zIndex: '20'
    });

    const rect = target.getBoundingClientRect();
    const offsetX = Math.random() * rect.width;
    const offsetY = rect.height - 10;

    flower.style.left = `${offsetX}px`;
    flower.style.top = `${offsetY}px`;

    target.style.position = 'relative';
    target.appendChild(flower);

    setTimeout(() => {
      flower.style.opacity = '1';
      flower.style.transform = 'scale(1)';
    }, 100);

    setTimeout(() => {
      flower.style.animation = 'flowerSwing 4s ease-in-out infinite';
    }, 2000);

    flowers.push(flower);
  }

  targets.forEach(target => {
    createFlower(runolistSVG, target);
    createFlower(maslacakSVG, target);
    createFlower(visibabaSVG, target);
  });

  // === LATICE (Canvas) ===
  const petalSVGs = [
    `<svg viewBox="0 0 32 32" width="18" height="18"><path d="M16 2 Q28 12 16 30 Q4 12 16 2Z" fill="#f4c2c2"/></svg>`,
    `<svg viewBox="0 0 32 32" width="14" height="14"><path d="M16 0 Q30 16 16 32 Q2 16 16 0Z" fill="#f9e3e3"/></svg>`,
    `<svg viewBox="0 0 32 32" width="16" height="16"><path d="M16 4 Q24 20 16 28 Q8 20 16 4Z" fill="#fdebd3"/></svg>`
  ];
  const petalImages = [];

  petalSVGs.forEach(svg => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    petalImages.push(url);
  });

  const canvas = document.createElement('canvas');
  canvas.id = 'spring-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '10'
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Petal {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height;
      this.size = 16 + Math.random() * 10;
      this.speedY = 0.5 + Math.random() * 1.5;
      this.speedX = Math.random() * 1 - 0.5;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 0.5 - 0.25;
      this.img = new Image();
      this.img.src = petalImages[Math.floor(Math.random() * petalImages.length)];
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
      if (this.y > canvas.height || this.x < -50 || this.x > canvas.width + 50) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  const petals = Array.from({ length: 25 }, () => new Petal());

  let springActive = true;
  function animatePetals() {
    if (!springActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animatePetals);
  }
  animatePetals();

  // === PČELE ===
  const beeSVG = `<svg viewBox="0 0 64 64" width="32" height="32"><ellipse cx="32" cy="32" rx="10" ry="16" fill="#fbc02d" stroke="#000" stroke-width="1.5"/><line x1="22" y1="32" x2="42" y2="32" stroke="#000" stroke-width="2"/><line x1="26" y1="24" x2="38" y2="24" stroke="#000" stroke-width="2"/><line x1="26" y1="40" x2="38" y2="40" stroke="#000" stroke-width="2"/><ellipse cx="24" cy="20" rx="8" ry="14" fill="#e1f5fe" opacity="0.7"/><ellipse cx="40" cy="20" rx="8" ry="14" fill="#e1f5fe" opacity="0.7"/></svg>`;
  const beeContainer = document.createElement('div');
  Object.assign(beeContainer.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '50',
    pointerEvents: 'none'
  });
  document.body.appendChild(beeContainer);

  class Bee {
    constructor() {
      this.el = document.createElement('div');
      this.el.innerHTML = beeSVG;
      Object.assign(this.el.style, {
        position: 'absolute',
        width: '32px',
        height: '32px'
      });
      beeContainer.appendChild(this.el);

      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = Math.random() * 2 - 1;
      this.vy = Math.random() * 1.5 - 0.75;
      this.rotation = 0;

      this.move();
    }

    move() {
      const tick = () => {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += Math.random() * 4 - 2;

        if (this.x < 0 || this.x > window.innerWidth - 30) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight - 30) this.vy *= -1;

        const zoom = 1 + 0.05 * Math.sin(Date.now() / 300);
        this.el.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg) scale(${zoom})`;
        requestAnimationFrame(tick);
      };
      tick();
    }
  }

  Array.from({ length: 5 }, () => new Bee());

  // === SUN FLARE ===
  const flare = document.createElement('div');
  flare.innerHTML = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%;">
      <radialGradient id="sunlight" cx="30%" cy="20%" r="80%">
        <stop offset="0%" stop-color="rgba(255,255,200,0.35)"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
      <circle cx="30" cy="20" r="80" fill="url(#sunlight)">
        <animate attributeName="r" values="70;80;70" dur="8s" repeatCount="indefinite"/>
      </circle>
    </svg>`;
  Object.assign(flare.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '5'
  });
  document.body.appendChild(flare);

  // === ZVUK ===
  const beeBuzz = new Audio('https://cdn.pixabay.com/audio/2021/10/21/audio_a6edc8e492.mp3');
  beeBuzz.loop = true;
  beeBuzz.volume = 0.1;
  beeBuzz.play().catch(() => {});
  window._springBuzz = beeBuzz;

  // === STILOVI ===
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flowerSwing {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1) rotate(4deg); }
    }
  `;
  document.head.appendChild(style);

  // === ZAVRŠNI PODACI ===
  window._springPetals = petals;
  window._springCanvas = canvas;
  window._springActive = () => { springActive = false; };
  window._springFlowers = flowers;
  window._springFlare = flare;
  window._springBees = beeContainer;
}

function stopSpringEffect() {
  if (window._springCanvas) window._springCanvas.remove();
  if (window._springActive) window._springActive();
  if (window._springBuzz) {
    window._springBuzz.pause();
    window._springBuzz = null;
  }
  if (window._springFlare) window._springFlare.remove();
  if (window._springBees) window._springBees.remove();
  if (window._springFlowers) window._springFlowers.forEach(f => f.remove());

  // Ukloni stilove
  document.querySelectorAll('style').forEach(style => {
    if (style.textContent.includes('flowerSwing')) {
      style.remove();
    }
  });
}
// === KRAJ PROLJECA ===
