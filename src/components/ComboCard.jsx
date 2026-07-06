import { useAuth } from "../context/AuthContext";
import { toggleLike } from "../lib/combis";

export default function ComboCard({ combo, liked }) {
  const { user, signIn } = useAuth();

  async function handleLike() {
    if (!user) {
      signIn();
      return;
    }
    await toggleLike(combo.id, user.uid);
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

      {combo.note && <p className="combi-note">{combo.note}</p>}

      {combo.imageUrl && (
        <img className="combi-screenshot" src={combo.imageUrl} alt="สกรีนช็อตเซ็ต" />
      )}

      <div className="combi-bottom">
        <span className="combi-author">โดย {combo.authorName}</span>
        <button
          className={`like-btn ${liked ? "liked" : ""}`}
          onClick={handleLike}
        >
          {liked ? "♥" : "♡"} {combo.likeCount || 0}
        </button>
      </div>
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
