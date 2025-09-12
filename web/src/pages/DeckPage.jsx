import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, Fab, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Box, Chip, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination,
  useTheme as useMuiTheme
} from '@mui/material';
import {
  AddCard as AddCardIcon, ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Edit as EditIcon,
  PlayArrow as PlayIcon, Search as SearchIcon, AutoFixHigh as AIIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import Navigation from '../components/Navigation';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import AIFlashcardsGenerator from '../components/AIFlashcardsGenerator';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const DeckPage = () => {
  const muiTheme = useMuiTheme();
  const { themeName } = useAppTheme();

  const { deckId } = useParams();
  const navigate = useNavigate();
  const { flashcards, decks } = useApi();

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
  const [creating, setCreating] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editing, setEditing] = useState(false);

  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingCard, setReviewingCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  // Carga inicial y al cambiar filtros
  useEffect(() => {
    if (!searchQuery) {
      loadDeckAndCards(page, rowsPerPage);
    } else {
      handleSearch(searchQuery, page, rowsPerPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, page, rowsPerPage, searchQuery]);

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
      const cardsWithDeckId = generatedCards.map(c => ({ ...c, deckId: parseInt(deckId) }));
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
    const card = cards.find(c => c.id === cardId);
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
  const openReviewDialog = (card) => { setReviewingCard(card); setReviewDialogOpen(true); setShowAnswer(false); };

  const getDifficultyColor = (d) => (d === 1 ? 'success' : d === 2 ? 'warning' : d === 3 ? 'error' : 'default');
  const getDifficultyLabel = (d) => (d === 1 ? 'Fácil' : d === 2 ? 'Normal' : d === 3 ? 'Difícil' : 'Sin dificultad');

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
        sx={{ py: 4, backgroundColor: muiTheme.palette.background.default, minHeight: '100vh', position: 'relative' }}
      >
        {(themeName === 'kyoto' || themeName === 'tokyo') && (
          <Box
            sx={{
              position: 'fixed', inset: 0, zIndex: -1, width: '100vw', height: '100vh',
              background: `url(${themeName === 'kyoto' ? '/kyoto.png' : '/tokyo.png'}) center/cover no-repeat`,
              filter: 'blur(8px) brightness(1.08)', opacity: 0.7
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

  // Render normal
  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', minHeight: '100vh' }}>
        {(themeName === 'kyoto' || themeName === 'tokyo') && (
          <Box
            sx={{
              position: 'fixed', inset: 0, zIndex: -1, width: '100vw', height: '100vh',
              background: `url(${themeName === 'kyoto' ? '/kyoto.png' : '/tokyo.png'}) center/cover no-repeat`,
              filter: 'blur(8px) brightness(1.08)', opacity: 0.7
            }}
          />
        )}

        {/* Buscador */}
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            label="Buscar por consigna" variant="outlined" size="small" value={searchQuery}
            onChange={e => { setPage(0); setSearchQuery(e.target.value); }}
            sx={{ width: 320, mr: 2 }} disabled={loading || searching}
          />
          <Button variant="contained" startIcon={<SearchIcon />}
                  onClick={() => handleSearch(searchQuery, page, rowsPerPage)}
                  disabled={loading || searching || !searchQuery.trim()}>
            Buscar
          </Button>
          {searchQuery && (
            <Button variant="text" sx={{ ml: 1 }} onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchTotal(0); }}>
              Limpiar
            </Button>
          )}
        </Box>

        <Box display="flex" alignItems="center" mb={4}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}><ArrowBackIcon /></IconButton>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>{deck.name}</Typography>
            <Typography variant="body1" color="text.secondary">{deck.description || 'Sin descripción'}</Typography>
            <Typography variant="body2" color="text.secondary">{cards.length} flashcards</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <TableContainer component={Paper} sx={{
          backgroundColor: muiTheme.palette.background.paper, borderRadius: 1, mt: 2, mb: 2,
          boxShadow: muiTheme.shadows[1],
          '& .MuiTableCell-root': { borderBottom: `1px solid ${muiTheme.palette.divider}`, color: muiTheme.palette.text.primary }
        }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: muiTheme.palette.text.secondary, fontSize: '0.875rem', py: 1.5 }}>Consigna</TableCell>
                <TableCell sx={{ color: muiTheme.palette.text.secondary, fontSize: '0.875rem', py: 1.5 }}>Dificultad</TableCell>
                <TableCell sx={{ color: muiTheme.palette.text.secondary, fontSize: '0.875rem', py: 1.5 }}>Revisiones</TableCell>
                <TableCell sx={{ color: muiTheme.palette.text.secondary, fontSize: '0.875rem', py: 1.5, width: 120 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(searchQuery ? searchResults : cards).map((card) => {
                const truncatedFront = card.front.length > 25 ? card.front.substring(0, 25) + '…' : card.front;
                return (
                  <TableRow key={card.id} hover sx={{ backgroundColor: muiTheme.palette.background.paper, cursor: 'pointer', '&:hover': { backgroundColor: muiTheme.palette.action.hover } }}>
                    <TableCell sx={{ color: muiTheme.palette.text.primary, fontSize: '0.95rem', py: 1.5 }}>{truncatedFront}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip label={getDifficultyLabel(card.difficulty)} color={getDifficultyColor(card.difficulty)} size="small" />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>{card.reviewCount > 0 ? `${card.reviewCount}` : '0'}</TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Revisar"><IconButton size="small" sx={{ color: muiTheme.palette.icon?.main || muiTheme.palette.primary.main }} onClick={() => openReviewDialog(card)}><PlayIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Editar"><IconButton size="small" sx={{ color: muiTheme.palette.icon?.main || muiTheme.palette.secondary.main }} onClick={() => openEditDialog(card)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Eliminar"><IconButton size="small" sx={{ color: muiTheme.palette.icon?.main || muiTheme.palette.error.main }} onClick={() => handleDeleteCard(card.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[15]} component="div"
            count={searchQuery ? searchTotal : totalCards}
            rowsPerPage={rowsPerPage} page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={() => {}}
            labelRowsPerPage="Flashcards por página"
          />
        </TableContainer>

        {cards.length === 0 && !loading && (
          <Box textAlign="center" mt={6}>
            <Typography variant="h6" color="text.secondary" gutterBottom>No hay flashcards en este deck</Typography>
            <Typography variant="body2" color="text.secondary">Crea tu primera flashcard para comenzar a estudiar</Typography>
          </Box>
        )}

        {/* FABs */}
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', gap: 2 }}>
          <Tooltip title="Crear flashcard manualmente" placement="left">
            <Fab color="primary" aria-label="add manually" onClick={() => setCreateDialogOpen(true)} sx={{ width: 64, height: 64 }}>
              <AddCardIcon />
            </Fab>
          </Tooltip>
          <Tooltip title="Generar flashcards con IA" placement="left">
            <Fab color="secondary" aria-label="generate with ai" onClick={() => setAiGeneratorOpen(true)} sx={{ width: 64, height: 64 }}>
              <AIIcon />
            </Fab>
          </Tooltip>
        </Box>

        {/* Crear */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Crear Nueva Flashcard</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Anverso (pregunta)" fullWidth multiline rows={3}
                       variant="outlined" value={newCard.front}
                       onChange={(e) => setNewCard({ ...newCard, front: e.target.value })} sx={{ mb: 2 }} />
            <TextField margin="dense" label="Reverso (respuesta)" fullWidth multiline rows={3}
                       variant="outlined" value={newCard.back}
                       onChange={(e) => setNewCard({ ...newCard, back: e.target.value })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCard} variant="contained" disabled={!newCard.front.trim() || !newCard.back.trim() || creating}>
              {creating ? <CircularProgress size={20} /> : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Editar */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Flashcard</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Anverso (pregunta)" fullWidth multiline rows={3}
                       variant="outlined" value={editingCard?.front || ''}
                       onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })} sx={{ mb: 2 }} />
            <TextField margin="dense" label="Reverso (respuesta)" fullWidth multiline rows={3}
                       variant="outlined" value={editingCard?.back || ''}
                       onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditCard} variant="contained" disabled={!editingCard?.front?.trim() || !editingCard?.back?.trim() || editing}>
              {editing ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Revisar */}
        <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Revisar Flashcard</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>{reviewingCard?.front}</Typography>
            {!showAnswer ? (
              <Box textAlign="center" mt={3}><Button variant="contained" onClick={() => setShowAnswer(true)}>Mostrar Respuesta</Button></Box>
            ) : (
              <Box>
                <Typography variant="body1" sx={{ mb: 3 }}>{reviewingCard?.back}</Typography>
                <Typography variant="h6" gutterBottom>¿Qué tan fácil fue recordar esta respuesta?</Typography>
                <Box display="flex" gap={1} justifyContent="center" mt={2}>
                  <Button variant="contained" color="success" onClick={() => handleReviewCard(1)}>Fácil</Button>
                  <Button variant="contained" color="warning" onClick={() => handleReviewCard(2)}>Normal</Button>
                  <Button variant="contained" color="error" onClick={() => handleReviewCard(3)}>Difícil</Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions><Button onClick={() => setReviewDialogOpen(false)}>Cerrar</Button></DialogActions>
        </Dialog>

        {/* Generador IA */}
        <AIFlashcardsGenerator open={aiGeneratorOpen} onClose={() => setAiGeneratorOpen(false)} onGenerate={handleGeneratedCards} />

        {/* Confirmar borrado */}
        <ConfirmDeleteModal
          open={deleteDialogOpen}
          onClose={() => { setDeleteDialogOpen(false); setCardToDelete(null); }}
          onConfirm={confirmDeleteCard}
          title="Eliminar Flashcard"
          message="¿Estás seguro de que quieres eliminar esta flashcard?"
          showItemName={false}
          confirmText="Eliminar"
          cancelText="Cancelar"
          size="xs"
        />
      </Container>
    </>
  );
};

export default DeckPage;
