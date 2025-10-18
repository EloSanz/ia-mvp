import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  Alert,
  CircularProgress,
  Box,
  useTheme as useMuiTheme,
  Fab,
  Tooltip,
  Typography,
  IconButton,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AddCard as AddCardIcon,
  SmartToy as AIIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  RestartAlt as RestartAltIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import FlashcardTable from '../components/deckPage/FlashcardTable';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import AIFlashcardsGenerator from '../components/deckPage/AIFlashcardsGenerator';
import CreateFlashcardModal from '../components/deckPage/CreateFlashcardModal';
import EditFlashcardModal from '../components/deckPage/EditFlashcardModal';
import ReviewFlashcardModal from '../components/deckPage/ReviewFlashcardModal';
import { useFlashcardManager } from '../hooks/useFlashcardManager';

const DeckPage = () => {
  const muiTheme = useMuiTheme();
  const { themeName } = useAppTheme();
  const { token } = useAuth();
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { flashcards, decks, tags: tagsService } = useApi();

  // Estado
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);

  // Búsqueda y paginación
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);

  // Filtro de dificultad
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Filtro de tags
  const [tagFilter, setTagFilter] = useState('all');

  // Filtro de revisiones
  const [reviewFilter, setReviewFilter] = useState('all');

  // Estados para tags y paginación
  const [tags, setTags] = useState([]); // Lista de tags disponibles
  const [newCardTagId, setNewCardTagId] = useState('');
  const [_editingCardTagId, _setEditingCardTagId] = useState('');

  // Ref para evitar múltiples llamadas al mismo deck
  const fetchedDeckRef = useRef(new Set());

  // Resetear el ref cuando cambie el deckId
  useEffect(() => {
    fetchedDeckRef.current.clear();
  }, [deckId]);

  // Hook personalizado para manejar flashcards
  const flashcardManager = useFlashcardManager(deckId);
  const currentPage = flashcardManager.page;

  // Estado local para paginación
  const getInitialRowsPerPage = () => {
    const stored = localStorage.getItem('deck_rows_per_page');
    return stored ? parseInt(stored, 10) : 15;
  };
  const [rowsPerPage, setRowsPerPageState] = useState(getInitialRowsPerPage);
  const [page, setPage] = useState(0);

  // Carga inicial y al cambiar filtros y tags
  useEffect(() => {
    // Cargar tags protegidas por token
    const loadTags = async () => {
      try {
        const response = await tagsService.getByDeckId(deckId);
        const tagsList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
        setTags(tagsList);
      } catch (error) {
        console.error('Error cargando tags:', error);
        setTags([]);
      }
    };

    if (token) {
      loadTags();
    }
    // Cargar deck/cards según búsqueda y paginación
    if (!searchQuery) {
      loadDeckAndCards(currentPage, rowsPerPage);
    } else {
      handleSearch(searchQuery, currentPage, rowsPerPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, currentPage, rowsPerPage, searchQuery, token]);

  const loadDeckAndCards = async (p = 0, pageSize = 15) => {
    try {
      setLoading(true);

      const deckKey = `${deckId}_${p}_${pageSize}`;

      const [deckResponse, cardsResponse] = await Promise.all([
        decks.getById(deckId),
        flashcards.getByDeck(deckId, { page: p, pageSize })
      ]);

      // Marcar como fetched
      fetchedDeckRef.current.add(deckKey);

      // console.debug('✅ Loaded flashcards:', cardsResponse.data?.data?.length || 0);

      // Verificar si la respuesta tiene la estructura correcta
      const cardsData = cardsResponse.data.data || cardsResponse.data || [];
      const totalCount = cardsResponse.data.total || cardsResponse.data.length || 0;

      setDeck(deckResponse.data.data);
      setCards(Array.isArray(cardsData) ? cardsData : []);
      setTotalCards(totalCount);
      setSearchResults([]);
      setSearchTotal(0);
      setError(null);
    } catch (err) {
      setError('Error al cargar el deck y las flashcards');
      console.error('❌ Error loading deck and cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query, p = flashcardManager.page, pageSize = rowsPerPage) => {
    try {
      setSearching(true);
      const res = await flashcards.searchInDeck(deckId, query, { page: p, pageSize });
      setSearchResults(res.data.data || []);
      setSearchTotal(res.data.total || 0);
      setError(null);
    } catch (err) {
      setError('Error al buscar flashcards');
      setSearchResults([]);
      setSearchTotal(0);
      console.error('Error searching flashcards:', err);
    } finally {
      setSearching(false);
    }
  };

  // Función para manejar el cambio en el input de búsqueda
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Si el query está vacío, volver a cargar todas las cards
    if (!query.trim()) {
      loadDeckAndCards(flashcardManager.page, rowsPerPage);
    } else {
      // Debounced search - esperar 300ms antes de buscar
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        if (query.trim()) {
          handleSearch(query.trim(), 0, rowsPerPage);
        }
      }, 300);
    }
  };

  // Función para manejar cambios de página durante búsqueda o listado normal
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    if (searchQuery.trim()) {
      handleSearch(searchQuery.trim(), newPage, rowsPerPage);
    } else {
      loadDeckAndCards(newPage, rowsPerPage);
    }
  };

  // Función para manejar cambios en la cantidad de filas por página
  const setRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPageState(newRowsPerPage);
    localStorage.setItem('deck_rows_per_page', newRowsPerPage);
    setPage(0);
    if (searchQuery.trim()) {
      handleSearch(searchQuery.trim(), 0, newRowsPerPage);
    } else {
      loadDeckAndCards(0, newRowsPerPage);
    }
  };

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchTotal(0);
    setPage(0);
    loadDeckAndCards(flashcardManager.page, rowsPerPage);
  };

  // Función para manejar cambios en el filtro de dificultad
  const handleDifficultyFilterChange = (value) => {
    setDifficultyFilter(value);
    setPage(0);
  };

  // Función para manejar cambios en el filtro de tags
  const handleTagFilterChange = (value) => {
    setTagFilter(value);
    setPage(0);
  };

  // Función para manejar cambios en el filtro de revisiones
  const handleReviewFilterChange = (value) => {
    setReviewFilter(value);
    setPage(0);
  };

  const handleCreateCard = async () => {
    const createData = {
      ...flashcardManager.newCard,
      deckId: parseInt(deckId)
    };

    // Solo incluir tagId si existe
    if (newCardTagId) {
      createData.tagId = parseInt(newCardTagId);
    }

    await flashcardManager.createCard(() => {
      setNewCardTagId('');
      setPage(0); // <-- vuelve a la primera página
      loadDeckAndCards(0, rowsPerPage); // <-- usa el valor actual de rowsPerPage
    });
  };

  const handleGeneratedCards = async (generatedCards) => {
    try {
      await flashcards.createMany({
        flashcards: generatedCards.map((card) => ({
          ...card,
          deckId: deckId
        }))
      });
      setPage(0); // <-- vuelve a la primera página
      loadDeckAndCards(0, rowsPerPage); // <-- usa el valor actual de rowsPerPage
    } catch (err) {
      console.error('❌ Error creating generated flashcards:', err);
    }
  };

  const handleEditCard = async () => {
    await flashcardManager.updateCard(() => {
      loadDeckAndCards(flashcardManager.page, flashcardManager.rowsPerPage);
    });
  };

  const handleDeleteCard = (cardId) => {
    flashcardManager.handleDeleteCard(cardId);
  };

  const confirmDeleteCard = async () => {
    try {
      await flashcardManager.deleteCard(() => {
        setError(null);
        loadDeckAndCards(flashcardManager.page, flashcardManager.rowsPerPage);
      });
    } catch (err) {
      console.error('❌ Error deleting flashcard:', err);

      // Si la flashcard no existe (404), simplemente refrescar la lista
      if (err.response?.status === 404 || err.response?.data?.message?.includes('no encontrado')) {
        flashcardManager.closeAllModals();
        setError(null);
        loadDeckAndCards(flashcardManager.page, flashcardManager.rowsPerPage);
        return;
      }

      // Para otros errores, mostrar mensaje de error
      setError('Error al eliminar la flashcard');
    }
  };

  const handleReviewCard = async (difficulty) => {
    await flashcardManager.reviewCard(difficulty, () => {
      loadDeckAndCards(flashcardManager.page, flashcardManager.rowsPerPage);
    });
  };

  // Función para actualizar localmente la tag de una card
  const onCardTagUpdated = (cardId, tagId) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, tagId } : c)));
  };

  const openEditDialog = (card) => {
    flashcardManager.openEditDialog(card);
  };

  const openReviewDialog = (card) => {
    flashcardManager.openReviewDialog(card);
  };

  // Limpiar timeout de búsqueda cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
    };
  }, []);

  const _getDifficultyColor = (d) =>
    d === 1 ? 'success' : d === 2 ? 'warning' : d === 3 ? 'error' : 'default';
  const _getDifficultyLabel = (d) =>
    d === 1 ? 'Fácil' : d === 2 ? 'Normal' : d === 3 ? 'Difícil' : 'Sin dificultad';

  // Loading
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  // Deck no encontrado
  if (!deck) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          backgroundColor: muiTheme.palette.background.default,
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        {(themeName === 'kyoto' || themeName === 'tokyo') && (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: -1,
              width: '100vw',
              height: '100vh',
              background: `url(${themeName === 'kyoto' ? '/kyoto.png' : '/tokyo.png'}) center/cover no-repeat`,
              filter: 'blur(8px) brightness(1.08)',
              opacity: 0.7
            }}
          />
        )}
        <Alert severity="error">Deck no encontrado</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Volver al Inicio
        </Button>
      </Container>
    );
  }

  // Render principal cuando el deck existe
  return (
    <>
      <Navigation />
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          position: 'relative',
          minHeight: '100vh',
          fontFamily: muiTheme.fontFamily,
          backgroundColor: muiTheme.palette.background.default
        }}
      >
        {/* Breadcrumbs para navegación contextual */}
        <Breadcrumbs />

        {/* Información del deck */}
        {deck && (
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontFamily: muiTheme.fontFamily }}
            >
              {deck.name}
            </Typography>
            {deck.description && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontFamily: muiTheme.fontFamily }}
              >
                descripción: {deck.description}
              </Typography>
            )}
          </Box>
        )}

        {/* Error message */}
        {_error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {_error}
          </Alert>
        )}

        {(themeName === 'kyoto' || themeName === 'tokyo') && (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: -1,
              width: '100vw',
              height: '100vh',
              background: `url(${themeName === 'kyoto' ? '/kyoto.png' : '/tokyo.png'}) center/cover no-repeat`,
              filter: 'blur(8px) brightness(1.08)',
              opacity: 0.7
            }}
          />
        )}

        <FlashcardTable
          cards={cards}
          tags={tags}
          muiTheme={muiTheme}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCards={totalCards}
          searchQuery={searchQuery}
          searchResults={searchResults}
          searchTotal={searchTotal}
          searching={searching}
          onSearchChange={handleSearchInputChange}
          onClearSearch={handleClearSearch}
          difficultyFilter={difficultyFilter}
          onDifficultyFilterChange={handleDifficultyFilterChange}
          tagFilter={tagFilter}
          onTagFilterChange={handleTagFilterChange}
          reviewFilter={reviewFilter}
          onReviewFilterChange={handleReviewFilterChange}
          openReviewDialog={openReviewDialog}
          openEditDialog={openEditDialog}
          handleDeleteCard={handleDeleteCard}
          setPage={handlePageChange}
          setRowsPerPage={setRowsPerPage}
          flashcards={flashcards}
          setTags={setTags}
          loadDeckAndCards={loadDeckAndCards}
          tagsService={tagsService}
          onCardTagUpdated={onCardTagUpdated}
        />
        {/* Modal de revisión de flashcards */}
        <ReviewFlashcardModal
          open={flashcardManager.reviewDialogOpen}
          onClose={() => {
            flashcardManager.setReviewDialogOpen(false);
            flashcardManager.setReviewingCard(null);
            flashcardManager.setShowAnswer(false);
          }}
          reviewingCard={flashcardManager.reviewingCard}
          showAnswer={flashcardManager.showAnswer}
          setShowAnswer={flashcardManager.setShowAnswer}
          onReview={handleReviewCard}
          muiTheme={muiTheme}
        />

        {/* Modal de edición de flashcards */}
        <EditFlashcardModal
          open={flashcardManager.editDialogOpen}
          onClose={() => {
            flashcardManager.setEditDialogOpen(false);
            flashcardManager.setEditingCard(null);
          }}
          editingCard={flashcardManager.editingCard}
          setEditingCard={flashcardManager.setEditingCard}
          onEdit={handleEditCard}
          editing={flashcardManager.editing}
          muiTheme={muiTheme}
        />

        {/* Modal de confirmación de eliminación */}
        <ConfirmDeleteModal
          open={flashcardManager.deleteDialogOpen}
          onClose={() => {
            flashcardManager.setDeleteDialogOpen(false);
            flashcardManager.setCardToDelete(null);
          }}
          onConfirm={confirmDeleteCard}
          title="Eliminar Flashcard"
          message="¿Estás seguro de que quieres eliminar esta flashcard?"
          itemName={flashcardManager.cardToDelete?.front}
          confirmText="Eliminar"
          cancelText="Cancelar"
          size="sm"
        />

        {/* FABs para crear flashcards */}
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', gap: 2 }}>
          <Tooltip title="Crear flashcard manualmente" placement="left">
            <Fab
              color="primary"
              aria-label="add manually"
              onClick={() => flashcardManager.setCreateDialogOpen(true)}
              sx={{
                width: 64,
                height: 64,
                '& .MuiSvgIcon-root': {
                  fontSize: 32
                }
              }}
            >
              <AddCardIcon />
            </Fab>
          </Tooltip>
          <Tooltip title="Generar flashcards con IA" placement="left">
            <Fab
              color="secondary"
              aria-label="generate with ai"
              onClick={() => flashcardManager.setAiGeneratorOpen(true)}
              sx={{
                width: 64,
                height: 64,
                '& .MuiSvgIcon-root': {
                  fontSize: 32
                }
              }}
            >
              <AIIcon />
            </Fab>
          </Tooltip>
        </Box>

        {/* Modal para crear flashcard */}
        <CreateFlashcardModal
          open={flashcardManager.createDialogOpen}
          onClose={() => flashcardManager.setCreateDialogOpen(false)}
          newCard={flashcardManager.newCard}
          setNewCard={flashcardManager.setNewCard}
          onCreate={handleCreateCard}
          creating={flashcardManager.creating}
          muiTheme={muiTheme}
        />

        {/* Modal para generar flashcards con IA */}
        <AIFlashcardsGenerator
          open={flashcardManager.aiGeneratorOpen}
          onClose={() => flashcardManager.setAiGeneratorOpen(false)}
          onGenerate={handleGeneratedCards}
        />
      </Container>
    </>
  );
};

export default DeckPage;
