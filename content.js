/* Den Hemmelige Læsebog – indhold.
   Siderne ligger i stigende sværhedsgrad: 1. klasse -> 4. klasse. */

const CHAPTERS = [
  {
    title: 'De første ord',
    subtitle: 'Kapitel 1 · 1. klasse',
    emoji: '🐣',
    color: '#e8890c',
    colorSoft: '#ffe9c7',
    blurb: 'Vi starter helt blidt. Små ord, store stjerner. Læs ordet højt for Ulla.',
    pages: [
      { type: 'word', word: 'sol', emoji: '☀️', syllables: ['sol'], hint: 'Solen er gul og varm. Sig det langsomt: s-o-l.' },
      { type: 'word', word: 'mus', emoji: '🐭', syllables: ['mus'], hint: 'En lille mus med store ører. Pip!' },
      { type: 'pick', prompt: 'Hvilket ord hører til billedet?', emoji: '🐱', options: ['kat', 'hat', 'mad', 'bus'], answer: 'kat', hint: 'Det er et dyr, der siger mjav.' },
      { type: 'word', word: 'is', emoji: '🍦', syllables: ['is'], hint: 'Koldt, sødt og lækkert. Mums.' },
      { type: 'sentence', words: ['Musen', 'ser', 'en', 'kat.'], hint: 'Tryk på et ord, hvis du er i tvivl. Så læser Ulla det for dig.' },
      { type: 'find', words: ['Jeg', 'kan', 'læse', 'en', 'bog.'], target: 2, prompt: 'Tryk på ordet »læse«.', hint: 'Det er det, du er i gang med lige nu!' },
      { type: 'joke', setup: 'Hvad siger koen, når den hopper i vandet?', punchline: 'MUH-SPLAT!' }
    ]
  },
  {
    title: 'Ord med fart på',
    subtitle: 'Kapitel 2 · 2. klasse',
    emoji: '🚀',
    color: '#2f9e8f',
    colorSoft: '#d6f2ec',
    blurb: 'Nu kommer der fart på. Ordene bliver lidt længere, men du kan sagtens.',
    pages: [
      { type: 'word', word: 'springe', emoji: '🦘', syllables: ['sprin', 'ge'], hint: 'Kænguruen kan springe højt. Del ordet: sprin-ge.' },
      { type: 'word', word: 'blomst', emoji: '🌸', syllables: ['blomst'], hint: 'Mange bogstaver. Sig det langsomt: b-l-o-m-s-t.' },
      { type: 'word', word: 'fnise', emoji: '🤭', syllables: ['fni', 'se'], hint: 'Det gør man, når noget er lidt sjovt. Hi-hi.' },
      { type: 'pick', prompt: 'Hvilket ord rimer på »hat«?', emoji: '🎩', options: ['kat', 'sol', 'mus', 'ost'], answer: 'kat', hint: 'Det rimer, fordi det også slutter med -at.' },
      { type: 'sentence', words: ['Frøen', 'springer', 'over', 'den', 'blå', 'blomst.'], hint: 'Frøen har det sjovt i haven.' },
      { type: 'find', words: ['Bamse', 'spiser', 'blå', 'blomster', 'i', 'haven.'], target: 2, prompt: 'Tryk på farven.', hint: 'Farven på blomsterne.' },
      { type: 'build', answer: ['Musen', 'spiser', 'en', 'ost.'], hint: 'Start med »Musen«. Hvad laver musen så?' },
      { type: 'joke', setup: 'Hvad kalder man en bjørn uden tænder?', punchline: 'En gummi-bjørn!' }
    ]
  },
  {
    title: 'Sætninger med sjov',
    subtitle: 'Kapitel 3 · 2.–3. klasse',
    emoji: '🤪',
    color: '#e2653f',
    colorSoft: '#ffe3d9',
    blurb: 'Nu bygger vi sætninger. Nogle af dem er lidt fjollede. Det er meningen.',
    pages: [
      { type: 'sentence', words: ['Kan', 'du', 'finde', 'ketchuppen?'], hint: 'Spørgetegnet betyder, at du skal sige det som et spørgsmål.' },
      { type: 'sentence', words: ['Min', 'hund', 'spiser', 'spaghetti', 'med', 'ske.'], hint: 'Hunde spiser da ikke spaghetti med ske!' },
      { type: 'pick', prompt: 'Hvilket ord mangler?', before: 'Jeg', after: 'en stor is.', options: ['spiser', 'sover', 'kaster', 'tegner'], answer: 'spiser', hint: 'Man kan spise en is. Nam.' },
      { type: 'build', answer: ['Hvor', 'er', 'mine', 'sure', 'sokker?'], hint: 'Det er et spørgsmål. Start med »Hvor«.' },
      { type: 'find', words: ['Den', 'lille', 'gris', 'danser', 'i', 'stuen.'], target: 2, prompt: 'Tryk på ordet, der er et dyr.', hint: 'Det er et lyserødt dyr, der siger øf.' },
      { type: 'joke', setup: 'Hvad sagde osten, da den blev skåret?', punchline: 'Av, det er hårdt!' }
    ]
  },
  {
    title: 'De lange ord',
    subtitle: 'Kapitel 4 · 3. klasse',
    emoji: '🐘',
    color: '#7a6ae8',
    colorSoft: '#e6e1ff',
    blurb: 'Nu bliver ordene lange. Del dem i bider, hvis det hjælper. Ulla gør det også.',
    pages: [
      { type: 'word', word: 'sommerfugl', emoji: '🦋', syllables: ['som', 'mer', 'fugl'], hint: 'Sommerfuglen har fire farverige vinger.' },
      { type: 'word', word: 'tandbørste', emoji: '🪥', syllables: ['tand', 'bør', 'ste'], hint: 'To ord i ét: TAND + BØRSTE.' },
      { type: 'word', word: 'chokolade', emoji: '🍫', syllables: ['cho', 'ko', 'la', 'de'], hint: 'Ch! Chokolade smager skønt.' },
      { type: 'sentence', words: ['Søren', 'spiste', 'syv', 'sure', 'citroner.'], hint: 'Syv sure citroner. Av, det smager surt!' },
      { type: 'find', words: ['Søren', 'spiste', 'syv', 'sure', 'citroner.'], target: 2, prompt: 'Tryk på ordet, der betyder 7.', hint: 'Tallet syv, skrevet med bogstaver.' },
      { type: 'pick', prompt: 'Hvilket ord betyder »meget sjovt«?', emoji: '😄', options: ['morsomt', 'kedeligt', 'hurtigt', 'koldt'], answer: 'morsomt', hint: 'Det er det modsatte af kedeligt.' },
      { type: 'joke', setup: 'Hvad hedder en meget lille mor?', punchline: 'En mini-mor!' }
    ]
  },
  {
    title: 'Vrøvl og vittigheder',
    subtitle: 'Kapitel 5 · 3.–4. klasse',
    emoji: '🃏',
    color: '#d94f7a',
    colorSoft: '#ffdce6',
    blurb: 'Nu bliver det vrøvlet. Og det er meningen. Læs roligt, så giver vrøvlet mening.',
    pages: [
      { type: 'word', word: 'vrøvl', emoji: '🤪', syllables: ['vrøvl'], hint: 'Det betyder noget, der ikke giver mening. Som en pingvin på bordet.' },
      { type: 'sentence', words: ['Da', 'jeg', 'vågnede,', 'dansede', 'der', 'en', 'pingvin', 'på', 'mit', 'bord.'], hint: 'Det er vist noget, du har drømt. Læs den roligt.' },
      { type: 'sentence', words: ['Hvis', 'du', 'finder', 'en', 'ost', 'i', 'skoen,', 'skal', 'du', 'ikke', 'spise', 'den.'], hint: 'En ost i skoen? Ad! Læg mærke til kommaet.' },
      { type: 'pick', prompt: 'Hvilket ord mangler?', before: 'Jeg løb hurtigt,', after: 'jeg var sulten.', options: ['fordi', 'men', 'og', 'eller'], answer: 'fordi', hint: '»Fordi« fortæller hvorfor.' },
      { type: 'build', answer: ['En', 'pingvin', 'dansede', 'på', 'mit', 'bord.'], hint: 'Start med »En«. Hvem dansede?' },
      { type: 'joke', setup: 'Hvorfor har fiskene ikke paraplyer?', punchline: 'Fordi de ikke bliver våde!' },
      { type: 'joke', setup: 'Hvad er en spøgelses yndlingsret?', punchline: 'Spøg-etti!' }
    ]
  },
  {
    title: 'Mester-læser',
    subtitle: 'Kapitel 6 · 4. klasse',
    emoji: '🏆',
    color: '#2f7dd1',
    colorSoft: '#d8eaff',
    blurb: 'Sidste kapitel. Nu er du en rigtig ord-detektiv. Klarer du de sidste lange sætninger?',
    pages: [
      { type: 'word', word: 'krokodille', emoji: '🐊', syllables: ['kro', 'ko', 'dil', 'le'], hint: 'Krokodillen har skarpe tænder, men her er den flink.' },
      { type: 'word', word: 'pludselig', emoji: '⚡', syllables: ['plud', 'se', 'lig'], hint: 'Det betyder, at noget sker helt uventet.' },
      { type: 'sentence', words: ['Pludselig', 'landede', 'en', 'kæmpe', 'krokodille', 'i', 'min', 'have', 'og', 'bad', 'om', 'ketchup.'], hint: 'Mange ord! Læs dem i små bidder og træk vejret.' },
      { type: 'sentence', words: ['Selv', 'om', 'det', 'regnede,', 'ville', 'hun', 'spise', 'isen', 'ude', 'i', 'haven.'], hint: 'Hun er vist ligeglad med regnen. Læg mærke til kommaet.' },
      { type: 'pick', prompt: 'Hvad betyder ordet »fnise«?', options: ['At grine lidt', 'At sove tungt', 'At spise hurtigt', 'At løbe væk'], answer: 'At grine lidt', hint: 'Det gør man bag sin hånd: hi-hi.' },
      { type: 'build', answer: ['Dragen', 'ville', 'hellere', 'spise', 'pandekager', 'end', 'spinat.'], hint: 'Start med »Dragen«. Hvad ville den hellere?' },
      { type: 'joke', setup: 'Hvad sagde den ene væg til den anden?', punchline: 'Vi mødes på hjørnet!' }
    ]
  }
];

