// รายชื่อเป้าหมายการเล่น (คงที่ ไม่ต้องแก้บ่อย)
export const GOALS = [
  { id: "score", label: "ตีคะแนน" },
  { id: "autofarm", label: "ฟาร์มออโต้" },
  { id: "semiauto", label: "กึ่งออโต้" },
  { id: "coins", label: "ฟาร์มเหรียญ" },
  { id: "exp", label: "ฟาร์ม EXP" },
  { id: "boxes", label: "ฟาร์มกล่องสุ่ม" },
];

// รายชื่อ Episode (คงที่ ไม่ต้องแก้บ่อย)
export const EPISODES = [
  { id: "ep1", label: "EP 1" },
  { id: "ep2", label: "EP 2" },
  { id: "ep3", label: "EP 3" },
  { id: "ep4", label: "EP 4" },
  { id: "ep5", label: "EP 5" },
  { id: "ep6", label: "EP 6" },
  { id: "special1", label: "Special 1" },
  { id: "special2", label: "Special 2" },
  { id: "special3", label: "Special 3" },
];

export function goalLabel(id) {
  return GOALS.find((g) => g.id === id)?.label || id;
}

export function episodeLabel(id) {
  return EPISODES.find((e) => e.id === id)?.label || id;
}
