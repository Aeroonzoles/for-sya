/* =========================================================
   script.js
   Handles: opening letter reveal, cursor glow, scroll progress,
   parallax blobs, tilt-on-hover cards, scroll-reveal, custom
   audio player, and a live canvas visualizer for the piano.
   ========================================================= */

/* ---------- Opening title, letter by letter ---------- */
(function revealTitle(){
  const el = document.getElementById('openingTitle');
  const text = 'For Sya 🤍';
  el.innerHTML = '';
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.style.animationDelay = (i * 0.045) + 's';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    if (ch === '🤍') span.classList.add('tint');
    el.appendChild(span);
  });
})();

/* ---------- Floating petals ambient background ---------- */
(function initPetals(){
  const field = document.getElementById('petalField');
  const petalEmojis = ['🌷', '🌸', '🤍'];
  const count = window.innerWidth < 600 ? 10 : 18;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
    petal.style.left = Math.random() * 100 + '%';
    petal.style.fontSize = (0.9 + Math.random() * 1.1) + 'rem';
    petal.style.animationDuration = (14 + Math.random() * 12) + 's';
    petal.style.animationDelay = (-Math.random() * 20) + 's';
    field.appendChild(petal);
  }
})();

/* ---------- Cursor glow (desktop only) ---------- */
(function initCursorGlow(){
  const glow = document.getElementById('cursorGlow');
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let curX = mouseX, curY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    glow.classList.add('active');
  });

  function animateGlow(){
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    glow.style.transform = `translate(${curX}px, ${curY}px)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
})();

/* ---------- Scroll progress bar ---------- */
(function initScrollProgress(){
  const bar = document.getElementById('scrollProgress');
  function update(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---------- Parallax background blobs ---------- */
(function initParallaxBlobs(){
  const blobs = document.querySelectorAll('.blob');
  function update(){
    const y = window.scrollY;
    blobs.forEach((b) => {
      const depth = parseFloat(b.dataset.depth) || 0.2;
      b.style.transform = `translateY(${y * depth * -0.15}px)`;
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---------- Tilt-on-hover for cards ---------- */
(function initTilt(){
  const tiltEls = document.querySelectorAll('[data-tilt]');
  const pianoCard = document.getElementById('pianoCard');
  if (pianoCard) pianoCard.setAttribute('data-tilt', '');
  const allTilt = document.querySelectorAll('[data-tilt]');

  allTilt.forEach((el) => {
    let raf = null;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(700px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-4px)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
})();

/* ---------- Opening screen -> main content transition ---------- */
const enterBtn = document.getElementById('enterBtn');
const opening = document.getElementById('opening');
const mainContent = document.getElementById('mainContent');

enterBtn.addEventListener('click', () => {
  opening.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
  opening.style.opacity = '0';
  opening.style.transform = 'scale(1.04)';

  setTimeout(() => {
    opening.style.display = 'none';
    mainContent.removeAttribute('aria-hidden');
    mainContent.classList.add('visible');
    document.getElementById('piano').scrollIntoView({ behavior: 'smooth' });
  }, 850);
});

/* ---------- Scroll-reveal: section headers, memory cards, little-things cards ---------- */
const revealTargets = document.querySelectorAll('[data-reveal]');
revealTargets.forEach((el, i) => {
  el.style.transitionDelay = (i % 6) * 0.09 + 's';
});
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
revealTargets.forEach((el) => revealObserver.observe(el));

const sectionTargets = document.querySelectorAll('[data-reveal-section]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
sectionTargets.forEach((el) => sectionObserver.observe(el));

/* ---------- Custom audio player ---------- */
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const seek = document.getElementById('seek');
const volume = document.getElementById('volume');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');

function formatTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().catch(() => { /* placeholder mp3 not swapped in yet */ });
  } else {
    audio.pause();
  }
});

audio.addEventListener('play', () => {
  iconPlay.classList.remove('is-visible');
  iconPause.classList.add('is-visible');
  startVisualizer();
});
audio.addEventListener('pause', () => {
  iconPlay.classList.add('is-visible');
  iconPause.classList.remove('is-visible');
});
audio.addEventListener('loadedmetadata', () => {
  durTime.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
  curTime.textContent = formatTime(audio.currentTime);
});
seek.addEventListener('input', () => {
  if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
});
volume.addEventListener('input', () => { audio.volume = volume.value / 100; });
audio.volume = volume.value / 100;

/* ---------- Canvas visualizer, tied to real playback via Web Audio API ---------- */
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let audioCtx, analyser, dataArray, sourceNode, rafId;
let visualizerReady = false;
const BAR_COUNT = 40;

function setupAudioGraph(){
  if (visualizerReady) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    sourceNode = audioCtx.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    visualizerReady = true;
  } catch (err) {
    /* Web Audio graph unavailable (e.g. CORS on the mp3) — fall back to idle animation. */
    visualizerReady = false;
  }
}

function drawIdleBars(t){
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const barW = w / BAR_COUNT;
  for (let i = 0; i < BAR_COUNT; i++) {
    const wave = Math.sin(t / 700 + i * 0.4) * 0.5 + 0.5;
    const barH = 4 + wave * 10;
    drawBar(i, barW, barH, h);
  }
}

function drawBar(i, barW, barH, h){
  const x = i * barW + barW * 0.2;
  const y = h - barH;
  const grad = ctx.createLinearGradient(0, y, 0, h);
  grad.addColorStop(0, '#C48D88');
  grad.addColorStop(1, '#C6A972');
  ctx.fillStyle = grad;
  const w = barW * 0.6;
  const r = Math.min(3, w / 2);
  ctx.beginPath();
  ctx.moveTo(x, h);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, h);
  ctx.closePath();
  ctx.fill();
}

function drawLiveBars(){
  try {
    analyser.getByteFrequencyData(dataArray);
  } catch (err) {
    drawIdleBars(performance.now());
    return;
  }
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const barW = w / BAR_COUNT;
  const step = Math.floor(dataArray.length / BAR_COUNT);
  for (let i = 0; i < BAR_COUNT; i++) {
    const v = dataArray[i * step] / 255;
    const barH = 4 + v * (h - 8);
    drawBar(i, barW, barH, h);
  }
}

function visualizerLoop(t){
  if (!audio.paused && visualizerReady) {
    drawLiveBars();
  } else {
    drawIdleBars(t || 0);
  }
  rafId = requestAnimationFrame(visualizerLoop);
}

function startVisualizer(){
  try {
    setupAudioGraph();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  } catch (err) {
    /* Visualizer is purely decorative — never let it interfere with playback. */
  }
}

/* Idle animation runs immediately so the visualizer never looks dead/broken */
visualizerLoop(0);

/* ---------- Lightbox for memory photos ---------- */
(function initLightbox(){
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');

  function openLightbox(photoEl){
    if (photoEl.classList.contains('img-missing')) return; // no real photo yet
    const img = photoEl.querySelector('img');
    const caption = photoEl.closest('.memory-card')?.querySelector('h3')?.textContent || '';
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.memory-photo').forEach((photo) => {
    photo.addEventListener('click', () => openLightbox(photo));
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();