function isTaskPage(page) {
  return ['word', 'sentence', 'pick', 'find', 'build', 'joke'].includes(page.type);
}

const PAGES = [];

CHAPTERS.forEach((chapter, chapterIndex) => {
  const meta = {
    chapter: chapterIndex,
    chapterTitle: chapter.title,
    chapterSub: chapter.subtitle,
    color: chapter.color,
    colorSoft: chapter.colorSoft,
    chapterEmoji: chapter.emoji
  };

  PAGES.push({
    type: 'chapter',
    ...meta,
    title: chapter.title,
    blurb: chapter.blurb,
    kicker: chapter.subtitle
  });

  chapter.pages.forEach((page) => {
    PAGES.push({ ...page, ...meta });
  });

  if (chapterIndex < CHAPTERS.length - 1) {
    PAGES.push({
      type: 'chapterEnd',
      ...meta,
      title: `Kapitel ${chapterIndex + 1} klaret!`,
      stars: chapter.pages.filter(isTaskPage).length
    });
  }
});

const lastChapter = CHAPTERS[CHAPTERS.length - 1];
PAGES.push({
  type: 'finish',
  chapter: CHAPTERS.length - 1,
  chapterTitle: lastChapter.title,
  chapterSub: 'Slut på bogen',
  color: lastChapter.color,
  colorSoft: lastChapter.colorSoft,
  emoji: '🏅'
});

window.LB_CONTENT = { CHAPTERS, PAGES };
