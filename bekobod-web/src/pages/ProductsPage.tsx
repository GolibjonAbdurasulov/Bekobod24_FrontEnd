import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, FILE_URL } from "../api/client";
import { useCartStore } from "../store/CartStore";

function imgUrl(product: any) {
  if (product.imageUrl && product.imageUrl.startsWith("https://")) return product.imageUrl;
  if (!product.imageId) return null;
  return `${FILE_URL}/${product.imageId}`;
}

export default function ProductsPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [imgErrors, setImgErrors] = useState<number[]>([]);
  const cart = useCartStore();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/Stores/GetById/${id}`),
      api.get(`/Products/GetAll?storeId=${id}`),
    ]).then(([sRes, pRes]) => {
      setStore(sRes.data);
      setProducts(pRes.data);
    }).catch(() => {});
  }, [id]);

  const qty = (pid: string) => cart.items.find((i) => i.id === pid)?.quantity ?? 0;

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div>
          <div className="page-title">{store?.name ?? "Menyu"}</div>
          {store?.address && <div style={{ fontSize: 12, color: "#6B7280" }}>{store.address}</div>}
        </div>
      </div>

      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {products.length === 0
          ? <div className="empty-state"><span className="ei">🍽️</span><p>Mahsulot topilmadi</p></div>
          : products.map((p: any) => (
            <div key={p.id} className="product-card">
              {imgUrl(p) && !imgErrors.includes(p.id) && (
                <img src={imgUrl(p)!} alt={p.name} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                  onError={() => setImgErrors((prev) => [...prev, p.id])} />
              )}
              <div className="product-info">
                <div className="name">{p.name}</div>
                {p.description && <div className="desc">{p.description}</div>}
                <div className="price">{Number(p.price).toLocaleString()} so'm</div>
              </div>
              {!p.isAvailable ? (
                <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 600, whiteSpace: "nowrap" }}>Mavjud emas</span>
              ) : qty(p.id) === 0 ? (
                <button className="product-add-btn" onClick={() => cart.add({ id: p.id, name: p.name, price: p.price, storeId: id!, storeName: store?.name })}>+</button>
              ) : (
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => cart.dec(p.id)}>−</button>
                  <span className="qty-num">{qty(p.id)}</span>
                  <button className="qty-btn" onClick={() => cart.inc(p.id)}>+</button>
                </div>
              )}
            </div>
          ))}
      </div>

      {cart.count() > 0 && (
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
