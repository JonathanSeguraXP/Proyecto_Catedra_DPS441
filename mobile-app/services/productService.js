import api from './api';

export const getProducts = async () => api.get('/productos');
export const getProductById = async (id) => api.get(`/productos/${id}`);
export const createProduct = async (data) => api.post('/productos', data);
export const updateProduct = async (id, data) => api.put(`/productos/${id}`, data);
export const deleteProduct = async (id) => api.delete(`/productos/${id}`);
