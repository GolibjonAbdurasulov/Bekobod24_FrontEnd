import { useEffect, useState, useRef } from "react";
import { api, FILE_URL } from "../../api/client";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";

const empty = { storeId: "", productCategoryId: "", name: "", description: "", price: "", isAvailable: true, imageId: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filterStore, setFilterStore] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/Stores/GetAll").then((r) => setStores(r.data)).catch(() => {});
    api.get("/ProductCategory/GetAllCategories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const load = () => {
    const url = filterStore ? `/Products/GetAll?storeId=${filterStore}` : "/Products/GetAll";
    api.get(url).then((r) => setProducts(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [filterStore]);

  const storeCategories = categories.filter((c) => String(c.storeId) === form.storeId);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/File/UploadFile", fd);
      const id = res.data?.data?.id ?? res.data?.id;
      if (id) setForm((p: any) => ({ ...p, imageId: id }));
    } catch { alert("Rasm yuklashda xatolik"); }
    finally { setUploading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      storeId: String(p.storeId),
      productCategoryId: String(p.productCategoryId ?? ""),
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      isAvailable: p.isAvailable,
      imageId: p.imageId ?? "",
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.price) return alert("Majburiy maydonlarni to'ldiring");
    setSaving(true);
    try {
      const body: any = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        imageId: form.imageId || null,
        productCategoryId: form.productCategoryId ? Number(form.productCategoryId) : null,
      };
      if (editing) {
        body.isAvailable = form.isAvailable;
        await api.put(`/Products/Update/${editing.id}`, body);
      } else {
        body.storeId = Number(form.storeId);
        await api.post("/Products/Create", body);
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

      <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)} style={{ width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "10px 14px", fontSize: 14, background: "white" }}>
        <option value="">Barcha do'konlar</option>
        {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {products.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Mahsulot yo'q</div>}

      {products.map((p: any) => {
        const cat = categories.find((c) => c.id === p.productCategoryId);
        return (
          <div key={p.id} style={{ background: "white", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, overflow: "hidden" }}>
              {p.imageId
                ? <img src={`${FILE_URL}/${p.imageId}`} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                : "📦"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
              {p.description && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>{p.description}</div>}
              {cat && <div style={{ fontSize: 11, color: "#2563EB", marginTop: 1 }}>{cat.name}</div>}
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginTop: 3 }}>
                {Number(p.price).toLocaleString()} so'm · {p.isAvailable ? "✅" : "❌"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openEdit(p)} style={{ background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✏️</button>
              <button onClick={() => del(p.id)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🗑️</button>
            </div>
          </div>
        );
      })}

      {modal && (
        <AdminModal title={editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot"} onClose={() => setModal(false)} onSave={save} saving={saving}>
          {!editing && (
            <FormField label="Do'kon" value={form.storeId} onChange={(v) => { setForm((p: any) => ({ ...p, storeId: v, productCategoryId: "" })); }} as="select" required>
              <option value="">Tanlang...</option>
              {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </FormField>
          )}
          <FormField label="Kategoriya" value={form.productCategoryId} onChange={f("productCategoryId")} as="select">
            <option value="">Tanlanmagan</option>
            {storeCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FormField>
          <FormField label="Nomi" value={form.name} onChange={f("name")} placeholder="Mahsulot nomi" required />
          <FormField label="Tavsif" value={form.description} onChange={f("description")} placeholder="Qisqacha tavsif" as="textarea" />
          <FormField label="Narxi (so'm)" value={form.price} onChange={f("price")} type="number" placeholder="15000" required />

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Rasm</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: "#F3F4F6", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {form.imageId
                  ? <img src={`${FILE_URL}/${form.imageId}`} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                  : "📦"}
              </div>
              <div style={{ flex: 1 }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px dashed #D1D5DB", background: "white", cursor: "pointer", fontSize: 13, color: "#6B7280", fontWeight: 500 }}>
                  {uploading ? "Yuklanmoqda..." : form.imageId ? "✅ Rasmni almashtirish" : "📷 Rasm yuklash"}
                </button>
                {form.imageId && (
                  <button onClick={() => setForm((p: any) => ({ ...p, imageId: "" }))}
                    style={{ width: "100%", marginTop: 6, padding: "7px", borderRadius: 10, border: "none", background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    🗑️ Rasmni olib tashlash
                  </button>
                )}
              </div>
            </div>
          </div>

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