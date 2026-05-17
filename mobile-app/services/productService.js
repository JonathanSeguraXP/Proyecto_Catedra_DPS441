import api from './api';

export const getProducts = async () => api.get('/productos');
export const getProductById = async (id) => api.get(`/productos/${id}`);
