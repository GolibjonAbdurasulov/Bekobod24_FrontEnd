import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, FILE_URL } from "../api/client";
import { useCartStore } from "../store/CartStore";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  imageId?: string;
  isAvailable: boolean;
}

interface Store {
  id: string;
  name: string;
  address?: string;
}

function imgUrl(product: Product | Store | any): string | null {
  if (product.imageUrl && product.imageUrl.startsWith("https://")) return product.imageUrl;
  if (!product.imageId) return null;
  return `${FILE_URL}/${product.imageId}`;
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

export default function ProductsPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cart = useCartStore();

  const fetchData = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    Promise.all([
      api.get<Store>(`/Stores/GetById/${id}`),
      api.get<Product[]>(`/Products/GetAll?storeId=${id}`),
    ])
      .then(([sRes, pRes]) => {
        setStore(sRes.data);
        setProducts(pRes.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const qtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart.items) map.set(item.id, item.quantity);
    return map;
  }, [cart.items]);

  const qty = (pid: string) => qtyMap.get(pid) ?? 0;

  const handleImgError = (pid: string) =>
    setImgErrors((prev) => { const n = new Set(prev); n.add(pid); return n; });

  const hasCheckout = cart.count() > 0;

  if (loading) return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav(-1)}><BackIcon /></button>
        <div className="page-title">Yuklanmoqda...</div>
      </div>
      <div className="empty-state">
        <span className="ei">⏳</span>
        <p>Mahsulotlar yuklanmoqda</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav(-1)}><BackIcon /></button>
        <div className="page-title">Xatolik</div>
      </div>
      <div className="empty-state">
        <span className="ei">⚠️</span>
        <p>Ma'lumot yuklanmadi</p>
        <button
          onClick={fetchData}
          style={{ marginTop: 12, padding: "10px 24px", borderRadius: 12, background: "#2563EB", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
        >
          Qayta urinish
        </button>
      </div>
    </div>
  );

  return (
    <div className={`page${hasCheckout ? " has-checkout" : ""}`}>
      <div className="page-header">
        <button className="back-btn" onClick={() => nav(-1)}><BackIcon /></button>
        <div>
          <div className="page-title">{store?.name ?? "Menyu"}</div>
          {store?.address && <div style={{ fontSize: 12, color: "#6B7280" }}>{store.address}</div>}
        </div>
      </div>

      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {products.length === 0 ? (
          <div className="empty-state">
            <span className="ei">🍽️</span>
            <p>Mahsulot topilmadi</p>
          </div>
        ) : (
          products.map((p) => {
            const url = imgUrl(p);
            const showImg = url !== null && !imgErrors.has(p.id);
            const itemQty = qty(p.id);
            return (
              <div key={p.id} className="product-card">
                {showImg && (
                  <img
                    className="product-img"
                    src={url!}
                    alt={p.name}
                    onError={() => handleImgError(p.id)}
                  />
                )}
                <div className="product-info">
                  <div className="name">{p.name}</div>
                  {p.description && <div className="desc">{p.description}</div>}
                  <div className="price">{Number(p.price).toLocaleString()} so'm</div>
                </div>
                {!p.isAvailable ? (
                  <span className="product-unavailable">Mavjud emas</span>
                ) : itemQty === 0 ? (
                  <button
                    className="product-add-btn"
                    onClick={() => cart.add({ id: p.id, name: p.name, price: p.price, storeId: id!, storeName: store?.name ?? "" })}
                  >+</button>
                ) : (
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => cart.dec(p.id)}>−</button>
                    <span className="qty-num">{itemQty}</span>
                    <button className="qty-btn" onClick={() => cart.inc(p.id)}>+</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {hasCheckout && (
        <div className="checkout-bar">
          <button className="checkout-btn" onClick={() => nav("/cart")}>
            <span>Savatga o'tish ({cart.count()})</span>
            <span>{cart.total().toLocaleString()} so'm →</span>
          </button>
        </div>
      )}
    </div>
  );
}
