import { confetti, sayBubble } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { getMini, setMini } from '../state.js';

/* ห้องระบายสี: รูปเส้นเป็น SVG แบ่งเป็นส่วนๆ (class r) แตะสีแล้วแตะส่วนที่อยากระบาย
   สีที่ระบายไว้บันทึกทุกครั้ง กลับมาเปิดใหม่ก็ยังอยู่
   ส่วนที่เป็น class d คือรายละเอียด (ตา ปาก) ระบายไม่ได้ */

const S = 'stroke="#5a4a63" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

const PICTURES = [
  { id: 'turtle', icon: '🐢', name: 'เต่า', svg: `
    <ellipse class="r" cx="58" cy="50" rx="15" ry="9" transform="rotate(-35 58 50)" ${S}/>
    <ellipse class="r" cx="142" cy="50" rx="15" ry="9" transform="rotate(35 142 50)" ${S}/>
    <ellipse class="r" cx="58" cy="112" rx="15" ry="9" transform="rotate(35 58 112)" ${S}/>
    <ellipse class="r" cx="142" cy="112" rx="15" ry="9" transform="rotate(-35 142 112)" ${S}/>
    <path class="r" d="M46 74 L26 81 L46 88 Z" ${S}/>
    <circle class="r" cx="166" cy="81" r="17" ${S}/>
    <ellipse class="r" cx="100" cy="81" rx="56" ry="42" ${S}/>
    <circle class="r" cx="100" cy="81" r="17" ${S}/>
    <circle class="r" cx="70" cy="70" r="11" ${S}/>
    <circle class="r" cx="130" cy="70" r="11" ${S}/>
    <circle class="r" cx="82" cy="104" r="10" ${S}/>
    <circle class="r" cx="118" cy="104" r="10" ${S}/>
    <circle class="d" cx="172" cy="75" r="3"/>
    <circle class="d" cx="172" cy="87" r="3"/>` },

  { id: 'seal', icon: '🦭', name: 'แมวน้ำ', svg: `
    <path class="r" d="M40 104 L14 90 L24 106 L14 122 Z" ${S}/>
    <ellipse class="r" cx="92" cy="106" rx="60" ry="30" ${S}/>
    <ellipse class="r" cx="108" cy="130" rx="18" ry="8" transform="rotate(15 108 130)" ${S}/>
    <circle class="r" cx="148" cy="84" r="25" ${S}/>
    <ellipse class="r" cx="162" cy="93" rx="11" ry="7" ${S}/>
    <circle class="r" cx="160" cy="46" r="14" ${S}/>
    <circle class="d" cx="144" cy="78" r="3.5"/>
    <circle class="d" cx="167" cy="89" r="3"/>
    <path class="d" d="M166 96 L182 92 M166 98 L182 101" stroke="#5a4a63" stroke-width="2" fill="none"/>` },

  { id: 'flower', icon: '🌸', name: 'ดอกไม้', svg: `
    <circle class="r" cx="170" cy="30" r="15" ${S}/>
    <path class="r" d="M97 95 L103 95 L103 152 L97 152 Z" ${S}/>
    <ellipse class="r" cx="80" cy="126" rx="17" ry="8" transform="rotate(-30 80 126)" ${S}/>
    <ellipse class="r" cx="121" cy="138" rx="17" ry="8" transform="rotate(30 121 138)" ${S}/>
    <ellipse class="r" cx="100" cy="42" rx="12" ry="22" ${S}/>
    <ellipse class="r" cx="124" cy="56" rx="12" ry="22" transform="rotate(60 124 56)" ${S}/>
    <ellipse class="r" cx="124" cy="84" rx="12" ry="22" transform="rotate(120 124 84)" ${S}/>
    <ellipse class="r" cx="100" cy="98" rx="12" ry="22" ${S}/>
    <ellipse class="r" cx="76" cy="84" rx="12" ry="22" transform="rotate(60 76 84)" ${S}/>
    <ellipse class="r" cx="76" cy="56" rx="12" ry="22" transform="rotate(120 76 56)" ${S}/>
    <circle class="r" cx="100" cy="70" r="15" ${S}/>` },

  { id: 'fish', icon: '🐟', name: 'ปลา', svg: `
    <path class="r" d="M42 80 L12 55 L20 80 L12 105 Z" ${S}/>
    <path class="r" d="M84 50 Q100 24 122 52 Z" ${S}/>
    <path class="r" d="M88 112 Q100 134 118 110 Z" ${S}/>
    <ellipse class="r" cx="95" cy="80" rx="55" ry="32" ${S}/>
    <path class="r" d="M70 56 Q76 80 70 104 L84 104 Q90 80 84 56 Z" ${S}/>
    <path class="r" d="M98 50 Q104 80 98 110 L112 110 Q118 80 112 50 Z" ${S}/>
    <circle class="r" cx="168" cy="40" r="7" ${S}/>
    <circle class="r" cx="182" cy="24" r="5" ${S}/>
    <circle class="r" cx="162" cy="62" r="4" ${S}/>
    <circle class="d" cx="130" cy="72" r="4.5"/>
    <circle cx="131.5" cy="70.5" r="1.5" fill="#fff"/>` },

  { id: 'house', icon: '🏠', name: 'บ้าน', svg: `
    <circle class="r" cx="172" cy="30" r="14" ${S}/>
    <path class="r" d="M22 44 Q14 30 30 28 Q36 14 52 22 Q68 16 70 32 Q84 34 74 46 Z" ${S}/>
    <path class="r" d="M18 110 L28 110 L28 150 L18 150 Z" ${S}/>
    <circle class="r" cx="23" cy="100" r="18" ${S}/>
    <path class="r" d="M125 40 L139 40 L139 62 L125 62 Z" ${S}/>
    <path class="r" d="M50 70 L150 70 L150 150 L50 150 Z" ${S}/>
    <path class="r" d="M40 72 L100 26 L160 72 Z" ${S}/>
    <path class="r" d="M88 150 L88 112 Q100 100 112 112 L112 150 Z" ${S}/>
    <path class="r" d="M60 84 L82 84 L82 106 L60 106 Z" ${S}/>
    <path class="r" d="M118 84 L140 84 L140 106 L118 106 Z" ${S}/>
    <circle class="d" cx="107" cy="132" r="2.5"/>` },
];

