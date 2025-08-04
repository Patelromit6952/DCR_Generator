import axios from 'axios';
// const baseURL = import.meta.env.VITE_API_URL
const backendHost = window.location.hostname;
const BASE_URL = `http://${backendHost}:8000`;
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});


export default {
  login: (data) => api.post('/api/login', data, {}),
  createSedB: () => api.post('/api/createSedB'),
  mainBuilding: () => api.post('/api/mainBuilding'),
  Rccroad: () => api.post('/api/rccroad'),
  Paverblock: () => api.post('/api/paverblock'),
  EsRoom: () => api.post('/api/esroom'),
  SecurityCabin: () => api.post('/api/securitycabin'),
  DisplayAllQuotations: () => api.get('/api/quotations'),
  DisplayRecentQuotations: () => api.get('/api/recentquotations'),
  quotations: ({ id }) => api.get(`/api/quotations/${id}`),
  updateQuotation: ({ id, ...data }) => api.put(`/api/quotations/${id}`, data),
  saveQuotation: (data) => api.post('/api/quotations/save', data),

};
