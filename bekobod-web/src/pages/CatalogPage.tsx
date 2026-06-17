import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, FILE_URL } from "../api/client";
import { useCartStore } from "../store/CartStore";

const TYPE_MAP: Record<string, { title: string; icon: string; storeType: number }> = {
  market:      { title: "Market",      icon: "🛒", storeType: 1 },
  pharmacy:    { title: "Dorixona",    icon: "💊", storeType: 3 },
  electronics: { title: "Elektronika", icon: "📱", storeType: 4 },
};

interface StoreOrCat {
  id: string;
  name: string;
  isActive?: boolean;
  imageUrl?: string;
  imageId?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  imageId?: string;
  isAvailable: boolean;
}

function imgUrl(item: StoreOrCat | Product): string | null {
  if (item.imageUrl && item.imageUrl.startsWith("https://")) return item.imageUrl;
  if (!item.imageId) return null;
  return `${FILE_URL}/${item.imageId}`;
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function ProductList({
  products,
  loading,
  cart,
  storeId,
  storeName,
}: {
  products: Product[];
  loading: boolean;
  cart: ReturnType<typeof useCartStore>;
  storeId: string;
  storeName: string;
}) {
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const nav = useNavigate();

  const qtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart.items) map.set(item.id, item.quantity);
    return map;
  }, [cart.items]);

  const handleImgError = (pid: string) =>
    setImgErrors((prev) => { const n = new Set(prev); n.add(pid); return n; });

  const hasCheckout = cart.count() > 0;

  if (loading) return <div className="empty-state"><span className="ei">⏳</span><p>Yuklanmoqda...</p></div>;
  if (products.length === 0) return <div className="empty-state"><span className="ei">📦</span><p>Mahsulot topilmadi</p></div>;

  return (
    <>
      {products.map((p) => {
        const url = imgUrl(p);
        const showImg = url !== null && !imgErrors.has(p.id);
        const itemQty = qtyMap.get(p.id) ?? 0;
        return (
          <div key={p.id} className="product-card">
            {showImg && (
              <img className="product-img" src={url!} alt={p.name} onError={() => handleImgError(p.id)} />
            )}
            <div className="product-info">
              <div className="name">{p.name}</div>
              {p.description && <div className="desc">{p.description}</div>}
              <div className="price">{Number(p.price).toLocaleString()} so'm</div>
            </div>
            {!p.isAvailable ? (
              <span className="product-unavailable">Mavjud emas</span>
            ) : itemQty === 0 ? (
              <button className="product-add-btn"
                onClick={() => cart.add({ id: p.id, name: p.name, price: p.price, storeId, storeName })}>+</button>
            ) : (
              <div className="qty-control">
                <button className="qty-btn" onClick={() => cart.dec(p.id)}>−</button>
                <span className="qty-num">{itemQty}</span>
                <button className="qty-btn" onClick={() => cart.inc(p.id)}>+</button>
              </div>
            )}
          </div>
        );
      })}

      {hasCheckout && (
        <div className="checkout-bar">
          <button className="checkout-btn" onClick={() => nav("/cart")}>
            <span>Savatga o'tish ({cart.count()})</span>
            <span>{cart.total().toLocaleString()} so'm →</span>
          </button>
        </div>
      )}
    </>
  );
}

export default function CatalogPage() {
  const { type } = useParams<{ type: string }>();
  const nav = useNavigate();
  const info = TYPE_MAP[type ?? ""] ?? { title: type ?? "", icon: "🏪", storeType: 0 };
  const isMarket = type === "market";

  const [stores, setStores] = useState<StoreOrCat[]>([]);
  const [categories, setCategories] = useState<StoreOrCat[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreOrCat | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<StoreOrCat | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [storeImgErrors, setStoreImgErrors] = useState<Set<string>>(new Set());

  const cart = useCartStore();

  useEffect(() => {
    if (!info.storeType) return;
    setListLoading(true);
    if (isMarket) {
      api.get<StoreOrCat[]>("/ProductCategory/GetAllCategories")
        .then((r) => setCategories(r.data))
        .catch(() => {})
        .finally(() => setListLoading(false));
    } else {
      api.get<StoreOrCat[]>(`/Stores/GetAll?type=${info.storeType}`)
        .then((r) => setStores(r.data))
        .catch(() => {})
        .finally(() => setListLoading(false));
    }
  }, [type]);

  const openStore = useCallback(async (store: StoreOrCat) => {
    setSelectedStore(store);
    setLoading(true);
    try {
      const pRes = await api.get<Product[]>(`/Products/GetAll?storeId=${store.id}`);
      setProducts(pRes.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const openCategory = useCallback(async (category: StoreOrCat) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const pRes = await api.get<Product[]>(`/Products/GetAll?categoryId=${category.id}`);
      setProducts(pRes.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStoreImgError = (id: string) =>
    setStoreImgErrors((prev) => { const n = new Set(prev); n.add(id); return n; });

  // Store ichki sahifasi
  if (selectedStore && !isMarket) return (
    <div className={`page${cart.count() > 0 ? " has-checkout" : ""}`}>
      <div className="page-header">
        <button className="back-btn" onClick={() => { setSelectedStore(null); setProducts([]); }}>
          <BackIcon />
        </button>
        <div>
          <div className="page-title">{selectedStore.name}</div>
        </div>
      </div>
      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <ProductList products={products} loading={loading} cart={cart} storeId={selectedStore.id} storeName={selectedStore.name} />
      </div>
    </div>
  );

  // Kategoriya ichki sahifasi
  if (selectedCategory && isMarket) return (
    <div className={`page${cart.count() > 0 ? " has-checkout" : ""}`}>
      <div className="page-header">
        <button className="back-btn" onClick={() => { setSelectedCategory(null); setProducts([]); }}>
          <BackIcon />
        </button>
        <div className="page-title">{selectedCategory.name}</div>
      </div>
      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <ProductList products={products} loading={loading} cart={cart} storeId="" storeName={selectedCategory.name} />
      </div>
    </div>
  );

  // Asosiy ro'yxat sahifasi
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav("/")}>
          <BackIcon />
        </button>
        <div className="page-title">{info.icon} {info.title}</div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {listLoading ? (
          <div className="empty-state"><span className="ei">⏳</span><p>Yuklanmoqda...</p></div>
        ) : isMarket ? (
          categories.length === 0
            ? <div className="empty-state"><span className="ei">{info.icon}</span><p>Kategoriyalar topilmadi</p></div>
            : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {categories.map((c) => (
                  <div key={c.id}
                    onClick={() => openCategory(c)}
                    style={{ background: "white", borderRadius: 16, padding: "16px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                    onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                    onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, overflow: "hidden" }}>
                      {imgUrl(c)
                        ? <img src={imgUrl(c)!} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : "📦"}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  </div>
                ))}
              </div>
        ) : (
          stores.length === 0
            ? <div className="empty-state"><span className="ei">{info.icon}</span><p>Do'konlar topilmadi</p></div>
            : stores.map((s) => {
                const url = imgUrl(s);
                return (
                  <div key={s.id} className="store-card" onClick={() => openStore(s)}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
                      {url && !storeImgErrors.has(s.id)
                        ? <img src={url} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => handleStoreImgError(s.id)} />
                        : info.icon
                      }
                    </div>
                    <div className="store-card-body">
                      <div className="store-card-name">{s.name}</div>
                      <div className="store-card-meta">
                        <span>{s.isActive ? "✅ Faol" : "❌ Nofaol"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
        )}
      </div>
    </div>
  );
}
