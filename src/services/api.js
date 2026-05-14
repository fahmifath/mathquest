const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('mq_token');

/**
 * Header standar untuk request yang butuh autentikasi.
 */
export const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

/**
 * Header untuk request publik (tanpa token).
 */
export const publicHeader = () => ({
  'Content-Type': 'application/json',
});

/**
 * Wrapper fetch utama.
 * Otomatis parse JSON dan lempar error jika success: false.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const json = await res.json();

  if (!json.success) {
    // Lempar error dengan pesan dari backend
    const err = new Error(json.message || 'Terjadi kesalahan');
    err.status = res.status;
    err.errors = json.errors || null;
    throw err;
  }

  return json.data;
};