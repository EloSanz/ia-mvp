import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as PlayIcon,
  Search as SearchIcon,
  AutoFixHigh as AIIcon,
  AddCard as AddCardIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import Navigation from '../components/Navigation';
import AIFlashcardsGenerator from '../components/AIFlashcardsGenerator';

const DeckPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { flashcards, decks } = useApi();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal para crear flashcard
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [creating, setCreating] = useState(false);

  // Modal para generar flashcards con IA
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);

  // Modal para editar flashcard
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editing, setEditing] = useState(false);

  // Modal para revisar flashcard
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingCard, setReviewingCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    loadDeckAndCards();
  }, [deckId]);

  const loadDeckAndCards = async () => {
    try {
      setLoading(true);
      const [deckResponse, cardsResponse] = await Promise.all([
        decks.getById(deckId),
        flashcards.getByDeck(deckId)
      ]);

      setDeck(deckResponse.data.data);
      setCards(cardsResponse.data.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar el deck y las flashcards');
      console.error('Error loading deck and cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;

    try {
      setCreating(true);
      await flashcards.create({
        ...newCard,
        deckId: parseInt(deckId)
      });
      setCreateDialogOpen(false);
      setNewCard({ front: '', back: '' });
      loadDeckAndCards();
    } catch (err) {
      console.error('Error creating flashcard:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleGeneratedCards = async (generatedCards) => {
    try {
      const cardsWithDeckId = generatedCards.map(card => ({
        ...card,
        deckId: parseInt(deckId)
      }));
      await flashcards.createMany(cardsWithDeckId);
      loadDeckAndCards();
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
      loadDeckAndCards();
    } catch (err) {
      console.error('Error editing flashcard:', err);
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta flashcard?')) return;

    try {
      await flashcards.delete(cardId);
      loadDeckAndCards();
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
      loadDeckAndCards();
    } catch (err) {
      console.error('Error reviewing flashcard:', err);
    }
  };

  const openEditDialog = (card) => {
    setEditingCard({ ...card });
    setEditDialogOpen(true);
  };

  const openReviewDialog = (card) => {
    setReviewingCard(card);
    setReviewDialogOpen(true);
    setShowAnswer(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1:
        return 'success';
      case 2:
        return 'warning';
      case 3:
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 1:
        return 'Fácil';
      case 2:
        return 'Normal';
      case 3:
        return 'Difícil';
      default:
        return 'Sin dificultad';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!deck) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Deck no encontrado</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Volver al Inicio
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {deck.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {deck.description || 'Sin descripción'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {cards.length} flashcards
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    {card.front}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {card.back}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label={getDifficultyLabel(card.difficulty)}
                      color={getDifficultyColor(card.difficulty)}
                      size="small"
                    />
                    {card.reviewCount > 0 && (
                      <Chip
                        label={`${card.reviewCount} revisiones`}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Tooltip title="Revisar">
                    <IconButton size="small" color="primary" onClick={() => openReviewDialog(card)}>
                      <PlayIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton size="small" color="secondary" onClick={() => openEditDialog(card)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {cards.length === 0 && !loading && (
          <Box textAlign="center" mt={6}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay flashcards en este deck
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crea tu primera flashcard para comenzar a estudiar
            </Typography>
          </Box>
        )}

        {/* FABs para crear flashcards */}
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', gap: 2 }}>
          <Tooltip title="Crear flashcard manualmente" placement="left">
            <Fab
              color="primary"
              aria-label="add manually"
              onClick={() => setCreateDialogOpen(true)}
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
              onClick={() => setAiGeneratorOpen(true)}
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
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Crear Nueva Flashcard</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Anverso (pregunta)"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newCard.front}
              onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Reverso (respuesta)"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newCard.back}
              onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleCreateCard}
              variant="contained"
              disabled={!newCard.front.trim() || !newCard.back.trim() || creating}
            >
              {creating ? <CircularProgress size={20} /> : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para editar flashcard */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Editar Flashcard</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Anverso (pregunta)"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={editingCard?.front || ''}
              onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Reverso (respuesta)"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={editingCard?.back || ''}
              onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleEditCard}
              variant="contained"
              disabled={!editingCard?.front?.trim() || !editingCard?.back?.trim() || editing}
            >
              {editing ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para revisar flashcard */}
        <Dialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Revisar Flashcard</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              {reviewingCard?.front}
            </Typography>

            {!showAnswer ? (
              <Box textAlign="center" mt={3}>
                <Button variant="contained" onClick={() => setShowAnswer(true)}>
                  Mostrar Respuesta
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {reviewingCard?.back}
                </Typography>

                <Typography variant="h6" gutterBottom>
                  ¿Qué tan fácil fue recordar esta respuesta?
                </Typography>

                <Box display="flex" gap={1} justifyContent="center" mt={2}>
                  <Button variant="contained" color="success" onClick={() => handleReviewCard(1)}>
                    Fácil
                  </Button>
                  <Button variant="contained" color="warning" onClick={() => handleReviewCard(2)}>
                    Normal
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleReviewCard(3)}>
                    Difícil
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* Modal para generar flashcards con IA */}
        <AIFlashcardsGenerator
          open={aiGeneratorOpen}
          onClose={() => setAiGeneratorOpen(false)}
          onGenerate={handleGeneratedCards}
        />
      </Container>
    </>
  );
};

export default DeckPage;
