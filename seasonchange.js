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
  }

  stopButton.addEventListener('click', () => {
    stopSeasonEffects();
  });
}
