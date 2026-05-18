import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
});

let csrfReady = null;
export function ensureCsrf() {
  if (!csrfReady) {
    csrfReady = axios.get("/sanctum/csrf-cookie", { withCredentials: true });
  }
  return csrfReady;
}

api.interceptors.request.use(async (config) => {
  if (["post", "put", "patch", "delete"].includes(config.method)) {
    await ensureCsrf();
  }
  return config;
});

let onUnauthenticated = null;
export function setUnauthenticatedHandler(fn) {
  onUnauthenticated = fn;
}

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && onUnauthenticated) {
      onUnauthenticated();
    }
    return Promise.reject(err);
  }
);

export default api;

export const peso = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    Number(v || 0)
  );
