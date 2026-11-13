/* Den Hemmelige Læsebog – spilmotor, lyd og navigation. */

(function () {
  'use strict';

  const LB = (window.LB = {});
  const CONTENT = window.LB_CONTENT;
  const PAGES = CONTENT.PAGES;
  const STORAGE_KEY = 'hemmelig-laesebog-v1';

  const $ = (sel, root = document) => root.querySelector(sel);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Tilstand ---------------- */

  const DEFAULTS = {
    name: '',
    pageIndex: 0,
    stars: 0,
    words: [],
    completed: [],
    sound: true,
    started: false
  };

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const data = JSON.parse(raw);
      const merged = { ...DEFAULTS, ...data };
      merged.words = Array.isArray(merged.words) ? merged.words : [];
      merged.completed = Array.isArray(merged.completed) ? merged.completed : [];
      merged.pageIndex = Math.max(0, Math.min(PAGES.length - 1, Number(merged.pageIndex) || 0));
      merged.stars = Math.max(0, Number(merged.stars) || 0);
      return merged;
    } catch (error) {
      return { ...DEFAULTS };
    }
  }

  const state = loadState();
  LB.state = state;

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* localStorage kan være slået fra – spillet virker stadig. */
    }
  }
  LB.save = save;

  /* ---------------- Hjælpere ---------------- */

  LB.$ = $;
  LB.sleep = sleep;
  LB.reducedMotion = reducedMotion;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  LB.escapeHtml = escapeHtml;

  function stripPunctuation(text) {
    return String(text).replace(/[.,!?;:»«"']/g, '').trim();
  }
  LB.stripPunctuation = stripPunctuation;

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  LB.shuffle = shuffle;

  LB.currentPage = () => PAGES[state.pageIndex] || PAGES[0];

  /* ---------------- DOM ---------------- */

  const els = {
    startScreen: $('#startScreen'),
    game: $('#game'),
    page: $('#page'),
    startForm: $('#startForm'),
    startBtn: $('#startBtn'),
    nameInput: $('#nameInput'),
    resumeInfo: $('#resumeInfo'),
    restartBtn: $('#restartBtn'),
    chapterLabel: $('#chapterLabel'),
    starCount: $('#starCount'),
    dictCount: $('#dictCount'),
    dictBtn: $('#dictBtn'),
    soundBtn: $('#soundBtn'),
    homeBtn: $('#homeBtn'),
    progressFill: $('#progressFill'),
    progressText: $('#progressText'),
    dictModal: $('#dictModal'),
    dictClose: $('#dictClose'),
    dictSub: $('#dictSub'),
    wordGrid: $('#wordGrid'),
    toast: $('#toast'),
    confetti: $('#confetti')
  };
  LB.els = els;

  /* ---------------- Lyd ---------------- */

  let audioContext = null;

  function getAudio() {
    if (!audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      try {
        audioContext = new Ctx();
      } catch (error) {
        return null;
      }
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  }

  function tone(freq, duration, type, volume, delay, endFreq) {
    const ctx = getAudio();
    if (!ctx) return;
    const start = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume || 0.05, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  function sfx(name) {
    if (!state.sound) return;
    switch (name) {
      case 'tap':
        tone(540, 0.06, 'triangle', 0.028);
        break;
      case 'turn':
        tone(640, 0.2, 'sine', 0.032, 0, 250);
        break;
      case 'good':
        tone(660, 0.14, 'sine', 0.045, 0);
        tone(880, 0.16, 'sine', 0.045, 0.07);
        tone(1180, 0.2, 'sine', 0.04, 0.14);
        break;
      case 'bad':
        tone(230, 0.14, 'triangle', 0.038, 0, 170);
        break;
      case 'star':
        tone(1040, 0.12, 'sine', 0.03, 0);
        tone(1560, 0.16, 'sine', 0.028, 0.08);
        break;
      case 'win':
        [523, 659, 784, 1046].forEach((freq, i) => tone(freq, 0.26, 'sine', 0.045, i * 0.1));
        break;
      case 'reveal':
        [392, 523, 659].forEach((freq, i) => tone(freq, 0.18, 'triangle', 0.035, i * 0.06));
        break;
      default:
        tone(540, 0.06, 'triangle', 0.03);
    }
  }
  LB.sfx = sfx;

  /* ---------------- Tale ---------------- */

  let danishVoices = [];

  function refreshVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices() || [];
    danishVoices = voices.filter((voice) => /^da/i.test(voice.lang || ''));
  }

  if ('speechSynthesis' in window) {
    refreshVoices();
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
  }

  function speak(text, rate) {
    if (!state.sound) {
      toast('Slå lyden til for at høre det 🔊');
      return;
    }
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = 'da-DK';
      utterance.rate = rate || 0.9;
      utterance.pitch = 1.03;
      if (danishVoices.length) utterance.voice = danishVoices[0];
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      /* Ignoreres – lyd er en ekstra hjælp. */
    }
  }
  LB.speak = speak;

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        /* ignoreres */
      }
    }
  }
  LB.stopSpeech = stopSpeech;

  /* ---------------- Toast ---------------- */

  let toastTimer = 0;

  function toast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => els.toast.classList.remove('show'), 2400);
  }
  LB.toast = toast;

  /* ---------------- Stjerne og konfetti ---------------- */

  function starBurst(x, y) {
    if (reducedMotion) return;
    const star = document.createElement('div');
    star.className = 'star-burst';
    star.textContent = '⭐';
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    document.body.appendChild(star);
    window.setTimeout(() => star.remove(), 1000);
  }
  LB.starBurst = starBurst;

  const confettiCanvas = els.confetti;
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiParticles = [];
  let confettiFrame = 0;

  function confettiBurst(count) {
    if (reducedMotion || !confettiCtx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    confettiCanvas.width = Math.floor(window.innerWidth * dpr);
    confettiCanvas.height = Math.floor(window.innerHeight * dpr);
    confettiCanvas.style.width = '100%';
    confettiCanvas.style.height = '100%';
    confettiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ['#ffd166', '#2f9e8f', '#e2653f', '#8b7cf6', '#ef5b8a', '#4da3ff'];
    const total = count || 90;
    for (let i = 0; i < total; i++) {
      confettiParticles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 220,
        y: window.innerHeight * 0.44 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 10,
        vy: -6 - Math.random() * 10,
        gravity: 0.3 + Math.random() * 0.16,
        size: 5 + Math.random() * 7,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.34,
        color: colors[i % colors.length],
        round: Math.random() > 0.55,
        life: 1
      });
    }
    if (!confettiFrame) confettiFrame = window.requestAnimationFrame(drawConfetti);
  }
  LB.confettiBurst = confettiBurst;

  function drawConfetti() {
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    confettiParticles.forEach((particle) => {
      particle.vy += particle.gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.992;
      particle.rotation += particle.spin;
      particle.life = Math.max(0, particle.life - 0.005);

      confettiCtx.save();
      confettiCtx.translate(particle.x, particle.y);
      confettiCtx.rotate(particle.rotation);
      confettiCtx.globalAlpha = particle.life;
      confettiCtx.fillStyle = particle.color;
      if (particle.round) {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, particle.size / 2.4, 0, Math.PI * 2);
        confettiCtx.fill();
      } else {
        confettiCtx.fillRect(-particle.size / 2, -particle.size / 3, particle.size, particle.size * 0.62);
      }
      confettiCtx.restore();
    });

    confettiParticles = confettiParticles.filter(
      (particle) => particle.life > 0 && particle.y < window.innerHeight + 80
    );

    if (confettiParticles.length) {
      confettiFrame = window.requestAnimationFrame(drawConfetti);
    } else {
      confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiFrame = 0;
    }
  }

  /* ---------------- Topbar og fremskridt ---------------- */

  function chapterLabelFor(page) {
    if (page.type === 'finish') return 'Slut på bogen';
    if (!page.chapterTitle) return '';
    return `Kapitel ${page.chapter + 1} · ${page.chapterTitle}`;
  }

  function updateChrome(page) {
    const current = page || LB.currentPage();
    els.starCount.textContent = String(state.stars);
    els.dictCount.textContent = String(state.words.length);
    els.chapterLabel.textContent = chapterLabelFor(current);
    els.chapterLabel.title = chapterLabelFor(current);

    const total = PAGES.length;
    const position = state.pageIndex + 1;
    els.progressText.textContent = `Side ${position} af ${total}`;
    els.progressFill.style.width = `${(position / total) * 100}%`;

    els.soundBtn.textContent = state.sound ? '🔊' : '🔇';
    els.soundBtn.setAttribute('aria-pressed', String(state.sound));
    els.soundBtn.setAttribute('aria-label', state.sound ? 'Slå lyden fra' : 'Slå lyden til');
  }
  LB.updateChrome = updateChrome;

  /* ---------------- Navigation ---------------- */

  let transitioning = false;

  function awardCurrentPage() {
    const page = LB.currentPage();
    if (!isTaskPage(page)) return;
    if (state.completed.includes(state.pageIndex)) return;

    state.completed.push(state.pageIndex);
    state.stars += 1;

    if (page.type === 'word' && page.word && !state.words.some((entry) => entry.word === page.word)) {
      state.words.push({ word: page.word, emoji: page.emoji || '✨' });
    }
  }

  async function turnTo(nextIndex) {
    const pageEl = els.page;
    const next = Math.max(0, Math.min(PAGES.length - 1, nextIndex));

    if (reducedMotion) {
      state.pageIndex = next;
      save();
      LB.renderPage({ animate: false });
      return;
    }

    pageEl.classList.remove('turn-in');
    pageEl.classList.add('turn-out');
    sfx('turn');
    await sleep(230);

    state.pageIndex = next;
    save();
    pageEl.classList.remove('turn-out');
    LB.renderPage();
  }

  async function advance() {
    if (transitioning) return;
    const page = LB.currentPage();

    transitioning = true;
    try {
      awardCurrentPage();
      save();
      updateChrome(page);

      if (state.pageIndex < PAGES.length - 1) {
        await turnTo(state.pageIndex + 1);
      } else {
        LB.renderPage();
      }
    } finally {
      transitioning = false;
    }
  }
  LB.advance = advance;

  /* ---------------- Forside ---------------- */

  function updateStartScreen() {
    const hasProgress = state.pageIndex > 0;
    els.nameInput.value = state.name || '';
    els.startBtn.textContent = hasProgress ? 'Fortsæt bogen' : 'Åbn bogen';
    els.resumeInfo.hidden = !hasProgress;
    els.resumeInfo.textContent = hasProgress
      ? `⭐ ${state.stars} stjerner · side ${state.pageIndex + 1} af ${PAGES.length}`
      : '';
    els.restartBtn.hidden = !hasProgress;
  }
  LB.updateStartScreen = updateStartScreen;

  function resetProgress() {
    state.pageIndex = 0;
    state.stars = 0;
    state.words = [];
    state.completed = [];
    save();
  }
  LB.resetProgress = resetProgress;

  function openBook(fresh) {
    if (fresh) resetProgress();
    const typedName = els.nameInput.value.trim().slice(0, 18);
    if (typedName) state.name = typedName;
    state.started = true;
    save();

    els.startScreen.classList.add('hidden');
    els.game.classList.remove('hidden');
    window.scrollTo(0, 0);
    LB.renderPage({ animate: true });
  }
  LB.openBook = openBook;

  function showStart() {
    stopSpeech();
    updateStartScreen();
    els.game.classList.add('hidden');
    els.startScreen.classList.remove('hidden');
    window.scrollTo(0, 0);
  }
  LB.showStart = showStart;

  /* ---------------- Ordbog ---------------- */

  function renderDictionary() {
    els.wordGrid.innerHTML = '';
    els.dictSub.textContent = state.words.length
      ? `${state.words.length} ord samlet. Tryk på et ord for at høre det.`
      : 'Her samler du de sjove ord, du læser undervejs.';

    if (!state.words.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-dict';
      empty.innerHTML = '<span class="big">📖</span>Ingen ord endnu.<br>Læs en side med et fedt ord, så dukker det op her.';
      els.wordGrid.appendChild(empty);
      return;
    }

    state.words.forEach((entry) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'word-card';
      card.innerHTML = `
        <span class="wc-emoji" aria-hidden="true">${escapeHtml(entry.emoji || '✨')}</span>
        <span class="wc-word">${escapeHtml(entry.word)}</span>
        <span class="wc-speak">🔊 hør</span>
      `;
      card.addEventListener('click', () => speak(entry.word, 0.8));
      els.wordGrid.appendChild(card);
    });
  }

  function openDictionary() {
    renderDictionary();
    els.dictModal.classList.remove('hidden');
    els.dictClose.focus();
  }

  function closeDictionary() {
    els.dictModal.classList.add('hidden');
    els.dictBtn.focus();
  }

  /* ---------------- Hændelser ---------------- */

  function bindEvents() {
    els.startForm.addEventListener('submit', (event) => {
      event.preventDefault();
      sfx('tap');
      openBook(false);
    });

    els.restartBtn.addEventListener('click', () => {
      const ok = window.confirm('Vil du begynde helt forfra? Dine stjerner og ord bliver nulstillet.');
      if (!ok) return;
      sfx('tap');
      openBook(true);
    });

    els.homeBtn.addEventListener('click', () => {
      sfx('tap');
      showStart();
    });

    els.soundBtn.addEventListener('click', () => {
      state.sound = !state.sound;
      save();
      updateChrome();
      if (state.sound) {
        sfx('good');
        toast('Lyden er slået til 🔊');
      } else {
        stopSpeech();
        toast('Lyden er slået fra 🔇');
      }
    });

    els.dictBtn.addEventListener('click', () => {
      sfx('tap');
      openDictionary();
    });

    els.dictClose.addEventListener('click', () => {
      sfx('tap');
      closeDictionary();
    });

    els.dictModal.addEventListener('click', (event) => {
      if (event.target === els.dictModal) closeDictionary();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !els.dictModal.classList.contains('hidden')) {
        closeDictionary();
      }
    });

    const nameInput = els.nameInput;
    nameInput.addEventListener('input', () => {
      state.name = nameInput.value.trim().slice(0, 18);
      save();
    });
  }

  /* ---------------- Start ---------------- */

  LB.init = function init() {
    bindEvents();
    updateStartScreen();
    updateChrome();
    if (state.started) {
      /* Vis forsiden med "Fortsæt", så barnet selv vælger. */
      updateStartScreen();
    }
  };
})();
