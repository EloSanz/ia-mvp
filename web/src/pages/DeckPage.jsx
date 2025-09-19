import React, { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AddCard as AddCardIcon,
  SmartToy as AIIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import Navigation from '../components/Navigation';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import FlashcardTable from '../components/FlashcardTable';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import AIFlashcardsGenerator from '../components/AIFlashcardsGenerator';
import CreateFlashcardModal from '../components/CreateFlashcardModal';
import EditFlashcardModal from '../components/EditFlashcardModal';
import ReviewFlashcardModal from '../components/ReviewFlashcardModal';
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

  // Estados para tags y paginación
  const [tags, setTags] = useState([]); // Lista de tags disponibles
  const [newCardTagId, setNewCardTagId] = useState('');
  const [_editingCardTagId, _setEditingCardTagId] = useState('');

  // Hook personalizado para manejar flashcards
  const flashcardManager = useFlashcardManager(deckId);

  // Carga inicial y al cambiar filtros y tags
  useEffect(() => {
    // Cargar tags protegidas por token
    const loadTags = async () => {
      try {
        const response = await tagsService.getAll();
        if (Array.isArray(response.data)) {
          setTags(response.data);
        } else {
          setTags([]);
        }
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
      loadDeckAndCards(flashcardManager.page, flashcardManager.rowsPerPage);
    } else {
      handleSearch(searchQuery, flashcardManager.page, flashcardManager.rowsPerPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, flashcardManager.page, flashcardManager.rowsPerPage, searchQuery, token]);

  const loadDeckAndCards = async (p = 0, pageSize = 15) => {
    try {
      setLoading(true);

      const [deckResponse, cardsResponse] = await Promise.all([
        decks.getById(deckId),
        flashcards.getByDeck(deckId, { page: p, pageSize })
      ]);

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

  const handleSearch = async (
    query,
    p = flashcardManager.page,
    pageSize = flashcardManager.rowsPerPage
  ) => {
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
      loadDeckAndCards(flashcardManager.page, flashcardManager.rowsPerPage);
    } else {
      // Debounced search - esperar 300ms antes de buscar
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        if (query.trim()) {
          handleSearch(query.trim(), 0, flashcardManager.rowsPerPage);
        }
      }, 300);
    }
  };

  // Función para manejar cambios de página durante búsqueda
  const handlePageChange = (newPage) => {
    if (searchQuery.trim()) {
      // Si hay búsqueda activa, buscar en la nueva página
      handleSearch(searchQuery.trim(), newPage, flashcardManager.rowsPerPage);
    } else {
      // Si no hay búsqueda, cargar normalmente
      loadDeckAndCards(newPage, flashcardManager.rowsPerPage);
    }
  };

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchTotal(0);
    loadDeckAndCards(flashcardManager.page, flashcardManager.rowsPerPage);
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
      loadDeckAndCards(flashcardManager.page, flashcardManager.rowsPerPage);
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
      loadDeckAndCards(flashcardManager.page, flashcardManager.rowsPerPage);
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
        {/* Información del deck */}
        {deck && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: muiTheme.fontFamily }}>
              {deck.name}
            </Typography>
            {deck.description && (
              <Typography variant="body1" color="text.secondary" sx={{ fontFamily: muiTheme.fontFamily }}>
                {deck.description}
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

        {/* Componente de búsqueda */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={1}
            sx={{
              p: 1.5,
              backgroundColor: muiTheme.palette.background.paper,
              borderRadius: 2,
              width: 400,
              maxWidth: '90%'
            }}
          >
            <TextField
              size="small"
              variant="outlined"
              label="Buscar flashcards"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      disabled={loading}
                      sx={{ mr: 0.5 }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                    {searching && <CircularProgress size={16} />}
                  </InputAdornment>
                ) : (
                  searching && <CircularProgress size={16} />
                )
              }}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: muiTheme.fontFamily,
                  fontSize: '0.875rem'
                },
                '& .MuiInputLabel-root': {
                  fontFamily: muiTheme.fontFamily,
                  fontSize: '0.8rem'
                },
                '& .MuiFormHelperText-root': {
                  fontFamily: muiTheme.fontFamily,
                  fontSize: '0.75rem'
                }
              }}
            />
          </Paper>
        </Box>

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
          page={flashcardManager.page}
          rowsPerPage={flashcardManager.rowsPerPage}
          totalCards={totalCards}
          searchQuery={searchQuery}
          searchResults={searchResults}
          searchTotal={searchTotal}
          openReviewDialog={openReviewDialog}
          openEditDialog={openEditDialog}
          handleDeleteCard={handleDeleteCard}
          setPage={handlePageChange}
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
