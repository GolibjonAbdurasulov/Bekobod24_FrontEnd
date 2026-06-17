import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, FILE_URL } from "../api/client";

interface Restaurant {
  id: string;
  name: string;
  isActive: boolean;
  imageUrl?: string;
  imageId?: string;
}

function imgUrl(store: Restaurant): string | null {
  if (store.imageUrl && store.imageUrl.startsWith("https://")) return store.imageUrl;
  if (!store.imageId) return null;
  return `${FILE_URL}/${store.imageId}`;
}

export default function RestaurantsPage() {
  const nav = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Restaurant[]>("/Stores/GetAll?type=2")
      .then((r) => setRestaurants(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleImgError = (id: string) =>
    setImgErrors((prev) => { const n = new Set(prev); n.add(id); return n; });

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="page-title">🍔 Taomlar</div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <div className="empty-state"><span className="ei">⏳</span><p>Yuklanmoqda...</p></div>
        ) : restaurants.length === 0 ? (
          <div className="empty-state"><span className="ei">🍽️</span><p>Restoranlar topilmadi</p></div>
        ) : (
          restaurants.map((r) => {
            const url = imgUrl(r);
            return (
              <div key={r.id} className="store-card" onClick={() => nav(`/restaurants/${r.id}/menu`)}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, overflow: "hidden" }}>
                  {url && !imgErrors.has(r.id)
                    ? <img src={url} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => handleImgError(r.id)} />
                    : "🍔"
                  }
                </div>
                <div className="store-card-body">
                  <div className="store-card-name">{r.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                    {r.isActive ? "✅ Faol" : "❌ Nofaol"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
