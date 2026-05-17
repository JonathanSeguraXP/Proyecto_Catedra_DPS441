import api from './api';

export const getCategories = async () => api.get('/categorias');