const PALETTE = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac', '#a9e34b', '#63e6be', '#8d6e63', '#495057'];
const ERASER = '#ffffff';

export function mount(stage) {
  let saved = getMini('coloring') || {};
  let pic = PICTURES.find((p) => p.id === saved.current) || PICTURES[0];
  let color = PALETTE[0];

  stage.innerHTML = `
    <div class="mini-top">
      ${PICTURES.map((p) => `<button class="pic-btn" data-id="${p.id}" title="${p.name}">${p.icon}</button>`).join('')}
    </div>
    <div class="art-wrap"><svg class="art" viewBox="0 0 200 160" id="art"></svg></div>
    <div class="palette" id="palette">
      ${PALETTE.map((c) => `<button class="swatch" data-c="${c}" style="background:${c}"></button>`).join('')}
      <button class="swatch eraser" data-c="${ERASER}" title="ยางลบ">🧽</button>
    </div>
    <div class="mini-actions">
      <button class="btn blue" id="clear">เริ่มใหม่ 🔄</button>
      <button class="btn green" id="done">เสร็จแล้ว ✨</button>
    </div>`;

  const $art = stage.querySelector('#art');

  function persist() {
    saved.current = pic.id;
    setMini('coloring', saved);
  }

  function render() {
    $art.innerHTML = pic.svg;
    const fills = saved[pic.id] || {};
    $art.querySelectorAll('.r').forEach((el, i) => {
      el.dataset.i = i;
      el.setAttribute('fill', fills[i] || '#fff');
      el.onclick = () => {
        sfx.tap();
        fills[i] = color;
        saved[pic.id] = fills;
        el.setAttribute('fill', color);
        el.classList.remove('pop');
        void el.getBBox();
        el.classList.add('pop');
        persist();
      };
    });
    $art.querySelectorAll('.d').forEach((el) => el.setAttribute('fill', '#5a4a63'));
    stage.querySelectorAll('.pic-btn').forEach((b) => b.classList.toggle('on', b.dataset.id === pic.id));
  }

  stage.querySelectorAll('.pic-btn').forEach((b) => {
    b.onclick = () => {
      sfx.tap();
      pic = PICTURES.find((p) => p.id === b.dataset.id);
      speak(`ระบายสี${pic.name}`);
      persist();
      render();
    };
  });

  stage.querySelectorAll('.swatch').forEach((s) => {
    s.onclick = () => {
      sfx.tap();
      color = s.dataset.c;
      stage.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('on', x === s));
    };
  });
  stage.querySelector('.swatch').classList.add('on');

  stage.querySelector('#clear').onclick = () => {
    sfx.retry();
    delete saved[pic.id];
    persist();
    render();
  };

  stage.querySelector('#done').onclick = () => {
    sfx.win();
    confetti(stage, 36);
    sayBubble(stage, 'สวยมากเลย! 🎨');
    speak('สวยมากเลย');
  };

  speak('เลือกสีแล้วแตะรูปเพื่อระบาย');
  render();
}
