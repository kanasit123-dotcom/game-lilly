"""แยกรูปที่ Gemini วาดมา 4 รูปในแผ่นเดียว (ตาราง 2x2 พื้นขาว) ออกเป็น 4 ไฟล์

วิธีใช้:
    python design/split.py <ไฟล์แผ่น> TL=star TR=rainbow BL=- BR=strawberry
    ชื่อที่ให้จะกลายเป็น assets/incoming/sticker-<ชื่อ>.png (ใส่ - ถ้าไม่เอาช่องนั้น)
    แล้วค่อยรัน python design/cutout.py เพื่อตัดพื้นหลังต่อ

หาเส้นแบ่งเอง: เลือกคอลัมน์/แถวแถวๆ กลางภาพที่มี "หมึก" น้อยที่สุด
จะได้ไม่ตัดโดนรูปที่ล้ำเข้ามาใกล้กลาง (เช่น เมฆของรุ้ง)
"""
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
INCOMING = ROOT / 'assets' / 'incoming'
WHITE = 235


def best_cut(sums, lo, hi):
    """ตำแหน่งระหว่าง lo..hi ที่หมึกน้อยสุด (ถ้าเท่ากันเอาอันที่ใกล้กลางสุด)"""
    mid = (lo + hi) // 2
    return min(range(lo, hi), key=lambda i: (sums[i], abs(i - mid)))


def split(path: Path, names: dict):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    # mask ของหมึก: พิกเซลที่ไม่ขาว
    mask = im.convert('L').point(lambda v: 255 if v < WHITE else 0)
    px = mask.load()
    cols = [sum(1 for y in range(0, h, 4) if px[x, y]) for x in range(w)]
    rows = [sum(1 for x in range(0, w, 4) if px[x, y]) for y in range(h)]
    cx = best_cut(cols, int(w * 0.35), int(w * 0.65))
    cy = best_cut(rows, int(h * 0.35), int(h * 0.65))
    boxes = {'TL': (0, 0, cx, cy), 'TR': (cx, 0, w, cy), 'BL': (0, cy, cx, h), 'BR': (cx, cy, w, h)}
    print(f'{path.name}: ตัดที่ x={cx} y={cy}')
    for key, name in names.items():
        if not name or name == '-':
            continue
        out = INCOMING / f'sticker-{name}.png'
        im.crop(boxes[key]).save(out)
        print(f'  {key} -> {out.relative_to(ROOT)}')


if __name__ == '__main__':
    src = Path(sys.argv[1])
    if not src.is_absolute():
        src = ROOT / src
    names = dict(arg.split('=', 1) for arg in sys.argv[2:])
    split(src, names)
