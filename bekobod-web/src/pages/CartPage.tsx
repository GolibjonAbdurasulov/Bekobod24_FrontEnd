import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/CartStore";
import { useUserStore } from "../store/userStore";
import { api } from "../api/client";

export default function CartPage() {
  const nav = useNavigate();
  const cart = useCartStore();
  const user = useUserStore((s) => s.user);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const checkout = async () => {
    if (!address.trim()) { alert("Manzilni kiriting"); return; }
    if (!user) { alert("Foydalanuvchi aniqlanmadi"); return; }
    setSubmitting(true);
    try {
      for (const item of cart.items) {
        await api.post(`/Cart/AddItem/${user.id}`, {
          storeId: Number(item.storeId),
          productId: Number(item.id),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        });
      }
      await api.post(`/Orders/Checkout/${user.id}`);
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
    /* has-checkout: checkout-bar + BottomNav ikkalasi uchun joy */
    <div className="page has-checkout">
      <div className="page-header">
        <div className="page-title">🛒 Savat</div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {cart.items.map((item) => (
          <div key={item.id} className="product-card">
            <div className="product-info">
              <div className="name">{item.name}</div>
              {item.storeName && <div className="desc">{item.storeName}</div>}
              <div className="price">{(item.price * item.quantity).toLocaleString()} so'm</div>
            </div>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => cart.dec(item.id)}>−</button>
              <span className="qty-num">{item.quantity}</span>
              <button className="qty-btn" onClick={() => cart.inc(item.id)}>+</button>
            </div>
          </div>
        ))}

        <div style={{ background: "white", borderRadius: 16, padding: 16, marginTop: 4, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label className="form-label">Yetkazib berish manzili</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ko'cha, uy raqami..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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

      {/* checkout-bar — BottomNav ustida, z-index: 45 */}
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
