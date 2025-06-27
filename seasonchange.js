function initSeasonChange() {
  let activeSeason = null;
  const seasonToggle = document.getElementById('season-toggle');
  const seasonIcons = document.getElementById('season-icons');
  const stopButton = document.getElementById('stop-season');

  seasonToggle.addEventListener('click', () => {
    if (activeSeason !== null) {
      stopSeasonEffects();
    } else {
      seasonIcons.classList.toggle('hidden');
      seasonIcons.classList.toggle('show'); // 🎯 dodano: animacija skaliranja ikona
    }
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
      document.body.classList.add(`season-${season}`);
      stopButton.classList.remove('hidden');
    });
  });

  function stopSeasonEffects() {
    if (activeSeason) {
      document.body.classList.remove(`season-${activeSeason}`);
      activeSeason = null;
    }
    stopButton.classList.add('hidden');
    seasonIcons.classList.add('hidden');
    seasonIcons.classList.remove('show'); // 🎯 dodano: ukloni animaciju kad isključiš
  }

  stopButton.addEventListener('click', () => {
    stopSeasonEffects();
  });
}

// ZIMA
function startWinterEffect() {
  const snowChars = ['❄', '❅', '❆'];
  let activeSnow = true;
  let stuckFlakeCount = 0;
  const maxStuckFlakes = 4;

  const contentBoxes = document.querySelectorAll('.content-box');
  contentBoxes.forEach(box => {
    let snowLayer = document.createElement('div');
    snowLayer.classList.add('snow-layer');
    box.appendChild(snowLayer);
  });

  function createSnowflake() {
    if (!activeSnow) return;

    const snowChar = snowChars[Math.floor(Math.random() * snowChars.length)];

    // Zalijepljena pahulja
    const isStuck = stuckFlakeCount < maxStuckFlakes && Math.random() < 0.02;
    if (isStuck) {
      stuckFlakeCount++;
      const stuckFlake = document.createElement('div');
      stuckFlake.classList.add('stuck-snowflake');
      stuckFlake.textContent = snowChar;
      stuckFlake.style.left = `${Math.random() * window.innerWidth}px`;
      document.body.appendChild(stuckFlake);
      setTimeout(() => stuckFlake.remove(), 3000);
      return;
    }

    // Obična pahulja
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.textContent = snowChar;

    const size = Math.random() * 16 + 10;
    const startX = Math.random() * window.innerWidth;
    const duration = Math.random() * 3 + 2;
    const rotate = Math.random() * 360;
    const skew = (Math.random() - 0.5) * 20;

    snowflake.style.left = `${startX}px`;
    snowflake.style.fontSize = `${size}px`;
    snowflake.style.animationDuration = `${duration}s`;
    snowflake.style.transform = `rotate(${rotate}deg) skewX(${skew}deg)`;

    document.body.appendChild(snowflake);

    // Nakupljanje snijega na box
    const box = contentBoxes[Math.floor(Math.random() * contentBoxes.length)];
    const layer = box.querySelector('.snow-layer');
    const currentHeight = parseFloat(layer.style.height || 0);
    if (currentHeight < 30) {
      layer.style.height = (currentHeight + 2) + 'px';
    } else {
      layer.style.transition = 'transform 1s ease, opacity 1s ease';
      layer.style.transform = 'translateY(100%)';
      layer.style.opacity = 0;
      setTimeout(() => {
        layer.style.height = '0px';
        layer.style.transform = 'none';
        layer.style.opacity = 0.7;
        layer.style.transition = 'height 2s ease';
      }, 1000);
    }

    setTimeout(() => snowflake.remove(), duration * 1000);
  }

  const snowInterval = setInterval(() => {
    for (let i = 0; i < 5; i++) createSnowflake();
  }, 150);

  // Prekini zimski efekt
  window.stopWinterEffect = () => {
    activeSnow = false;
    clearInterval(snowInterval);
    document.querySelectorAll('.snowflake').forEach(flake => flake.remove());
    document.querySelectorAll('.stuck-snowflake').forEach(flake => flake.remove());
    document.querySelectorAll('.snow-layer').forEach(layer => {
      layer.style.height = '0px';
    });
  };
}
