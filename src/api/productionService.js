import api from "./api";

export const productionService = {
  listarDisponiveis: async () => {
    const response = await api.get("/api/production/available-products");
    return response.data;
  },
};
