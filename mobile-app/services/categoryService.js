import api from './api';

export const getCategories = async () => api.get('/categorias');
export const createCategory = async (data) => api.post('/categorias', data);
export const updateCategory = async (id, data) => api.put(`/categorias/${id}`, data);
export const deleteCategory = async (id) => api.delete(`/categorias/${id}`);
