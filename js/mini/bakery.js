import { confetti, sayBubble } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { getMini, setMini } from '../state.js';

/* ร้านขนม: เลือกขนม → ระบายสีส่วนต่างๆ → แตะวางท็อปปิ้ง → เสร็จแล้วเก็บเข้าตู้โชว์
   ขนมเป็น SVG แบ่งส่วน (class r) เหมือนห้องระบายสี */

const S = 'stroke="#5a4a63" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

const BASES = [
  { id: 'cupcake', icon: '🧁', name: 'คัพเค้ก', svg: `
    <path class="r" d="M58 96 L70 152 L130 152 L142 96 Z" ${S}/>
    <ellipse class="r" cx="100" cy="96" rx="46" ry="11" ${S}/>
    <ellipse class="r" cx="100" cy="80" rx="42" ry="16" ${S}/>
    <ellipse class="r" cx="100" cy="62" rx="32" ry="14" ${S}/>
    <ellipse class="r" cx="100" cy="46" rx="20" ry="12" ${S}/>
    <circle class="r" cx="100" cy="28" r="8" ${S}/>` },
  { id: 'donut', icon: '🍩', name: 'โดนัท', svg: `
    <path class="r" fill-rule="evenodd" d="M100 30 a55 55 0 1 0 0.1 0 Z M100 66 a19 19 0 1 1 -0.1 0 Z" ${S}/>
    <path class="r" fill-rule="evenodd" d="M46 86 Q48 52 100 48 Q152 52 154 86 Q150 94 141 90 Q133 100 123 90 Q112 100 100 92 Q88 100 77 90 Q67 100 59 90 Q50 94 46 86 Z M100 66 a19 19 0 1 1 -0.1 0 Z" ${S}/>` },
  { id: 'cookie', icon: '🍪', name: 'คุกกี้', svg: `
    <circle class="r" cx="100" cy="85" r="58" ${S}/>
    <circle class="r" cx="78" cy="66" r="7" ${S}/>
    <circle class="r" cx="118" cy="60" r="7" ${S}/>
    <circle class="r" cx="130" cy="96" r="7" ${S}/>
    <circle class="r" cx="96" cy="108" r="7" ${S}/>
    <circle class="r" cx="70" cy="98" r="7" ${S}/>
    <circle class="r" cx="102" cy="82" r="6" ${S}/>` },
];

const PALETTE = ['#ff8fc0', '#ffd43b', '#8d6e63', '#69db7c', '#4dabf7', '#9775fa', '#ffa94d', '#ffffff'];
const TOPPINGS = ['🍓', '🍒', '🫐', '🍫', '⭐', '🍬', '🌸', '❤️'];
const SHOWCASE_MAX = 8;

function svgFor(base, fills, toppings) {
  const tops = toppings.map((t) => `<text x="${t.x}" y="${t.y}" font-size="16" text-anchor="middle" dominant-baseline="central">${t.e}</text>`).join('');
  return `<svg class="art" viewBox="0 0 200 160">${base.svg}${tops}</svg>`;
}

export function mount(stage) {
  const data = getMini('bakery') || { showcase: [] };
  let base = BASES[0];
  let fills = {};
  let toppings = [];
  let tool = { kind: 'color', value: PALETTE[0] };

  stage.innerHTML = `
    <div class="mini-top">
      ${BASES.map((b) => `<button class="pic-btn" data-id="${b.id}" title="${b.name}">${b.icon}</button>`).join('')}
    </div>
    <div class="art-wrap" id="artwrap"></div>
    <div class="palette" id="palette">
      ${PALETTE.map((c) => `<button class="swatch" data-kind="color" data-v="${c}" style="background:${c}"></button>`).join('')}
      <span class="palette-gap"></span>
      ${TOPPINGS.map((t) => `<button class="swatch topping" data-kind="top" data-v="${t}">${t}</button>`).join('')}
    </div>
    <div class="mini-actions">
      <button class="btn blue" id="clear">เริ่มใหม่ 🔄</button>
      <button class="btn green" id="done">เสร็จแล้ว ✨</button>
    </div>
    <div class="showcase" id="showcase"></div>`;

  const $wrap = stage.querySelector('#artwrap');

  function renderShowcase() {
    const $s = stage.querySelector('#showcase');
    $s.innerHTML = data.showcase.length
      ? '🏪 ' + data.showcase.map((c) => `<span class="shelf-item">${svgFor(BASES.find((b) => b.id === c.base), c.fills, c.toppings).replace('class="art"', 'class="art tiny"')}</span>`).join('')
      : '<span class="dim">🏪 ตู้โชว์ยังว่าง ทำขนมชิ้นแรกกันเถอะ</span>';
    // ใส่สีที่บันทึกไว้ให้ขนมในตู้
    $s.querySelectorAll('.shelf-item').forEach((item, k) => {
      const c = data.showcase[k];
      item.querySelectorAll('.r').forEach((el, i) => el.setAttribute('fill', c.fills[i] || '#fff'));
    });
  }

  function render() {
    $wrap.innerHTML = svgFor(base, fills, toppings);
    const $art = $wrap.querySelector('svg');
    $art.querySelectorAll('.r').forEach((el, i) => {
      el.setAttribute('fill', fills[i] || '#fff');
      el.onclick = (e) => {
        sfx.tap();
        if (tool.kind === 'color') {
          fills[i] = tool.value;
          el.setAttribute('fill', tool.value);
        } else {
          const pt = $art.createSVGPoint();
          pt.x = e.clientX; pt.y = e.clientY;
          const p = pt.matrixTransform($art.getScreenCTM().inverse());
          toppings.push({ x: Math.round(p.x), y: Math.round(p.y), e: tool.value });
          render();
        }
      };
    });
    stage.querySelectorAll('.pic-btn').forEach((b) => b.classList.toggle('on', b.dataset.id === base.id));
  }

  stage.querySelectorAll('.pic-btn').forEach((b) => {
    b.onclick = () => {
      sfx.tap();
      base = BASES.find((x) => x.id === b.dataset.id);
      fills = {}; toppings = [];
      speak(`ทำ${base.name}`);
      render();
    };
  });

  stage.querySelectorAll('.swatch').forEach((s) => {
    s.onclick = () => {
      sfx.tap();
      tool = { kind: s.dataset.kind, value: s.dataset.v };
      stage.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('on', x === s));
    };
  });
  stage.querySelector('.swatch').classList.add('on');

  stage.querySelector('#clear').onclick = () => { sfx.retry(); fills = {}; toppings = []; render(); };

  stage.querySelector('#done').onclick = () => {
    data.showcase.unshift({ base: base.id, fills: { ...fills }, toppings: toppings.slice() });
    if (data.showcase.length > SHOWCASE_MAX) data.showcase.length = SHOWCASE_MAX;
    setMini('bakery', data);
    sfx.win();
    confetti(stage, 36);
    sayBubble(stage, `${base.name}น่ากินมาก! เก็บเข้าตู้โชว์แล้ว 🏪`);
    speak('น่ากินมาก');
    fills = {}; toppings = [];
    render();
    renderShowcase();
  };

  speak('เลือกขนม ระบายสี แล้วแตะวางท็อปปิ้ง');
  render();
  renderShowcase();
}
