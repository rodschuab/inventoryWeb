import api from "./api";

export const rawMaterialService = {
  listar: async () => (await api.get("/api/raw-materials")).data,
  criar: async (dados) => (await api.post("/api/raw-materials", dados)).data,
  atualizar: async (id, dados) => (await api.put(`/api/raw-materials/${id}`, dados)).data,
  excluir: async (id) => (await api.delete(`/api/raw-materials/${id}`)).data,
};
