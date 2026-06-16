import { NavLink } from "react-router-dom";
import { useCartStore } from "../store/CartStore";

export default function BottomNav() {
  const count = useCartStore((s) => s.count)();
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Bosh sahifa
      </NavLink>
      <NavLink to="/cart">
        <span style={{ position: "relative", display: "inline-flex" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.56l1.38-7.44H6"/></svg>
          {count > 0 && <span className="badge" style={{ position: "absolute", top: -6, right: -8 }}>{count}</span>}
        </span>
        Savat
      </NavLink>
      <NavLink to="/orders">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        Buyurtmalar
      </NavLink>
    </nav>
  );
}
