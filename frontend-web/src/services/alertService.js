import api from './api';

export const getAlerts = async () => api.get('/alertas');
export const getSummary = async () => api.get('/alertas/resumen');
