/**
 * useNavigation Hook
 *
 * Hook personalizado para navegación inteligente en la aplicación
 * Detecta rutas específicas y proporciona navegación contextual
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useLastDeck } from './useLastDeck';

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lastDeckId, hasLastDeck, clearLastDeck } = useLastDeck();

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

  // Funciones de navegación inteligente
  const goToDecks = () => {
    navigate('/');
  };

  const goToDeck = (deckId) => {
    navigate(`/decks/${deckId}`);
  };

  const goToLastDeck = () => {
    if (lastDeckId) {
      navigate(`/decks/${lastDeckId}`);
    } else {
      goToDecks();
    }
  };

  const goToStudy = () => {
    navigate('/study');
  };

  const goToCurrentDeck = () => {
    const deckId = getCurrentDeckId();
    if (deckId) {
      navigate(`/decks/${deckId}`);
    } else {
      goToDecks();
    }
  };

  const goToStudySession = (deckId) => {
    navigate(`/study/session/${deckId}`);
  };

  const goBackToDecks = () => {
    // Si estamos en una página de deck, volver a la lista de decks
    // Si estamos en cualquier otra página, ir a la lista de decks
    navigate('/');
  };

  // Funciones de breadcrumb
  const getBreadcrumbItems = () => {
    const items = [];

    if (isOnDeckPage) {
      const deckId = getCurrentDeckId();
      items.push(
        { label: 'Mis Decks', path: '/', onClick: goToDecks },
        { label: `Deck ${deckId}`, path: `/decks/${deckId}`, onClick: () => goToDeck(deckId) }
      );
    } else if (location.pathname === '/study') {
      items.push(
        { label: 'Mis Decks', path: '/', onClick: goToDecks },
        { label: 'Estudiar', path: '/study', onClick: goToStudy }
      );
    } else if (location.pathname.startsWith('/study/session/')) {
      const sessionId = getCurrentStudySessionId();
      items.push(
        { label: 'Mis Decks', path: '/', onClick: goToDecks },
        { label: 'Estudiar', path: '/study', onClick: goToStudy },
        { label: `Sesión ${sessionId}`, path: location.pathname }
      );
    } else if (location.pathname === '/') {
      items.push({ label: 'Mis Decks', path: '/' });
    }

    return items;
  };

  // Determinar el texto del botón de navegación principal
  const getNavigationButtonText = () => {
    if (isOnDeckPage) {
      return 'Mis Decks';
    } else if (isOnStudyPage) {
      return 'Mis Decks';
    } else {
      return 'Inicio';
    }
  };

  // Determinar la acción del botón de navegación principal
  const getNavigationButtonAction = () => {
    if (isOnDeckPage || isOnStudyPage) {
      // Si estamos en páginas específicas, ir a la lista de decks
      return goToDecks;
    } else {
      // Si estamos en home y tenemos un último deck visitado, ir directamente a ese deck
      if (hasLastDeck) {
        return goToLastDeck;
      } else {
        return goToDecks;
      }
    }
  };

  return {
    // Estado de navegación
    isOnDeckPage,
    isOnStudyPage,
    isOnHome,
    currentDeckId: getCurrentDeckId(),
    currentSessionId: getCurrentStudySessionId(),
    lastDeckId,
    hasLastDeck,

    // Funciones de navegación
    goToDecks,
    goToDeck,
    goToLastDeck,
    goToStudy,
    goToCurrentDeck,
    goToStudySession,
    goBackToDecks,

    // Gestión del último deck
    clearLastDeck,

    // Breadcrumbs
    getBreadcrumbItems,

    // Botones inteligentes
    navigationButtonText: getNavigationButtonText(),
    navigationButtonAction: getNavigationButtonAction(),

    // Utilidades
    currentPath: location.pathname,
    canGoBack: !isOnHome
  };
};
