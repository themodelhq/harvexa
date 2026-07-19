import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('harvexa_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function fileDownloadUrl(jobId, format) {
  const token = localStorage.getItem('harvexa_token');
  return `${API_URL}/api/export/${jobId}/${format}?token=${encodeURIComponent(token || '')}`;
}

// Excel/CSV/JSON downloads need auth, but a plain <a href> can't send headers,
// so we fetch as a blob and trigger the save client-side instead.
export async function downloadExport(jobId, format, suggestedName) {
  const res = await api.get(`/export/${jobId}/${format}`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', suggestedName || `harvexa_export.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default api;
