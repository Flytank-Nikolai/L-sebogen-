/* Den Hemmelige Læsebog – hvordan hver slags side ser ud og virker. */

(function () {
  'use strict';

  const LB = window.LB;
  const PAGES = window.LB_CONTENT.PAGES;
  const state = LB.state;
  const els = LB.els;
  const escapeHtml = LB.escapeHtml;
  const stripPunctuation = LB.stripPunctuation;

  const PRAISE = [
    'Du er en stjerne!',
    'Sikke en læser!',
    'Ulla er imponeret!',
    'Fuld fart frem!',
    'Wow, hvor er du god!',
    'Det var flot klaret!'
  ];

  /* ---------------- Fælles dele ---------------- */

  function pageHead(page) {
    const chapterText = page.type === 'chapter' ? 'Den hemmelige læsebog' : page.chapterSub || 'Slut på bogen';
    return `
      <div class="page-head">
        <span class="chapter-tag">
          <svg class="owl-mini" viewBox="0 0 120 120" aria-hidden="true"><use href="#owl"></use></svg>
          <span>${escapeHtml(chapterText)}</span>
        </span>
        <span class="page-num">Side ${state.pageIndex + 1}</span>
      </div>
    `;
  }

  function nextButton(label) {
    return `<button class="btn primary" type="button" data-act="next">${label || 'Videre'} <span aria-hidden="true">➜</span></button>`;
  }

  function bindNext(root) {
    root.querySelectorAll('[data-act="next"]').forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = '1';
      button.addEventListener('click', () => {
        LB.sfx('tap');
        LB.advance();
      });
    });
  }

  function revealContinue(root, label) {
    const wrap = root.querySelector('#continueWrap');
    if (!wrap || wrap.dataset.ready) return;
    wrap.dataset.ready = '1';
    wrap.innerHTML = nextButton(label);
    bindNext(root);
    const button = wrap.querySelector('button');
    if (button) {
      window.setTimeout(() => {
        button.scrollIntoView({
          block: 'nearest',
          behavior: LB.reducedMotion ? 'auto' : 'smooth'
        });
      }, 90);
    }
  }

  function completeAndAdvance(button) {
    if (button.dataset.busy) return;
    button.dataset.busy = '1';
    button.disabled = true;
    button.classList.add('is-done');
    button.innerHTML = '✔️ Sejt læst!';
    LB.sfx('good');
    const rect = button.getBoundingClientRect();
    LB.starBurst(rect.left + rect.width / 2, rect.top + 4);
    window.setTimeout(() => LB.advance(), 540);
  }

  function hintBlock(text) {
    if (!text) return '';
    return `<p class="hint" id="hint" hidden><span class="hint-owl">Ulla</span> ${escapeHtml(text)}</p>`;
  }

  /* ---------------- Kapitelstart ---------------- */

  function renderChapter(page) {
    const body = `
      <div class="chapter-intro">
        <div class="chapter-badge" aria-hidden="true">${escapeHtml(page.chapterEmoji || '📖')}</div>
        <p class="kicker">${escapeHtml(page.chapterSub || '')}</p>
        <h2 class="chapter-title">${escapeHtml(page.title)}</h2>
        <p class="chapter-blurb">${escapeHtml(page.blurb || '')}</p>
      </div>
    `;
    return {
      body,
      actions: nextButton('Begynd at læse'),
      wire: bindNext
    };
  }

  /* ---------------- Enkelt ord ---------------- */

  function renderWord(page) {
    const syllables = Array.isArray(page.syllables) ? page.syllables : [];
    const canSplit = syllables.length > 1;

    const syllableMarkup = canSplit
      ? `<div class="syllables" id="syllables" hidden>
           ${syllables
             .map(
               (part) =>
                 `<button class="syl" type="button" data-speak="${escapeHtml(part)}">${escapeHtml(part)}</button>`
             )
             .join('')}
         </div>`
      : '';

    const body = `
      <p class="prompt">Læs ordet højt for Ulla</p>
      <div class="word-card">
        <div class="word-emoji" aria-hidden="true">${escapeHtml(page.emoji || '✨')}</div>
        <div class="word-text">${escapeHtml(page.word)}</div>
        ${syllableMarkup}
        <div class="word-tools">
          <button class="chip-btn" type="button" data-speak="${escapeHtml(page.word)}">🔊 Hør ordet</button>
          ${canSplit ? '<button class="chip-btn" type="button" data-act="split" aria-expanded="false">✂️ Del ordet</button>' : ''}
        </div>
      </div>
      ${page.hint ? `<p class="hint"><span class="hint-owl">Ulla</span> ${escapeHtml(page.hint)}</p>` : ''}
    `;

    return {
      body,
      actions: `<button class="btn primary" type="button" data-act="done">Jeg har læst det <span aria-hidden="true">⭐</span></button>`,
      wire(root) {
        root.querySelectorAll('[data-speak]').forEach((button) => {
          button.addEventListener('click', () => LB.speak(button.dataset.speak, 0.72));
        });

        const done = root.querySelector('[data-act="done"]');
        if (done) done.addEventListener('click', () => completeAndAdvance(done));

        const splitButton = root.querySelector('[data-act="split"]');
        const syllableBox = root.querySelector('#syllables');
        if (splitButton && syllableBox) {
          splitButton.addEventListener('click', () => {
            const showing = syllableBox.hidden;
            syllableBox.hidden = !showing;
            splitButton.setAttribute('aria-expanded', String(showing));
            splitButton.textContent = showing ? '🧩 Saml ordet' : '✂️ Del ordet';
            LB.sfx('tap');
            if (showing) LB.speak(page.word, 0.6);
          });
        }
      }
    };
  }

  /* ---------------- Sætning ---------------- */

  function renderSentence(page) {
    const tokens = page.words
      .map(
        (word, index) =>
          `<button class="word-token" type="button" data-index="${index}" data-speak="${escapeHtml(word)}">${escapeHtml(word)}</button>`
      )
      .join(' ');

    const body = `
      <p class="prompt">Læs sætningen højt</p>
      <div class="sentence">${tokens}</div>
      ${hintBlock(page.hint || 'Tryk på et ord, hvis du er i tvivl.')}
    `;

    return {
      body,
      actions: `
        <button class="btn ghost" type="button" data-act="speak-all">🔊 Læs for mig</button>
        <button class="btn primary" type="button" data-act="done">Jeg har læst den <span aria-hidden="true">⭐</span></button>
      `,
      wire(root) {
        root.querySelectorAll('.word-token').forEach((token) => {
          token.addEventListener('click', () => {
            LB.speak(token.dataset.speak, 0.8);
            token.classList.add('is-tapped');
            window.setTimeout(() => token.classList.remove('is-tapped'), 420);
          });
        });

        const speakAll = root.querySelector('[data-act="speak-all"]');
        if (speakAll) {
          speakAll.addEventListener('click', () => LB.speak(page.words.join(' '), 0.88));
        }

        const done = root.querySelector('[data-act="done"]');
        if (done) done.addEventListener('click', () => completeAndAdvance(done));
      }
    };
  }

  /* ---------------- Vælg det rigtige ord ---------------- */

  function renderPick(page) {
    const emoji = page.emoji
      ? `<div class="pick-emoji" aria-hidden="true">${escapeHtml(page.emoji)}</div>`
      : '';

    const gap =
      page.before !== undefined
        ? `<p class="gap-sentence">${escapeHtml(page.before)} <span class="blank">?</span> ${escapeHtml(page.after)}</p>`
        : '';

    const options = page.options
      .map(
        (option, index) =>
          `<button class="option" type="button" data-index="${index}">${escapeHtml(option)}</button>`
      )
      .join('');

    const body = `
      <p class="prompt">${escapeHtml(page.prompt)}</p>
      ${emoji}
      ${gap}
      <div class="options">${options}</div>
      ${hintBlock(page.hint)}
    `;

    return {
      body,
      actions: '<div class="continue-wrap" id="continueWrap"></div>',
      wire(root) {
        const buttons = Array.from(root.querySelectorAll('.option'));
        const hint = root.querySelector('#hint');
        let solved = false;

        buttons.forEach((button) => {
          button.addEventListener('click', () => {
            if (solved) return;
            const value = page.options[Number(button.dataset.index)];

            if (value === page.answer) {
              solved = true;
              button.classList.add('correct');
              buttons.forEach((other) => {
                other.disabled = true;
                other.classList.add('is-locked');
              });
              if (hint) hint.hidden = false;
              LB.sfx('good');

              const spoken =
                page.before !== undefined
                  ? `${page.before} ${page.answer} ${page.after}`
                  : page.answer;
              LB.speak(spoken, 0.85);
              revealContinue(root);
            } else {
              buttons.forEach((other) => other.classList.remove('wrong'));
              button.classList.add('wrong');
              if (hint) hint.hidden = false;
              LB.sfx('bad');
              window.setTimeout(() => button.classList.remove('wrong'), 560);
            }
          });
        });
      }
    };
  }

  /* ---------------- Find ordet ---------------- */

  function renderFind(page) {
    const tokens = page.words
      .map(
        (word, index) =>
          `<button class="word-token" type="button" data-index="${index}">${escapeHtml(word)}</button>`
      )
      .join(' ');

    const body = `
      <p class="prompt">${escapeHtml(page.prompt)}</p>
      <div class="sentence find-sentence">${tokens}</div>
      ${hintBlock(page.hint)}
    `;

    return {
      body,
      actions: '<div class="continue-wrap" id="continueWrap"></div>',
      wire(root) {
        const tokensEls = Array.from(root.querySelectorAll('.word-token'));
        const hint = root.querySelector('#hint');
        let solved = false;

        tokensEls.forEach((token) => {
          token.addEventListener('click', () => {
            if (solved) return;
            const index = Number(token.dataset.index);

            if (index === page.target) {
              solved = true;
              token.classList.add('is-found');
              tokensEls.forEach((other) => {
                other.disabled = true;
              });
              if (hint) hint.hidden = false;
              LB.sfx('good');
              LB.speak(stripPunctuation(token.textContent), 0.78);
              revealContinue(root);
            } else {
              token.classList.add('wrong');
              if (hint) hint.hidden = false;
              LB.sfx('bad');
              window.setTimeout(() => token.classList.remove('wrong'), 500);
            }
          });
        });
      }
    };
  }

  /* ---------------- Byg sætningen ---------------- */

  function renderBuild(page) {
    const answer = page.answer.slice();

    const body = `
      <p class="prompt">${escapeHtml(page.prompt || 'Byg sætningen. Tryk på ordene i den rigtige rækkefølge.')}</p>
      <div class="answer-line" id="answerLine"><span class="placeholder">Tryk på ordene herunder …</span></div>
      <div class="chips" id="chipPool"></div>
      ${hintBlock(page.hint)}
    `;

    return {
      body,
      actions: `
        <button class="btn ghost" type="button" data-act="clear">Ryd</button>
        <button class="btn primary" type="button" data-act="check">Tjek sætningen</button>
        <div class="continue-wrap" id="continueWrap"></div>
      `,
      wire(root) {
        const line = root.querySelector('#answerLine');
        const poolEl = root.querySelector('#chipPool');
        const hint = root.querySelector('#hint');
        const clearButton = root.querySelector('[data-act="clear"]');
        const checkButton = root.querySelector('[data-act="check"]');

        let available = LB.shuffle(answer.map((text, index) => ({ id: `c${index}`, text })));
        let chosen = [];
        let attempts = 0;
        let solved = false;

        function chipMarkup(chip, inLine) {
          return `<button class="chip${inLine ? ' in-line' : ''}" type="button" data-id="${chip.id}">${escapeHtml(
            chip.text
          )}</button>`;
        }

        function refresh() {
          if (!chosen.length) {
            line.innerHTML = '<span class="placeholder">Tryk på ordene herunder …</span>';
          } else {
            line.innerHTML = chosen.map((chip) => chipMarkup(chip, true)).join('');
          }
          poolEl.innerHTML = available.map((chip) => chipMarkup(chip, false)).join('');
          line.classList.toggle('is-filled', chosen.length > 0);
        }

        poolEl.addEventListener('click', (event) => {
          const button = event.target.closest('.chip');
          if (!button || solved) return;
          const id = button.dataset.id;
          const index = available.findIndex((chip) => chip.id === id);
          if (index === -1) return;
          chosen.push(available[index]);
          available.splice(index, 1);
          LB.sfx('tap');
          refresh();
        });

        line.addEventListener('click', (event) => {
          const button = event.target.closest('.chip');
          if (!button || solved) return;
          const id = button.dataset.id;
          const index = chosen.findIndex((chip) => chip.id === id);
          if (index === -1) return;
          available.push(chosen[index]);
          available.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
          chosen.splice(index, 1);
          LB.sfx('tap');
          refresh();
        });

        clearButton.addEventListener('click', () => {
          if (solved) return;
          chosen.forEach((chip) => available.push(chip));
          available.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
          chosen = [];
          line.classList.remove('is-correct');
          LB.sfx('tap');
          refresh();
        });

        checkButton.addEventListener('click', () => {
          if (solved) return;

          if (chosen.length < answer.length) {
            line.classList.add('shake');
            if (hint) hint.hidden = false;
            LB.sfx('bad');
            LB.toast('Der mangler stadig nogle ord.');
            window.setTimeout(() => line.classList.remove('shake'), 500);
            return;
          }

          const attempt = chosen.map((chip) => chip.text).join(' ');
          if (attempt === answer.join(' ')) {
            solved = true;
            line.classList.add('is-correct');
            line.classList.remove('shake');
            line.querySelectorAll('.chip').forEach((chip) => chip.classList.add('is-good'));
            if (hint) hint.hidden = false;
            clearButton.hidden = true;
            checkButton.hidden = true;
            LB.sfx('good');
            LB.speak(answer.join(' '), 0.85);
            revealContinue(root, 'Sejt bygget');
            return;
          }

          attempts += 1;
          line.classList.add('shake');
          if (hint) hint.hidden = false;
          LB.sfx('bad');
          LB.toast(attempts === 1 ? 'Næsten! Prøv at bytte rundt på ordene.' : 'Kig på de grønne ord – de sidder rigtigt.');
          window.setTimeout(() => line.classList.remove('shake'), 500);

          chosen.forEach((chip, index) => {
            const chipEl = line.querySelector(`[data-id="${chip.id}"]`);
            if (!chipEl) return;
            chipEl.classList.toggle('is-good', chip.text === answer[index]);
            chipEl.classList.toggle('is-bad', chip.text !== answer[index]);
          });
        });

        refresh();
      }
    };
  }

  /* ---------------- Vittighed ---------------- */

  function renderJoke(page) {
    const body = `
      <p class="prompt">Vittighed · læs den højt</p>
      <div class="joke">
        <p class="joke-setup">${escapeHtml(page.setup)}</p>
        <button class="btn accent" type="button" data-act="reveal">Vis svaret 🤭</button>
        <p class="punchline" id="punchline" hidden>${escapeHtml(page.punchline)}<span class="laugh" aria-hidden="true">😂 😂</span></p>
      </div>
    `;

    return {
      body,
      actions: '<div class="continue-wrap" id="continueWrap"></div>',
      wire(root) {
        const revealButton = root.querySelector('[data-act="reveal"]');
        const punchline = root.querySelector('#punchline');
        if (!revealButton || !punchline) return;

        revealButton.addEventListener('click', () => {
          revealButton.hidden = true;
          punchline.hidden = false;
          LB.sfx('reveal');
          LB.speak(page.punchline, 0.85);
          revealContinue(root);
        });
      }
    };
  }

  /* ---------------- Kapitel klaret ---------------- */

  function renderChapterEnd(page) {
    const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    const body = `
      <div class="celebrate">
        <div class="celebrate-emoji" aria-hidden="true">🎉</div>
        <p class="kicker">${escapeHtml(page.chapterSub || '')}</p>
        <h2 class="chapter-title">Kapitel ${page.chapter + 1} klaret!</h2>
        <p class="chapter-blurb">${escapeHtml(praise)}</p>
        <div class="big-stars" aria-hidden="true"><span>⭐</span><span>⭐</span><span>⭐</span></div>
        <p class="celebrate-count">${page.stars} stjerner i dette kapitel</p>
      </div>
    `;

    return {
      body,
      actions: nextButton('Videre til næste kapitel'),
      wire(root) {
        bindNext(root);
        LB.sfx('win');
        window.setTimeout(() => LB.confettiBurst(110), 250);
      }
    };
  }

  /* ---------------- Bevis ---------------- */

  function renderFinish() {
    const name = (state.name || '').trim() || 'Læser';
    let date = '';
    try {
      date = new Intl.DateTimeFormat('da-DK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date());
    } catch (error) {
      date = new Date().toLocaleDateString();
    }

    const body = `
      <div class="cert-print">
        <div class="certificate">
          <div class="cert-seal" aria-hidden="true">🏅</div>
          <p class="kicker">Bevis</p>
          <h2 class="cert-title">Ord-detektiv</h2>
          <p class="cert-name">${escapeHtml(name)}</p>
          <p class="cert-line">har læst hele <em>Den Hemmelige Læsebog</em> og samlet en hel masse gode ord.</p>
          <div class="cert-stats">
            <div><b>${state.stars}</b><span>stjerner</span></div>
            <div><b>${state.words.length}</b><span>ord</span></div>
          </div>
          <p class="cert-date">${escapeHtml(date)}</p>
          <p class="cert-sign">Ulla 🦉</p>
        </div>
      </div>
    `;

    return {
      body,
      actions: `
        <button class="btn ghost" type="button" data-act="print">🖨️ Print bevis</button>
        <button class="btn primary" type="button" data-act="again">Læs bogen igen 🔁</button>
      `,
      wire(root) {
        const printButton = root.querySelector('[data-act="print"]');
        if (printButton) {
          printButton.addEventListener('click', () => {
            LB.sfx('tap');
            window.print();
          });
        }

        const againButton = root.querySelector('[data-act="again"]');
        if (againButton) {
          againButton.addEventListener('click', () => {
            const ok = window.confirm('Vil du læse bogen igen? Stjerner og ord starter forfra.');
            if (!ok) return;
            LB.sfx('tap');
            LB.resetProgress();
            LB.save();
            LB.renderPage();
          });
        }

        LB.sfx('win');
        window.setTimeout(() => LB.confettiBurst(150), 320);
      }
    };
  }

  /* ---------------- Render ---------------- */

  const RENDERERS = {
    chapter: renderChapter,
    word: renderWord,
    sentence: renderSentence,
    pick: renderPick,
    find: renderFind,
    build: renderBuild,
    joke: renderJoke,
    chapterEnd: renderChapterEnd,
    finish: renderFinish
  };

  function renderPage(options) {
    const settings = options || {};
    const page = LB.currentPage();
    const pageEl = els.page;

    pageEl.style.setProperty('--accent', page.color || '#2f9e8f');
    pageEl.style.setProperty('--accent-soft', page.colorSoft || '#d6f2ec');

    const renderer = RENDERERS[page.type];
    const result = renderer
      ? renderer(page)
      : {
          body: '<p class="prompt">Hovsa. Denne side er væk.</p>',
          actions: nextButton('Videre'),
          wire: bindNext
        };

    pageEl.innerHTML = `
      ${pageHead(page)}
      <div class="page-body">${result.body}</div>
      <div class="page-actions">${result.actions || ''}</div>
      <div class="dogear" aria-hidden="true"></div>
    `;

    LB.updateChrome(page);

    if (result.wire) {
      try {
        result.wire(pageEl);
      } catch (error) {
        console.error('Sidefejl:', error);
      }
    }

    pageEl.classList.remove('turn-in');
    if (!LB.reducedMotion && settings.animate !== false) {
      void pageEl.offsetWidth;
      pageEl.classList.add('turn-in');
    }

    window.scrollTo(0, 0);
  }

  LB.renderPage = renderPage;

  /* ---------------- Start spillet ---------------- */

  LB.init();
  LB.renderPage({ animate: false });
  LB.showStart();
})();
