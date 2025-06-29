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

      // Aktiviraj sezonski efekt
      if (selected === 'winter') startWinterEffect();
      else if (selected === 'summer') startSummerEffect();
      else if (selected === 'autumn') startAutumnEffect();
      else if (selected === 'spring') startSpringEffect();
    });
  });

  stopButton.addEventListener('click', () => {
    stopSeasonEffects();
  });

  function stopSeasonEffects() {
    document.body.classList.remove(
      'season-winter',
      'season-summer',
      'season-autumn',
      'season-spring'
    );
    activeSeason = null;
    stopButton.classList.add('hidden');

    stopWinterEffect();
    stopSummerEffect();
    stopAutumnEffect();
    stopSpringEffect();
  }

  // ✅ ISPRAVNA verzija startWinterEffect()
  function startWinterEffect() {
  if (document.getElementById('season-layer')) return; // već postoji

  const layer = document.createElement('div');
  layer.id = 'season-layer';
  document.body.appendChild(layer);

  const numFlakes = 1000;
  const style = document.createElement('style');
  style.id = 'winter-style';

  // Dodaj osnovni stil sloja i pada
  style.innerHTML = `
    @keyframes fall {
      to {
        transform: translateY(110vh);
      }
    }

    #season-layer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9998;
      pointer-events: none;
      overflow: hidden;
    }
  `;

  for (let i = 0; i < numFlakes; i++) {
    const flake = document.createElement('div');
    flake.classList.add('snowflake');

    const size = Math.random() * 8 + 4;
    const startX = Math.random() * 100;
    const delay = Math.random() * 20;
    const duration = Math.random() * 10 + 5;
    const swayName = `sway${i}`;
    const swayDuration = Math.random() * 4 + 2;
    const swayDistance = Math.floor(Math.random() * 20 + 5);
    const swayDirection = Math.random() < 0.5 ? '-' : '';

    // Unikatna animacija po pahulji
    flake.style.position = 'absolute';
    flake.style.top = '-10px';
    flake.style.left = `${startX}vw`;
    flake.style.width = `${size}px`;
    flake.style.height = `${size}px`;
    flake.style.background = 'white';
    flake.style.borderRadius = '50%';
    flake.style.opacity = Math.random() * 0.5 + 0.5;
    flake.style.pointerEvents = 'none';
    flake.style.filter = 'blur(0.5px)';
    flake.style.animation = `
      fall ${duration}s linear ${delay}s infinite,
      ${swayName} ${swayDuration}s ease-in-out infinite alternate
    `;

    layer.appendChild(flake);

    // Dodaj unikatni @keyframes za svaku pahulju
    style.innerHTML += `
      @keyframes ${swayName} {
        0% { transform: translateX(0); }
        100% { transform: translateX(${swayDirection}${swayDistance}px); }
      }
    `;
  }

  document.head.appendChild(style);
}

  function stopWinterEffect() {
    const layer = document.getElementById('season-layer');
    if (layer) layer.remove();

    const style = document.getElementById('winter-style');
    if (style) style.remove();
  }

  function startSummerEffect() {
    console.log("☀️ Pokrenut ljetni efekt");
  }

  function stopSummerEffect() {
    console.log("🧹 Ugašen ljetni efekt");
  }

  function startAutumnEffect() {
    console.log("🍂 Pokrenut jesenski efekt");
  }

  function stopAutumnEffect() {
    console.log("🧹 Ugašen jesenski efekt");
  }

  function startSpringEffect() {
    console.log("🌸 Pokrenut proljetni efekt");
  }

  function stopSpringEffect() {
    console.log("🧹 Ugašen proljetni efekt");
  }
}
