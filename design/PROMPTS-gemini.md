# Prompt สำหรับสร้างรูปเพื่อนซี้ด้วย Gemini

รูปเพื่อนซี้ 3 ตัวแรก (แมวน้ำ เต่า กระต่าย) สร้างจาก prompt ใน `ART-PROMPT.md`
ชุดนี้ทำเพื่อนซี้ที่ปลดล็อกจากดาวอีก 8 ตัว ให้สไตล์เดียวกัน

## วิธีใช้

1. เปิด Gemini แล้ว**อัปโหลดรูป 3 ไฟล์นี้ก่อน**เป็นตัวอย่างสไตล์ (แนบไว้ในแชตเดียวกันตลอด ไม่ต้องอัปโหลดซ้ำทุกรูป)
   - `assets/friends/seal.png`
   - `assets/friends/turtle.png`
   - `assets/friends/rabbit.png`
2. ก๊อป **บล็อกสไตล์กลาง** + **prompt ของตัวละคร** วางต่อกันเป็นข้อความเดียว แล้วส่ง
3. ได้รูปแล้วดาวน์โหลด เซฟชื่อไฟล์ตามที่ระบุ ลงโฟลเดอร์ `assets/incoming/`
   (ไม่ต้องตัดพื้นหลังเอง ผมตัดให้ทีหลัง ขอแค่พื้นขาวล้วน)
4. ถ้ารูปออกมาไม่เข้าสไตล์ ให้พิมพ์ต่อว่า `Redo. Match the reference images more closely: same line quality, same soft shading, same eye style.`
   ถ้ามีเงาที่พื้น/พื้นไม่ขาว ให้พิมพ์ `Redo with a pure flat white background and no cast shadow.`
5. เสร็จแล้วบอกผมว่าไฟล์ไหนอยู่ในโฟลเดอร์แล้ว ผมตัดพื้นหลัง ย่อขนาด ใส่เข้าเกม และเทสให้

**เทสก่อน 1 รูป** — ทำ `cat.png` อันเดียวก่อน ดูว่าเข้ากับ 3 ตัวเดิมไหม ค่อยทำที่เหลือ

---

## บล็อกสไตล์กลาง (วางนำหน้าทุก prompt)

```text
Use the three attached character images (baby seal, turtle, rabbit) as the exact style reference. Create ONE new character in the same art style: polished children's picture-book / softly shaded 2D game art, expressive bright eyes, tiny rosy cheeks, tactile fine colored-pencil detailing, crisp clean silhouette, gentle dimensional shading, not emoji, not plastic 3D, not photorealistic. Same visual scale, same line quality and same eye style as the references. Full body, facing the viewer, standing upright on an invisible floor, feet or base visible, centered, generous white margin around the character. Square 1:1 image. Background uniformly pure flat white (#FFFFFF). No cast shadow on the ground, no text, no lettering, no border, no logo, no watermark, no background scenery, no other characters. Friendly and sweet, for children aged 4-6.
```

---

## 1. น้องแมว — เซฟเป็น `cat.jpg`  (ทำแล้ว)

```text
Character: a chubby ginger-and-white kitten with a cream belly, big amber eyes and a tiny pink nose, wearing a small yellow collar with a little gold bell, holding a small red ball of yarn with both front paws, tail curled up happily.
```

## 2. เพนกวิน — เซฟเป็น `penguin.jpg`  (ทำแล้ว)

```text
Character: a fluffy baby penguin, soft dark grey back and white tummy, orange feet and small orange beak, wearing a sky-blue knitted beanie with a white pom-pom, flippers slightly out as if about to hug.
```

## 3. จิ้งจอก — เซฟเป็น `fox.jpg`  (ทำแล้ว)

```text
Character: a small orange fox with a white chest and white tail tip, big warm brown eyes, wearing a little green satchel bag across the shoulder, one paw raised in a friendly wave.
```

## 4. ยูนิคอร์น — เซฟเป็น `unicorn.jpg`  (ทำแล้ว)

```text
Character: a small white unicorn foal with a short golden spiral horn and a soft pastel rainbow mane and tail (pink, peach, mint, lavender), big sparkly violet eyes, a tiny gold star hair clip in the mane, standing on four legs facing the viewer.
```

## 5. โลมา — เซฟเป็น `dolphin.jpg`  (ทำแล้ว)

```text
Character: a cheerful light blue dolphin with a pale cream belly, big dark shiny eyes and a smiling beak, balancing upright on its tail like the seal reference, wearing a small coral pink flower tucked behind its head, one flipper waving.
```

## 6. ผีเสื้อ — เซฟเป็น `butterfly.jpg`  (ทำแล้ว)

```text
Character: a cute butterfly with a small round lavender body, a sweet face with big eyes and rosy cheeks, two thin antennae with tiny yellow tips, and large soft wings in pastel pink and lilac with simple mint-green dots, wings fully open and facing the viewer.
```

## 7. หมึกยักษ์ — เซฟเป็น `octopus.jpg`  (ทำแล้ว)

```text
Character: a small lavender-purple baby octopus with a big round head, big glossy eyes and rosy cheeks, eight short curly arms with pale pink suckers, wearing a tiny white sailor hat with a blue band, two arms raised as if waving hello.
```

## 8. กระรอก — เซฟเป็น `squirrel.jpg`  (ทำแล้ว)

```text
Character: a small chestnut-brown squirrel with a cream belly, a big fluffy curled tail, bright dark eyes and tiny tufted ears, wearing a small yellow bow at the neck, holding one acorn with both front paws.
```

---

## หมายเหตุสำหรับตอนใส่เข้าเกม

