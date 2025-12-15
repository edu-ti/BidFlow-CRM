import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

// Adiciona o Token JWT em todas as requisições se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email, password) => {
    const response = await api.post("/login", { email, password });
    // Salva o token para manter a sessão
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const dataApi = {
  getCompanies: async () => {
    return api.get("/companies");
  },
};

export default api;
