import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, FILE_URL } from "../api/client";

interface ServiceCategory {
  id: number | string;
  categoryName: string;
  description?: string;
  icon?: string;
  imageId?: string;
  imageUrl?: string;
}

// Kategoriya nomiga qarab fallback emoji
const ICON_MAP: Record<string, string> = {
  elektrik:  "⚡", electrician: "⚡",
  santexnik: "🔧", plumber: "🔧",
  usta:      "🪚", builder: "🪚",
  farrosh:   "🧹", cleaner: "🧹",
  haydovchi: "🚗", driver: "🚗",
  bogbon:    "🌿", gardener: "🌿",
};

function catIcon(c: ServiceCategory): string {
  if (c.icon) return c.icon;
  const key = c.categoryName?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
  return ICON_MAP[key] ?? "🔧";
}

function imgUrl(c: ServiceCategory): string | null {
  if (c.imageUrl && c.imageUrl.startsWith("https://")) return c.imageUrl;
  if (!c.imageId) return null;
  return `${FILE_URL}/${c.imageId}`;
}

export default function ServiceCategoriesPage() {
  const nav = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ServiceCategory[]>("/ServiceCategory/GetAll")
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : (r.data as any)?.data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="page-title">🔧 Xizmatlar</div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        {loading ? (
          <div className="empty-state"><span className="ei">⏳</span><p>Yuklanmoqda...</p></div>
        ) : categories.length === 0 ? (
          <div className="empty-state"><span className="ei">🔧</span><p>Kategoriyalar topilmadi</p></div>
        ) : (
          <div className="category-grid">
            {categories.map((c) => {
              const url = imgUrl(c);
              const icon = catIcon(c);
              return (
                <div
                  key={c.id}
                  className="cat-card"
                  onClick={() => nav(`/services/${c.id}`)}
                >
                  <div className="cat-icon" style={{ background: "#FFF1F2", overflow: "hidden" }}>
                    {url
                      ? <img src={url} alt={c.categoryName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 28 }}>{icon}</span>
                    }
                  </div>
                  <div>
                    <div className="cat-title">{c.categoryName}</div>
                    {c.description && <div className="cat-desc">{c.description}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
