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
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const COMBIS = "combis";
const LIKES = "likes";
const VOTES = "votes";

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
  boosts,
  farmStats,
  sourceUrl,
  powerEffectsUsed,
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
    boosts: boosts || null, // { energy, itemTime, fastStart, randomBoost }
    farmStats: farmStats || null, // { coins, exp, boxes, coinEfficiency, timeSec }
    sourceUrl: sourceUrl || "",
    powerEffectsUsed: powerEffectsUsed || [], // ["Cheerleader", "Fairy", ...]
    likeCount: 0,
    verifyCount: 0,
    rejectCount: 0,
    authorUid: author.uid,
    authorName: author.displayName || "ผู้เล่น",
    authorPhoto: author.photoURL || "",
    createdAt: serverTimestamp(),
  });
}

// ลบ combi (ทำได้เฉพาะเจ้าของโพสต์ - กันไว้อีกชั้นด้วย Firestore rules)
export async function deleteCombi(comboId) {
  await deleteDoc(doc(db, COMBIS, comboId));
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

// โหวตยืนยัน (verify) หรือรายงานว่าใช้ไม่ได้ (reject) — คนละ 1 โหวตต่อเซ็ต เปลี่ยนใจภายหลังได้
export async function castVote(comboId, uid, voteType, voterName) {
  const voteRef = doc(db, VOTES, `${comboId}_${uid}`);
  const comboRef = doc(db, COMBIS, comboId);

  await runTransaction(db, async (tx) => {
    const voteSnap = await tx.get(voteRef);
    const comboSnap = await tx.get(comboRef);
    if (!comboSnap.exists()) return;

    const data = comboSnap.data();
    let verifyCount = data.verifyCount || 0;
    let rejectCount = data.rejectCount || 0;
    const prevType = voteSnap.exists() ? voteSnap.data().type : null;

    if (prevType === voteType) {
      // กดซ้ำ = ยกเลิกโหวต
      tx.delete(voteRef);
      if (voteType === "verify") verifyCount = Math.max(0, verifyCount - 1);
      if (voteType === "reject") rejectCount = Math.max(0, rejectCount - 1);
    } else {
      // โหวตใหม่ หรือเปลี่ยนใจจากอีกฝั่ง
      if (prevType === "verify") verifyCount = Math.max(0, verifyCount - 1);
      if (prevType === "reject") rejectCount = Math.max(0, rejectCount - 1);
      if (voteType === "verify") verifyCount += 1;
      if (voteType === "reject") rejectCount += 1;

      tx.set(voteRef, {
        comboId,
        uid,
        type: voteType,
        voterName: voterName || "ผู้เล่น",
        createdAt: serverTimestamp(),
      });
    }

    tx.update(comboRef, { verifyCount, rejectCount });
  });
}

// ฟังโหวตของ user คนนี้แบบเรียลไทม์ คืนเป็น Map: comboId -> "verify" | "reject"
export function subscribeUserVotes(uid, callback) {
  if (!uid) {
    callback(new Map());
    return () => {};
  }
  const q = query(collection(db, VOTES), where("uid", "==", uid));
  return onSnapshot(q, (snapshot) => {
    const map = new Map();
    snapshot.docs.forEach((d) => map.set(d.data().comboId, d.data().type));
    callback(map);
  });
}

// ดึงรายชื่อคนที่โหวต verify ล่าสุดของ combi หนึ่ง (ใช้ครั้งเดียวตอนเปิด modal รายละเอียด ไม่ต้องเรียลไทม์)
export async function getVotersForCombo(comboId) {
  const q = query(collection(db, VOTES), where("comboId", "==", comboId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}
