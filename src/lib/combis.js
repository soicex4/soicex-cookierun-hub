import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const COMBIS = "combis";
const LIKES = "likes";

// ฟังรายการ combi แบบเรียลไทม์ กรองตาม episode + goal เรียงตามคะแนนมาก -> น้อย
// callback จะถูกเรียกทุกครั้งที่ข้อมูลเปลี่ยน (มีคนเพิ่ม/กดไลค์)
export function subscribeCombis(episodeId, goalId, callback) {
  const q = query(
    collection(db, COMBIS),
    where("episodeId", "==", episodeId),
    where("goalId", "==", goalId),
    orderBy("score", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const combis = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(combis);
  });
}

// เพิ่ม combi ใหม่ (ต้องล็อกอินก่อน)
export async function addCombi({
  episodeId,
  goalId,
  mainCookie,
  partner,
  treasures,
  score,
  note,
  imageUrl,
  author,
}) {
  await addDoc(collection(db, COMBIS), {
    episodeId,
    goalId,
    mainCookie,
    partner,
    treasures, // [{ name, level }]
    score: Number(score) || 0,
    note: note || "",
    imageUrl: imageUrl || "",
    likeCount: 0,
    authorUid: author.uid,
    authorName: author.displayName || "ผู้เล่น",
    authorPhoto: author.photoURL || "",
    createdAt: serverTimestamp(),
  });
}

// สลับสถานะไลค์ (กด/ยกเลิก) ป้องกันไลค์ซ้ำด้วย doc id = comboId_uid
export async function toggleLike(comboId, uid) {
  const likeRef = doc(db, LIKES, `${comboId}_${uid}`);
  const comboRef = doc(db, COMBIS, comboId);

  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);
    const comboSnap = await tx.get(comboRef);
    if (!comboSnap.exists()) return;

    const currentCount = comboSnap.data().likeCount || 0;

    if (likeSnap.exists()) {
      // เคยไลค์แล้ว -> ยกเลิกไลค์
      tx.delete(likeRef);
      tx.update(comboRef, { likeCount: Math.max(0, currentCount - 1) });
    } else {
      // ยังไม่เคยไลค์ -> ไลค์
      tx.set(likeRef, { comboId, uid, createdAt: serverTimestamp() });
      tx.update(comboRef, { likeCount: currentCount + 1 });
    }
  });
}

// เช็คว่า user คนนี้เคยไลค์ combi นี้ไว้หรือยัง
export async function hasLiked(comboId, uid) {
  if (!uid) return false;
  const likeSnap = await getDoc(doc(db, LIKES, `${comboId}_${uid}`));
  return likeSnap.exists();
}

// ฟังรายการ comboId ทั้งหมดที่ user คนนี้เคยกดไลค์ไว้แบบเรียลไทม์ (ใช้โชว์หัวใจแดง/เทา)
export function subscribeUserLikes(uid, callback) {
  if (!uid) {
    callback(new Set());
    return () => {};
  }
  const q = query(collection(db, LIKES), where("uid", "==", uid));
  return onSnapshot(q, (snapshot) => {
    const ids = new Set(snapshot.docs.map((d) => d.data().comboId));
    callback(ids);
  });
}
