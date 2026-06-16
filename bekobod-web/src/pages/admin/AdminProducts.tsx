import { useEffect, useState } from "react";
import { api } from "../../api/client";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";

const empty = { storeId: "", name: "", description: "", price: "", isAvailable: true };

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [filterStore, setFilterStore] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get("/Stores/GetAll").then((r) => setStores(r.data)).catch(() => {}); }, []);

  const load = () => {
    const url = filterStore ? `/Products/GetAll?storeId=${filterStore}` : "/Products/GetAll";
    api.get(url).then((r) => setProducts(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [filterStore]);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ storeId: String(p.storeId), name: p.name, description: p.description ?? "", price: String(p.price), isAvailable: p.isAvailable });
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.price) return alert("Majburiy maydonlarni to'ldiring");
    setSaving(true);
    try {
      if (editing) {
        // UpdateProductDto: { name, description, price, imageId, isAvailable }
        await api.put(`/Products/Update/${editing.id}`, {
          name: form.name,
          description: form.description || null,
          price: Number(form.price),
          imageId: null,
          isAvailable: form.isAvailable,
        });
      } else {
        // CreateProductDto: { storeId, name, description, price, imageId }
        await api.post("/Products/Create", {
          storeId: Number(form.storeId),
          name: form.name,
          description: form.description || null,
          price: Number(form.price),
          imageId: null,
        });
      }
      await load();
      setModal(false);
    } catch { alert("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/Products/Delete/${id}`);
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Mahsulotlar ({products.length})</span>
        <button onClick={openCreate} style={{ background: "#2563EB", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Qo'shish</button>
      </div>

      {/* Store filter */}
      <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)} style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 14, background: "white" }}>
        <option value="">Barcha do'konlar</option>
        {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {products.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Mahsulot yo'q</div>}

      {products.map((p: any) => (
        <div key={p.id} style={{ background: "white", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
            {p.description && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>{p.description}</div>}
            <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginTop: 3 }}>
              {Number(p.price).toLocaleString()} so'm · {p.isAvailable ? "✅" : "❌"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openEdit(p)} style={{ background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✏️</button>
            <button onClick={() => del(p.id)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🗑️</button>
          </div>
        </div>
      ))}

      {modal && (
        <AdminModal title={editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot"} onClose={() => setModal(false)} onSave={save} saving={saving}>
          {!editing && (
            <FormField label="Do'kon" value={form.storeId} onChange={f("storeId")} as="select" required>
              <option value="">Tanlang...</option>
              {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </FormField>
          )}
          <FormField label="Nomi" value={form.name} onChange={f("name")} placeholder="Mahsulot nomi" required />
          <FormField label="Tavsif" value={form.description} onChange={f("description")} placeholder="Qisqacha tavsif" as="textarea" />
          <FormField label="Narxi (so'm)" value={form.price} onChange={f("price")} type="number" placeholder="15000" required />
          {editing && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="avail" checked={form.isAvailable} onChange={(e) => setForm((p: any) => ({ ...p, isAvailable: e.target.checked }))} style={{ width: 18, height: 18 }} />
              <label htmlFor="avail" style={{ fontSize: 14, fontWeight: 600 }}>Mavjud</label>
            </div>
          )}
        </AdminModal>
      )}
    </div>
  );
}
