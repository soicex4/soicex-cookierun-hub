# CookieRun Guide by Soicex

เว็บลิสต์เซ็ตคุกกี้/เพ็ท/เทรเชอร์ต่อ Episode แบบเดียวกับ CookieRunHUB
ใครก็เพิ่มเซ็ตได้หลังล็อกอินด้วย Gmail กดไลค์ได้คนละ 1 ครั้งต่อเซ็ต เรียงลำดับตามคะแนน

## ระบบที่ใช้ (ทั้งหมดฟรี ไม่มี server ของเราเอง)

| ส่วน | ใช้อะไร |
|---|---|
| ล็อกอิน | Firebase Authentication (Sign in with Google) |
| ฐานข้อมูล combi + ไลค์ | Firebase Firestore |
| เก็บรูปสกรีนช็อต | Cloudinary (unsigned upload, ฟรี ไม่ต้องผูกบัตร) |
| โฮสต์เว็บ | GitHub Pages |

Firebase project, Google Sign-in, Firestore, และ Cloudinary ถูกตั้งค่าไว้แล้วตอนคุยกับ Claude
ค่า config ทั้งหมดอยู่ใน `src/firebase.js` และ `src/lib/cloudinary.js` เรียบร้อย ไม่ต้องแก้อะไรเพิ่มถ้าใช้ project เดิม

## สิ่งที่ต้องทำก่อนใช้งานจริง

### 1. ตั้งค่า Firestore security rules (สำคัญมาก ทำก่อนเปิดใช้จริง)

1. เปิด [Firebase Console](https://console.firebase.google.com) > โปรเจกต์ `soicex-cookierun-hub`
2. ไปที่ **Firestore Database > Rules**
3. ลบข้อความเดิมทั้งหมด แล้ววางเนื้อหาทั้งหมดจากไฟล์ [`firestore.rules`](./firestore.rules) ในโฟลเดอร์นี้แทน
4. กด **Publish**

กฎนี้ทำหน้าที่:
- ใครก็อ่านลิสต์ combi ได้ (สาธารณะ)
- เพิ่ม combi ได้เฉพาะคนที่ล็อกอินแล้ว
- กดไลค์ได้คนละ 1 ครั้งต่อเซ็ต (กันไลค์สแปม)
- ลบ combi ได้เฉพาะคนที่โพสต์เอง

### 2. รันดูในเครื่องตัวเองก่อน (แนะนำ)

ต้องมี [Node.js](https://nodejs.org) เวอร์ชัน 20 ขึ้นไป

```bash
npm install
npm run dev
```

เปิดลิงก์ที่ terminal บอก (ปกติคือ `http://localhost:5173`) ลองกด "เข้าสู่ระบบด้วย Google" และเพิ่ม combi ทดสอบดู

### 3. ขึ้นเว็บจริงผ่าน GitHub Pages

1. สร้าง repo ใหม่ชื่อ `soicex-cookierun-hub` บน GitHub แล้ว push โค้ดทั้งหมดในโฟลเดอร์นี้ขึ้นไป
2. ไปที่ repo > **Settings > Pages** > Source เลือก **GitHub Actions**
3. push ครั้งถัดไป (หรือกด **Run workflow** ที่แท็บ Actions) ระบบจะ build และขึ้นเว็บให้อัตโนมัติ
4. ถ้ายังไม่มีโดเมนของตัวเอง เว็บจะขึ้นที่ `https://<ชื่อบัญชี-github>.github.io/soicex-cookierun-hub/`
   - กรณีนี้ต้องเปลี่ยนค่า `base` ใน `vite.config.js` เป็น `"/soicex-cookierun-hub/"`

### 4. เพิ่มโดเมนของเว็บใน Firebase (สำคัญ ไม่ทำจะล็อกอินไม่ได้)

Google Sign-in จะทำงานเฉพาะโดเมนที่ Firebase อนุญาตไว้เท่านั้น:

1. Firebase Console > **Authentication > Settings > Authorized domains**
2. กด **Add domain**
3. ใส่โดเมนที่เว็บขึ้นจริง เช่น `<ชื่อบัญชี-github>.github.io` หรือโดเมนของพี่เอง

ถ้าลืมขั้นนี้ ปุ่ม "เข้าสู่ระบบด้วย Google" จะขึ้น error ตอนกด

### 5. ต่อโดเมนของพี่เอง (ถ้ามี)

1. สร้างไฟล์ `public/CNAME` ใส่ชื่อโดเมนบรรทัดเดียว เช่น `guide.soicex.com`
2. ตั้งค่า DNS ที่ผู้ให้บริการโดเมน ชี้ CNAME record ไปที่ `<ชื่อบัญชี-github>.github.io`
3. repo > Settings > Pages > ใส่ custom domain ให้ตรงกัน
4. อย่าลืมเพิ่มโดเมนนี้ใน Firebase Authorized domains ตามขั้นที่ 4 ด้วย
5. เก็บ `base: "/"` ไว้ใน `vite.config.js` แบบเดิม

---

## โครงสร้างโปรเจกต์

```
src/
  firebase.js           ← Firebase config (Auth + Firestore)
  lib/
    cloudinary.js        ← Cloudinary config + อัปโหลดรูป
    combis.js            ← Firestore: ดึง/เพิ่ม combi, ระบบไลค์
  gameData.js            ← รายชื่อ Episode และเป้าหมายการเล่น (แก้ตรงนี้ถ้าจะเพิ่ม/ลด)
  context/
    AuthContext.jsx       ← สถานะล็อกอินทั้งแอป
  components/
    LoginButton.jsx
    TabRow.jsx
    ComboCard.jsx         ← การ์ดแสดงเซ็ต (คุกกี้/เทรเชอร์/คะแนน/ไลค์)
    AddComboModal.jsx     ← ฟอร์มเพิ่มเซ็ตใหม่
    EpisodeCombis.jsx     ← หน้าหลัก (แท็บเป้าหมาย + Episode + ลิสต์)

firestore.rules          ← วางใน Firebase Console > Firestore > Rules
.github/workflows/       ← ตั้งค่า deploy อัตโนมัติขึ้น GitHub Pages
```

## วิธีเพิ่ม/แก้ Episode หรือเป้าหมายการเล่น

แก้ที่ไฟล์ `src/gameData.js` เพิ่ม/ลบรายการใน `GOALS` หรือ `EPISODES` ได้ตรงๆ
(อันนี้เป็นค่าคงที่ในโค้ด เพราะเป็นข้อมูลเกมที่ไม่ค่อยเปลี่ยน ต่างจาก combi ที่ผู้ใช้เพิ่มเองผ่านฟอร์ม)

## เฟสถัดไป (ยังไม่ได้ทำในเวอร์ชันนี้)

- คอมเมนต์ต่อ combi
- ระบบดาว/บันทึกเซ็ตโปรด
- ป้าย B (Blueberry buff) / P+ (Power+ effect)
- Search, Encyclopedia, Calculator, Forum (จากเว็บต้นฉบับ)
