import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { castVote, getVotersForCombo } from "../lib/combis";
import { POWER_EFFECTS } from "../gameData";

export default function ComboDetailModal({ combo, myVote, onClose }) {
  const { user, signIn } = useAuth();
  const [voters, setVoters] = useState(null);

  useEffect(() => {
    getVotersForCombo(combo.id).then(setVoters);
  }, [combo.id]);

  async function handleVote(type) {
    if (!user) {
      signIn();
      return;
    }
    await castVote(combo.id, user.uid, type, user.displayName);
    getVotersForCombo(combo.id).then(setVoters); // รีเฟรชลิสต์คนโหวตหลังกด
  }

  const usedEffects = combo.powerEffectsUsed || [];
  const verifiers = voters?.filter((v) => v.type === "verify") || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <p className="modal-title">รายละเอียดเซ็ต</p>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {combo.boosts && (
          <div className="detail-section">
            <p className="detail-heading">บูสต์ที่ใช้</p>
            <div className="boost-chips">
              <span className={`boost-chip ${combo.boosts.energy === "on" ? "on" : ""}`}>
                Energy {combo.boosts.energy === "on" ? "ON" : "OFF"}
              </span>
              <span className={`boost-chip ${combo.boosts.itemTime === "on" ? "on" : ""}`}>
                Item Time {combo.boosts.itemTime === "on" ? "ON" : "OFF"}
              </span>
              <span className={`boost-chip ${combo.boosts.fastStart === "on" ? "on" : ""}`}>
                Fast Start {combo.boosts.fastStart === "on" ? "ON" : "OFF"}
              </span>
              {combo.boosts.randomBoost && (
                <span className="boost-chip">Random Boost: {combo.boosts.randomBoost}</span>
              )}
            </div>
          </div>
        )}

        <div className="detail-section">
          <p className="detail-heading">Power+ Effects</p>
          <div className="power-grid">
            {POWER_EFFECTS.map((name) => {
              const used = usedEffects.includes(name);
              return (
                <div key={name} className={`power-item ${used ? "used" : ""}`}>
                  <span>{name}</span>
                  <span className="power-status">{used ? "Used" : "Not Used"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {combo.farmStats && (
          <div className="detail-section">
            <p className="detail-heading">Auto Farm Details</p>
            <div className="stat-grid">
              {combo.farmStats.coins && (
                <div className="stat-item">
                  <span className="stat-label">Coins</span>
                  <span className="stat-value">{combo.farmStats.coins}</span>
                </div>
              )}
              {combo.farmStats.exp && (
                <div className="stat-item">
                  <span className="stat-label">EXP</span>
                  <span className="stat-value">{combo.farmStats.exp}</span>
                </div>
              )}
              {combo.farmStats.boxes && (
                <div className="stat-item">
                  <span className="stat-label">Boxes</span>
                  <span className="stat-value">{combo.farmStats.boxes}</span>
                </div>
              )}
              {combo.farmStats.coinEfficiency && (
                <div className="stat-item">
                  <span className="stat-label">Coin Efficiency</span>
                  <span className="stat-value">{combo.farmStats.coinEfficiency}</span>
                </div>
              )}
              {combo.farmStats.timeSec && (
                <div className="stat-item">
                  <span className="stat-label">Time</span>
                  <span className="stat-value">{combo.farmStats.timeSec}s</span>
                </div>
              )}
            </div>
          </div>
        )}

        {combo.note && (
          <div className="detail-section">
            <p className="detail-heading">หมายเหตุ</p>
            <p className="detail-note">{combo.note}</p>
          </div>
        )}

        {combo.sourceUrl && (
          <div className="detail-section">
            <p className="detail-heading">ลิงก์อ้างอิง</p>
            <a href={combo.sourceUrl} target="_blank" rel="noreferrer" className="detail-link">
              {combo.sourceUrl}
            </a>
          </div>
        )}

        <div className="detail-section">
          <p className="detail-heading">Verification Votes</p>
          <div className="vote-row">
            <button
              className={`vote-btn verify ${myVote === "verify" ? "active" : ""}`}
              onClick={() => handleVote("verify")}
            >
              ✓ ยืนยันใช้ได้ ({combo.verifyCount || 0})
            </button>
            <button
              className={`vote-btn reject ${myVote === "reject" ? "active" : ""}`}
              onClick={() => handleVote("reject")}
            >
              ✕ ใช้ไม่ได้ ({combo.rejectCount || 0})
            </button>
          </div>

          {verifiers.length > 0 && (
            <div className="voter-list">
              {verifiers.map((v, i) => (
                <span className="voter-chip" key={i}>
                  {v.voterName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
