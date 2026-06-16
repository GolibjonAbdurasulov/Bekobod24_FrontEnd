import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";

const CAT_LABELS: Record<string, string> = {
  elektrik: "Elektrik", santexnik: "Santexnik",
  usta: "Usta", farrosh: "Farrosh",
  haydovchi: "Haydovchi", bogbon: "Bog'bon",
};

export default function ServiceProvidersPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const nav = useNavigate();
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    api.get("/Service/GetAll").then((r) => setServices(r.data)).catch(() => setServices([]));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav("/services")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="page-title">{CAT_LABELS[categoryId ?? ""] ?? "Xizmatlar"}</div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {services.length === 0
          ? <div className="empty-state"><span className="ei">🔧</span><p>Xizmatlar topilmadi</p></div>
          : services.map((s: any) => (
            <div key={s.id} className="product-card">
              <div className="product-info">
                <div className="name">{s.name}</div>
                {s.storeName && <div className="desc">{s.storeName}</div>}
                {s.description && <div className="desc">{s.description}</div>}
                <div className="price">{Number(s.price).toLocaleString()} so'm</div>
              </div>
              {s.requiresBooking && (
                <span style={{ fontSize: 11, color: "#D97706", background: "#FFF7ED", padding: "4px 8px", borderRadius: 8, fontWeight: 600, whiteSpace: "nowrap" }}>
                  Bron talab
                </span>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
