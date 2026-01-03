import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_APP_URL || 'http://localhost/api';
const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

// Configuration de base d'axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Intercepteur de requête - Ajoute le token d'authentification
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gère les erreurs d'authentification
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// Fonction de LOGIN
// ============================================
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/login', {
      email,
      password,
    });

    const { access_token, token_type, user } = response.data;

    // Stocker le token et les données utilisateur
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem('token_type', token_type);

    return {
      success: true,
      user,
      token: access_token,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Erreur de connexion',
    };
  }
};

// ============================================
// Fonction de LOGOUT
// ============================================
export const logout = async () => {
  try {
    await axiosInstance.post('/logout');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token_type');
    return { success: true };
  } catch (error) {
    // Même en cas d'erreur, on supprime les données locales
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token_type');
    return { success: true };
  }
};

// ============================================
// Fonctions de requête HTTP
// ============================================

// GET
export const apiGet = async (endpoint, config = {}) => {
  try {
    const response = await axiosInstance.get(endpoint, config);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// POST
export const apiPost = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.post(endpoint, data, config);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// PUT
export const apiPut = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.put(endpoint, data, config);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// DELETE
export const apiDelete = async (endpoint, config = {}) => {
  try {
    const response = await axiosInstance.delete(endpoint, config);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// ============================================
// Fonctions utilitaires
// ============================================

// Récupérer le token stocké
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Récupérer les données utilisateur
export const getUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Vérifier si l'utilisateur est authentifié
export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

// Exporter l'instance axios pour utilisation directe si nécessaire
export default axiosInstance;
