"""ตัดพื้นหลังขาวของรูปตัวละครจาก Gemini ให้เป็น PNG โปร่งใส แล้วย่อให้พอดีใช้ในเกม

วิธีใช้ (จากโฟลเดอร์โปรเจกต์):
    python design/cutout.py                 # แปลงทุกไฟล์ใน assets/incoming/ -> assets/friends/<ชื่อ>.png
    python design/cutout.py cat             # แปลงเฉพาะ cat.jpg / cat.png
    python design/cutout.py --shrink        # ย่อรูปที่โปร่งใสอยู่แล้วใน assets/friends/ ให้เล็กลง (ไม่ตัดพื้น)

หลักการ: flood fill จากขอบรูปเข้ามา เก็บเฉพาะพื้นที่สีขาวที่ "ต่อกับขอบ" เป็นพื้นหลัง
ส่วนสีขาวที่อยู่ในตัวละคร (ท้อง หน้า) ไม่โดนเพราะไม่ต่อกับขอบ
ต้องมี Pillow: python -m pip install pillow
"""
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
INCOMING = ROOT / 'assets' / 'incoming'
FRIENDS = ROOT / 'assets' / 'friends'
SIZE = 800          # ในเกมโชว์ใหญ่สุด ~190px (จอ 2x = 380px) 800px เหลือเฟือ
WHITE = 238         # ทุก channel >= ค่านี้ถือว่าเป็นพื้นขาว (JPEG มี noise นิดหน่อย)
MARGIN = 0.04       # ขอบว่างรอบตัวละคร (สัดส่วนของด้าน)


def background_mask(im):
    """คืน mask (L) 255 = พื้นหลัง โดย flood fill จากพิกเซลขอบที่เป็นสีขาว"""
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q = deque()

    def is_white(x, y):
        r, g, b = px[x, y][:3]
        return r >= WHITE and g >= WHITE and b >= WHITE

    for x in range(w):
        for y in (0, h - 1):
            if is_white(x, y) and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_white(x, y) and not seen[y * w + x]:
                seen[y * w + x] = 1
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and is_white(nx, ny):
                seen[ny * w + nx] = 1
                q.append((nx, ny))
    return Image.frombytes('L', (w, h), bytes(255 if s else 0 for s in seen))


def cutout(src: Path, dst: Path):
    im = Image.open(src).convert('RGB')
    bg = background_mask(im)
    alpha = Image.eval(bg, lambda v: 255 - v)
    # ขอบนุ่มนิดหน่อยจะได้ไม่เป็นขั้นบันได แล้วกินขอบขาวที่ติดมา 1px
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert('RGBA')
    out.putalpha(alpha)
    finish(out, dst)


def finish(out: Image.Image, dst: Path):
    """ครอปให้พอดีตัว เติมขอบ ทำเป็นสี่เหลี่ยมจัตุรัส ย่อ แล้วเซฟ PNG"""
    box = out.getbbox()
    if box:
        out = out.crop(box)
    w, h = out.size
    side = int(max(w, h) * (1 + MARGIN * 2))
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - w) // 2, (side - h) // 2))
    canvas = canvas.resize((SIZE, SIZE), Image.LANCZOS)
    # ลดเหลือ 256 สี (ยังมีความโปร่งใส) ไฟล์เล็กลง ~5 เท่า ตาเปล่าแยกไม่ออกกับงานสีไม้แบบนี้
    canvas = canvas.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
    dst.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst, 'PNG', optimize=True)
    print(f'{dst.relative_to(ROOT)}  {SIZE}x{SIZE}  {dst.stat().st_size // 1024} KB')


def main(args):
    if args[:1] == ['--shrink']:
        for src in sorted(FRIENDS.glob('*.png')):
            finish(Image.open(src).convert('RGBA'), src)
        return
    names = set(args)
    files = [p for p in sorted(INCOMING.iterdir()) if p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp') and (not names or p.stem in names)]
    if not files:
        print('ไม่พบไฟล์ใน assets/incoming/')
        return
    for src in files:
        cutout(src, FRIENDS / f'{src.stem}.png')


if __name__ == '__main__':
    main(sys.argv[1:])
