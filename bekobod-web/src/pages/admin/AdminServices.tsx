import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";

interface ServiceCategory {
  id: number | string;
  name: string;
}

const empty = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  phone: "",
  telegramUsername: "",
  requiresBooking: false,
};

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get("/Service/GetAll").then((r) => setServices(r.data)).catch(() => {});

  useEffect(() => {
    load();
    api.get<ServiceCategory[]>("/ServiceCategory/GetAll")
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : (r.data as any)?.data ?? [];
        setCategories(data);
      })
      .catch(() => {});
  }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      categoryId: String(s.categoryId ?? ""),
      name: s.name,
      description: s.description ?? "",
      price: String(s.price),
      phone: s.phone ?? "",
      telegramUsername: s.telegramUsername ?? "",
      requiresBooking: !!s.requiresBooking,
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.price) return alert("Majburiy maydonlarni to'ldiring");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/Service/Update/${editing.id}`, {
          name: form.name,
          price: Number(form.price),
          description: form.description || null,
          phone: form.phone || null,
          telegramUsername: form.telegramUsername || null,
          requiresBooking: form.requiresBooking,
        });
      } else {
        await api.post("/Service/Create", {
          categoryId: Number(form.categoryId),
          name: form.name,
          price: Number(form.price),
          description: form.description || null,
          phone: form.phone || null,
          telegramUsername: form.telegramUsername || null,
          requiresBooking: form.requiresBooking,
        });
      }
      await load();
      setModal(false);
    } catch {
      alert("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm("Xizmatni o'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/Service/Delete/${id}`);
    setServices((p) => p.filter((x) => x.id !== id));
  };

  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  // Kategoriya nomi topish
  const catName = (catId: any) =>
    categories.find((c) => String(c.id) === String(catId))?.name ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Xizmatlar ({services.length})</span>
        <button
          onClick={openCreate}
          style={{ background: "#2563EB", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          + Qo'shish
        </button>
      </div>

      {services.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Xizmat yo'q</div>
      )}

      {services.map((s: any) => (
        <div key={s.id} style={{ background: "white", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🔧</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>
              {catName(s.categoryId)}
              {catName(s.categoryId) && " · "}
              {s.requiresBooking ? "🗓 Bron" : "⚡ Tezkor"}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2563EB" }}>{Number(s.price).toLocaleString()} so'm</span>
              {s.phone && <span style={{ fontSize: 12, color: "#6B7280" }}>📞 {s.phone}</span>}
              {s.telegramUsername && <span style={{ fontSize: 12, color: "#6B7280" }}>✈️ @{s.telegramUsername.replace(/^@/, "")}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => openEdit(s)} style={{ background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✏️</button>
            <button onClick={() => del(s.id)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🗑️</button>
          </div>
        </div>
      ))}

      {modal && (
        <AdminModal
          title={editing ? "Xizmatni tahrirlash" : "Yangi xizmat"}
          onClose={() => setModal(false)}
          onSave={save}
          saving={saving}
        >
          {!editing && (
            <FormField label="Kategoriya" value={form.categoryId} onChange={f("categoryId")} as="select" required>
              <option value="">Tanlang...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </FormField>
          )}
          <FormField label="Nomi" value={form.name} onChange={f("name")} placeholder="Masalan: Alisher Elektrik" required />
          <FormField label="Tavsif" value={form.description} onChange={f("description")} placeholder="Qisqacha tavsif" as="textarea" />
          <FormField label="Narxi (so'm/soat)" value={form.price} onChange={f("price")} type="number" placeholder="50000" required />
          <FormField label="Telefon raqami" value={form.phone} onChange={f("phone")} placeholder="+998901234567" />
          <FormField label="Telegram username" value={form.telegramUsername} onChange={f("telegramUsername")} placeholder="username (@ belgisisiz)" />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              id="bron"
              checked={form.requiresBooking}
              onChange={(e) => setForm((p: any) => ({ ...p, requiresBooking: e.target.checked }))}
              style={{ width: 18, height: 18 }}
            />
            <label htmlFor="bron" style={{ fontSize: 14, fontWeight: 600 }}>Bron talab qilinadi</label>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
