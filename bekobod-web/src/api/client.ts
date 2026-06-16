import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://back.bekobod24.uz/api";

export const API_BASE = BASE_URL.replace("/api", "");
export const FILE_URL = `${BASE_URL}/File/DownloadFileAsync`;

export const api = axios.create({ baseURL: BASE_URL });

// Telegram user id header
const tg = (window as any).Telegram?.WebApp;
if (tg?.initDataUnsafe?.user) {
  api.defaults.headers.common["x-telegram-id"] = tg.initDataUnsafe.user.id;
}
