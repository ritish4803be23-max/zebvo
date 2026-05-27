import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5005/api' })

export async function fetchPosts() {
  const res = await api.get('/posts');
  return res.data;
}

export async function searchPosts(q) {
  const res = await api.get('/posts/search', { params: { q } });
  return res.data;
}

export async function filterPosts(params) {
  const res = await api.get('/posts/filter', { params });
  return res.data;
}

export async function translatePost(id, to='hi') {
  const res = await api.post('/posts/translate', { id, to });
  return res.data;
}

export function exportCSV() {
  const url = (import.meta.env.VITE_API_URL || 'http://localhost:5005/api') + '/export/csv';
  window.open(url, '_blank');
}

export default api;
