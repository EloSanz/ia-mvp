import React, { createContext, useContext } from 'react';
import axios from 'axios';

// Configurar axios con la URL base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token de autorización
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url, error.message);

    // Si el servidor devuelve success: true, no es realmente un error
    if (error.response?.data?.success === true) {
      return Promise.resolve(error.response);
    }

    // Si es un error 500 pero el mensaje indica que es un 404 (recurso no encontrado)
    if (error.response?.status === 500 && error.response?.data?.message?.includes('no encontrado')) {
      // Crear una nueva respuesta con status 404
      const notFoundResponse = {
        ...error.response,
        status: 404,
        statusText: 'Not Found',
        data: {
          ...error.response.data,
          success: false,
          message: 'Recurso no encontrado',
          statusCode: 404
        }
      };
      return Promise.reject({
        ...error,
        response: notFoundResponse
      });
    }

    return Promise.reject(error);
  }
);

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ApiProvider = ({ children }) => {
  // Decks API
  const decks = {
    getAll: () => api.get('/api/decks'),
    getById: (id) => api.get(`/api/decks/${id}`),
    create: (data) => api.post('/api/decks', data),
    update: (id, data) => api.put(`/api/decks/${id}`, data),
    delete: (id) => api.delete(`/api/decks/${id}`)
  };

  // Flashcards API
  const flashcards = {
    getAll: () => api.get('/api/flashcards'),
    getById: (id) => api.get(`/api/flashcards/${id}`),
    getByDeck: (deckId, { page = 0, pageSize = 15 } = {}) => {
      const params = {};
      if (page !== undefined && page !== null) params.page = page;
      if (pageSize !== undefined && pageSize !== null) params.pageSize = pageSize;

      return api.get(`/api/flashcards/deck/${deckId}`, { params });
    },
    getDue: () => api.get('/api/flashcards/due'),
    create: (data) => api.post('/api/flashcards', data),
    createMany: (flashcards) => api.post('/api/flashcards/batch', { flashcards }),
    update: (id, data) => api.put(`/api/flashcards/${id}`, data),
    review: (id, data) => api.put(`/api/flashcards/${id}/review`, data),
    delete: (id) => api.delete(`/api/flashcards/${id}`),
    search: (query, deckId) =>
      api.get('/api/flashcards/search', {
        params: { q: query, deckId }
      }),
    searchInDeck: (deckId, consigna, { page = 0, pageSize = 15 } = {}) =>
      api.get(`/api/flashcards/deck/${deckId}/search`, {
        params: { q: consigna, page, pageSize }
      }),
    generateWithAI: (text) => api.post('/api/flashcards/ai-generate', { text })
  };

  // Tags API
  const tags = {
    getAll: () => api.get('/api/tags'),
    getById: (id) => api.get(`/api/tags/${id}`),
    create: (data) => api.post('/api/tags', data),
    update: (id, data) => api.put(`/api/tags/${id}`, data),
    delete: (id) => api.delete(`/api/tags/${id}`)
  };

  // Sync API (para futuras integraciones)
  const sync = {
    checkAnki: () => api.get('/api/sync/anki/status'),
    syncWithAnki: (deckId) => api.post(`/api/sync/anki/sync${deckId ? `/${deckId}` : ''}`),
    getStats: () => api.get('/api/sync/stats')
  };

  const value = {
    decks,
    flashcards,
    tags,
    sync
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
