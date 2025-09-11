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

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
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
    getByDeck: (deckId, { page = 0, pageSize = 15 } = {}) =>
      api.get(`/api/flashcards/deck/${deckId}`, { params: { page, pageSize } }),
    getDue: () => api.get('/api/flashcards/due'),
    create: (data) => api.post('/api/flashcards', data),
    createMany: (flashcards) => api.post('/api/flashcards/batch', { flashcards }),
    update: (id, data) => api.put(`/api/flashcards/${id}`, data),
    review: (id, data) => api.put(`/api/flashcards/${id}/review`, data),
    delete: (id) => api.delete(`/api/flashcards/${id}`),
    search: (query, deckId) =>
      api.get('/api/flashcards/search', {
        params: { q: query, deckId }
      })
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
    sync
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
