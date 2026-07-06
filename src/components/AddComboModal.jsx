import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addCombi } from "../lib/combis";
import { uploadImage } from "../lib/cloudinary";

const MAX_FILE_MB = 4;

export default function AddComboModal({ episodeId, goalId, onClose }) {
  const { user, signIn } = useAuth();

  const [mainCookie, setMainCookie] = useState("");
  const [partner, setPartner] = useState("");
  const [treasures, setTreasures] = useState([
    { name: "", level: "" },
    { name: "", level: "" },
    { name: "", level: "" },
  ]);
  const [score, setScore] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // null | "saving" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  function updateTreasure(i, field, value) {
    setTreasures((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
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
      let imageUrl = "";
      if (file) {
        imageUrl = await uploadImage(file);
      }

      await addCombi({
        episodeId,
        goalId,
        mainCookie: mainCookie.trim(),
        partner: partner.trim(),
        treasures: treasures.filter((t) => t.name.trim()),
        score,
        note: note.trim(),
        imageUrl,
        author: user,
      });

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
          <p className="modal-title">เพิ่มเซ็ตใหม่</p>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {!user ? (
          <div className="login-prompt">
            <p>ต้องเข้าสู่ระบบก่อนถึงจะเพิ่มเซ็ตได้</p>
            <button className="login-btn" onClick={signIn}>
              เข้าสู่ระบบด้วย Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
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
                <label>คุกกี้/เพ็ทคู่ (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  placeholder="เช่น Fire Spirit"
                />
              </div>
            </div>

            <div className="form-field">
              <label>เทรเชอร์ (สูงสุด 3 ชิ้น พร้อมระดับเสริม)</label>
              {treasures.map((t, i) => (
                <div className="treasure-input-row" key={i}>
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => updateTreasure(i, "name", e.target.value)}
                    placeholder={`เทรเชอร์ที่ ${i + 1}`}
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
              <label>สกรีนช็อต (ไม่บังคับ)</label>
              <label
                htmlFor="combo-screenshot"
                className={`dropzone ${file ? "has-file" : ""}`}
              >
                {file ? `เลือกไฟล์แล้ว: ${file.name}` : "แตะเพื่อเลือกรูป (จำกัด 4MB)"}
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
              {status === "saving" ? "กำลังบันทึก..." : "เพิ่มเซ็ตนี้"}
            </button>

            {errorMsg && <p className="status-message error">{errorMsg}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
