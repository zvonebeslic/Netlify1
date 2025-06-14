const langToggle = document.getElementById('language-toggle');
const searchInput = document.getElementById('search');
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');
const backToTopBtn = document.getElementById('backToTop');
const footer = document.getElementById('footer');

let currentLang = 'hr';

langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'hr' ? 'en' : 'hr';
  langToggle.src = currentLang === 'hr' ? 'images/flag-uk.svg' : 'images/flag-hr.svg';
  searchInput.placeholder = currentLang === 'hr' ? 'Pretraži...' : 'Search...';
  document.querySelectorAll('[data-hr]').forEach(el => {
    el.textContent = el.getAttribute(`data-${currentLang}`);
  });
  document.querySelectorAll('.menu-overlay a').forEach(link => {
    link.textContent = link.getAttribute(`data-${currentLang}`);
  });
});

menuToggle.addEventListener('click', () => {
  menu.classList.toggle('open');
});

window.addEventListener('click', e => {
  if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
    menu.classList.remove('open');
  }
});

document.querySelectorAll('.menu-overlay a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
  });
});

const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    entry.isIntersecting
      ? entry.target.classList.add('visible')
      : entry.target.classList.remove('visible');
  });
}, { threshold: 0.5 });

sections.forEach(section => observer.observe(section));

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const footerTop = footer.getBoundingClientRect().top + window.scrollY;
  const windowHeight = window.innerHeight;

  if (scrollY > 300) {
    backToTopBtn.style.display = 'flex';
  } else {
    backToTopBtn.style.display = 'none';
  }

  if (scrollY + windowHeight > footerTop) {
    backToTopBtn.style.bottom = `${(scrollY + windowHeight - footerTop) + 60}px`;
  } else {
    backToTopBtn.style.bottom = '30px';
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
