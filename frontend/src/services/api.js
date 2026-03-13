import axios from 'axios';

// Cliente HTTP centralizado para simplificar chamadas da aplicação.
const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export const fetchTasks = async () => (await api.get('/tasks')).data;
export const createTask = async (payload) => (await api.post('/tasks', payload)).data;
export const updateTask = async (id, payload) => (await api.put(`/tasks/${id}`, payload)).data;
export const deleteTask = async (id) => api.delete(`/tasks/${id}`);
export const fetchMetrics = async () => (await api.get('/tasks/dashboard/metrics')).data;
export const getDayPlan = async () => (await api.post('/tasks/ai/day-plan')).data;
export const getSuggestions = async () => (await api.get('/tasks/ai/suggestions')).data;

export default api;
