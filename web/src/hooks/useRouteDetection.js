/**
 * useRouteDetection Hook
 *
 * Hook separado para detectar rutas y estado de navegación
 * Evita dependencias circulares con otros hooks
 */

import { useLocation } from 'react-router-dom';

export const useRouteDetection = () => {
  const location = useLocation();

  // Detectar si estamos en una ruta específica
  const isOnDeckPage = location.pathname.startsWith('/decks/');
  const isOnStudyPage = location.pathname.startsWith('/study');
  const isOnHome = location.pathname === '/';

  // Extraer información de la ruta actual
  const getCurrentDeckId = () => {
    if (isOnDeckPage) {
      const match = location.pathname.match(/^\/decks\/(\d+)$/);
      return match ? parseInt(match[1]) : null;
    }
    return null;
  };

  const getCurrentStudySessionId = () => {
    if (location.pathname.startsWith('/study/session/')) {
      const match = location.pathname.match(/^\/study\/session\/([^/]+)$/);
      return match ? match[1] : null;
    }
    return null;
  };

  return {
    // Estado de navegación
    isOnDeckPage,
    isOnStudyPage,
    isOnHome,
    currentDeckId: getCurrentDeckId(),
    currentSessionId: getCurrentStudySessionId(),
    currentPath: location.pathname,
    canGoBack: !isOnHome
  };
};
