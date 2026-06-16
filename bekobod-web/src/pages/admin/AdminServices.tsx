import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";

const empty = { storeId: "", name: "", description: "", price: "", requiresBooking: true };

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/Service/GetAll").then((r) => setServices(r.data)).catch(() => {});

  useEffect(() => {
    load();
    api.get("/Stores/GetAll?type=5").then((r) => setStores(r.data)).catch(() => {
      api.get("/Stores/GetAll").then((r) => setStores(r.data)).catch(() => {});
    });
  }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ storeId: String(s.storeId), name: s.name, description: s.description ?? "", price: String(s.price), requiresBooking: s.requiresBooking });
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.price) return alert("Majburiy maydonlarni to'ldiring");
    setSaving(true);
    try {
      if (editing) {
        // UpdateServiceDto: { name, price, description, requiresBooking }
        await api.put(`/Service/Update/${editing.id}`, {
          name: form.name,
          price: Number(form.price),
          description: form.description || null,
          requiresBooking: form.requiresBooking,
        });
      } else {
        // CreateServiceDto: { storeId, name, price, description, requiresBooking }
        await api.post("/Service/Create", {
          storeId: Number(form.storeId),
          name: form.name,
          price: Number(form.price),
          description: form.description || null,
          requiresBooking: form.requiresBooking,
        });
      }
      await load();
      setModal(false);
    } catch { alert("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Xizmatni o'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/Service/Delete/${id}`);
    setServices((p) => p.filter((x) => x.id !== id));
  };

  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Xizmatlar ({services.length})</span>
        <button onClick={openCreate} style={{ background: "#2563EB", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Qo'shish</button>
      </div>

      {services.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Xizmat yo'q</div>}

      {services.map((s: any) => (
        <div key={s.id} style={{ background: "white", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🔧</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>{s.storeName} · {s.requiresBooking ? "🗓 Bron" : "⚡ Tezkor"}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginTop: 3 }}>{Number(s.price).toLocaleString()} so'm</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openEdit(s)} style={{ background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✏️</button>
            <button onClick={() => del(s.id)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🗑️</button>
          </div>
        </div>
      ))}

      {modal && (
        <AdminModal title={editing ? "Xizmatni tahrirlash" : "Yangi xizmat"} onClose={() => setModal(false)} onSave={save} saving={saving}>
          {!editing && (
            <FormField label="Do'kon / Usta" value={form.storeId} onChange={f("storeId")} as="select" required>
              <option value="">Tanlang...</option>
              {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </FormField>
          )}
          <FormField label="Nomi" value={form.name} onChange={f("name")} placeholder="Xizmat nomi" required />
          <FormField label="Tavsif" value={form.description} onChange={f("description")} placeholder="Qisqacha tavsif" as="textarea" />
          <FormField label="Narxi (so'm/soat)" value={form.price} onChange={f("price")} type="number" placeholder="50000" required />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" id="bron" checked={form.requiresBooking} onChange={(e) => setForm((p: any) => ({ ...p, requiresBooking: e.target.checked }))} style={{ width: 18, height: 18 }} />
            <label htmlFor="bron" style={{ fontSize: 14, fontWeight: 600 }}>Bron talab qilinadi</label>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
