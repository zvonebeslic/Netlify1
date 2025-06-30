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
        stopSeasonEffects();
        return;
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
  const layer = document.getElementById('season-layer');
  if (layer) layer.remove();
}

function createLayer() {
  const layer = document.createElement('div');
  layer.id = 'season-layer';
  layer.style.position = 'fixed';
  layer.style.top = '0';
  layer.style.left = '0';
  layer.style.width = '100vw';
  layer.style.height = '100vh';
  layer.style.pointerEvents = 'none';
  layer.style.zIndex = '9999';
  document.body.appendChild(layer);
  return layer;
}

// ❄️ WINTER
function startWinterEffect() {
  const layer = createLayer();
  for (let i = 0; i < 1000; i++) {
    const flake = document.createElement('div');
    flake.className = 'snowflake';

    const size = Math.random() * 4 + 2;
    flake.style.position = 'absolute';
    flake.style.width = `${size}px`;
    flake.style.height = `${size}px`;
    flake.style.left = `${Math.random() * 100}vw`;
    flake.style.top = `-${Math.random() * 20}px`;
    flake.style.opacity = `${0.5 + Math.random() * 0.5}`;
    flake.style.borderRadius = '50%';
    flake.style.filter = 'blur(1px)';
    flake.style.background = 'white';
    flake.style.animation = `fall ${5 + Math.random() * 5}s linear ${Math.random() * 10}s infinite`;

    layer.appendChild(flake);
  }
}

// 🌸 SPRING
function startSpringEffect() {
  const layer = createLayer();
  for (let i = 0; i < 1000; i++) {
    const petal = document.createElement('div');
    petal.className = Math.random() > 0.5 ? 'petal' : 'seed';

    const size = Math.random() * 8 + 6;
    petal.style.position = 'absolute';
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.top = `-${Math.random() * 20}px`;
    petal.style.opacity = `${0.4 + Math.random() * 0.6}`;
    petal.style.borderRadius = '50%';
    petal.style.background = 'pink';
    petal.style.animation = `fall ${4 + Math.random() * 4}s ease-in ${Math.random() * 8}s infinite`;

    layer.appendChild(petal);
  }
}

// 🍂 AUTUMN
function startAutumnEffect() {
  const layer = createLayer();
  for (let i = 0; i < 1500; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';

    drop.style.position = 'absolute';
    drop.style.width = '1px';
    drop.style.height = '10px';
    drop.style.background = 'rgba(255, 140, 0, 0.7)';
    drop.style.left = `${Math.random() * 100}vw`;
    drop.style.top = `-${Math.random() * 50}px`;
    drop.style.animation = `fall ${1 + Math.random() * 2}s ease-in ${Math.random() * 3}s infinite`;

    layer.appendChild(drop);
  }
}

// ☀️ SUMMER
function startSummerEffect() {
  const layer = createLayer();
  for (let i = 0; i < 300; i++) {
    const ray = document.createElement('div');
    ray.className = 'sunray';

    ray.style.position = 'absolute';
    ray.style.width = '2px';
    ray.style.height = '60px';
    ray.style.background = 'rgba(255, 255, 0, 0.5)';
    ray.style.top = `${Math.random() * 100}vh`;
    ray.style.left = `${80 + Math.random() * 20}vw`;
    ray.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
    ray.style.animation = `fall ${4 + Math.random() * 4}s ease-in-out ${Math.random() * 5}s infinite`;

    layer.appendChild(ray);
  }
}
