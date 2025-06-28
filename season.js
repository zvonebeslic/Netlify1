document.addEventListener('DOMContentLoaded', () => {
  // Učitaj HTML iz season.html
  fetch('season.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('season-placeholder').innerHTML = html;

      // Kad je ubačen HTML, čekaj da DOM prepozna #season-toggle
      const observer = new MutationObserver(() => {
        const toggle = document.getElementById('season-toggle');
        const iconsWrapper = document.getElementById('season-icons');
        const stopButton = document.getElementById('stop-season');

        if (!toggle || !iconsWrapper || !stopButton) return;

        observer.disconnect(); // više ne trebamo promatrati

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

            if (selected === 'winter') {
              particlesJS.load('snow-particles', 'animations/snow-realistic.json', function () {
                console.log('Snijeg učitan');
              });
            }
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

          if (window.pJSDom && window.pJSDom.length) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom = [];
          }
        }
      });

      observer.observe(document.getElementById('season-placeholder'), {
        childList: true,
        subtree: true
      });
    })
    .catch(error => console.error('Greška pri učitavanju season.html:', error));
});
