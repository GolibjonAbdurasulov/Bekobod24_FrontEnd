import { useState } from "react";
import AdminGuard from "./AdminGuard";
import AdminOrders from "./AdminOrders";
import AdminStores from "./AdminStores";
import AdminProducts from "./AdminProducts";
import AdminProductCategories from "./AdminProductCategories";
import AdminServices from "./AdminServices";
import AdminServiceCategories from "./AdminServiceCategories";
import AdminUsers from "./AdminUsers";
import AdminAddresses from "./AdminAddresses";

const TABS = [
  { key: "orders",      label: "Buyurtmalar",       icon: "📋" },
  { key: "stores",      label: "Do'konlar",          icon: "🏪" },
  { key: "products",    label: "Mahsulotlar",        icon: "📦" },
  { key: "categories",  label: "Mahsulot kat.",      icon: "📂" },
  { key: "services",    label: "Xizmatlar",          icon: "🔧" },
  { key: "svcats",      label: "Xizmat kat.",        icon: "🗂️" },
  { key: "users",       label: "Foydalanuvchilar",   icon: "👥" },
  { key: "addresses",   label: "Manzillar",           icon: "📍" },
];

export default function AdminPage() {
  const [tab, setTab] = useState("orders");

  return (
    <AdminGuard>
      <div style={{ background: "#F3F4F6", minHeight: "100dvh", paddingBottom: 16 }}>

        <div style={{
          background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)",
          padding: "16px 16px 14px",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, letterSpacing: 0.5 }}>BEKOBOD 24</div>
          <div style={{ color: "white", fontWeight: 800, fontSize: 18, marginTop: 2 }}>⚙️ Admin Panel</div>
        </div>

        <div style={{
          background: "white",
          display: "flex",
          overflowX: "auto",
          borderBottom: "2px solid #F3F4F6",
          scrollbarWidth: "none",
          position: "sticky", top: 54, zIndex: 20,
        }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: "0 0 auto",
              padding: "11px 14px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? "#2563EB" : "#6B7280",
              borderBottom: tab === t.key ? "2px solid #2563EB" : "2px solid transparent",
              marginBottom: -2,
              whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 5,
              transition: "color 0.15s",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "12px" }}>
          {tab === "orders"     && <AdminOrders />}
          {tab === "stores"     && <AdminStores />}
          {tab === "products"   && <AdminProducts />}
          {tab === "categories" && <AdminProductCategories />}
          {tab === "services"   && <AdminServices />}
          {tab === "svcats"     && <AdminServiceCategories />}
          {tab === "users"      && <AdminUsers />}
          {tab === "addresses" && <AdminAddresses />}
        </div>
      </div>
    </AdminGuard>
  );
}
