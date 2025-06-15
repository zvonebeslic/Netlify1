const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const target = entry.target;

    if (entry.isIntersecting) {
      if (!target.classList.contains('aktivno')) {
        target.classList.add('aktivno');

        // SVG MARKACIJA
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "markacija");
        svg.setAttribute("viewBox", "0 0 100 100");

        const bijeli = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        bijeli.setAttribute("cx", "50");
        bijeli.setAttribute("cy", "50");
        bijeli.setAttribute("r", "34");
        bijeli.setAttribute("fill", "#fff");

        const crveni = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        crveni.setAttribute("cx", "50");
        crveni.setAttribute("cy", "50");
        crveni.setAttribute("r", "49");
        crveni.setAttribute("fill", "none");
        crveni.setAttribute("stroke", "red");
        crveni.setAttribute("stroke-width", "12");
        crveni.classList.add("crveni");

        svg.appendChild(bijeli);
        svg.appendChild(crveni);
        target.appendChild(svg);

        // BLOG BUBBLE
        const bubble = document.createElement("div");
        bubble.classList.add("blog-bubble");

        const tekst = document.createElement("div");
        tekst.classList.add("blog-text");

        const title = target.dataset.title || "Naslov bloga";
        const text = target.dataset.text || "Opis bloga...";
        const link = target.dataset.link || "#blog";

        tekst.innerHTML = `
          <h4>${title}</h4>
          <p>${text}</p>
        `;
        bubble.appendChild(tekst);
        target.appendChild(bubble);

        // GUMB
        const gumb = document.createElement("button");
        gumb.classList.add("markacija-btn");
        gumb.textContent = "Pročitaj više ovdje";
        gumb.onclick = () => window.location.href = link;
        target.appendChild(gumb);

        // TAJMING
        setTimeout(() => bubble.classList.add('show'), 1600);
        setTimeout(() => tekst.classList.add('show'), 2000);
        setTimeout(() => gumb.classList.add('show'), 2600);
      }
    } else {
      target.classList.remove('aktivno');
      const svg = target.querySelector('.markacija');
      const bubble = target.querySelector('.blog-bubble');
      const gumb = target.querySelector('.markacija-btn');
      if (svg) svg.remove();
      if (bubble) bubble.remove();
      if (gumb) gumb.remove();
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.image-section').forEach(section => {
  observer.observe(section);
});
