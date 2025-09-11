import React, { createContext, useContext } from 'react';
import axios from 'axios';

// Configurar axios con la URL base
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
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

export const ApiProvider = ({ children }) => {
  // Decks API
  const decks = {
    getAll: () => api.get('/decks'),
    getById: (id) => api.get(`/decks/${id}`),
    create: (data) => api.post('/decks', data),
    update: (id, data) => api.put(`/decks/${id}`, data),
    delete: (id) => api.delete(`/decks/${id}`)
  };

  // Flashcards API
  const flashcards = {
    getAll: () => api.get('/flashcards'),
    getById: (id) => api.get(`/flashcards/${id}`),
    getByDeck: (deckId, { page = 0, pageSize = 15 } = {}) =>
      api.get(`/flashcards/deck/${deckId}`, { params: { page, pageSize } }),
    getDue: () => api.get('/flashcards/due'),
    create: (data) => api.post('/flashcards', data),
    createMany: (flashcards) => api.post('/flashcards/batch', { flashcards }),
    update: (id, data) => api.put(`/flashcards/${id}`, data),
    review: (id, data) => api.put(`/flashcards/${id}/review`, data),
    delete: (id) => api.delete(`/flashcards/${id}`),
    search: (query, deckId) =>
      api.get('/flashcards/search', {
        params: { q: query, deckId }
      })
  };

  // Sync API (para futuras integraciones)
  const sync = {
    checkAnki: () => api.get('/sync/anki/status'),
    syncWithAnki: (deckId) => api.post(`/sync/anki/sync${deckId ? `/${deckId}` : ''}`),
    getStats: () => api.get('/sync/stats')
  };

  const value = {
    decks,
    flashcards,
    sync
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
