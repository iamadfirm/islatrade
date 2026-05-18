import { create } from "zustand";
import api, { setUnauthenticatedHandler } from "../lib/api";

export const useAuth = create((set, get) => ({
  user: null,
  loading: true,
  hydrated: false,
  async hydrate() {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.data ?? data, loading: false, hydrated: true });
    } catch {
      set({ user: null, loading: false, hydrated: true });
    }
  },
  async login(phone, password) {
    const { data } = await api.post("/auth/login", { phone, password });
    set({ user: data.data ?? data });
  },
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    set({ user: data.data ?? data });
  },
  async logout() {
    try { await api.post("/auth/logout"); } catch {}
    set({ user: null });
  },
  refresh: async () => {
    const { data } = await api.get("/auth/me");
    set({ user: data.data ?? data });
  },
}));

// On any 401, drop the user from the store. React Router's <Protected>
// guard will then redirect to /login via SPA navigation — no hard reload,
// so cookies/store don't get torn down mid-flight.
setUnauthenticatedHandler(() => {
  const { hydrated, user } = useAuth.getState();
  if (hydrated && user) {
    useAuth.setState({ user: null });
  }
});
