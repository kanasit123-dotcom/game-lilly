(() => {
  'use strict';
  const app = document.querySelector('#app');
  const storageKey = 'lilly-design-preview-v1';
  const subjects = {
    family: { title: 'ครอบครัวของเรา', short: 'ครอบครัว', art: 'บ้าน', caption: 'ปู่ ย่า ตา ยาย', buddy: 'rabbit', lesson: 'ใครเป็นใครในครอบครัว', note: 'วันนี้รู้จักปู่ ย่า ตา และยาย', sticker: 'ครอบครัวแสนรัก' },
    thai: { title: 'สวนภาษาไทย', short: 'ภาษาไทย', art: 'ก อา', caption: 'ฟังเสียง · อ่านคำ', buddy: 'rabbit', lesson: 'มารู้จักสระ อา', note: 'กอ + อา อ่านว่า กา', sticker: 'นักอ่านตัวน้อย' },
    math: { title: 'สวนสนุกตัวเลข', short: 'คณิตศาสตร์', art: '1 2 3', caption: 'นับจำนวน · บวกทีละนิด', buddy: 'turtle', lesson: 'แครอตสองกลุ่ม', note: 'มี 2 หัว เพิ่มอีก 3 หัว รวมเป็น 5 หัว', sticker: 'นักนับแครอต' },
    english: { title: 'เพื่อนภาษาอังกฤษ', short: 'ภาษาอังกฤษ', art: 'Aa Bb', caption: 'Seal · Turtle · Rabbit', buddy: 'seal', lesson: 'Hello, little friends!', note: 'แมวน้ำ เต่า และกระต่าย', sticker: 'เพื่อนซี้สามตัว' }
  };
  const buddyNames = { seal: 'แมวน้ำ', turtle: 'เต่า', rabbit: 'กระต่าย' };
  const family = {
    grandpa: ['ปู่', 'พ่อของพ่อ เรียกว่า ปู่', 'Grandfather'],
    grandma: ['ย่า', 'แม่ของพ่อ เรียกว่า ย่า', 'Grandmother'],
    maternalGrandpa: ['ตา', 'พ่อของแม่ เรียกว่า ตา', 'Grandfather'],
    maternalGrandma: ['ยาย', 'แม่ของแม่ เรียกว่า ยาย', 'Grandmother'],
    father: ['พ่อ', 'พ่อ คือคุณพ่อของเรา', 'Father'],
    mother: ['แม่', 'แม่ คือคุณแม่ของเรา', 'Mother'],
    child: ['เรา', 'นี่คือตัวเรา', 'Me']
  };
  const questions = {
    family: [
      { q: 'พ่อของพ่อ เรียกว่าอะไร', choices: ['ตา', 'ปู่', 'พ่อ'], answer: 'ปู่', why: 'พ่อของพ่อ เรียกว่า ปู่' },
      { q: 'แม่ของพ่อ เรียกว่าอะไร', choices: ['ย่า', 'ยาย', 'แม่'], answer: 'ย่า', why: 'แม่ของพ่อ เรียกว่า ย่า' },
      { q: 'แม่ของแม่ เรียกว่าอะไร', choices: ['ป้า', 'ย่า', 'ยาย'], answer: 'ยาย', why: 'แม่ของแม่ เรียกว่า ยาย' }
    ],
    thai: [
      { q: 'กอ + อา อ่านว่าอะไร', choices: ['กา', 'กี', 'กู'], answer: 'กา', why: 'กอ อา กา' },
      { q: 'คำไหนมีสระ อา', choices: ['ดู', 'ตา', 'ดี'], answer: 'ตา', why: 'ตอ อา ตา' },
      { q: 'มอ + อา อ่านว่าอะไร', choices: ['มี', 'มือ', 'มา'], answer: 'มา', why: 'มอ อา มา' }
    ],
    math: [
      { q: '2 + 3 เท่ากับเท่าไร', choices: ['4', '5', '6'], answer: '5', why: 'สอง บวก สาม เท่ากับ ห้า', counts: [2, 3] },
      { q: '1 + 2 เท่ากับเท่าไร', choices: ['2', '4', '3'], answer: '3', why: 'หนึ่ง บวก สอง เท่ากับ สาม', counts: [1, 2] },
      { q: '3 + 1 เท่ากับเท่าไร', choices: ['4', '3', '5'], answer: '4', why: 'สาม บวก หนึ่ง เท่ากับ สี่', counts: [3, 1] }
    ]
  };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { /* Preview works when local storage is unavailable. */ }
  const state = {
    view: 'home', subject: 'family', buddy: buddyNames[saved.buddy] ? saved.buddy : 'seal',
    sound: saved.sound !== false, earned: Array.isArray(saved.earned) ? saved.earned.filter(x => subjects[x]) : [],
    question: 0, answered: false, picked: [], matched: 0, cards: [], harvested: new Set(), familyKey: 'grandma'
  };
  let pendingTimer;
  const icon = name => `<i data-lucide="${name}"></i>`;
  const animal = (kind, extra = '') => `<span class="animal ${kind} ${extra}" role="img" aria-label="${buddyNames[kind]}"></span>`;
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify({ buddy: state.buddy, sound: state.sound, earned: state.earned })); } catch { /* Session-only fallback. */ }
  }
  function speak(text, lang = 'th-TH') {
    if (!state.sound || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }
  function finishRender() { window.lucide?.createIcons(); }
  function go(view) {
    clearTimeout(pendingTimer);
    window.speechSynthesis?.cancel();
    state.view = view;
    document.querySelectorAll('nav [data-go]').forEach(button => {
      const active = button.dataset.go === view || (button.dataset.go === 'worlds' && ['lesson', 'quiz', 'memory', 'break', 'mini', 'done'].includes(view));
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    const views = { home, worlds, lesson, quiz, memory, break: breakTime, mini, done, collection, parents };
    app.innerHTML = views[view]();
    finishRender();
    app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  function worldCard(key) {
    const s = subjects[key];
    return `<button class="world-card" data-subject="${key}"><span class="subject-art ${key}" aria-hidden="true">${s.art}</span><b>${s.title}</b><small>${s.caption}</small><span class="card-footer">${state.earned.includes(key) ? 'เรียนแล้ว · ทบทวนได้' : 'บทเรียนแรก'}${icon('arrow-up-right')}</span></button>`;
  }
  function home() {
    return `<section class="welcome"><div><div class="eyebrow">วันนี้ของลิลลี่</div><h1>โลกของลิลลี่</h1><p>วันนี้เราไปเรียนรู้ด้วยกันนะ</p></div><div class="date-mark">สมุดสะสมของเรา<b>${state.earned.length} / 4 ดวง</b></div></section>
      <fieldset class="friends"><legend class="visually-hidden">เลือกเพื่อนร่วมทาง</legend>${Object.keys(buddyNames).map(b => `<label class="friend">${animal(b)}<input type="radio" name="buddy" value="${b}" aria-label="${buddyNames[b]}" ${b === state.buddy ? 'checked' : ''}><span class="friend-name">${buddyNames[b]}</span></label>`).join('')}</fieldset>
      <section class="daily"><span class="daily-number" aria-hidden="true">01</span><div class="daily-copy"><h2>ไปเยี่ยมครอบครัวกัน</h2><p>รู้จักปู่ ย่า ตา ยาย · แบบฝึกหัด 3 ข้อ</p></div><button class="primary" data-subject="family">เริ่มเรียน${icon('arrow-right')}</button></section>
      <div class="section-heading"><h2>วันนี้อยากเรียนอะไร</h2><button class="text-button" data-go="worlds">ดูบทเรียน${icon('arrow-right')}</button></div><div class="world-grid">${Object.keys(subjects).map(worldCard).join('')}</div>`;
  }
  function worlds() {
    return `<section class="worlds-intro"><div class="eyebrow">ทีละนิด เก่งขึ้นทุกวัน</div><h1>เลือกโลกที่อยากไป</h1><p class="muted">มีเรื่องสนุกรออยู่ทุกโลกเลย</p></section><div class="world-grid worlds-list">${Object.keys(subjects).map(worldCard).join('')}</div>`;
  }
  function steps(active) {
    return `<div class="back-row"><button class="icon-button" data-go="worlds" title="กลับไปเลือกบทเรียน" aria-label="กลับไปเลือกบทเรียน">${icon('arrow-left')}</button><div class="eyebrow">${subjects[state.subject].title}</div></div><div class="step-strip" aria-label="ขั้นตอนการเรียน">${['เรียนรู้', 'ลองทำ', 'พักเล่น'].map((text, i) => `${i ? '<span class="line" aria-hidden="true"></span>' : ''}<span class="${i === active ? 'active' : ''}" ${i === active ? 'aria-current="step"' : ''}><b>${i + 1}</b>${text}</span>`).join('')}</div>`;
  }
  function person(key, extra = '') { return `<button class="tree-person ${extra}" data-person="${key}" aria-pressed="${state.familyKey === key}" aria-label="${family[key][1]}">${family[key][0]}</button>`; }
  function explanation() {
    const member = family[state.familyKey];
    return `<div><b>${member[1]}</b><p>${member[2]}</p></div><button class="icon-button" data-action="family-audio" aria-label="ฟังคำเรียก" title="ฟังคำเรียก">${icon('volume-2')}</button>`;
  }
  function tree() {
    return `<div class="tree" aria-label="ผังครอบครัวตัวอย่าง"><div class="tree-side"><div class="grandparents">${person('grandpa')}${person('grandma')}</div>${person('father', 'parent-node')}</div><div class="tree-side maternal"><div class="grandparents">${person('maternalGrandpa')}${person('maternalGrandma')}</div>${person('mother', 'parent-node')}</div><div class="child-node">${person('child')}</div></div><div class="explanation" id="explanation" aria-live="polite">${explanation()}</div>`;
  }
  function carrots(count) { return Array.from({ length: count }, () => '<span class="carrot" aria-hidden="true"></span>').join(''); }
  function mathObjects(counts) { return `<div class="math-objects" aria-label="แครอต ${counts[0]} หัว รวมกับ ${counts[1]} หัว"><span class="object-group">${carrots(counts[0])}</span><span class="math-symbol" aria-hidden="true">+</span><span class="object-group">${carrots(counts[1])}</span></div>`; }
  function lesson() {
    const s = subjects[state.subject];
    let content = tree();
    if (state.subject === 'thai') content = `<div class="vowel">า</div><div class="reading-cards">${['กา', 'ตา', 'มา'].map(word => `<button class="reading-card" data-say="${word}"><b>${word}</b>${icon('volume-2')}</button>`).join('')}</div>`;
    if (state.subject === 'math') content = `${mathObjects([2, 3])}<div class="number-equation">2 + 3 = 5</div>`;
    if (state.subject === 'english') content = `<div class="reading-cards">${Object.keys(buddyNames).map(b => `<button class="reading-card" data-say="${b}" data-lang="en-US">${animal(b)}<b>${b[0].toUpperCase() + b.slice(1)}</b>${icon('volume-2')}</button>`).join('')}</div>`;
    return `${steps(0)}<div class="lesson-header"><h1>${s.lesson}</h1><p>${s.note}</p></div><section class="lesson-surface">${content}</section><div class="actions"><button class="secondary" data-action="lesson-audio">${icon('volume-2')}ฟังอีกครั้ง</button><button class="primary" data-action="start-practice">ลองทำกันเลย${icon('arrow-right')}</button></div>`;
  }
  function quiz() {
    const q = questions[state.subject][state.question];
    state.answered = false;
    return `${steps(1)}<div class="question-top"><span>ข้อ ${state.question + 1} / 3</span><div class="progress" role="progressbar" aria-label="ความคืบหน้า" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${state.question}"><div style="width:${state.question / 3 * 100}%"></div></div><button class="icon-button" data-action="question-audio" title="ฟังโจทย์" aria-label="ฟังโจทย์">${icon('volume-2')}</button></div><section class="lesson-surface"><h1 class="question">${q.q}</h1>${q.counts ? mathObjects(q.counts) : ''}<div class="answer-grid">${q.choices.map((answer, i) => `<button class="answer" data-answer="${i}">${answer}</button>`).join('')}</div><div class="feedback" role="status" id="feedback">ค่อย ๆ คิดได้นะ</div><div class="actions"><button class="primary" data-action="next-question" disabled>${state.question === 2 ? 'เรียนครบแล้ว' : 'ข้อต่อไป'}${icon('arrow-right')}</button></div></section>`;
  }
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; }
    return array;
  }
  function startPractice() {
    state.question = 0;
    if (state.subject === 'english') {
      state.cards = shuffle(Object.keys(buddyNames).flatMap(key => [{ key, kind: 'picture' }, { key, kind: 'word' }]));
      state.picked = [];
      state.matched = 0;
      go('memory');
    } else go('quiz');
  }
  function memory() {
    return `${steps(1)}<div class="lesson-header"><h1>หาเพื่อนให้เจอกัน</h1><p id="memory-count" role="status">จับคู่ได้ 0 / 3 คู่</p></div><div class="memory-grid">${state.cards.map((c, i) => `<button class="memory-card" data-memory="${i}" aria-label="เปิดการ์ดใบที่ ${i + 1}" aria-pressed="false"><span class="cover" aria-hidden="true">?</span><span class="face" aria-hidden="true">${c.kind === 'picture' ? animal(c.key) : c.key[0].toUpperCase() + c.key.slice(1)}</span></button>`).join('')}</div><div class="feedback" id="feedback" role="status"></div><div class="actions"><button class="primary" data-action="finish-practice" disabled>จับคู่ครบแล้ว${icon('arrow-right')}</button></div>`;
  }
  function breakTime() {
    return `${steps(2)}<section class="success">${animal(state.buddy)}<h1>ลิลลี่ทำได้แล้ว!</h1><p>พักไปเก็บแครอต 5 หัวให้เพื่อนกัน</p><div class="actions"><button class="primary" data-action="start-mini">ไปสวนแครอต${icon('sprout')}</button><button class="secondary" data-go="done">ข้ามการพักเล่น</button></div></section>`;
  }
  function mini() {
    return `${steps(2)}<div class="lesson-header"><h1>สวนแครอตของเรา</h1><p>แครอตพร้อมเก็บแล้ว</p></div><section class="lesson-surface"><div class="garden">${Array.from({ length: 5 }, (_, i) => `<button class="harvest" data-harvest="${i}" aria-label="เก็บแครอตหัวที่ ${i + 1}"><span class="carrot" aria-hidden="true"></span><span>${i + 1}</span></button>`).join('')}</div><div class="garden-status">${animal('turtle', 'buddy-small')}<div><b id="harvest-count" role="status">เก็บแล้ว 0 / 5 หัว</b><p class="muted">เต่ารอรับแครอตอยู่</p></div></div></section><div class="actions"><button class="secondary" data-go="done">พักพอแล้ว</button></div>`;
  }
  function done() {
    return `<section class="success">${animal(state.buddy)}<div class="eyebrow" style="justify-content:center">จบบทเรียนวันนี้แล้ว</div><h1>เก่งขึ้นอีกนิดแล้วนะ</h1><p>${subjects[state.subject].title}</p><div class="reward-sticker">${icon('badge-check')}สติกเกอร์ ${subjects[state.subject].sticker}</div><div class="actions"><button class="primary" data-action="continue-learning">ไปบทเรียนถัดไป${icon('arrow-right')}</button><button class="secondary" data-go="home">วันนี้พอแค่นี้</button></div></section>`;
  }
  function collection() {
    return `<div class="eyebrow">ความตั้งใจของลิลลี่</div><h1>สมุดสะสมของเรา</h1><p class="muted">มีสติกเกอร์แล้ว ${state.earned.length} ดวง</p><div class="collection">${Object.entries(subjects).map(([key, s]) => `<div class="sticker ${state.earned.includes(key) ? '' : 'locked'}">${animal(s.buddy)}<b>${s.sticker}</b><small>${state.earned.includes(key) ? 'ได้รับแล้ว' : s.title}</small></div>`).join('')}</div>`;
  }
  function parents() {
    return `<div class="eyebrow">สำหรับผู้ปกครอง</div><h1>การเรียนรู้ของลิลลี่</h1><div class="settings"><label class="settings-row"><span><b>เสียงคำอ่าน</b><p>ภาษาไทยและภาษาอังกฤษ</p></span><input id="sound-setting" type="checkbox" ${state.sound ? 'checked' : ''}></label><div class="settings-row"><b>บทเรียนที่ทำครบ</b><span>${state.earned.length} / 4 บท</span></div>${Object.entries(subjects).map(([key, s]) => `<div class="settings-row"><span>${s.title}</span><span>${state.earned.includes(key) ? 'ทำครบแล้ว' : 'ยังไม่ครบ'}</span></div>`).join('')}</div>`;
  }
  function completePractice() {
    if (!state.earned.includes(state.subject)) { state.earned.push(state.subject); persist(); }
    go('break');
  }
  function answer(button) {
    if (state.answered) return;
    const q = questions[state.subject][state.question];
    if (q.choices[Number(button.dataset.answer)] !== q.answer) {
      button.classList.add('wrong');
      button.disabled = true;
      document.querySelector('#feedback').textContent = 'ลองอีกครั้งนะ เราค่อย ๆ คิดด้วยกัน';
      speak('ลองอีกครั้งนะ');
      return;
    }
    state.answered = true;
    button.classList.add('correct');
    document.querySelectorAll('[data-answer]').forEach(el => { el.disabled = true; });
    document.querySelector('#feedback').textContent = `ใช่เลย! ${q.why}`;
    document.querySelector('[data-action="next-question"]').disabled = false;
    speak(q.why);
  }
  function flip(button) {
    if (button.classList.contains('flipped') || button.classList.contains('matched') || state.picked.length === 2) return;
    const index = Number(button.dataset.memory);
    const card = state.cards[index];
    button.classList.add('flipped');
    button.setAttribute('aria-label', `${card.kind === 'picture' ? 'รูป' : 'คำว่า'} ${card.key}`);
    button.setAttribute('aria-pressed', 'true');
    button.querySelector('.face').setAttribute('aria-hidden', 'false');
    state.picked.push(index);
    speak(card.key, 'en-US');
    if (state.picked.length !== 2) return;
    const [first, second] = state.picked;
    if (state.cards[first].key === state.cards[second].key) {
      state.picked.forEach(i => { const el = document.querySelector(`[data-memory="${i}"]`); el.classList.add('matched'); el.disabled = true; });
      state.picked = [];
      state.matched++;
      document.querySelector('#memory-count').textContent = `จับคู่ได้ ${state.matched} / 3 คู่`;
      document.querySelector('#feedback').textContent = 'เจอเพื่อนแล้ว!';
      if (state.matched === 3) document.querySelector('[data-action="finish-practice"]').disabled = false;
    } else {
      document.querySelector('#feedback').textContent = 'ยังไม่ใช่คู่เดียวกัน ลองใหม่ได้เลย';
      pendingTimer = setTimeout(() => {
        state.picked.forEach(i => { const el = document.querySelector(`[data-memory="${i}"]`); el.classList.remove('flipped'); el.setAttribute('aria-label', `เปิดการ์ดใบที่ ${i + 1}`); el.setAttribute('aria-pressed', 'false'); el.querySelector('.face').setAttribute('aria-hidden', 'true'); });
        state.picked = [];
      }, 1100);
    }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const d = button.dataset;
    if (d.go) { go(d.go); return; }
    if (d.subject) { state.subject = d.subject; state.familyKey = 'grandma'; go('lesson'); return; }
    if (d.say) { speak(d.say, d.lang || 'th-TH'); return; }
    if (d.person) {
      state.familyKey = d.person;
      document.querySelectorAll('[data-person]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.person === d.person)));
      document.querySelector('#explanation').innerHTML = explanation();
      finishRender();
      speak(family[d.person][1]);
      return;
    }
    if (d.answer !== undefined) { answer(button); return; }
    if (d.memory !== undefined) { flip(button); return; }
    if (d.harvest !== undefined) {
      state.harvested.add(d.harvest);
      button.disabled = true;
      button.setAttribute('aria-label', `เก็บแครอตหัวที่ ${Number(d.harvest) + 1} แล้ว`);
      button.querySelector('span:last-child').textContent = '✓';
      document.querySelector('#harvest-count').textContent = `เก็บแล้ว ${state.harvested.size} / 5 หัว`;
      speak(['หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า'][state.harvested.size - 1]);
      if (state.harvested.size === 5) pendingTimer = setTimeout(() => go('done'), 900);
      return;
    }
    switch (d.action) {
      case 'family-audio': speak(family[state.familyKey][1]); break;
      case 'lesson-audio': speak(state.subject === 'family' ? family[state.familyKey][1] : state.subject === 'english' ? 'Seal. Turtle. Rabbit.' : subjects[state.subject].note, state.subject === 'english' ? 'en-US' : 'th-TH'); break;
      case 'question-audio': speak(questions[state.subject][state.question].q); break;
      case 'start-practice': startPractice(); break;
      case 'next-question': if (state.answered) { if (++state.question === 3) completePractice(); else go('quiz'); } break;
      case 'finish-practice': if (state.matched === 3) completePractice(); break;
      case 'start-mini': state.harvested = new Set(); go('mini'); break;
      case 'continue-learning': { const keys = Object.keys(subjects); state.subject = keys[(keys.indexOf(state.subject) + 1) % keys.length]; go('lesson'); break; }
    }
  });
  document.addEventListener('change', event => {
    if (event.target.name === 'buddy') { state.buddy = event.target.value; persist(); }
    if (event.target.id === 'sound-setting') { state.sound = event.target.checked; if (!state.sound) window.speechSynthesis?.cancel(); persist(); }
  });
  go('home');
})();
