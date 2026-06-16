import { useEffect, useState } from "react";
import { api } from "../../api/client";

// OrderStatus: 1=Pending 2=Accepted 3=Preparing 4=OnTheWay 5=Completed 6=Cancelled
const STATUSES: Record<string, { bg: string; color: string; label: string }> = {
  Pending:    { bg: "#FFF7ED", color: "#D97706", label: "⏳ Kutilmoqda" },
  Accepted:   { bg: "#EFF6FF", color: "#2563EB", label: "✅ Qabul qilindi" },
  Preparing:  { bg: "#F5F3FF", color: "#7C3AED", label: "👨‍🍳 Tayyorlanmoqda" },
  OnTheWay:   { bg: "#ECFDF5", color: "#059669", label: "🛵 Yolda" },
  Completed:  { bg: "#F0FDF4", color: "#16a34a", label: "🎉 Yetkazildi" },
  Cancelled:  { bg: "#FEF2F2", color: "#DC2626", label: "❌ Bekor" },
};

const NEXT_STATUSES: Record<string, string[]> = {
  Pending:   ["Accepted", "Cancelled"],
  Accepted:  ["Preparing", "Cancelled"],
  Preparing: ["OnTheWay", "Cancelled"],
  OnTheWay:  ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = () => {
    setLoading(true);
    api.get("/Orders/GetAll").then((r) => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await api.patch(`/Orders/UpdateStatus/${id}`, { status });
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    } catch { alert("Xatolik yuz berdi"); }
    finally { setUpdating(null); }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm("Buyurtmani o'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/Orders/Delete/${id}`);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Yuklanmoqda...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Buyurtmalar ({filtered.length})</span>
        <button onClick={load} style={{ background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🔄 Yangilash</button>
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
        <button onClick={() => setFilterStatus("all")} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 20, border: "1.5px solid", borderColor: filterStatus === "all" ? "#2563EB" : "#E5E7EB", background: filterStatus === "all" ? "#2563EB" : "white", color: filterStatus === "all" ? "white" : "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Barchasi</button>
        {Object.entries(STATUSES).map(([k, v]) => (
          <button key={k} onClick={() => setFilterStatus(k)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 20, border: "1.5px solid", borderColor: filterStatus === k ? v.color : "#E5E7EB", background: filterStatus === k ? v.bg : "white", color: filterStatus === k ? v.color : "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{v.label}</button>
        ))}
      </div>

      {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Buyurtma yo'q</div>}

      {filtered.map((o: any) => {
        const st = STATUSES[o.status] ?? { bg: "#F3F4F6", color: "#6B7280", label: o.status };
        const nextStatuses = NEXT_STATUSES[o.status] ?? [];
        return (
          <div key={o.id} style={{ background: "white", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>Buyurtma #{o.id}</span>
              <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10 }}>{st.label}</span>
            </div>

            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
              👤 User #{o.userId} · 🕐 {new Date(o.createdAt).toLocaleString("uz-UZ")}
            </div>

            <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 8, marginBottom: 8 }}>
              {o.items?.map((i: any) => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", marginBottom: 3 }}>
                  <span>• {i.name} × {i.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{Number(i.price * i.quantity).toLocaleString()} so'm</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F3F4F6", paddingTop: 8 }}>
              <span style={{ fontWeight: 800, color: "#2563EB", fontSize: 15 }}>Jami: {Number(o.totalPrice).toLocaleString()} so'm</span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {nextStatuses.map((s) => {
                const ns = STATUSES[s];
                return (
                  <button key={s} disabled={updating === o.id}
                    onClick={() => updateStatus(o.id, s)}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: ns.bg, color: ns.color, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    → {ns.label}
                  </button>
                );
              })}
              <button onClick={() => deleteOrder(o.id)} style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 8, border: "none", background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑️ O'chirish</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
