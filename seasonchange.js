// === seasonchange.js === (mobile optimized, full winter version)

let activeSeason = null;

function initSeasonChange() { const seasonToggle = document.getElementById('season-toggle'); const seasonIcons = document.getElementById('season-icons'); const stopButton = document.getElementById('stop-season');

seasonToggle.addEventListener('click', () => { seasonIcons.classList.toggle('show'); });

document.querySelectorAll('.season-icon').forEach(icon => { icon.addEventListener('click', () => { const season = icon.dataset.season; if (activeSeason === season) { stopSeasonEffects(); return; } stopSeasonEffects(); activeSeason = season; stopButton.classList.remove('hidden');

if (season === 'winter') startWinterEffect();
});

});

stopButton.addEventListener('click', stopSeasonEffects); }

function stopSeasonEffects() { activeSeason = null; document.querySelectorAll('.season-layer, canvas, .animated-object, .snow-layer').forEach(el => el.remove()); const stopButton = document.getElementById('stop-season'); if (stopButton) stopButton.classList.add('hidden'); }

// === ZIMSKI EFEKT === (POČETAK ZIME)

function startWinterEffect() { // === OSNOVNA POSTAVKA CANVASA === const canvas = document.createElement('canvas'); canvas.id = 'snow-canvas'; canvas.classList.add('season-layer'); Object.assign(canvas.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '9998' }); document.body.appendChild(canvas); const ctx = canvas.getContext('2d'); let width = canvas.width = window.innerWidth; let height = canvas.height = window.innerHeight; window.addEventListener('resize', () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });

// === PAHULJE - 6 SLOJEVA === const layers = [ { count: 100, size: [0.5, 1.5], speed: 0.4 }, { count: 80, size: [1, 2], speed: 0.7 }, { count: 60, size: [2, 3.5], speed: 1.0 }, { count: 40, size: [3, 5], speed: 1.5 }, { count: 20, size: [4, 6], speed: 2.0 }, { count: 10, size: [5, 8], speed: 2.5 } ]; const flakes = []; layers.forEach(layer => { for (let i = 0; i < layer.count; i++) { flakes.push({ x: Math.random() * width, y: Math.random() * height, r: Math.random() * (layer.size[1] - layer.size[0]) + layer.size[0], d: layer.speed + Math.random(), wind: Math.random() * 1.5 - 0.75, layer: layer.speed }); } });

function drawFlakes() { ctx.clearRect(0, 0, width, height); ctx.fillStyle = 'rgba(255,255,255,0.9)'; flakes.forEach(f => { ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill(); f.y += f.d; f.x += f.wind + Math.sin(f.y * 0.005); if (f.y > height || f.x < -50 || f.x > width + 50) { f.x = Math.random() * width; f.y = -10; } }); requestAnimationFrame(drawFlakes); } drawFlakes();

// === NAKUPLJANJE SNIJEGA === const elements = document.querySelectorAll('.content-box, .web-intro, .markacija, .blog-bubble, h1, h2, h3, p, .navbar, footer'); elements.forEach(el => { if (!el.querySelector('.snow-layer')) { const snow = document.createElement('div'); snow.className = 'snow-layer'; Object.assign(snow.style, { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '0px', background: 'white', opacity: '0.6', transition: 'height 2s ease', pointerEvents: 'none', zIndex: '4' }); el.style.position = 'relative'; el.appendChild(snow); } }); setInterval(() => { const rand = document.querySelectorAll('.snow-layer')[Math.floor(Math.random() * document.querySelectorAll('.snow-layer').length)]; if (!rand) return; const h = parseFloat(rand.style.height || 0); if (h < 25) { rand.style.height = ${h + 2}px; } else { rand.style.transition = 'transform 1s ease, opacity 1s ease'; rand.style.transform = 'translateY(100%)'; rand.style.opacity = '0'; setTimeout(() => { rand.style.height = '0px'; rand.style.transform = 'none'; rand.style.opacity = '0.6'; rand.style.transition = 'height 2s ease'; }, 1000); } }, 9500);

// === ZALEĐENI KUTOVI === ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(pos => { const ice = document.createElement('div'); ice.className = 'animated-object'; ice.textContent = '🧊'; Object.assign(ice.style, { position: 'fixed', zIndex: '9999', fontSize: '28px', opacity: '0.65' }); if (pos.includes('top')) ice.style.top = '0'; if (pos.includes('bottom')) ice.style.bottom = '0'; if (pos.includes('left')) ice.style.left = '0'; if (pos.includes('right')) ice.style.right = '0'; document.body.appendChild(ice); });

// === MAGLA GORE I DOLJE === ['top', 'bottom'].forEach(dir => { setInterval(() => { const fog = document.createElement('div'); fog.className = 'season-layer'; Object.assign(fog.style, { position: 'fixed', [dir]: 0, left: 0, width: '100vw', height: '20vh', background: 'linear-gradient(to top, rgba(255,255,255,0.25), transparent)', zIndex: '9996', opacity: '0', transition: 'opacity 2s ease' }); document.body.appendChild(fog); setTimeout(() => fog.style.opacity = '1', 200); setTimeout(() => fog.style.opacity = '0', 3000); setTimeout(() => fog.remove(), 5000); }, 45000); });

// === ZALEĐIVANJE + PUCAJ === setInterval(() => { const crack = document.createElement('div'); crack.className = 'season-layer'; Object.assign(crack.style, { position: 'fixed', top: ${Math.random() * 70}vh, left: ${Math.random() * 80}vw, width: '20vw', height: '20vh', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4), transparent)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', zIndex: '9999', opacity: '0', transition: 'opacity 1s ease, transform 2s ease' }); document.body.appendChild(crack); setTimeout(() => crack.style.opacity = '1', 100); setTimeout(() => { crack.style.transform = 'scale(1.5) rotate(20deg)'; crack.style.opacity = '0'; }, 1800); setTimeout(() => crack.remove(), 4000); }, 30000);

// === SHAKE TIJELA === setInterval(() => { document.body.style.transition = 'transform 0.2s'; document.body.style.transform = 'translateX(-2px)'; setTimeout(() => document.body.style.transform = 'translateX(2px)', 100); setTimeout(() => document.body.style.transform = 'translateX(0)', 200); }, 20000);

// === SNJEŠKO === setInterval(() => { const snowman = document.createElement('div'); snowman.className = 'animated-object'; snowman.innerHTML = '<span style="display:inline-block; transform: rotate(5deg);">⛄</span>'; Object.assign(snowman.style, { position: 'fixed', top: ${Math.random() * 60 + 20}vh, left: '-10vw', fontSize: '32px', zIndex: '9999', transition: 'transform 10s ease-in-out', opacity: '0.9' }); document.body.appendChild(snowman); setTimeout(() => snowman.style.transform = 'translateX(130vw) rotate(10deg)', 200); setTimeout(() => snowman.remove(), 11000); }, 20000); }

// === ZIMSKI EFEKT === (KRAJ ZIME)

// ❄️ Efekt zaleđivanja + pucanja leda setInterval(() => { const crackOverlay = document.createElement('div'); crackOverlay.className = 'season-layer'; Object.assign(crackOverlay.style, { position: 'fixed', top: ${Math.random() * 70}vh, left: ${Math.random() * 80}vw, width: '20vw', height: '20vh', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3), transparent)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', zIndex: '9999', opacity: '0', transition: 'opacity 1s ease, transform 2s ease' }); document.body.appendChild(crackOverlay); setTimeout(() => crackOverlay.style.opacity = '1', 100); setTimeout(() => { crackOverlay.style.transform = 'scale(1.5) rotate(15deg)'; crackOverlay.style.opacity = '0'; }, 1500); setTimeout(() => crackOverlay.remove(), 3500); }, 30000);

// === OSTALA GODIŠNJA DOBA SE DODAJU ISPOD ===

