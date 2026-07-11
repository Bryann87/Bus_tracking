import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: reemplaza esta IP por la IP local de tu computadora
// (donde corre `php artisan serve`). No uses "localhost" porque el
// celular/emulador no podría alcanzar tu PC.
// Ejemplo: si tu PC tiene IP 192.168.1.50 -> 'http://192.168.1.50:8000/api'
export const API_URL = 'http://192.168.0.8:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Adjunta el token guardado a cada petición
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira o es inválido, limpia la sesión guardada
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

export default api;
