export default function TabRow({ items, activeId, onSelect }) {
  return (
    <div className="tab-row">
      {items.map((item) => (
        <button
          key={item.id}
          className={`tab-btn ${item.id === activeId ? "active" : ""}`}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
