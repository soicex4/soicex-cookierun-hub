import { useEffect, useState } from "react";
import { GOALS, EPISODES } from "../gameData";
import { subscribeCombis, subscribeUserLikes } from "../lib/combis";
import { useAuth } from "../context/AuthContext";
import TabRow from "./TabRow";
import ComboCard from "./ComboCard";
import AddComboModal from "./AddComboModal";

export default function EpisodeCombis() {
  const { user, signIn } = useAuth();
  const [goalId, setGoalId] = useState(GOALS[0].id);
  const [episodeId, setEpisodeId] = useState(EPISODES[0].id);
  const [combis, setCombis] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setCombis(null);
    const unsub = subscribeCombis(episodeId, goalId, setCombis);
    return unsub;
  }, [episodeId, goalId]);

  useEffect(() => {
    const unsub = subscribeUserLikes(user?.uid, setLikedIds);
    return unsub;
  }, [user?.uid]);

  function handleAddClick() {
    if (!user) {
      signIn();
      return;
    }
    setShowAddModal(true);
  }

  return (
    <div>
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Episode Combis</p>
          <h2 className="page-title">เลือกเป้าหมายและ Episode เพื่อดูเซ็ตแนะนำ</h2>
        </div>
        <button className="select-btn" onClick={handleAddClick}>
          + เพิ่ม Combi
        </button>
      </div>

      <TabRow items={GOALS} activeId={goalId} onSelect={setGoalId} />
      <TabRow items={EPISODES} activeId={episodeId} onSelect={setEpisodeId} />

      {combis === null && <p className="loading-state">กำลังโหลด...</p>}

      {combis?.length === 0 && (
        <p className="empty-state">
          ยังไม่มีเซ็ตสำหรับตัวกรองนี้ เป็นคนแรกที่เพิ่มเซ็ตสิ
        </p>
      )}

      {combis?.map((c) => (
        <ComboCard key={c.id} combo={c} liked={likedIds.has(c.id)} />
      ))}

      {showAddModal && (
        <AddComboModal
          episodeId={episodeId}
          goalId={goalId}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
