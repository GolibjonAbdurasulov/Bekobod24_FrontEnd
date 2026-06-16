import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";

const CATEGORIES = [
  { key: "market",       title: "Market",      desc: "Oziq-ovqat",     icon: "🛒", color: "#ECFDF5", route: "/catalog/market" },
  { key: "food",         title: "Taomlar",     desc: "Restoranlar",    icon: "🍔", color: "#FFF7ED", route: "/restaurants" },
  { key: "pharmacy",     title: "Dorixona",    desc: "Dori-darmon",    icon: "💊", color: "#EFF6FF", route: "/catalog/pharmacy" },
  { key: "electronics",  title: "Elektronika", desc: "Texnikalar",     icon: "📱", color: "#F5F3FF", route: "/catalog/electronics" },
  { key: "services",     title: "Xizmatlar",   desc: "Usta, elektrik", icon: "🔧", color: "#FFF1F2", route: "/services" },
];

export default function MainPage() {
  const nav = useNavigate();
  const user = useUserStore((s) => s.user);
  const chatId = useUserStore((s) => s.chatId);
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="page">

      {/* Navbar */}
      <div style={{
        background: "white",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #F3F4F6",
      }}>
        <span style={{ fontWeight: 900, fontSize: 20, color: "#2563EB", cursor: "pointer" }}
          onClick={() => setShowDebug(!showDebug)}>Bekobod 24</span>
        <span style={{ fontSize: 24 }}>🔔</span>
      </div>
      {showDebug && (
        <div style={{ fontSize: 11, color: "#9CA3AF", padding: "4px 16px", background: "#F9FAFB", textAlign: "center" }}>
          user.id: {user?.id} | chatId: {chatId}
        </div>
      )}

      {/* Hero banner */}
      <div style={{
        background: "linear-gradient(135deg,#2563EB,#1d4ed8)",
        margin: "12px 12px 0",
        borderRadius: 18,
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 6 }}>Bekobod shahri bo'ylab</div>
          <div style={{ color: "white", fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>Tez va qulay<br />yetkazib berish</div>
          <div onClick={() => nav("/catalog/market")} style={{
            marginTop: 14, background: "white", color: "#2563EB",
            borderRadius: 10, padding: "8px 16px", fontSize: 13,
            fontWeight: 700, display: "inline-block", cursor: "pointer",
          }}>Buyurtma berish →</div>
        </div>
        <span style={{ fontSize: 64 }}>🛵</span>
      </div>

      {/* Category grid — 2x3 */}
      <div style={{ padding: "16px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {CATEGORIES.map((c) => (
            <div key={c.key} onClick={() => nav(c.route)} style={{
              background: "white",
              borderRadius: 16,
              padding: "16px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
              onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
              onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: c.color,
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 22, flexShrink: 0,
              }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}