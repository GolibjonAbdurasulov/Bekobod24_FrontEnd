import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, FILE_URL } from "../api/client";

function imgUrl(store: any) {
  if (store.imageUrl && store.imageUrl.startsWith("https://")) return store.imageUrl;
  if (!store.imageId) return null;
  return `${FILE_URL}/${store.imageId}`;
}

export default function RestaurantsPage() {
  const nav = useNavigate();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [imgErrors, setImgErrors] = useState<number[]>([]);

  useEffect(() => {
    api.get("/Stores/GetAll?type=2").then((r) => setRestaurants(r.data)).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="page-title">🍔 Taomlar</div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {restaurants.length === 0
          ? <div className="empty-state"><span className="ei">🍽️</span><p>Restoranlar topilmadi</p></div>
          : restaurants.map((r: any) => (
            <div key={r.id} className="store-card" onClick={() => nav(`/restaurants/${r.id}/menu`)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, overflow: "hidden" }}>
                  {imgUrl(r) && !imgErrors.includes(r.id)
                    ? <img src={imgUrl(r)!} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErrors((p) => [...p, r.id])} />
                    : "🍔"
                  }
                </div>
                <div className="store-card-body" style={{ flex: 1 }}>
                  <div className="store-card-name">{r.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{r.isActive ? "✅ Faol" : "❌ Nofaol"}</div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
