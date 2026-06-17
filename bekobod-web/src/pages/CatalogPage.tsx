import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, FILE_URL } from "../api/client";
import { useCartStore } from "../store/CartStore";

const TYPE_MAP: Record<string, { title: string; icon: string; storeType: number }> = {
  market:      { title: "Market",     icon: "🛒", storeType: 1 },
  pharmacy:    { title: "Dorixona",   icon: "💊", storeType: 3 },
  electronics: { title: "Elektronika", icon: "📱", storeType: 4 },
};

function imgUrl(item: any) {
  if (item.imageUrl && item.imageUrl.startsWith("https://")) return item.imageUrl;
  if (!item.imageId) return null;
  return `${FILE_URL}/${item.imageId}`;
}

export default function CatalogPage() {
  const { type } = useParams<{ type: string }>();
  const nav = useNavigate();
  const info = TYPE_MAP[type ?? ""] ?? { title: type ?? "", icon: "🏪", storeType: 0 };
  const isMarket = type === "market";

  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const cart = useCartStore();

  useEffect(() => {
    if (!info.storeType) return;
    if (isMarket) {
      api.get("/ProductCategory/GetAllCategories").then((r) => setCategories(r.data)).catch(() => {});
    } else {
      api.get(`/Stores/GetAll?type=${info.storeType}`).then((r) => setStores(r.data)).catch(() => {});
    }
  }, [type]);

  const openStore = async (store: any) => {
    setSelectedStore(store);
    setLoading(true);
    try {
      const pRes = await api.get(`/Products/GetAll?storeId=${store.id}`);
      setProducts(pRes.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const openCategory = async (category: any) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const pRes = await api.get(`/Products/GetAll?categoryId=${category.id}`);
      setProducts(pRes.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const qty = (id: string) => cart.items.find((i) => i.id === id)?.quantity ?? 0;

  if (selectedStore && !isMarket) return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => setSelectedStore(null)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div>
          <div className="page-title">{selectedStore.name}</div>
          {selectedStore.address && <div style={{ fontSize: 12, color: "#6B7280" }}>{selectedStore.address}</div>}
        </div>
      </div>

      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Yuklanmoqda...</div>
          : products.length === 0 ? <div className="empty-state"><span className="ei">📦</span><p>Mahsulot topilmadi</p></div>
          : products.map((p: any) => (
            <div key={p.id} className="product-card">
              {imgUrl(p) && (
                <img src={imgUrl(p)!} alt={p.name} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                  onError={(e) => { (e.currentTarget.style.display = "none"); }} />
              )}
              <div className="product-info">
                <div className="name">{p.name}</div>
                {p.description && <div className="desc">{p.description}</div>}
                <div className="price">{Number(p.price).toLocaleString()} so'm</div>
              </div>
              {qty(p.id) === 0 ? (
                <button className="product-add-btn" onClick={() => cart.add({ id: p.id, name: p.name, price: p.price, storeId: selectedStore.id, storeName: selectedStore.name })}>+</button>
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
            <span>Savatga o'tish</span>
            <span>{cart.total().toLocaleString()} so'm →</span>
          </button>
        </div>
      )}
    </div>
  );

  if (selectedCategory && isMarket) return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => setSelectedCategory(null)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div>
          <div className="page-title">{selectedCategory.name}</div>
        </div>
      </div>

      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Yuklanmoqda...</div>
          : products.length === 0 ? <div className="empty-state"><span className="ei">📦</span><p>Mahsulot topilmadi</p></div>
          : products.map((p: any) => (
            <div key={p.id} className="product-card">
              {imgUrl(p) && (
                <img src={imgUrl(p)!} alt={p.name} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                  onError={(e) => { (e.currentTarget.style.display = "none"); }} />
              )}
              <div className="product-info">
                <div className="name">{p.name}</div>
                {p.description && <div className="desc">{p.description}</div>}
                <div className="price">{Number(p.price).toLocaleString()} so'm</div>
              </div>
              {qty(p.id) === 0 ? (
                <button className="product-add-btn" onClick={() => cart.add({ id: p.id, name: p.name, price: p.price, storeId: "", storeName: selectedCategory.name })}>+</button>
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
            <span>Savatga o'tish</span>
            <span>{cart.total().toLocaleString()} so'm →</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="page-title">{info.icon} {info.title}</div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {isMarket ? (
          categories.length === 0
            ? <div className="empty-state"><span className="ei">{info.icon}</span><p>Kategoriyalar topilmadi</p></div>
            : <div className="category-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {categories.map((c: any) => (
                  <div key={c.id} className="cat-card" onClick={() => openCategory(c)} style={{
                    background: "white", borderRadius: 16, padding: "16px 14px",
                    display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}>
                    <div className="cat-icon" style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "#EFF6FF", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 22, flexShrink: 0, overflow: "hidden",
                    }}>
                      {imgUrl(c)
                        ? <img src={imgUrl(c)!} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : "📦"}
                    </div>
                    <div className="cat-title" style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  </div>
                ))}
              </div>
        ) : (
          stores.length === 0
            ? <div className="empty-state"><span className="ei">{info.icon}</span><p>Do'konlar topilmadi</p></div>
            : stores.map((s: any) => (
              <div key={s.id} className="store-card" onClick={() => openStore(s)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
                    {imgUrl(s) && !imgErrors.has(s.id)
                      ? <img src={imgUrl(s)!} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgErrors((p) => new Set(p).add(s.id))} />
                      : info.icon
                    }
                  </div>
                  <div className="store-card-body" style={{ flex: 1 }}>
                    <div className="store-card-name">{s.name}</div>
                    <div className="store-card-meta">
                      <span>{s.isActive ? "✅ Faol" : "❌ Nofaol"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
