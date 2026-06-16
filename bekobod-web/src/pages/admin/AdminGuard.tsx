import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom";

const ADMIN_ID = 5146085066;

export function useIsAdmin() {
  const user = useUserStore((s) => s.user);
  const chatId = useUserStore((s) => s.chatId);
  return user?.id === ADMIN_ID || chatId === ADMIN_ID;
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useUserStore((s) => s.user);
  const chatId = useUserStore((s) => s.chatId);
  const isAdmin = useIsAdmin();
  const nav = useNavigate();

  if (!isAdmin) return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100dvh", gap: 16, padding: 24, textAlign: "center",
      background: "#F3F4F6"
    }}>
      <span style={{ fontSize: 64 }}>🚫</span>
      <h2 style={{ fontWeight: 700, fontSize: 20 }}>Ruxsat yo'q</h2>
      <p style={{ color: "#6B7280", fontSize: 14 }}>Bu sahifa faqat admin uchun</p>
      <p style={{ color: "#9CA3AF", fontSize: 11, marginTop: 4 }}>
        user.id: {user?.id} | chatId: {chatId}
      </p>
      <button onClick={() => nav("/")} style={{
        background: "#2563EB", color: "white", border: "none",
        borderRadius: 12, padding: "12px 24px", fontWeight: 600, cursor: "pointer"
      }}>Bosh sahifaga qaytish</button>
    </div>
  );

  return <>{children}</>;
}
