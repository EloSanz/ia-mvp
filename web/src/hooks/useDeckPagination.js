import { useState, useEffect, useMemo } from 'react';

const useDeckPagination = (decks = [], initialItemsPerPage = 8) => {
  // Función para obtener valores del localStorage con fallbacks
  const getStoredValue = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  // Función para guardar valores en localStorage
  const setStoredValue = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error saving ${key} to localStorage:`, error);
    }
  };

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => 
    getStoredValue('deck_pagination_itemsPerPage', initialItemsPerPage)
  );
  
  // Estado de ordenamiento con persistencia
  const [sortBy, setSortBy] = useState(() => 
    getStoredValue('deck_pagination_sortBy', 'updatedAt')
  );
  const [sortOrder, setSortOrder] = useState(() => 
    getStoredValue('deck_pagination_sortOrder', 'desc')
  );

  // Calcular total de páginas
  const totalPages = Math.ceil(decks.length / itemsPerPage);

  // Función para ordenar los decks
  const sortDecks = (decksToSort, sortField, order) => {
    return [...decksToSort].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Manejar fechas
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Manejar strings (case insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  };

  // Decks ordenados
  const sortedDecks = useMemo(() => {
    return sortDecks(decks, sortBy, sortOrder);
  }, [decks, sortBy, sortOrder]);

  // Decks paginados
  const paginatedDecks = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedDecks.slice(startIndex, endIndex);
  }, [sortedDecks, currentPage, itemsPerPage]);

  // Función para cambiar página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Función para cambiar elementos por página
  const handleItemsPerPageChange = (newItemsPerPage) => {
    const newValue = parseInt(newItemsPerPage, 10);
    setItemsPerPage(newValue);
    setStoredValue('deck_pagination_itemsPerPage', newValue);
    setCurrentPage(0); // Resetear a la primera página
  };

  // Función para cambiar ordenamiento
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setStoredValue('deck_pagination_sortBy', newSortBy);
    setStoredValue('deck_pagination_sortOrder', newSortOrder);
    setCurrentPage(0); // Resetear a la primera página
  };

  // Resetear paginación cuando cambien los decks
  useEffect(() => {
    setCurrentPage(0);
  }, [decks.length]);

  // Ajustar página actual si excede el total de páginas
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  // Sincronizar cambios de estado con localStorage
  useEffect(() => {
    setStoredValue('deck_pagination_sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    setStoredValue('deck_pagination_sortOrder', sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    setStoredValue('deck_pagination_itemsPerPage', itemsPerPage);
  }, [itemsPerPage]);

  return {
    // Datos paginados
    paginatedDecks,
    sortedDecks,
    
    // Estado de paginación
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: decks.length,
    
    // Estado de ordenamiento
    sortBy,
    sortOrder,
    
    // Funciones
    handlePageChange,
    handleItemsPerPageChange,
    handleSortChange,
    
    // Información adicional
    hasItems: decks.length > 0,
    isEmpty: decks.length === 0,
    isFirstPage: currentPage === 0,
    isLastPage: currentPage >= totalPages - 1
  };
};

export default useDeckPagination;