ชื่อไฟล์ = id ของรางวัลใน `js/rewards.js` (`cat`, `penguin`, `fox`, `unicorn`, `dolphin`, `butterfly`, `octopus`, `squirrel`)
ตอนใส่จะเพิ่มลงตาราง `labels`/`emojiAssets` ใน `js/assets.js` ให้ `animalHTML()` หยิบรูปแทน emoji ได้เหมือน 3 ตัวแรก

---

# ชุดที่ 2: สติกเกอร์ภารกิจวันนี้ (10 รูป)

สติกเกอร์ 15 แบบใน `js/mission.js` — 5 แบบเป็นสัตว์ (เต่า แมวน้ำ กระต่าย ผีเสื้อ โลมา) ใช้รูปเพื่อนซี้อยู่แล้ว
เหลือ 10 แบบเป็นของ ทำเป็นตัวการ์ตูนมีหน้ายิ้มแบบสติกเกอร์ ชื่อไฟล์ขึ้นต้น `sticker-` สคริปต์จะเซฟลง `assets/stickers/` ให้เอง

## บล็อกสไตล์กลางของสติกเกอร์ (วางนำหน้าทุก prompt)

```text
Use the three attached character images (baby seal, turtle, rabbit) as the exact style reference. Create ONE cute sticker illustration in the same art style: polished children's picture-book / softly shaded 2D game art, tactile fine colored-pencil detailing, crisp clean silhouette, gentle dimensional shading, not emoji, not plastic 3D, not photorealistic. The object has a sweet kawaii face: big bright eyes, tiny rosy cheeks and a small happy smile, same eye style as the references. Simple, chunky, rounded shape that reads clearly at small size. Centered, generous white margin. Square 1:1 image. Background uniformly pure flat white (#FFFFFF). No cast shadow, no text, no lettering, no border, no logo, no watermark, no background scenery, no other objects. Friendly and sweet, for children aged 4-6.
```

## S1. ดาว — `sticker-star.jpg`
```text
Sticker: a chubby golden-yellow five-pointed star with softly rounded points and a happy face, a few tiny sparkles floating around it.
```
## S2. รุ้ง — `sticker-rainbow.jpg`
```text
Sticker: a small arched rainbow in soft pastel bands (pink, peach, yellow, mint, sky blue, lavender) with a fluffy white cloud at each end, the left cloud has a happy face.
```
## S3. สตรอว์เบอร์รี — `sticker-strawberry.jpg`
```text
Sticker: a plump red strawberry with tiny pale seeds and a leafy green top, with a happy face.
```
## S4. ดอกซากุระ — `sticker-blossom.jpg`
```text
Sticker: a single soft pink cherry blossom flower with five rounded petals and a pale yellow center, with a happy face in the center.
```
## S5. ปลา — `sticker-fish.jpg`
```text
Sticker: a round little tropical fish, orange with a white stripe and soft blue fins, big bright eyes and a happy smile, two tiny bubbles beside it.
```
## S6. ลูกโป่ง — `sticker-balloon.jpg`
```text
Sticker: a shiny red heart-shaped balloon with a soft highlight and a short curly white string, with a happy face.
```
## S7. ไอศกรีม — `sticker-icecream.jpg`
```text
Sticker: a strawberry-pink soft-serve ice cream swirl in a golden waffle cone, with rainbow sprinkles and a happy face on the ice cream.
```
## S8. ทานตะวัน — `sticker-sunflower.jpg`
```text
Sticker: a cheerful sunflower with bright yellow petals, a warm brown center that has a happy face, and one green leaf on its short stem.
```
## S9. อมยิ้ม — `sticker-lollipop.jpg`
```text
Sticker: a round swirled lollipop in pink, mint and white on a short white stick, with a happy face in the middle of the swirl.
```
## S10. โบว์ — `sticker-bow.jpg`
```text
Sticker: a big soft coral-pink ribbon bow with rounded loops and two short trailing tails, with a tiny happy face on the center knot.
```

---

# ชุดที่ 3: ฉาก 7 โลกบนแผนที่ (ทำแล้ว 2026-09-16)

Gemini วาดมาเป็นแผ่นเดียว 7 แถบแนวนอน (ดีมาก เพราะแถบกว้าง ~7:1 เหมาะกับแผนที่เลื่อนข้าง)
แยกแถบด้วยสคริปต์เล็กๆ (หาแถวสีขาวคั่น) เซฟเป็น `assets/worlds/{island,forest,sea,snow,space,rainbow,home}.jpg`
แล้วใส่ `art` กับ `sky` (สีขอบบนของรูป) ใน `WORLDS` ของ `js/levels.js` — ถ้าวาดใหม่ให้ทำแบบเดิม

บล็อกที่ใช้: "Create ONE wide 16:9 landscape background scene ... very light, airy and low-contrast pastel ... pale sky fills the upper two thirds, gentle scenery sits along the bottom third. No characters, no animals, no people, no text ... The left and right edges fade softly into plain pale sky." + คำอธิบายฉาก

---

# ชุดที่ 4: ของแต่งตัว 12 ชิ้น (ทำแล้ว 2026-09-16 — ได้ 14 ชิ้น Gemini แถมโบว์ฟ้า/ม่วง)

ขอเป็นแผ่นเดียว 12 ช่อง ได้แผ่นที่วางไม่เป็นตารางเป๊ะ → ใช้ `design/blobs.py` หาก้อนแล้วตั้งชื่อตามลำดับ
ชื่อขึ้นต้น `item-` → `cutout.py` เซฟลง `assets/items/` ขนาด 512px
ใส่ใน `ITEMS` ของ `js/mini/dressup.js` (key ยังเป็น emoji เดิมเพื่อให้ชุดที่เด็กเคยใส่ไว้ยังโหลดได้)
