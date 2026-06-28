import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/CartStore";
import { useUserStore } from "../store/userStore";
import { api } from "../api/client";

export default function CartPage() {
  const nav = useNavigate();
  const cart = useCartStore();
  const user = useUserStore((s) => s.user);
  const chatId = useUserStore((s) => s.chatId);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) { alert("Brauzeringiz joylashuvni aniqlashni qo'llab-quvvatlamaydi"); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); setLocLoading(false); },
      () => { alert("Joylashuvni aniqlashda xatolik"); setLocLoading(false); }
    );
  };

  const checkout = async () => {
    if (!latitude && !address.trim()) { alert("Manzilni kiriting yoki joylashuvni aniqlang"); return; }
    if (!phone.trim()) { alert("Telefon raqamini kiriting"); return; }
    const clientChatId = chatId ?? user?.id;
    if (!clientChatId) { alert("Foydalanuvchi aniqlanmadi"); return; }
    if (cart.items.length === 0) { alert("Savat bo'sh"); return; }
    setSubmitting(true);
    try {
      const orderRes = await api.post("/Orders/Create", {
        clientChatId,
        items: cart.items.map((i) => ({
          productId: Number(i.productId),
          quantityBox: i.quantity,
        })),
        phoneNumber: phone,
      });
      const orderId = orderRes.data?.data?.id ?? orderRes.data?.id;
      if (orderId) {
        await api.post("/Address/Create", {
          orderId,
          latitude: latitude ?? 0,
          longitude: longitude ?? 0,
          text: address || "📍 Joylashuv orqali",
          note: note || null,
        });
      }
      cart.clear();
      setSuccess(true);
    } catch {
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="page">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", gap: 16, textAlign: "center" }}>
        <span style={{ fontSize: 72 }}>🎉</span>
        <h2 style={{ fontWeight: 700, fontSize: 22 }}>Buyurtma qabul qilindi!</h2>
        <p style={{ color: "#6B7280", fontSize: 14 }}>Kuryer tez orada yetkazib beradi.</p>
        <button
          className="checkout-btn"
          style={{ marginTop: 16, borderRadius: 14, justifyContent: "center" }}
          onClick={() => nav("/orders")}
        >
          Buyurtmalarimni ko'rish
        </button>
      </div>
    </div>
  );

  if (cart.items.length === 0) return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🛒 Savat</div>
      </div>
      <div className="empty-state">
        <span className="ei">🛒</span>
        <p>Savat bo'sh</p>
        <button
          onClick={() => nav("/")}
          style={{ marginTop: 8, background: "#2563EB", color: "white", border: "none", borderRadius: 12, padding: "10px 24px", fontWeight: 600, cursor: "pointer" }}
        >
          Xarid qilish
        </button>
      </div>
    </div>
  );

  return (
    <div className="page has-checkout">
      <div className="page-header">
        <div className="page-title">🛒 Savat</div>
        <button
          onClick={() => { if (confirm("Savatni tozalaysizmi?")) cart.clear(); }}
          style={{ background: "none", border: "none", color: "#DC2626", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: "4px 8px" }}
        >
          🗑 Tozalash
        </button>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {cart.items.map((item) => (
          <div key={item.productId} className="product-card">
            <div className="product-info">
              <div className="name">{item.name}</div>
              {item.storeName && <div className="desc">{item.storeName}</div>}
              <div className="price">{(item.price * item.quantity).toLocaleString()} so'm</div>
            </div>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => cart.dec(item.productId)}>−</button>
              <span className="qty-num">{item.quantity}</span>
              <button className="qty-btn" onClick={() => cart.inc(item.productId)}>+</button>
            </div>
          </div>
        ))}

        <div style={{ background: "white", borderRadius: 16, padding: 16, marginTop: 4, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label className="form-label">Yetkazib berish manzili {latitude ? "(ixtiyoriy)" : "*"}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Ko'cha, uy raqami..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button onClick={getLocation} disabled={locLoading}
                style={{ flexShrink: 0, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #E5E7EB", background: locLoading ? "#F3F4F6" : "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                {locLoading ? "⏳" : latitude ? "📍 ✓" : "📍"}
              </button>
            </div>
            {latitude && longitude && (
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                Joylashuv aniqlandi ({latitude.toFixed(5)}, {longitude.toFixed(5)})
              </div>
            )}
          </div>
          <div>
            <label className="form-label">Telefon raqami *</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Izoh (ixtiyoriy)</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Qo'shimcha xohishlar..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="checkout-bar">
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280", marginBottom: 8, padding: "0 4px" }}>
          <span>{cart.count()} ta mahsulot</span>
          <span>Jami: <strong style={{ color: "#111827" }}>{cart.total().toLocaleString()} so'm</strong></span>
        </div>
        <button className="checkout-btn" onClick={checkout} disabled={submitting}>
          <span>{submitting ? "Yuborilmoqda..." : "Buyurtma berish"}</span>
          <span>{cart.total().toLocaleString()} so'm →</span>
        </button>
      </div>
    </div>
  );
}
