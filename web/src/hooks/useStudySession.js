/**
 * useStudySession Hook
 *
 * Hook personalizado para manejar sesiones de estudio de flashcards
 * Gestiona el estado completo de una sesión de estudio con repetición espaciada
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '../contexts/ApiContext';

export const useStudySession = () => {
  const { study } = useApi();

  // Estado de la sesión
  const [session, setSession] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado de respuesta
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const responseStartTime = useRef(null);

  // Estadísticas en tiempo real
  const [sessionStats, setSessionStats] = useState({
    cardsReviewed: 0,
    easyCount: 0,
    normalCount: 0,
    hardCount: 0,
    timeSpent: 0,
    averageResponseTime: 0
  });

  // Timer para el tiempo de respuesta
  const timerRef = useRef(null);

  /**
   * Iniciar nueva sesión de estudio
   */
  const startSession = useCallback(async (deckId, limit = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await study.startSession(deckId, limit);
      const sessionData = response.data.data;

      setSession({
        id: sessionData.sessionId,
        deckName: sessionData.deckName,
        totalCards: sessionData.totalCards,
        status: 'active'
      });

      setCurrentCard(sessionData.currentCard);
      setSessionStats(sessionData.sessionStats);
      setShowingAnswer(false);
      setResponseTime(0);

      // Iniciar timer de respuesta
      responseStartTime.current = Date.now();
      timerRef.current = setInterval(() => {
        if (responseStartTime.current) {
          setResponseTime(Date.now() - responseStartTime.current);
        }
      }, 100);

      return sessionData;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [study]);

  /**
   * Mostrar respuesta de la card actual
   */
  const showAnswer = useCallback(() => {
    if (currentCard && !showingAnswer) {
      setShowingAnswer(true);
      // Detener el timer cuando se muestra la respuesta
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [currentCard, showingAnswer]);

  /**
   * Revisar card con dificultad
   */
  const reviewCard = useCallback(async (difficulty) => {
    if (!session?.id || !currentCard?.id) {
      throw new Error('Sesión o card no válida');
    }

    setLoading(true);
    setError(null);

    try {
      // Calcular tiempo de respuesta final
      const finalResponseTime = responseStartTime.current
        ? Math.round((Date.now() - responseStartTime.current) / 1000)
        : 0;

      const response = await study.reviewCard(
        session.id,
        currentCard.id,
        difficulty,
        finalResponseTime
      );

      const reviewData = response.data.data;

      // Actualizar estadísticas
      setSessionStats(reviewData.sessionStats);

      // Resetear estado para siguiente card
      setShowingAnswer(false);
      setResponseTime(0);
      responseStartTime.current = null;

      // Detener timer anterior
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      return reviewData;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al revisar card');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, currentCard, study]);

  /**
   * Obtener siguiente card
   */
  const nextCard = useCallback(async () => {
    if (!session?.id) {
      throw new Error('No hay sesión activa');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await study.getNextCard(session.id);
      const nextData = response.data.data;

      setCurrentCard(nextData.currentCard);
      setSessionStats(nextData.sessionStats);
      setShowingAnswer(false);

      // Reiniciar timer para nueva card
      responseStartTime.current = Date.now();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        if (responseStartTime.current) {
          setResponseTime(Date.now() - responseStartTime.current);
        }
      }, 100);

      return nextData;
    } catch (err) {
      // Si no hay más cards, terminar la sesión automáticamente
      if (err.response?.status === 400 && err.response?.data?.message?.includes('No hay más')) {
        await finishSession();
        return null;
      }

      setError(err.response?.data?.message || 'Error al obtener siguiente card');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, study]);

  /**
   * Obtener estado actual de la sesión
   */
  const getSessionStatus = useCallback(async () => {
    if (!session?.id) {
      return null;
    }

    try {
      const response = await study.getSessionStatus(session.id);
      const statusData = response.data.data;

      setSessionStats(statusData.sessionStats);
      return statusData;
    } catch (err) {
      if (err.response?.status === 404) {
        // Sesión expirada o no encontrada
        setSession(null);
        setCurrentCard(null);
        setError('Sesión expirada');
      }
      throw err;
    }
  }, [session, study]);

  /**
   * Finalizar sesión
   */
  const finishSession = useCallback(async () => {
    if (!session?.id) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await study.finishSession(session.id);
      const finishData = response.data.data;

      // Limpiar estado
      setSession(null);
      setCurrentCard(null);
      setShowingAnswer(false);
      setResponseTime(0);
      setSessionStats({
        cardsReviewed: 0,
        easyCount: 0,
        normalCount: 0,
        hardCount: 0,
        timeSpent: 0,
        averageResponseTime: 0
      });

      // Limpiar timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      responseStartTime.current = null;

      return finishData;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al finalizar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, study]);

  /**
   * Calcular progreso de la sesión
   */
  const getProgress = useCallback(() => {
    if (!session?.totalCards) return { current: 0, total: 0, percentage: 0 };

    const current = sessionStats.cardsReviewed;
    const total = session.totalCards;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return { current, total, percentage };
  }, [session, sessionStats]);

  /**
   * Formatear tiempo para display
   */
  const formatTime = useCallback((milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  }, []);

  /**
   * Limpiar estado al desmontar
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    // Estado
    session,
    currentCard,
    loading,
    error,
    showingAnswer,
    responseTime,
    sessionStats,

    // Acciones
    startSession,
    showAnswer,
    reviewCard,
    nextCard,
    getSessionStatus,
    finishSession,

    // Utilidades
    getProgress,
    formatTime,

    // Helpers
    hasActiveSession: !!session?.id,
    canShowAnswer: !!currentCard && !showingAnswer,
    canReview: !!currentCard && showingAnswer,
    hasNextCard: !!currentCard
  };
};
