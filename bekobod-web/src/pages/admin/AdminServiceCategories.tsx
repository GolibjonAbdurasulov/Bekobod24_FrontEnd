import { useEffect, useState, useRef } from "react";
import { api, FILE_URL } from "../../api/client";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";

const empty = { name: "", description: "", icon: "", imageId: "" };

export default function AdminServiceCategories() {
  const [cats, setCats] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    api.get("/ServiceCategory/GetAll").then((r) => setCats(Array.isArray(r.data) ? r.data : (r.data as any)?.data ?? [])).catch(() => {});

  useEffect(() => { load(); }, []);

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
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? "", icon: c.icon ?? "", imageId: c.imageId ?? "" });
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) return alert("Nomni kiriting");
    if (!form.imageId) return alert("Rasm yuklash majburiy");
    setSaving(true);
    try {
      const body: any = {
        name: form.name,
        description: form.description || null,
        icon: form.icon || null,
        imageId: form.imageId || null,
      };
      if (editing) {
        await api.put(`/ServiceCategory/Update/${editing.id}`, body);
      } else {
        await api.post("/ServiceCategory/Create", body);
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
    if (!confirm("Kategoriyani o'chirishni tasdiqlaysizmi?")) return;
    await api.delete(`/ServiceCategory/Delete/${id}`);
    setCats((p) => p.filter((x) => x.id !== id));
  };

  const f = (k: string) => (v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Xizmat kategoriyalari ({cats.length})</span>
        <button
          onClick={openCreate}
          style={{ background: "#2563EB", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          + Qo'shish
        </button>
      </div>

      {cats.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Kategoriya yo'q</div>
      )}

      {cats.map((c: any) => (
        <div key={c.id} style={{ background: "white", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
            {c.imageId
              ? <img src={`${FILE_URL}/${c.imageId}`} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
              : (c.icon ?? "🔧")}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
            {c.description && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{c.description}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => openEdit(c)} style={{ background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✏️</button>
            <button onClick={() => del(c.id)} style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🗑️</button>
          </div>
        </div>
      ))}

      {modal && (
        <AdminModal
          title={editing ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
          onClose={() => setModal(false)}
          onSave={save}
          saving={saving}
        >
          <FormField label="Nomi" value={form.name} onChange={f("name")} placeholder="Masalan: Elektrik" required />
          <FormField label="Tavsif" value={form.description} onChange={f("description")} placeholder="Qisqacha tavsif" as="textarea" />
          <FormField label="Emoji (ixtiyoriy)" value={form.icon} onChange={f("icon")} placeholder="⚡" />

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Rasm *</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: "#F3F4F6", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {form.imageId
                  ? <img src={`${FILE_URL}/${form.imageId}`} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                  : "🖼️"}
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
        </AdminModal>
      )}
    </div>
  );
}