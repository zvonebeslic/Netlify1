const sections = document.querySelectorAll('.section');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const langIcon = document.getElementById('language-icon');
const translatables = document.querySelectorAll('[data-lang-hr]');
const placeholderInputs = document.querySelectorAll('[data-placeholder-hr]');

function handleScroll() {
  let windowMid = window.innerHeight / 2;
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top < windowMid && rect.bottom > 0) {
      section.classList.add('active');
      section.classList.remove('inactive');
    } else {
      section.classList.add('inactive');
      section.classList.remove('active');
    }
  });
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    navMenu.classList.remove('open');
  }
});

let currentLang = 'hr';

langIcon.addEventListener('click', () => {
  currentLang = currentLang === 'hr' ? 'en' : 'hr';
  langIcon.src = `images/${currentLang === 'hr' ? 'en' : 'hr'}.svg`;

  translatables.forEach(el => {
    el.textContent = el.getAttribute(`data-lang-${currentLang}`);
  });

  placeholderInputs.forEach(input => {
    input.placeholder = input.getAttribute(`data-placeholder-${currentLang}`);
  });
});

// fallback ako slike nisu učitane
document.querySelectorAll('img').forEach(img => {
  img.onerror = function () {
    const filename = this.src.split('/').pop();
    this.src = filename;
  };
});
