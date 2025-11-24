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
    // For debugging purposes
    //console.log('➡️ API Request:', config.method?.toUpperCase(), config.url, config.data || config.params);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    // For debugging purposes
    //console.log('✅ API Response:', response.status, response.config?.url, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url, error.message);

    // Si el servidor devuelve success: true, no es realmente un error
    if (error.response?.data?.success === true) {
      return Promise.resolve(error.response);
    }

    // Si es un error 500 pero el mensaje indica que es un 404 (recurso no encontrado)
    if (
      error.response?.status === 500 &&
      error.response?.data?.message?.includes('no encontrado')
    ) {
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
    if (error.response && error.response.status === 401) {
      // Redirige al usuario al login
      window.location.href = '/login';
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

// Interceptor duplicado removido - el token ya se maneja en el primer interceptor

export const ApiProvider = ({ children }) => {
  // Decks API
  const decks = {
    getAll: () => api.get('/api/decks'),
    getById: (id) => api.get(`/api/decks/${id}`),
    getCoverStatusById: (id) => api.get(`/api/decks/${id}/cover-status`),
    create: (data) => api.post('/api/decks', data, { timeout: 30000 }),
    update: (id, data) => api.put(`/api/decks/${id}`, data),
    delete: (id) => api.delete(`/api/decks/${id}`),
    // Nuevos métodos para generación con IA
    suggestTopics: (count = 3) => api.post('/api/decks/suggest-topics', { count }),
    generateWithAI: (config) => api.post('/api/decks/generate-with-ai', config, {
      timeout: 120000  // 2 minutos para generación completa
    }),
    generateFromDocument: (formData) => api.post('/api/decks/generate-from-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 180000, // 3 minutos para documentos (suficiente para procesamiento con IA)
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log('Upload progress:', percentCompleted + '%');
      }
    }),
    // Métodos para biblioteca
    updateVisibility: (id, visibility) => api.patch(`/api/decks/${id}/visibility`, { visibility }),
    clone: (id) => api.post(`/api/decks/${id}/clone`)
  };

  // Flashcards API
  const flashcards = {
    getAll: () => api.get('/api/flashcards'),
    getById: (id) => api.get(`/api/flashcards/${id}`),
    getByDeck: (deckId, { page = 0, pageSize = 15, tagId = null } = {}) => {
      const params = {};
      if (page !== undefined && page !== null) params.page = page;
      if (pageSize !== undefined && pageSize !== null) params.pageSize = pageSize;
      if (tagId !== undefined && tagId !== null) params.tagId = tagId;

      return api.get(`/api/flashcards/deck/${deckId}`, { params });
    },
    getDue: () => api.get('/api/flashcards/due'),
    create: (data) => api.post('/api/flashcards', data),
    createMany: (flashcardsInput) => {
      // Si ya viene como { flashcards: [...] }, lo usa tal cual
      // Si viene como array, lo envuelve correctamente
      const payload = Array.isArray(flashcardsInput)
        ? { flashcards: flashcardsInput }
        : flashcardsInput;
      return api.post('/api/flashcards/batch', payload);
    },
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
    generateWithAI: (text, options = {}) => {
      const { timeout = 90000, retries = 1 } = options;
      return api.post('/api/flashcards/ai-generate', { text }, { timeout });
    }
  };

  // Tags API (RESTful, anidadas bajo decks)
  const tags = {
    // Obtener todas las tags de un deck
    getByDeckId: (deckId) => api.get(`/api/decks/${deckId}/tags`),
    // Obtener una tag específica de un deck
    getById: (deckId, tagId) => api.get(`/api/decks/${deckId}/tags/${tagId}`),
    // Crear una tag en un deck
    create: (deckId, data) => api.post(`/api/decks/${deckId}/tags`, data),
    // Actualizar una tag de un deck
    update: (deckId, tagId, data) => api.put(`/api/decks/${deckId}/tags/${tagId}`, data),
    // Eliminar una tag de un deck
    delete: (deckId, tagId) => api.delete(`/api/decks/${deckId}/tags/${tagId}`)
  };

  // Sync API (para futuras integraciones)
  const sync = {
    checkAnki: () => api.get('/api/sync/anki/status'),
    syncWithAnki: (deckId) => api.post(`/api/sync/anki/sync${deckId ? `/${deckId}` : ''}`),
    getStats: () => api.get('/api/sync/stats')
  };

  // Study API - Sistema de repetición espaciada
  const study = {
    // Iniciar sesión de estudio
    startSession: (deckId, limit, tagId) => api.post('/api/study/start', { deckId, limit, tagId }),

    // Obtener siguiente card
    getNextCard: (sessionId) => api.get(`/api/study/${sessionId}/next`),

    // Revisar card
    reviewCard: (sessionId, cardId, difficulty, responseTime) =>
      api.post(`/api/study/${sessionId}/review`, {
        cardId,
        difficulty,
        responseTime
      }),

    // Obtener estado de sesión
    getSessionStatus: (sessionId) => api.get(`/api/study/${sessionId}/status`),

    // Finalizar sesión
    finishSession: (sessionId) => api.post(`/api/study/${sessionId}/finish`),

    // Estadísticas globales (admin)
    getGlobalStats: () => api.get('/api/study/stats')
  };

  // Library API - Biblioteca pública de decks
  const library = {
    // Obtener todos los decks públicos
    getAll: (search = '', sortBy = 'recent') => api.get('/api/library', {
      params: { search, sortBy }
    }),
    // Obtener preview de un deck público
    getPreview: (deckId) => api.get(`/api/library/${deckId}`)
  };

  // Health check
  const health = {
    check: () => api.get('/api/health'),
    detailed: () => api.get('/api/health/detailed')
  };

  const value = {
    decks,
    flashcards,
    tags,
    sync,
    study,
    library,
    health
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
