document.addEventListener('DOMContentLoaded', () => {
  fetch('season.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('season-placeholder').innerHTML = html;

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

          stopSeasonEffects();
          activeSeason = selected;
          document.body.classList.add(`season-${selected}`);
          stopButton.classList.remove('hidden');

          if (selected === 'winter') {
            particlesJS.load('snow-particles', 'animations/snow-realistic.json', function () {
              console.log('Snijeg učitan');
            });
          }
        });
      });

      // Stop Season
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

        // Uništi particles
        if (window.pJSDom && window.pJSDom.length) {
          window.pJSDom[0].pJS.fn.vendors.destroypJS();
          window.pJSDom = [];
        }
      }
    })
    .catch(error => console.error('Greška pri učitavanju season.html:', error));
});
