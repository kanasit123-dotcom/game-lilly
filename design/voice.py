"""สร้างไฟล์เสียงพูดล่วงหน้า (Microsoft Neural ผ่าน edge-tts) สำหรับโลกของลิลลี่
  ไทย    th-TH-PremwadeeNeural  → assets/voice/th/<hash>.mp3
  อังกฤษ en-US-AnaNeural        → assets/voice/en/<hash>.mp3
แต่ละโฟลเดอร์มี manifest.json (ข้อความ → ไฟล์) และรายชื่อไฟล์ถูกเขียนลง sw.js ระหว่าง // voice-start … // voice-end

ใช้:  pip install edge-tts   แล้ว   python design/voice.py
สร้างเฉพาะประโยคที่ยังไม่มีไฟล์ — เพิ่ม/แก้ข้อความใน js/ แล้วรันซ้ำได้เลย

เก็บข้อความจาก string literal ทุกตัวใน js/ (ยกเว้น tests) ถ้าเป็น template `...${x}...` จะเก็บเฉพาะส่วนคงที่
เวลาเล่น audio.js จะต่อคลิปเป็นวลีๆ (จับคู่คำที่ยาวที่สุดจากซ้ายไปขวา) เลยต้องมีคลิปของ ตัวเลข 0–100 ด้วย
"""
import asyncio
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICES = {
    'th': ('th-TH-PremwadeeNeural', '-10%', '+10Hz'),
    'en': ('en-US-AnaNeural', '-15%', '+0Hz'),
}
THAI = re.compile('[฀-๿]')
ENGLISH = re.compile(r"^[A-Za-z][A-Za-z' !?.,-]*$")
LITERAL = re.compile(r"'((?:[^'\\\n]|\\.)+)'|\"((?:[^\"\\\n]|\\.)+)\"|`((?:[^`\\]|\\.)+)`")
# string ที่เป็นโค้ด ไม่ใช่คำพูด
CODEY = re.compile(r"addEventListener\(\s*['\"](\w+)['\"]|classList\.\w+\(\s*['\"]([^'\"]+)['\"]|querySelector(?:All)?\(\s*['\"]([^'\"]+)['\"]|getAttribute\(\s*['\"]([^'\"]+)['\"]|dataset\.\w+|import .* from ['\"]([^'\"]+)['\"]")
SKIP_EN = set('''click pointerdown pointerup pointermove pointercancel touchstart touchmove touchend keydown keyup input change
load resize scroll ended error button div span img svg path circle rect text g none block flex grid hidden visible
auto true false null undefined function object string number boolean px em rem vh vw ms s'''.split())


def fragments(text):
    """ส่วนคงที่ของ template literal"""
    return [part.strip() for part in re.split(r"\$\{[^}]*\}", text)]


def collect():
    th, en = set(), set()
    for path in ROOT.glob('js/**/*.js'):
        src = path.read_text(encoding='utf-8')
        src = CODEY.sub('', src)
        for match in LITERAL.findall(src):
            raw = next(x for x in match if x)
            for text in fragments(raw):
                text = text.replace("\\'", "'").replace('\\"', '"').replace('\\n', ' ')
                text = re.sub(r'\s+', ' ', text).strip(' ·')
                if not text or re.search(r'[<>{}=;/\\]', text):   # HTML/โค้ด ไม่ใช่คำพูด
                    continue
                if THAI.search(text):
                    th.add(text)
                elif ENGLISH.match(text) and len(text) <= 40 and '-' not in text and text.lower() not in SKIP_EN and not re.search(r'[a-z][A-Z]', text):
                    en.add(text.strip('.,!? '))
    th.update(str(n) for n in range(0, 101))
    en.update(str(n) for n in range(0, 21))
    return {'th': sorted(t for t in th if t), 'en': sorted(t for t in en if t)}


def spoken(text):
    """ข้อความที่ส่งให้ TTS: ตัดอีโมจิ/สัญลักษณ์ออก"""
    chars = [' ' if (0x1F000 <= ord(c) <= 0x1FFFF or 0x2600 <= ord(c) <= 0x27BF or c in '️·') else c for c in text]
    return re.sub(r'\s+', ' ', ''.join(chars)).strip()


async def render(lang, texts):
    import edge_tts
    voice, rate, pitch = VOICES[lang]
    out = ROOT / 'assets' / 'voice' / lang
    out.mkdir(parents=True, exist_ok=True)
    manifest = {}
    todo = []
    for text in texts:
        # คีย์ไม่มีเครื่องหมายวรรคตอนท้ายประโยค เพราะตอนเล่น clipsFor() ข้ามเครื่องหมายพวกนี้ (แต่เสียงยังอ่านตามข้อความเต็ม)
        key = (text.lower() if lang == 'en' else text).strip('!?.,: ')
        if not key or key in manifest:
            continue
        name = hashlib.md5(key.encode('utf-8')).hexdigest()[:10] + '.mp3'
        manifest[key] = name
        if not (out / name).exists():
            todo.append((text, name))
    print(f'{lang}: {len(manifest)} phrases, {len(todo)} to generate')
    for i, (text, name) in enumerate(todo):
        for attempt in range(3):
            try:
                await edge_tts.Communicate(spoken(text), voice, rate=rate, pitch=pitch).save(str(out / name))
                break
            except Exception as error:  # เน็ตสะดุด ลองใหม่
                print('  retry', name, error)
                await asyncio.sleep(2)
        if i % 50 == 0:
            print(f'  {i}/{len(todo)}')
    (out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=0), encoding='utf-8')
    keep = set(manifest.values()) | {'manifest.json'}
    for f in out.iterdir():
        if f.name not in keep:
            f.unlink()
    return sorted(manifest.values())


async def main():
    texts = collect()
    files = []
    for lang in VOICES:
        names = await render(lang, texts[lang])
        files += [f'assets/voice/{lang}/manifest.json'] + [f'assets/voice/{lang}/{n}' for n in names]
    sw = ROOT / 'sw.js'
    text = sw.read_text(encoding='utf-8')
    start = text.index('\n', text.index('  // voice-start')) + 1
    end = text.index('  // voice-end')
    lines = ''.join(f"  '{f}',\n" for f in files)
    sw.write_text(text[:start] + lines + text[end:], encoding='utf-8', newline='\n')
    print('sw.js updated with', len(files), 'files')


asyncio.run(main())
