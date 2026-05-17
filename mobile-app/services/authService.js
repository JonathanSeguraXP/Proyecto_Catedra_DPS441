import api from './api';

export const login = async (data) => api.post('/auth/login', data);
