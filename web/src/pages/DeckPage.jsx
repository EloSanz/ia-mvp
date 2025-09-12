import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  Alert,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  useTheme as useMuiTheme
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import Navigation from '../components/Navigation';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import FlashcardTable from '../components/FlashcardTable';

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
  const [error, setError] = useState(null);

  // Búsqueda y paginación
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);

  // Modales
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [tags, setTags] = useState([]); // Lista de tags disponibles
  const [newCardTagId, setNewCardTagId] = useState('');
  const [creating, setCreating] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editingCardTagId, setEditingCardTagId] = useState('');
  const [editing, setEditing] = useState(false);

  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingCard, setReviewingCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

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
      loadDeckAndCards(page, rowsPerPage);
    } else {
      handleSearch(searchQuery, page, rowsPerPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, page, rowsPerPage, searchQuery, token]);

  const loadDeckAndCards = async (p = 0, pageSize = 15) => {
    try {
      setLoading(true);
      const [deckResponse, cardsResponse] = await Promise.all([
        decks.getById(deckId),
        flashcards.getByDeck(deckId, { page: p, pageSize })
      ]);
      setDeck(deckResponse.data.data);
      setCards(cardsResponse.data.data || []);
      setTotalCards(cardsResponse.data.total || 0);
      setSearchResults([]);
      setSearchTotal(0);
      setError(null);
    } catch (err) {
      setError('Error al cargar el deck y las flashcards');
      console.error('Error loading deck and cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query, p = 0, pageSize = 15) => {
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

  const handleCreateCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;
    try {
      setCreating(true);
      await flashcards.create({ ...newCard, deckId: parseInt(deckId) });
      setCreateDialogOpen(false);
      setNewCard({ front: '', back: '' });
      loadDeckAndCards(page, rowsPerPage);
    } catch (err) {
      console.error('Error creating flashcard:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleGeneratedCards = async (generatedCards) => {
    try {
      const cardsWithDeckId = generatedCards.map((c) => ({ ...c, deckId: parseInt(deckId) }));
      await flashcards.createMany(cardsWithDeckId);
      loadDeckAndCards(page, rowsPerPage);
    } catch (err) {
      console.error('Error creating generated flashcards:', err);
    }
  };

  const handleEditCard = async () => {
    if (!editingCard?.front?.trim() || !editingCard?.back?.trim()) return;
    try {
      setEditing(true);
      await flashcards.update(editingCard.id, editingCard);
      setEditDialogOpen(false);
      setEditingCard(null);
      loadDeckAndCards(page, rowsPerPage);
    } catch (err) {
      console.error('Error editing flashcard:', err);
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    const card = cards.find((c) => c.id === cardId);
    setCardToDelete(card);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;
    try {
      await flashcards.delete(cardToDelete.id);
      loadDeckAndCards(page, rowsPerPage);
    } catch (err) {
      console.error('Error deleting flashcard:', err);
    }
  };

  const handleReviewCard = async (difficulty) => {
    if (!reviewingCard) return;
    try {
      await flashcards.review(reviewingCard.id, { difficulty });
      setReviewDialogOpen(false);
      setReviewingCard(null);
      setShowAnswer(false);
      loadDeckAndCards(page, rowsPerPage);
    } catch (err) {
      console.error('Error reviewing flashcard:', err);
    }
  };

  const openEditDialog = (card) => setEditingCard({ ...card }) || setEditDialogOpen(true);
  const openReviewDialog = (card) => {
    setReviewingCard(card);
    setReviewDialogOpen(true);
    setShowAnswer(false);
  };

  const getDifficultyColor = (d) =>
    d === 1 ? 'success' : d === 2 ? 'warning' : d === 3 ? 'error' : 'default';
  const getDifficultyLabel = (d) =>
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
        {/* Buscador, info del deck, error, tabla, modales... */}
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
          openReviewDialog={openReviewDialog}
          openEditDialog={openEditDialog}
          handleDeleteCard={handleDeleteCard}
          setPage={setPage}
          flashcards={flashcards}
          setTags={setTags}
          loadDeckAndCards={loadDeckAndCards}
          tagsService={tagsService}
        />

        {/* Modal de revisión de flashcards */}
        <Dialog
          open={reviewDialogOpen}
          onClose={() => {
            setReviewDialogOpen(false);
            setReviewingCard(null);
            setShowAnswer(false);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: muiTheme.fontFamily }}>Estudiando Flashcard</DialogTitle>
          <DialogContent sx={{ fontFamily: muiTheme.fontFamily }}>
            {reviewingCard && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Pregunta:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    p: 3,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    borderRadius: 2
                  }}
                >
                  {reviewingCard.front}
                </Typography>

                {!showAnswer ? (
                  <Box textAlign="center" sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => setShowAnswer(true)}
                    >
                      Mostrar Respuesta
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                      Respuesta:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 4,
                        fontSize: '1.1rem',
                        textAlign: 'center',
                        p: 3,
                        bgcolor: 'success.light',
                        color: 'success.contrastText',
                        borderRadius: 2
                      }}
                    >
                      {reviewingCard.back}
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                      ¿Qué tan fácil fue recordar esta respuesta?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                      <Button variant="outlined" color="error" onClick={() => handleReviewCard(3)}>
                        Difícil
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleReviewCard(2)}
                      >
                        Normal
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => handleReviewCard(1)}
                      >
                        Fácil
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setReviewDialogOpen(false);
                setReviewingCard(null);
                setShowAnswer(false);
              }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de edición de flashcards */}
        <Dialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditingCard(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: muiTheme.fontFamily }}>Editar Flashcard</DialogTitle>
          <DialogContent sx={{ fontFamily: muiTheme.fontFamily }}>
            {editingCard && (
              <Box sx={{ pt: 2 }}>
                <TextField
                  fullWidth
                  label="Pregunta"
                  value={editingCard.front || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                  sx={{ mb: 2 }}
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  label="Respuesta"
                  value={editingCard.back || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                  sx={{ mb: 2 }}
                  multiline
                  rows={3}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setEditDialogOpen(false);
                setEditingCard(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditCard}
              variant="contained"
              color="primary"
              disabled={editing || !editingCard?.front?.trim() || !editingCard?.back?.trim()}
            >
              {editing ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default DeckPage;
