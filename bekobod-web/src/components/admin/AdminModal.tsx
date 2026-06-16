interface Props {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  children: React.ReactNode;
}

export default function AdminModal({ title, onClose, onSave, saving, children }: Props) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.5)",
      zIndex: 200, display: "flex",
      alignItems: "flex-end",
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "white",
        borderRadius: "20px 20px 0 0",
        padding: "20px 16px 36px",
        width: "100%", maxWidth: 480, margin: "0 auto",
        maxHeight: "92dvh", overflowY: "auto",
      }}>
        <div style={{ width: 36, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 18 }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>{children}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "13px", borderRadius: 12,
            border: "1.5px solid #E5E7EB", background: "white",
            fontWeight: 600, cursor: "pointer", fontSize: 14, color: "#374151",
          }}>Bekor</button>
          <button onClick={onSave} disabled={saving} style={{
            flex: 2, padding: "13px", borderRadius: 12,
            border: "none", background: saving ? "#93c5fd" : "#2563EB",
            color: "white", fontWeight: 600, cursor: saving ? "default" : "pointer", fontSize: 14,
          }}>{saving ? "Saqlanmoqda..." : "✓ Saqlash"}</button>
        </div>
      </div>
    </div>
  );
}
