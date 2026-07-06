import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toggleLike, deleteCombi } from "../lib/combis";
import ComboDetailModal from "./ComboDetailModal";

export default function ComboCard({ combo, liked, myVote }) {
  const { user, signIn } = useAuth();
  const [showDetail, setShowDetail] = useState(false);
  const isOwner = user && user.uid === combo.authorUid;

  async function handleLike() {
    if (!user) {
      signIn();
      return;
    }
    await toggleLike(combo.id, user.uid);
  }

  async function handleDelete() {
    const ok = window.confirm("ลบเซ็ตนี้ถาวรเลยไหม? กู้คืนไม่ได้");
    if (!ok) return;
    await deleteCombi(combo.id);
  }

  return (
    <div className="combi-card">
      <div className="combi-top">
        <div className="combi-icons">
          <div className="icon-pair">
            <div className="chip cookie" title={combo.mainCookie}>
              {shorten(combo.mainCookie)}
            </div>
            {combo.partner && (
              <>
                <span className="plus">+</span>
                <div className="chip cookie" title={combo.partner}>
                  {shorten(combo.partner)}
                </div>
              </>
            )}
          </div>

          {combo.treasures?.length > 0 && <span className="divider" />}

          {combo.treasures?.map((t, i) => (
            <div className="treasure-slot" key={i}>
              <div className="chip treasure" title={t.name}>
                {shorten(t.name, 6)}
              </div>
              {t.level && <span className="treasure-level">+{t.level}</span>}
            </div>
          ))}
        </div>

        <div className="combi-score">
          <span className="score-label">คะแนน</span>
          <span className="score-value">{formatScore(combo.score)}</span>
        </div>
      </div>

      {combo.farmStats && <FarmStatsRow stats={combo.farmStats} />}

      {combo.note && <p className="combi-note">{combo.note}</p>}

      {combo.imageUrl && (
        <img className="combi-screenshot" src={combo.imageUrl} alt="สกรีนช็อตเซ็ต" />
      )}

      <div className="combi-bottom">
        <span className="combi-author">โดย {combo.authorName}</span>

        <div className="combi-actions">
          <span className="vote-count verify" title="ยืนยันใช้ได้">
            ✓ {combo.verifyCount || 0}
          </span>
          <span className="vote-count reject" title="ใช้ไม่ได้">
            ✕ {combo.rejectCount || 0}
          </span>

          <button className="like-btn" onClick={() => setShowDetail(true)}>
            ดูรายละเอียด
          </button>

          <button className={`like-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
            {liked ? "♥" : "♡"} {combo.likeCount || 0}
          </button>

          {isOwner && (
            <button className="delete-btn" onClick={handleDelete}>
              ลบ
            </button>
          )}
        </div>
      </div>

      {showDetail && (
        <ComboDetailModal combo={combo} myVote={myVote} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}

function FarmStatsRow({ stats }) {
  const items = [
    ["Coins", stats.coins],
    ["EXP", stats.exp],
    ["Boxes", stats.boxes],
    ["Coin Eff.", stats.coinEfficiency],
    ["Time", stats.timeSec ? `${stats.timeSec}s` : null],
  ].filter(([, v]) => v);

  if (items.length === 0) return null;

  return (
    <div className="farm-stats-row">
      {items.map(([label, value]) => (
        <div className="farm-stat-item" key={label}>
          <span className="farm-stat-label">{label}</span>
          <span className="farm-stat-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

function shorten(name, max = 4) {
  if (!name) return "";
  return name.length > max ? name.slice(0, max) : name;
}

function formatScore(score) {
  return new Intl.NumberFormat("en-US").format(score || 0);
}
