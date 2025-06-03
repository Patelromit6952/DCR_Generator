import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, 
});


export default {
    login:(data)=>api.post('/api/login',data),
    createSedB:()=>api.post('/api/createSedB')
};
