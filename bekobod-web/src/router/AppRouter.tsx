import { HashRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import MainPage from "../pages/MainPage";
import CatalogPage from "../pages/CatalogPage";
import RestaurantsPage from "../pages/RestaurantsPage";
import ProductsPage from "../pages/ProductsPage";
import ServiceCategoriesPage from "../pages/ServiceCategoriesPage";
import ServiceProvidersPage from "../pages/ServiceProvidersPage";
import CartPage from "../pages/CartPage";
import OrdersPage from "../pages/OrdersPage";
import AdminPage from "../pages/admin/AdminPage";
import BottomNav from "../components/BottomNav";

function Layout() {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");
  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/catalog/:type" element={<CatalogPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/restaurants/:id/menu" element={<ProductsPage />} />
        <Route path="/store/:id/products" element={<ProductsPage />} />
        <Route path="/services" element={<ServiceCategoriesPage />} />
        <Route path="/services/:categoryId" element={<ServiceProvidersPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdmin && <BottomNav />}
    </>
  );
}

export default function AppRouter() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  );
}
