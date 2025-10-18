import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  AlertTitle,
  CircularProgress,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  CardMedia,
  Card,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import Navigation from '../components/Navigation';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Breadcrumbs from '../components/Breadcrumbs';
import { useNavigation } from '../hooks/useNavigation';

import { useTheme as useMuiTheme } from '@mui/material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import DecksGridCard from '../components/DecksGridCard';
import AIDeckGeneratorModal from '../components/AIDeckGeneratorModal';
const HomePage = () => {
  const muiTheme = useMuiTheme();
  const { themeName } = useAppTheme();
  const navigate = useNavigate();
  const { decks } = useApi();
  const { lastDeckId, hasLastDeck, lastDeckExists, goToLastDeck } = useNavigation();
  const [decksList, setDecksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal para crear deck
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDeck, setNewDeck] = useState({ name: '', description: '', generateCover: false });
  const [creating, setCreating] = useState(false);

  // Modal para editar deck
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [editing, setEditing] = useState(false);

  // Modal para confirmar eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState(null);

  // Modal para contacto
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  // Modal para generación de deck con IA
  const [aiDeckGeneratorOpen, setAiDeckGeneratorOpen] = useState(false);

  //Monitoreo de deck para portada IA
  const [deckMonitory, setDeckMonitory] = useState(null);

  const loadDecks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await decks.getAll();
      setDecksList(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los decks');
      console.error('Error loading decks:', err);
    } finally {
      setLoading(false);
    }
  }, [decks]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const handleCreateDeck = async () => {
    if (!newDeck.name.trim()) return;

    try {
      debugger;
      setCreating(true);
      const { data: createdDeck } = await decks.create(newDeck);
      if (newDeck.generateCover && createdDeck && createdDeck.data.id) {
        console.log('Generando portada IA...:', createdDeck.data);
        // monitorear solo este deck recién creado
        setDeckMonitory(createdDeck.data);
      }

      setCreateDialogOpen(false);
      setNewDeck({ name: '', description: '', generateCover: false });
      loadDecks(); // Recargar la lista
    } catch (err) {
      console.error('Error creating deck:', err);
    } finally {
      setCreating(false);
    }
  };

  /***Interval para monitorisar la deck creada */
  useEffect(() => {
    let interval;
    if (deckMonitory && !deckMonitory.coverUrl) {
      interval = setInterval(async () => {
        try {
          const { data: updated } = await decks.getById(deckMonitory.id);
          if (updated.data.coverUrl) {
            setDecksList((prev) => prev.map((d) => (d.id === updated.data.id ? updated.data : d)));
            setDeckMonitory(null); // dejar de monitorear
            // loadDecks();             // refresca lista completa
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Error fetching deck update:', err);
        }
      }, 10000); //Por lo general suel tardar menos de 30 segundos
    }
    return () => clearInterval(interval);
  }, [deckMonitory]);

  const handleEditDeck = async () => {
    if (!editingDeck?.name?.trim()) return;

    try {
      setEditing(true);
      await decks.update(editingDeck.id, editingDeck);
      setEditDialogOpen(false);
      setEditingDeck(null);
      loadDecks();
    } catch (err) {
      console.error('Error editing deck:', err);
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    const deck = decksList.find((d) => d.id === deckId);
    setDeckToDelete(deck);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDeck = async () => {
    if (!deckToDelete) return;

    try {
      await decks.delete(deckToDelete.id);

      // Si el deck eliminado era el último visitado, limpiarlo del localStorage
      if (lastDeckId === deckToDelete.id) {
        // Esto se maneja automáticamente por el hook useNavigation que valida la existencia del deck
        console.log(
          `Deck ${deckToDelete.id} eliminado, localStorage será limpiado automáticamente`
        );
      }

      loadDecks();
    } catch (err) {
      console.error('Error deleting deck:', err);
    }
  };

  const openEditDialog = (deck) => {
    setEditingDeck({ ...deck });
    setEditDialogOpen(true);
  };

  const handleAIDeckGenerated = (result) => {
    console.log('Deck generado con IA:', result);
    loadDecks(); // Recargar la lista
    showToast(`Deck "${result.deck.name}" creado exitosamente con ${result.flashcards.length} flashcards`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <Navigation />
      <Container
        maxWidth="lg"
        sx={{
          py: 2,
          backgroundColor: muiTheme.palette.background.default,
          minHeight: '100vh',
          position: 'relative',
          fontFamily: muiTheme.fontFamily
        }}
      >
        {/* Breadcrumbs para navegación contextual */}
        <Breadcrumbs showOnHome={true} />

        {/* Sección de "Continuar donde dejaste" */}
        {lastDeckExists === true && (
          <Box sx={{ mb: 3 }}>
            <Alert
              severity="info"
              icon={<SchoolIcon />}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={goToLastDeck}
                  startIcon={<ArrowForwardIcon />}
                >
                  Continuar
                </Button>
              }
            >
              <AlertTitle>Continuar estudiando</AlertTitle>
              Estabas estudiando el deck "
              {decksList.find((d) => d.id === lastDeckId)?.name || `ID: ${lastDeckId}`}". Haz clic
              en "Continuar" para retomar tu sesión.
            </Alert>
          </Box>
        )}
        {(themeName === 'kyoto' || themeName === 'tokyo') && (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: -1,
              width: '100vw',
              height: '100vh',
              background: `url(${themeName === 'kyoto' ? '/kyoto.png' : '/tokyo.png'}) center center / cover no-repeat`,
              filter: 'blur(3px) brightness(1.08)',
              opacity: 0.7
            }}
          />
        )}
        {/* Estilo japonés para Kyoto y Tokyo */}
        <style>
          {`
            body {
              font-family: ${themeName === 'kyoto' ? '"Sawarabi Mincho", "Noto Serif JP", serif' : themeName === 'tokyo' ? '"M PLUS 1p", "Noto Sans JP", sans-serif' : 'inherit'};
            }
            .japanese-title {
              font-family: ${themeName === 'kyoto' ? '"Sawarabi Mincho", "Noto Serif JP", serif' : themeName === 'tokyo' ? '"M PLUS 1p", "Noto Sans JP", sans-serif' : 'inherit'};
              letter-spacing: ${themeName === 'kyoto' ? '0.08em' : themeName === 'tokyo' ? '0.12em' : 'normal'};
              font-weight: ${themeName === 'kyoto' ? '600' : themeName === 'tokyo' ? '700' : 'normal'};
              color: ${themeName === 'kyoto' ? '#6d4c41' : themeName === 'tokyo' ? '#00eaff' : 'inherit'};
              text-shadow: ${themeName === 'kyoto' ? '0 2px 8px #f7cac9' : themeName === 'tokyo' ? '0 2px 12px #ff00cc' : 'none'};
            }
          `}
        </style>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'grey.800',
            pb: 1
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5" component="h1" sx={{ color: muiTheme.palette.text.primary }}>
              <span className="japanese-title">Decks</span>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Repositorio en GitHub" placement="bottom">
              <IconButton
                size="small"
                sx={{ color: muiTheme.palette.icon?.main || muiTheme.palette.text.primary }}
                onClick={() => window.open('https://github.com/EloSanz/ia-mvp', '_blank')}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Contacto" placement="bottom">
              <IconButton
                size="small"
                sx={{ color: muiTheme.palette.icon?.main || muiTheme.palette.text.primary }}
                onClick={() => setContactDialogOpen(true)}
              >
                <EmailIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Acerca de" placement="bottom">
              <IconButton
                size="small"
                sx={{ color: muiTheme.palette.icon?.main || muiTheme.palette.text.primary }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {decksList.length === 0 && !loading && (
          <Box textAlign="center" mt={6}>
            <Typography variant="h6" sx={{ color: 'grey.400' }} gutterBottom>
              No tienes decks creados aún
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              Crea tu primer deck para comenzar a estudiar con flashcards
            </Typography>
          </Box>
        )}
        {decksList.length != 0 && !loading && (
          <DecksGridCard
            decks={decksList}
            deckMonitory={deckMonitory}
            onEdit={openEditDialog}
            onDelete={handleDeleteDeck}
            onNavigate={(id) => navigate(`/decks/${id}`)}
          />
        )}
        {/* Botones de acción flotantes */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {/* Botón para crear deck con IA */}
          <Button
            variant="contained"
            startIcon={<AIIcon />}
            onClick={() => setAiDeckGeneratorOpen(true)}
            sx={{
              borderRadius: '50px',
              px: 3,
              py: 1.5,
              fontSize: '0.9rem',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6
              }
            }}
          >
            Crear Deck con IA
          </Button>
          
          {/* FAB para crear deck normal */}
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              width: 64,
              height: 64,
              '& .MuiSvgIcon-root': {
                fontSize: 32
              }
            }}
            onClick={() => setCreateDialogOpen(true)}
          >
            <AddIcon />
          </Fab>
        </Box>

        {/* Modal para crear deck */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Crear Nuevo Deck</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre del Deck"
              fullWidth
              variant="outlined"
              value={newDeck.name}
              onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Descripción (opcional)"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={newDeck.description}
              onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newDeck.generateCover}
                  onChange={(e) => setNewDeck({ ...newDeck, generateCover: e.target.checked })}
                  color="primary"
                />
              }
              label="Generar portada automática por IA"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleCreateDeck}
              variant="contained"
              disabled={!newDeck.name.trim() || creating}
            >
              {creating ? <CircularProgress size={20} /> : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para editar deck */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Editar Deck</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre del Deck"
              fullWidth
              variant="outlined"
              value={editingDeck?.name || ''}
              onChange={(e) => setEditingDeck({ ...editingDeck, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Descripción (opcional)"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={editingDeck?.description || ''}
              onChange={(e) => setEditingDeck({ ...editingDeck, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleEditDeck}
              variant="contained"
              disabled={!editingDeck?.name?.trim() || editing}
            >
              {editing ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para contacto */}
        <Dialog
          open={contactDialogOpen}
          onClose={() => setContactDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Contacto</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Para contactarnos, puedes escribirnos al siguiente email:
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'monospace',
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                textAlign: 'center',
                color: 'primary.main'
              }}
            >
              icardscontact@gmail.com
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Estaremos encantados de atender tus consultas, sugerencias o reportar problemas.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactDialogOpen(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* Modal para confirmar eliminación */}
        <ConfirmDeleteModal
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setDeckToDelete(null);
          }}
          onConfirm={confirmDeleteDeck}
          title="Eliminar Deck"
          message="¿Estás seguro de que quieres eliminar este deck?"
          showItemName={false}
          confirmText="Eliminar"
          cancelText="Cancelar"
          size="xs"
        />

        {/* Modal para generación de deck con IA */}
        <AIDeckGeneratorModal
          open={aiDeckGeneratorOpen}
          onClose={() => setAiDeckGeneratorOpen(false)}
          onGenerate={handleAIDeckGenerated}
        />

        {/* Toast de confirmación */}
        <Snackbar
          open={toast.open}
          autoHideDuration={5000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mb: 2, mr: 2 }}
        >
          <Alert
            onClose={() => setToast({ ...toast, open: false })}
            severity={toast.severity}
            sx={{ 
              width: '100%',
              minWidth: '300px',
              fontSize: '1rem',
              py: 1.5,
              '& .MuiAlert-message': {
                fontWeight: 500
              }
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default HomePage;
