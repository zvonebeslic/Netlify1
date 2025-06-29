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

      // 🔁 Aktiviraj sezonski efekt
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

    // 🧹 Očisti sve efekte
    stopWinterEffect();
    stopSummerEffect();
    stopAutumnEffect();
    stopSpringEffect();
  }

  // 🔧 Prazne funkcije za sad – dodavat ćemo animacije
  function startWinterEffect() {
    console.log("❄️ Pokrenut zimski efekt");
    // ovdje ide snijeg, pokrov itd.
  }

  function stopWinterEffect() {
    console.log("🧹 Ugašen zimski efekt");
    document.querySelectorAll('.snow-on-top')
      .forEach(el => el.classList.remove('snow-on-top'));
    // ovdje se brišu elementi, canvas itd.
  }

  function startSummerEffect() {
    console.log("☀️ Pokrenut ljetni efekt");
    // sunčeve zrake
  }

  function stopSummerEffect() {
    console.log("🧹 Ugašen ljetni efekt");
  }

  function startAutumnEffect() {
    console.log("🍂 Pokrenut jesenski efekt");
    // kiša, vjetar
  }

  function stopAutumnEffect() {
    console.log("🧹 Ugašen jesenski efekt");
  }

  function startSpringEffect() {
    console.log("🌸 Pokrenut proljetni efekt");
    // latice, pčele
  }

  function stopSpringEffect() {
    console.log("🧹 Ugašen proljetni efekt");
  }
}
