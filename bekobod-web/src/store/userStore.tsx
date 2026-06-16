import { create } from "zustand";

export type TgUser = { id: number; first_name: string; username?: string };

type S = { user: TgUser | null; chatId: number | null; setUser: (u: TgUser) => void; setChatId: (id: number) => void };

export const useUserStore = create<S>((set) => ({
  user: null,
  chatId: null,
  setUser: (u) => set({ user: u }),
  setChatId: (id) => set({ chatId: id }),
}));
