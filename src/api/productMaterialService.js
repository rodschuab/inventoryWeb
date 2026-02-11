import api from "./api";

export const productMaterialService = {
  listarDoProduto: async (productId) =>
    (await api.get(`/api/products/${productId}/materials`)).data,

  adicionar: async (productId, dados) =>
    (await api.post(`/api/products/${productId}/materials`, dados)).data,

  atualizar: async (productId, associationId, dados) =>
    (await api.put(`/api/products/${productId}/materials/${associationId}`, dados)).data,

  excluir: async (productId, associationId) =>
    (await api.delete(`/api/products/${productId}/materials/${associationId}`)).data,
};
