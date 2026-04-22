const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = rawUrl.replace(/\/+$/, ''); // Safely strip any trailing slashes
export default API_URL;
