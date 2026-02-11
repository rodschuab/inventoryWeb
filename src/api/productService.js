import api from "./api";

export const productService = {
  listar: async () => (await api.get("/api/products")).data,
  criar: async (dados) => (await api.post("/api/products", dados)).data,
  atualizar: async (id, dados) => (await api.put(`/api/products/${id}`, dados)).data,
  excluir: async (id) => (await api.delete(`/api/products/${id}`)).data,
};
