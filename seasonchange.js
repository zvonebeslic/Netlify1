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

// === ZIMSKI EFEKT === (POČETAK ZIME) function startWinterEffect() { // Canvas setup const canvas = document.createElement('canvas'); canvas.id = 'snow-canvas'; canvas.classList.add('season-layer'); Object.assign(canvas.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '9998' }); document.body.appendChild(canvas);

const ctx = canvas.getContext('2d'); let width = canvas.width = window.innerWidth; let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });

// Snowflake layers const layers = [ { count: 80, size: [1, 2], speed: 0.5, flakes: [] }, { count: 60, size: [2, 4], speed: 1.0, flakes: [] }, { count: 40, size: [4, 6], speed: 1.5, flakes: [] } ]; layers.forEach(layer => { layer.flakes = Array.from({ length: layer.count }, () => createFlake(layer.size, layer.speed)); });

function createFlake(sizeRange, speedFactor) { return { x: Math.random() * width, y: Math.random() * height, r: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0], d: speedFactor + Math.random(), wind: Math.random() * 1 - 0.5, rotate: Math.random() * 360, opacity: Math.random() * 0.8 + 0.2 }; }

function drawFlakes() { ctx.clearRect(0, 0, width, height); layers.forEach(layer => { ctx.beginPath(); ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; layer.flakes.forEach(flake => { ctx.moveTo(flake.x, flake.y); ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2); }); ctx.fill(); moveFlakes(layer); }); requestAnimationFrame(drawFlakes); }

function moveFlakes(layer) { layer.flakes.forEach(flake => { flake.y += flake.d; flake.x += flake.wind + Math.sin(flake.y * 0.005); if (flake.y > height) Object.assign(flake, createFlake([flake.r, flake.r + 1], layer.speed), { y: -flake.r }); }); }

drawFlakes();

// Snow accumulation on key elements const targets = document.querySelectorAll('.content-box, .web-intro, .markacija, .blog-bubble, h1, h2, h3, p, .navbar, footer'); targets.forEach(el => { if (!el.querySelector('.snow-layer')) { const snow = document.createElement('div'); snow.classList.add('snow-layer'); Object.assign(snow.style, { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '0px', background: 'white', opacity: '0.6', transition: 'height 1.5s ease', pointerEvents: 'none', zIndex: '4' }); el.style.position = 'relative'; el.appendChild(snow); } });

setInterval(() => { const targetList = document.querySelectorAll('.snow-layer'); const rand = targetList[Math.floor(Math.random() * targetList.length)]; if (!rand) return; const h = parseFloat(rand.style.height || 0); if (h < 20) { rand.style.height = ${h + 1}px; } else { rand.style.transition = 'transform 1s ease, opacity 1s ease'; rand.style.transform = 'translateY(100%)'; rand.style.opacity = '0'; setTimeout(() => { rand.style.height = '0px'; rand.style.transform = 'none'; rand.style.opacity = '0.6'; rand.style.transition = 'height 1.5s ease'; }, 1000); } }, 9000);

// Ice corners ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(pos => { const ice = document.createElement('div'); ice.className = 'animated-object'; ice.textContent = '🧊'; Object.assign(ice.style, { position: 'fixed', zIndex: '9999', fontSize: '28px', opacity: '0.65' }); if (pos.includes('top')) ice.style.top = '0'; if (pos.includes('bottom')) ice.style.bottom = '0'; if (pos.includes('left')) ice.style.left = '0'; if (pos.includes('right')) ice.style.right = '0'; document.body.appendChild(ice); });

// Frost fog layer setInterval(() => { const fog = document.createElement('div'); fog.className = 'season-layer'; Object.assign(fog.style, { position: 'fixed', bottom: 0, left: 0, width: '100vw', height: '30vh', background: 'linear-gradient(to top, rgba(255,255,255,0.3), transparent)', zIndex: '9996', opacity: '0', transition: 'opacity 3s ease' }); document.body.appendChild(fog); setTimeout(() => fog.style.opacity = '1', 200); setTimeout(() => fog.style.opacity = '0', 3000); setTimeout(() => fog.remove(), 6000); }, 35000);

// Frost screen flash setInterval(() => { const frostGlass = document.createElement('div'); frostGlass.className = 'season-layer'; Object.assign(frostGlass.style, { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(circle at center, rgba(255,255,255,0.3), rgba(0,0,0,0.1))', zIndex: '9997', opacity: '0', transition: 'opacity 2s ease' }); document.body.appendChild(frostGlass); setTimeout(() => frostGlass.style.opacity = '1', 200); setTimeout(() => frostGlass.style.opacity = '0', 3000); setTimeout(() => frostGlass.remove(), 5000); }, 20000);

// Shaking effect setInterval(() => { document.body.style.transition = 'transform 0.2s'; document.body.style.transform = 'translateX(-2px)'; setTimeout(() => document.body.style.transform = 'translateX(2px)', 100); setTimeout(() => document.body.style.transform = 'translateX(0)', 200); }, 18000);

// Snowman animation setInterval(() => { const snowman = document.createElement('div'); snowman.className = 'animated-object'; snowman.innerHTML = '<span style="display:inline-block; transform: rotate(5deg);">⛄</span>'; Object.assign(snowman.style, { position: 'fixed', top: ${Math.random() * 60 + 20}vh, left: '-10vw', fontSize: '32px', zIndex: '9999', transition: 'transform 10s ease-in-out', opacity: '0.9' }); document.body.appendChild(snowman); setTimeout(() => snowman.style.transform = 'translateX(130vw) rotate(10deg)', 200); setTimeout(() => snowman.remove(), 11000); }, 15000);

// Hover frost on interactive elements document.querySelectorAll('.content-box, .markacija, .web-intro').forEach(el => { el.addEventListener('mouseenter', () => { el.style.transition = 'filter 0.4s'; el.style.filter = 'brightness(1.1) saturate(0.7)'; }); el.addEventListener('mouseleave', () => { el.style.filter = 'none'; }); }); }

// === ZIMSKI EFEKT === (KRAJ ZIME)

// ❄️ Efekt zaleđivanja + pucanja leda setInterval(() => { const crackOverlay = document.createElement('div'); crackOverlay.className = 'season-layer'; Object.assign(crackOverlay.style, { position: 'fixed', top: ${Math.random() * 70}vh, left: ${Math.random() * 80}vw, width: '20vw', height: '20vh', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3), transparent)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', zIndex: '9999', opacity: '0', transition: 'opacity 1s ease, transform 2s ease' }); document.body.appendChild(crackOverlay); setTimeout(() => crackOverlay.style.opacity = '1', 100); setTimeout(() => { crackOverlay.style.transform = 'scale(1.5) rotate(15deg)'; crackOverlay.style.opacity = '0'; }, 1500); setTimeout(() => crackOverlay.remove(), 3500); }, 30000);

// === OSTALA GODIŠNJA DOBA SE DODAJU ISPOD ===

