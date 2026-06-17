import { useEffect, useState, useRef } from "react";
import { api, FILE_URL } from "../../api/client";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";

const STORE_TYPES = [
  { value: "1", label: "Market" },
  { value: "2", label: "Restoran" },
  { value: "3", label: "Dorixona" },
  { value: "4", label: "Elektronika" },
  { value: "5", label: "Xizmat" },
];

const TYPE_ICONS: Record<string, string> = {
  Market: "🛒", Restoran: "🍔", Dorixona: "💊", Elektronika: "📱", Xizmat: "🔧",
};

const empty = { name: "", type: "1", isActive: true, imageId: "" };

function imgUrl(store: any) {
  if (store.imageUrl && store.imageUrl.startsWith("https://")) return store.imageUrl;
  if (!store.imageId) return null;
  return `${FILE_URL}/${store.imageId}`;
}

export default function AdminStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgErrors, setImgErrors] = useState<number[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => api.get("/Stores/GetAll").then((r) => setStores(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (s: any) => {
    const typeVal = STORE_TYPES.find((t) => t.label === s.type)?.value ?? "1";
    setEditing(s);
    setForm({ name: s.name, type: typeVal, isActive: s.isActive, imageId: s.imageId ?? "" });
    setModal(true);
  };

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

  const save = async () => {
    if (!form.name.trim()) return alert("Nomi kiritilmadi");
    setSaving(true);
    try {
      const body = {
        name: form.name,
        type: Number(form.type),
        imageId: form.imageId || null,
        isActive: form.isActive,
      };
      if (editing) {
        await api.put(`/Stores/Update/${editing.id}`, body);
      } else {
        await api.post("/Stores/Create", { name: body.name, type: body.type, imageId: body.imageId });
      }
      await load();
      setModal(false);
    } catch { alert("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Do'konni o'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/Stores/Delete/${id}`);
    setStores((p) => p.filter((s) => s.id !== id));
  };

  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Do'konlar ({stores.length})</span>
        <button onClick={openCreate} style={{ background: "#2563EB", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Qo'shish</button>
      </div>

      {stores.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Do'kon yo'q</div>}

      {stores.map((s: any) => (
        <div key={s.id} style={{ background: "white", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Rasm */}
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
            {imgUrl(s) && !imgErrors.includes(s.id)
              ? <img src={imgUrl(s)!} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErrors((p) => [...p, s.id])} />
              : TYPE_ICONS[s.type] ?? "🏪"
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{s.type} · {s.isActive ? "✅ Faol" : "❌ Nofaol"}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openEdit(s)} style={{ background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✏️</button>
            <button onClick={() => del(s.id)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🗑️</button>
          </div>
        </div>
      ))}

      {modal && (
        <AdminModal title={editing ? "Do'konni tahrirlash" : "Yangi do'kon"} onClose={() => setModal(false)} onSave={save} saving={saving}>
          <FormField label="Nomi" value={form.name} onChange={f("name")} placeholder="Do'kon nomi" required />
          <FormField label="Turi" value={form.type} onChange={f("type")} as="select" required>
            {STORE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </FormField>

          {/* Rasm yuklash */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8, display: "block" }}>Rasm</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Preview */}
              <div style={{ width: 64, height: 64, borderRadius: 12, background: "#F3F4F6", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                {form.imageId
                  ? <img src={`${FILE_URL}/${form.imageId}`} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                  : TYPE_ICONS[STORE_TYPES.find((t) => t.value === form.type)?.label ?? ""] ?? "🏪"
                }
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
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((p: any) => ({ ...p, isActive: e.target.checked }))} style={{ width: 18, height: 18 }} />
              <label htmlFor="isActive" style={{ fontSize: 14, fontWeight: 600 }}>Faol</label>
            </div>
          )}
        </AdminModal>
      )}
    </div>
  );
} 