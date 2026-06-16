import { useNavigate } from "react-router-dom";

const SERVICE_CATS = [
  { id: "elektrik",   name: "Elektrik",   icon: "⚡", desc: "Elektr ishlari" },
  { id: "santexnik",  name: "Santexnik",  icon: "🔧", desc: "Suv ta'minoti" },
  { id: "usta",       name: "Usta",       icon: "🪚", desc: "Qurilish, ta'mirlash" },
  { id: "farrosh",    name: "Farrosh",    icon: "🧹", desc: "Tozalash xizmati" },
  { id: "haydovchi",  name: "Haydovchi",  icon: "🚗", desc: "Yuklarni tashish" },
  { id: "bogbon",     name: "Bog'bon",    icon: "🌿", desc: "Bog' parvarishi" },
];

export default function ServiceCategoriesPage() {
  const nav = useNavigate();

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="page-title">🔧 Xizmatlar</div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <div className="category-grid">
          {SERVICE_CATS.map((c) => (
            <div key={c.id} className="cat-card" onClick={() => nav(`/services/${c.id}`)}>
              <div className="cat-icon" style={{ background: "#FFF1F2" }}>
                <span style={{ fontSize: 28 }}>{c.icon}</span>
              </div>
              <div>
                <div className="cat-title">{c.name}</div>
                <div className="cat-desc">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
