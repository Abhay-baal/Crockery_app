import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();

    // Admin dashboard endpoints always use the admin session.
    const isAdminRoute = url.startsWith("/admin");

    // Product and category mutations from the admin dashboard
    // use the admin session, even though their URLs are not /admin/*.
    const isAdminMutation =
      ["post", "put", "patch", "delete"].includes(method) &&
      /^\/(products|categories)(\/|$)/.test(url);

    const isAdminRequest = isAdminRoute || isAdminMutation;

    const token = localStorage.getItem(
      isAdminRequest ? "adminToken" : "token"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  }

  return config;
});

export default api;
