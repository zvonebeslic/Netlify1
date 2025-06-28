document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('season-toggle');
  const iconsWrapper = document.getElementById('season-icons');
  const stopButton = document.getElementById('stop-season');
  let activeSeason = null;

  // Klik na toggler
  toggle.addEventListener('click', () => {
    iconsWrapper.classList.toggle('hidden');
  });

  // Klik na sezonu
  document.querySelectorAll('.season-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const selected = icon.dataset.season;

      if (activeSeason === selected) {
        stopSeasonEffects();
        return;
      }

      stopSeasonEffects(); // ugasi ako je neki već aktivan
      activeSeason = selected;
      document.body.classList.add(`season-${selected}`);
      stopButton.classList.remove('hidden');

      // Tu možeš ubaciti funkcije poput startWinterEffect(), itd.
   
    if (selected === 'winter') {
  particlesJS.load('snow-particles', 'animations/snow-realistic.json', function () {
    console.log('Snijeg učitan');
  });
}
    });
  });

  // Gumb za zaustavljanje
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

    // Ovdje također možeš pozvati stopWinterEffect(), itd.
 if (window.pJSDom && window.pJSDom.length) {
  window.pJSDom[0].pJS.fn.vendors.destroypJS();
  window.pJSDom = [];
}
  
  }
});
