/**
 * useNavigation Hook
 *
 * Hook personalizado para navegación inteligente en la aplicación
 * Detecta rutas específicas y proporciona navegación contextual
 */

import { useNavigate } from 'react-router-dom';
import { useLastDeck } from './useLastDeck';
import { useRouteDetection } from './useRouteDetection';
import { useApi } from '../contexts/ApiContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

export const useNavigation = () => {
  const navigate = useNavigate();
  const { decks } = useApi();
  const { token } = useAuth();
  const { lastDeckId, hasLastDeck, clearLastDeck } = useLastDeck();
  const routeInfo = useRouteDetection();

  // Estado para validar si el último deck existe
  const [lastDeckExists, setLastDeckExists] = useState(null); // null = loading, true = exists, false = doesn't exist

  // Ref para evitar múltiples validaciones del mismo deck
  const validatedDecksRef = useRef(new Set());

  // Resetear ref cuando cambie lastDeckId
  useEffect(() => {
    validatedDecksRef.current.clear();
  }, [lastDeckId]);

  // Validar si el último deck guardado aún existe
  useEffect(() => {
    const validateLastDeck = async () => {
      if (lastDeckId && hasLastDeck && token && !validatedDecksRef.current.has(lastDeckId)) {
        validatedDecksRef.current.add(lastDeckId);
        try {
          await decks.getById(lastDeckId);
          setLastDeckExists(true);
        } catch (error) {
          // Si el deck no existe, limpiarlo del localStorage
          console.warn(`Deck ${lastDeckId} no encontrado, limpiando localStorage`);
          clearLastDeck();
          setLastDeckExists(false);
        }
      } else if (!lastDeckId || !hasLastDeck) {
        setLastDeckExists(false);
      }
      // Si no hay token, mantener el estado en loading (null)
    };

    validateLastDeck();
  }, [lastDeckId, hasLastDeck, token]);

  // Extraer información de la ruta usando el hook separado
  const {
    isOnDeckPage,
    isOnStudyPage,
    isOnHome,
    currentDeckId,
    currentSessionId,
    currentPath,
    canGoBack
  } = routeInfo;

  // Funciones de navegación inteligente
  const goToDecks = () => {
    navigate('/');
  };

  const goToDeck = (deckId) => {
    navigate(`/decks/${deckId}`);
  };

  const goToLastDeck = () => {
    if (lastDeckId && lastDeckExists) {
      // Llevar al deck que estaba estudiando
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
      items.push(
        { label: 'Mis Decks', path: '/', onClick: goToDecks }
      );
    } else if (currentPath === '/study') {
      items.push(
        { label: 'Mis Decks', path: '/', onClick: goToDecks },
        { label: 'Estudiar', path: '/study', onClick: goToStudy }
      );
    } else if (currentPath.startsWith('/study/session/')) {
      const sessionId = currentSessionId;
      items.push(
        { label: 'Mis Decks', path: '/', onClick: goToDecks },
        { label: 'Estudiar', path: '/study', onClick: goToStudy },
        { label: `Sesión ${sessionId}`, path: currentPath }
      );
    } else if (currentPath === '/') {
      items.push({ label: 'Inicio', path: '/' });
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
      // Si estamos en home y tenemos un último deck visitado que existe, ir directamente a ese deck
      if (lastDeckExists) {
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
    currentDeckId,
    currentSessionId,
    lastDeckId,
    hasLastDeck,
    lastDeckExists,

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
    currentPath,
    canGoBack
  };
};
