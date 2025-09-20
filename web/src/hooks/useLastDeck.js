/**
 * useLastDeck Hook
 *
 * Hook personalizado para recordar el último deck visitado
 * Permite navegación inteligente al último deck visto
 */

import { useEffect } from 'react';
import { useNavigation } from './useNavigation';

const LAST_DECK_KEY = 'lastVisitedDeck';

export const useLastDeck = () => {
  const { currentDeckId, isOnDeckPage } = useNavigation();

  // Guardar el último deck visitado
  useEffect(() => {
    if (isOnDeckPage && currentDeckId) {
      localStorage.setItem(LAST_DECK_KEY, currentDeckId.toString());
    }
  }, [isOnDeckPage, currentDeckId]);

  // Obtener el último deck visitado
  const getLastDeckId = () => {
    const lastDeck = localStorage.getItem(LAST_DECK_KEY);
    return lastDeck ? parseInt(lastDeck) : null;
  };

  // Limpiar el último deck guardado
  const clearLastDeck = () => {
    localStorage.removeItem(LAST_DECK_KEY);
  };

  // Verificar si hay un último deck guardado
  const hasLastDeck = () => {
    return localStorage.getItem(LAST_DECK_KEY) !== null;
  };

  return {
    lastDeckId: getLastDeckId(),
    hasLastDeck: hasLastDeck(),
    clearLastDeck
  };
};
