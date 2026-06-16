import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { useUserStore } from "./store/userStore";
import { api } from "./api/client";

export default function App() {
  const setUser = useUserStore((s) => s.setUser);
  const setChatId = useUserStore((s) => s.setChatId);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const du = tg?.initDataUnsafe;
    console.log("Telegram initDataUnsafe:", JSON.stringify(du));
    const u = du?.user;
    if (du?.chat?.id) setChatId(Number(du.chat.id));
    if (u?.id) {
      setUser({ id: Number(u.id), first_name: u.first_name, username: u.username });
    } else {
      setUser({ id: 5146085066, first_name: "Admin", username: "admin" });
    }
  }, [setUser, setChatId]);

  useEffect(() => {
    if (!user) return;
    api.post("/User/Sync", {
      telegramId: user.id,
      username: user.username ?? null,
      firstName: user.first_name,
    }).catch(() => {});
  }, [user]);

  return <AppRouter />;
}