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

## 1. น้องแมว — เซฟเป็น `cat.png`  ← เทสอันนี้ก่อน

```text
Character: a chubby ginger-and-white kitten with a cream belly, big amber eyes and a tiny pink nose, wearing a small yellow collar with a little gold bell, holding a small red ball of yarn with both front paws, tail curled up happily.
```

## 2. เพนกวิน — เซฟเป็น `penguin.png`

```text
Character: a fluffy baby penguin, soft dark grey back and white tummy, orange feet and small orange beak, wearing a sky-blue knitted beanie with a white pom-pom, flippers slightly out as if about to hug.
```

## 3. จิ้งจอก — เซฟเป็น `fox.png`

```text
Character: a small orange fox with a white chest and white tail tip, big warm brown eyes, wearing a little green satchel bag across the shoulder, one paw raised in a friendly wave.
```

## 4. ยูนิคอร์น — เซฟเป็น `unicorn.png`

```text
Character: a small white unicorn foal with a short golden spiral horn and a soft pastel rainbow mane and tail (pink, peach, mint, lavender), big sparkly violet eyes, a tiny gold star hair clip in the mane, standing on four legs facing the viewer.
```

## 5. โลมา — เซฟเป็น `dolphin.png`

```text
Character: a cheerful light blue dolphin with a pale cream belly, big dark shiny eyes and a smiling beak, balancing upright on its tail like the seal reference, wearing a small coral pink flower tucked behind its head, one flipper waving.
```

## 6. ผีเสื้อ — เซฟเป็น `butterfly.png`

```text
Character: a cute butterfly with a small round lavender body, a sweet face with big eyes and rosy cheeks, two thin antennae with tiny yellow tips, and large soft wings in pastel pink and lilac with simple mint-green dots, wings fully open and facing the viewer.
```

## 7. หมึกยักษ์ — เซฟเป็น `octopus.png`

```text
Character: a small lavender-purple baby octopus with a big round head, big glossy eyes and rosy cheeks, eight short curly arms with pale pink suckers, wearing a tiny white sailor hat with a blue band, two arms raised as if waving hello.
```

## 8. โคอาลา — เซฟเป็น `koala.png`

```text
Character: a fluffy grey koala with big round ears with cream fluff inside, a large soft black nose, sleepy-happy eyes, wearing a small yellow bow at the neck, hugging a sprig of green eucalyptus leaves.
```

---

## หมายเหตุสำหรับตอนใส่เข้าเกม

ชื่อไฟล์ = id ของรางวัลใน `js/rewards.js` (`cat`, `penguin`, `fox`, `unicorn`, `dolphin`, `butterfly`, `octopus`, `koala`)
ตอนใส่จะเพิ่มลงตาราง `labels`/`emojiAssets` ใน `js/assets.js` ให้ `animalHTML()` หยิบรูปแทน emoji ได้เหมือน 3 ตัวแรก
