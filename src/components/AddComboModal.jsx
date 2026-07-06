import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addCombi, updateCombi } from "../lib/combis";
import { uploadImage } from "../lib/cloudinary";
import { POWER_EFFECTS } from "../gameData";

const MAX_FILE_MB = 4;

const emptyTreasures = [
  { name: "", level: "", status: "" },
  { name: "", level: "", status: "" },
  { name: "", level: "", status: "" },
];

// สถานะสมบัติ เลือกได้ 1 อย่างต่อชิ้น
const TREASURE_STATUS_OPTIONS = ["ไม่ต้องอีโว", "ไม่วิ้ง", "วิ้ง", "ไม่วิ้ง/วิ้ง"];

// ถ้ามี prop editCombo แปลว่าเปิดมาเพื่อ "แก้ไข" เซ็ตที่มีอยู่แล้ว ไม่ใช่เพิ่มใหม่
export default function AddComboModal({ episodeId, goalId, editCombo, onClose }) {
  const { user, signIn } = useAuth();
  const isEditMode = Boolean(editCombo);

  const [mainCookie, setMainCookie] = useState(editCombo?.mainCookie || "");
  const [relayCookie, setRelayCookie] = useState(editCombo?.relayCookie || "");
  const [pet, setPet] = useState(editCombo?.pet || "");
  const [treasures, setTreasures] = useState(
    editCombo?.treasures?.length
      ? [0, 1, 2].map(
          (i) => editCombo.treasures[i] || { name: "", level: "", status: "" }
        )
      : emptyTreasures
  );
  const [score, setScore] = useState(editCombo?.score ? String(editCombo.score) : "");
  const [note, setNote] = useState(editCombo?.note || "");
  const [sourceUrl, setSourceUrl] = useState(editCombo?.sourceUrl || "");
  const [boosts, setBoosts] = useState(
    editCombo?.boosts || {
      energy: "off",
      itemTime: "off",
      fastStart: "off",
      randomBoost: "",
    }
  );
  const [farmStats, setFarmStats] = useState(
    editCombo?.farmStats || {
      coins: "",
      exp: "",
      boxes: "",
      coinEfficiency: "",
      timeSec: "",
    }
  );
  const [file, setFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(editCombo?.imageUrl || "");
  const [powerEffectsUsed, setPowerEffectsUsed] = useState(editCombo?.powerEffectsUsed || []);
  const [status, setStatus] = useState(null); // null | "saving" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  function togglePowerEffect(name) {
    setPowerEffectsUsed((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  function updateTreasure(i, field, value) {
    setTreasures((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function toggleTreasureStatus(i, statusValue) {
    setTreasures((prev) => {
      const next = [...prev];
      const current = next[i].status;
      next[i] = { ...next[i], status: current === statusValue ? "" : statusValue };
      return next;
    });
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setErrorMsg(`ไฟล์ใหญ่เกินไป (จำกัด ${MAX_FILE_MB}MB)`);
      return;
    }
    setErrorMsg("");
    setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      signIn();
      return;
    }
    if (!mainCookie.trim() || !score) {
      setErrorMsg("กรอกคุกกี้หลักและคะแนนก่อนส่ง");
      return;
    }

    setStatus("saving");
    setErrorMsg("");

    try {
      let imageUrl = existingImageUrl;
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const payload = {
        mainCookie: mainCookie.trim(),
        relayCookie: relayCookie.trim(),
        pet: pet.trim(),
        treasures: treasures.filter((t) => t.name.trim()),
        score,
        note: note.trim(),
        imageUrl,
        boosts,
        farmStats,
        sourceUrl: sourceUrl.trim(),
        powerEffectsUsed,
      };

      if (isEditMode) {
        await updateCombi(editCombo.id, payload);
      } else {
        await addCombi({ episodeId, goalId, ...payload, author: user });
      }

      onClose();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <p className="modal-title">{isEditMode ? "แก้ไขเซ็ต" : "เพิ่มเซ็ตใหม่"}</p>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {!user ? (
          <div className="login-prompt">
            <p>ต้องเข้าสู่ระบบก่อนถึงจะเพิ่ม/แก้ไขเซ็ตได้</p>
            <button className="login-btn" onClick={signIn}>
              เข้าสู่ระบบด้วย Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row-3">
              <div className="form-field">
                <label>คุกกี้หลัก</label>
                <input
                  type="text"
                  value={mainCookie}
                  onChange={(e) => setMainCookie(e.target.value)}
                  placeholder="เช่น GingerBrave"
                />
              </div>
              <div className="form-field">
                <label>คุกกี้ผลัด (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={relayCookie}
                  onChange={(e) => setRelayCookie(e.target.value)}
                  placeholder="เช่น Fire Spirit"
                />
              </div>
              <div className="form-field">
                <label>เพ็ท (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={pet}
                  onChange={(e) => setPet(e.target.value)}
                  placeholder="เช่น Baby Mango"
                />
              </div>
            </div>

            <div className="form-field">
              <label>สมบัติ (สูงสุด 3 ชิ้น พร้อมระดับเสริม)</label>
              {treasures.map((t, i) => (
                <div className="treasure-block" key={i}>
                  <div className="treasure-input-row">
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => updateTreasure(i, "name", e.target.value)}
                      placeholder={`สมบัติที่ ${i + 1}`}
                    />
                    <input
                      type="number"
                      min="0"
                      max="9"
                      value={t.level}
                      onChange={(e) => updateTreasure(i, "level", e.target.value)}
                      placeholder="+9"
                      className="level-input"
                    />
                  </div>
                  <div className="treasure-status-row">
                    {TREASURE_STATUS_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        className={`treasure-status-btn ${t.status === opt ? "on" : ""}`}
                        onClick={() => toggleTreasureStatus(i, opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-field">
              <label>คะแนนที่ทำได้</label>
              <input
                type="number"
                min="0"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="เช่น 650000000"
              />
            </div>

            <div className="form-field">
              <label>หมายเหตุ (ไม่บังคับ)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ต้องปิดบูสต์ทั้งหมด"
                maxLength={200}
              />
            </div>

            <div className="form-field">
              <label>บูสต์ที่ใช้</label>
              <div className="boost-toggle-row">
                {[
                  ["energy", "Energy"],
                  ["itemTime", "Item Time"],
                  ["fastStart", "Fast Start"],
                ].map(([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    className={`boost-toggle-btn ${boosts[key] === "on" ? "on" : ""}`}
                    onClick={() =>
                      setBoosts((b) => ({
                        ...b,
                        [key]: b[key] === "on" ? "off" : "on",
                      }))
                    }
                  >
                    {label} {boosts[key] === "on" ? "ON" : "OFF"}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={boosts.randomBoost}
                onChange={(e) => setBoosts((b) => ({ ...b, randomBoost: e.target.value }))}
                placeholder="Random Boost (ไม่บังคับ)"
                style={{ marginTop: 8 }}
              />
            </div>

            <div className="form-field">
              <label>Power+ Effects ที่ใช้</label>
              <div className="power-select-grid">
                {POWER_EFFECTS.map((name) => (
                  <button
                    type="button"
                    key={name}
                    className={`power-select-btn ${
                      powerEffectsUsed.includes(name) ? "on" : ""
                    }`}
                    onClick={() => togglePowerEffect(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Auto Farm Details (ไม่บังคับ)</label>
              <div className="farm-stats-grid">
                <input
                  type="number"
                  min="0"
                  value={farmStats.coins}
                  onChange={(e) => setFarmStats((s) => ({ ...s, coins: e.target.value }))}
                  placeholder="Coins"
                />
                <input
                  type="number"
                  min="0"
                  value={farmStats.exp}
                  onChange={(e) => setFarmStats((s) => ({ ...s, exp: e.target.value }))}
                  placeholder="EXP"
                />
                <input
                  type="text"
                  value={farmStats.boxes}
                  onChange={(e) => setFarmStats((s) => ({ ...s, boxes: e.target.value }))}
                  placeholder="เช่น 1 กล่อง 100%"
                />
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={farmStats.coinEfficiency}
                  onChange={(e) =>
                    setFarmStats((s) => ({ ...s, coinEfficiency: e.target.value }))
                  }
                  placeholder="Coin Eff."
                />
                <input
                  type="number"
                  min="0"
                  value={farmStats.timeSec}
                  onChange={(e) => setFarmStats((s) => ({ ...s, timeSec: e.target.value }))}
                  placeholder="Time (วินาที)"
                />
              </div>
            </div>

            <div className="form-field">
              <label>ลิงก์อ้างอิง (ไม่บังคับ)</label>
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="form-field">
              <label>สกรีนช็อต (ไม่บังคับ)</label>
              <label
                htmlFor="combo-screenshot"
                className={`dropzone ${file || existingImageUrl ? "has-file" : ""}`}
              >
                {file
                  ? `เลือกไฟล์แล้ว: ${file.name}`
                  : existingImageUrl
                  ? "มีรูปเดิมอยู่แล้ว (แตะเพื่อเปลี่ยน)"
                  : "แตะเพื่อเลือกรูป (จำกัด 4MB)"}
              </label>
              <input
                id="combo-screenshot"
                type="file"
                accept="image/*"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </div>

            <button className="submit-btn" type="submit" disabled={status === "saving"}>
              {status === "saving"
                ? "กำลังบันทึก..."
                : isEditMode
                ? "บันทึกการแก้ไข"
                : "เพิ่มเซ็ตนี้"}
            </button>

            {errorMsg && <p className="status-message error">{errorMsg}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
