import { useEffect, useState } from "react";
import { api } from "../../api/client";

const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  Admin:   { bg: "#FEF2F2", color: "#DC2626" },
  Courier: { bg: "#FFF7ED", color: "#D97706" },
  Client:  { bg: "#F0FDF4", color: "#16a34a" },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/User/GetAll").then((r) => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const del = async (id: number) => {
    if (!confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/User/Delete/${id}`);
    setUsers((p) => p.filter((u) => u.id !== id));
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Yuklanmoqda...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Foydalanuvchilar ({users.length})</span>
        <button onClick={load} style={{ background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🔄 Yangilash</button>
      </div>

      {users.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Foydalanuvchi yo'q</div>}

      {users.map((u: any) => {
        const rs = ROLE_STYLES[u.role] ?? { bg: "#F3F4F6", color: "#6B7280" };
        return (
          <div key={u.id} style={{ background: "white", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 50, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{u.firstName ?? u.username ?? "Noma'lum"}</span>
                <span style={{ background: rs.bg, color: rs.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8 }}>{u.role}</span>
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                @{u.username ?? "—"} · {u.phoneNumber ?? "Tel yo'q"}
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
                TG ID: {u.telegramId} · {new Date(u.createdAt).toLocaleDateString("uz-UZ")}
              </div>
            </div>
            <button onClick={() => del(u.id)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "7px 10px", fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>🗑️</button>
          </div>
        );
      })}
    </div>
  );
}
