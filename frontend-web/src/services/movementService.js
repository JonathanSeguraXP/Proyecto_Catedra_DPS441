import api from './api';

export const getMovements = async () => api.get('/movimientos');
export const createMovement = async (data) => api.post('/movimientos', data);
