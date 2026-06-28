import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";

export default function AdminAddresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ text: "", note: "" });
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get("/Address/GetAll").then((r) => {
      const data = Array.isArray(r.data) ? r.data : (r.data as any)?.data ?? [];
      setAddresses(data);
    }).catch(() => {});

  useEffect(() => { load(); }, []);

  const openEdit = (a: any) => {
    setEditing(a);
    setForm({ text: a.text ?? "", note: a.note ?? "" });
    setModal(true);
  };

  const save = async () => {
    if (!form.text.trim()) return alert("Manzil matnini kiriting");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/Address/Update/${editing.id}`, {
          latitude: editing.latitude ?? 0,
          longitude: editing.longitude ?? 0,
          text: form.text,
          note: form.note || null,
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
    if (!confirm("Manzilni o'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/Address/Delete/${id}`);
    setAddresses((p) => p.filter((x) => x.id !== id));
  };

  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Manzillar ({addresses.length})</span>
      </div>

      {addresses.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Manzil yo'q</div>
      )}

      {addresses.map((a: any) => (
        <div key={a.id} style={{ background: "white", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📍</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{a.text}</div>
            {a.note && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>Izoh: {a.note}</div>}
            {(a.latitude || a.longitude) && (
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
                ({a.latitude?.toFixed(5)}, {a.longitude?.toFixed(5)})
                {a.orderId && <span> · Buyurtma #{a.orderId}</span>}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => openEdit(a)} style={{ background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✏️</button>
            <button onClick={() => del(a.id)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🗑️</button>
          </div>
        </div>
      ))}

      {modal && (
        <AdminModal
          title="Manzilni tahrirlash"
          onClose={() => setModal(false)}
          onSave={save}
          saving={saving}
        >
          <FormField label="Manzil matni" value={form.text} onChange={f("text")} placeholder="Ko'cha, uy raqami..." required />
          <FormField label="Izoh" value={form.note} onChange={f("note")} placeholder="Qo'shimcha ma'lumot" as="textarea" />
        </AdminModal>
      )}
    </div>
  );
}
