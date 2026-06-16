import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useUserStore } from "../store/userStore";

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  Pending:    { label: "Kutilmoqda", color: "#D97706", bg: "#FFF7ED" },
  Accepted:   { label: "Qabul qilindi", color: "#2563EB", bg: "#EFF6FF" },
  Preparing:  { label: "Tayyorlanmoqda", color: "#7C3AED", bg: "#F5F3FF" },
  OnTheWay:   { label: "Yo'lda",     color: "#D97706", bg: "#FFF7ED" },
  Completed:  { label: "Yetkazildi", color: "#059669", bg: "#ECFDF5" },
  Cancelled:  { label: "Bekor qilindi", color: "#DC2626", bg: "#FEF2F2" },
};

export default function OrdersPage() {
  const nav = useNavigate();
  const user = useUserStore((s) => s.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get(`/Orders/GetUserOrders/${user.id}`).then((r) => setOrders(r.data)).catch(() => setOrders([])).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Yuklanmoqda...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">📋 Buyurtmalarim</div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {orders.length === 0
          ? <div className="empty-state">
              <span className="ei">📋</span>
              <p>Hali buyurtma yo'q</p>
              <button onClick={() => nav("/")} style={{ marginTop: 8, background: "#2563EB", color: "white", border: "none", borderRadius: 12, padding: "10px 24px", fontWeight: 600, cursor: "pointer" }}>
                Xarid qilish
              </button>
            </div>
          : orders.map((o: any) => {
              const st = STATUS_LABEL[o.status] ?? { label: o.status, color: "#6B7280", bg: "#F3F4F6" };
              return (
                <div key={o.id} className="card" style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>#{o.id}</span>
                    <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 10 }}>{st.label}</span>
                  </div>
                  {o.items?.slice(0, 2).map((i: any) => (
                    <div key={i.id} style={{ fontSize: 13, color: "#374151" }}>• {i.name} × {i.quantity}</div>
                  ))}
                  {o.items?.length > 2 && <div style={{ fontSize: 12, color: "#9CA3AF" }}>+{o.items.length - 2} ta yana</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid #F3F4F6" }}>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>{new Date(o.createdAt).toLocaleDateString("uz-UZ")}</span>
                    <span style={{ fontWeight: 700, color: "#2563EB" }}>{Number(o.totalPrice).toLocaleString()} so'm</span>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
