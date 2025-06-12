// Jezična zamjena zastavica
let currentLang = "hr";
const flag = document.getElementById("flag-toggle");

flag.addEventListener("click", () => {
  if (currentLang === "hr") {
    flag.src = "images/flag-hr.svg";
    currentLang = "en";
  } else {
    flag.src = "images/flag-en.svg";
    currentLang = "hr";
  }
});

// Aktivna sekcija sa zoom-efektom
const sections = document.querySelectorAll(".parallax");

function updateActiveSection() {
  let closest = null;
  let minDistance = Infinity;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top - window.innerHeight / 2);

    if (distance < minDistance) {
      minDistance = distance;
      closest = section;
    }
  });

  sections.forEach(section => section.classList.remove("active"));
  if (closest) closest.classList.add("active");
}

window.addEventListener("scroll", updateActiveSection);
window.addEventListener("load", updateActiveSection);
