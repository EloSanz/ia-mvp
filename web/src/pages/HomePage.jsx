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
  Skeleton,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Backdrop,
  Zoom,
  Grow,
  Slide,
  Stepper,
  Step,
  StepLabel,
  LinearProgress
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
  AutoAwesome as AIIcon,
  Create as CreateIcon,
  AutoFixHigh as AutoFixHighIcon,
  Description as DocumentIcon,
  VpnKey as TokenIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import Navigation from '../components/Navigation';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Breadcrumbs from '../components/Breadcrumbs';
import { useNavigation } from '../hooks/useNavigation';
import useDeckPagination from '../hooks/useDeckPagination';
import Pagination from '../components/Pagination';
import DeckSorting from '../components/DeckSorting';
import { useAuth } from '../contexts/AuthContext';

import { useTheme as useMuiTheme } from '@mui/material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import DecksGridCard from '../components/DecksGridCard';
import AIDeckGeneratorModal from '../components/AIDeckGeneratorModal';
import DocumentUploadModal from '../components/DocumentUploadModal';
const HomePage = () => {
  const muiTheme = useMuiTheme();
  const { themeName } = useAppTheme();
  const navigate = useNavigate();
  const { decks } = useApi();
  const { lastDeckId, hasLastDeck, lastDeckExists, goToLastDeck } = useNavigation();
  const [decksList, setDecksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Hook de paginación y ordenamiento
  const {
    paginatedDecks,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    sortBy,
    sortOrder,
    handlePageChange,
    handleItemsPerPageChange,
    handleSortChange,
    hasItems,
    isEmpty
  } = useDeckPagination(decksList, 8); // Por defecto 8 elementos por página

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

  // Modal para generación desde documento
  const [documentUploadOpen, setDocumentUploadOpen] = useState(false);

  // Menu de creación de decks
  const [createMenuAnchor, setCreateMenuAnchor] = useState(null);
  const createMenuOpen = Boolean(createMenuAnchor);

  //Monitoreo de deck para portada IA
  const [deckMonitory, setDeckMonitory] = useState(null);

  // Estado para toast de confirmación
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Función helper para mostrar toasts
  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const [estimatedTime, setEstimatedTime] = useState(null);

  const [statusDialogManualOpen, setStatusDialogManualOpen] = useState(false); // Para el nuevo modal de estado

  const [generationManualStep, setGenerationManualStep] = useState(0);

  const generationManualSteps = [
    'Generando Deck...',
    'Creando portada...'
  ];

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


  /***handle de la CREACION MANUAL */
  const handleCreateDeck = async () => {
    if (!newDeck.name.trim()) return;

    try {
      setCreating(true);

      if (!newDeck.generateCover) {
        // --- RUTA A: FLUJO SIMPLE (SIN PORTADA CON IA) NI MONITOREO ---
        await decks.create(newDeck);

        setCreateDialogOpen(false);
        setNewDeck({ name: '', description: '', generateCover: false });
        loadDecks(); // Recargar la lista
        showToast(`Deck "${newDeck.name}" creado exitosamente`);

      }

      else {
        // --- RUTA B: FLUJO CON ESTADOS (PORTADA CON IA) ---

        setCreateDialogOpen(false);
        setStatusDialogManualOpen(true);
        setEstimatedTime(20); // Estimar 20 segundos para todo el proceso de creación
        setGenerationManualStep(0);

        // Llama al endpoint que inicia el trabajo asíncrono
        const { data: createdDeck } = await decks.create(newDeck);
        setGenerationManualStep(1);

        if (createdDeck && createdDeck.data.id) {
          showToast('Generando la portada con IA...', 'warning');
          // monitorear solo este deck recién creado
          setDeckMonitory(createdDeck.data);
        }

        setNewDeck({ name: '', description: '', generateCover: false });
        loadDecks(); // Recargar la lista
        showToast(`Deck "${newDeck.name}" creado exitosamente`);

      }

    } catch (err) {
      console.error('Error creating deck:', err);
      setStatusDialogManualOpen(false);
      setEstimatedTime(null);
    } finally {

      setCreating(false);
    }
  };

  /***Interval para monitorisar la deck creada */
  useEffect(() => {
    let interval;
    if (deckMonitory && (!deckMonitory.coverUrl || !deckMonitory.coverUrl.startsWith('https:'))) {
      interval = setInterval(async () => {
        try {
          // Usar el nuevo endpoint que solo trae el estado
          const { data: statusResult } = await decks.getCoverStatusById(deckMonitory.id);
          const updatedStatus = statusResult.data;

          console.log("🚀 ~ HomePage ~ Deck Status:", updatedStatus);

          if (updatedStatus.coverGenerationStatus === 'FAILED') {
            setDeckMonitory(null);
            showToast('Error Generando la portada con IA', 'error');
            clearInterval(interval);
            if (statusDialogManualOpen) {
              setStatusDialogManualOpen(false);
            }
          }

          if (updatedStatus.coverUrl && updatedStatus.coverUrl.startsWith('https:') && updatedStatus.coverGenerationStatus === 'COMPLETED') {
            showToast('Portada generada exitosamente con IA', 'success');

            // Ahora que está lista, obtener el deck completo para actualizar la UI
            const { data: finalDeck } = await decks.getById(deckMonitory.id);

            setDecksList((prev) => prev.map((d) => (d.id === finalDeck.data.id ? finalDeck.data : d)));
            setDeckMonitory(null);
            clearInterval(interval);

            if (statusDialogManualOpen) {
              setGenerationManualStep(2);
              setStatusDialogManualOpen(false);
            }
          }
        } catch (err) {
          showToast('Error consultando estado de la portada', 'error');
          setDeckMonitory(null);
          console.error('Error fetching deck status update:', err);
        }
      }, 15000); // Por lo general suele tardar menos de 30 segundos
    }
    return () => clearInterval(interval);
  }, [deckMonitory, decks, showToast, statusDialogManualOpen]);

  const handleEditDeck = async () => {
    if (!editingDeck?.name?.trim()) return;

    try {
      setEditing(true);
      await decks.update(editingDeck.id, editingDeck);
      setEditDialogOpen(false);
      setEditingDeck(null);
      loadDecks();
      showToast(`Deck "${editingDeck.name}" actualizado exitosamente`);
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
      showToast(`Deck "${deckToDelete.name}" eliminado exitosamente`);
    } catch (err) {
      console.error('Error deleting deck:', err);
      showToast('Error al eliminar el deck', 'error');
    }
  };

  const openEditDialog = (deck) => {
    setEditingDeck({ ...deck });
    setEditDialogOpen(true);
  };

  /***handle de la CREACION Automatica Por IA  por tematica o sugerencia de existentes */
  const handleAIDeckGenerated = (result) => {
    console.log('Deck generado con IA:', result);
    // Recargar la lista
    loadDecks();

    showToast(`Deck "${result.deck?.name || 'sin nombre'}" creado exitosamente con ${result.flashcards?.length || 0} flashcards`);

    // Si el deck fue creado pero aún no tiene portada, monitorizarlo para actualizar la portada cuando el backend la genere solo si corrresponde
    if (result && result.deck && !result.deck.coverUrl) {
      showToast('Generando la portada con IA...', 'warning');
      setDeckMonitory(result.deck);
    }


  };

  /****handle de la CREACION desde un Docuemnto por IA */
  const handleDocumentGenerate = (result) => {
    console.log('Deck generado desde documento:', result);
    // Recargar la lista
    loadDecks();

    // Si el deck fue creado pero aún no tiene portada, monitorizarlo para actualizar la portada cuando el backend la genere
    if (result && result.deck && !result.deck.coverUrl) {
      showToast('Generando la portada con IA...', 'warning');
      setDeckMonitory(result.deck);
    }

    showToast(`Deck "${result.deck?.name || 'sin nombre'}" creado exitosamente con ${result.flashcards?.length || 0} flashcards desde documento`);
  };

  // Handlers del menú de creación
  const handleCreateMenuOpen = (event) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleCreateMenuClose = () => {
    setCreateMenuAnchor(null);
  };

  const handleCreateOption = (option) => {
    handleCreateMenuClose();

    switch (option) {
      case 'document':
        setDocumentUploadOpen(true);
        break;
      case 'ai':
        setAiDeckGeneratorOpen(true);
        break;
      case 'manual':
        setCreateDialogOpen(true);
        break;
      default:
        break;
    }
  };

  // Cerrar menú con tecla ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && createMenuOpen) {
        handleCreateMenuClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [createMenuOpen]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <Navigation />
      <Container
        maxWidth="xl"
        sx={{
          pt: 2,
          pb: 1, // Reducir padding inferior
          backgroundColor: muiTheme.palette.background.default,
          minHeight: 'calc(100vh - 64px)', // Restar la altura del header de navegación
          position: 'relative',
          fontFamily: muiTheme.fontFamily
        }}
      >
        {/* Breadcrumbs para navegación contextual - Oculto en home */}
        <Breadcrumbs showOnHome={false} />

        {/* Sección de "Continuar donde dejaste" */}
        {lastDeckExists === true && lastDeckId && decksList.find(d => d.id === lastDeckId) && (
          <Box sx={{ mb: 3 }}>
            <Alert
              severity="info"
              icon={<SchoolIcon />}
              action={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Button
                    color="inherit"
                    size="small"
                    onClick={goToLastDeck}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Continuar
                  </Button>
                </Box>
              }
              sx={{
                backgroundColor: themeName === 'github' ? '#21262d' : undefined,
                border: themeName === 'github' ? '1px solid #30363d' : undefined,
                '& .MuiAlert-message': {
                  color: themeName === 'github' ? '#ffffff' : undefined,
                  fontWeight: themeName === 'github' ? '500' : undefined
                },
                '& .MuiAlertTitle-root': {
                  color: themeName === 'github' ? '#ffffff' : undefined,
                  fontWeight: themeName === 'github' ? 'bold' : undefined,
                  fontSize: themeName === 'github' ? '1.1rem' : undefined
                }
              }}
            >
              <AlertTitle>Continuar estudiando</AlertTitle>
              Estabas estudiando el deck <strong>{decksList.find((d) => d.id === lastDeckId)?.name || `ID: ${lastDeckId}`}</strong>. Haz clic
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
              color: ${themeName === 'kyoto' ? '#6d4c41' : themeName === 'tokyo' ? '#00eaff' : themeName === 'light' ? '#222' : themeName === 'dark' ? '#e0e0e0' : themeName === 'github' ? '#c9d1d9' : 'inherit'};
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
            <Typography variant="h5" component="h1" sx={{ color: muiTheme.palette.text.primary, fontWeight: 'bold' }}>
              <span className="japanese-title">Mis Decks</span>
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

        {isEmpty && !loading && (
          <Box textAlign="center" mt={6}>
            <Typography variant="h6" sx={{ color: 'grey.400' }} gutterBottom>
              No tienes decks creados aún
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              Crea tu primer deck para comenzar a estudiar con flashcards
            </Typography>
          </Box>
        )}
        {hasItems && !loading && (
          <>
            {/* Controles de ordenamiento */}
            <DeckSorting
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />

            {/* Grid de decks */}
            <DecksGridCard
              decks={paginatedDecks}
              deckMonitory={deckMonitory}
              onEdit={openEditDialog}
              onDelete={handleDeleteDeck}
              onNavigate={(id) => navigate(`/decks/${id}`)}
            />

            {/* Paginación */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[8, 16, 24]}
            />
          </>
        )}
        {/* Backdrop oscuro cuando el menú está abierto */}
        <Backdrop
          open={createMenuOpen}
          onClick={handleCreateMenuClose}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer - 1,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            transition: 'opacity 0.2s ease-in-out',
          }}
        />

        {/* Botón flotante único para crear deck con animación de rotación */}
        <Zoom in timeout={300}>
          <Fab
            color="primary"
            aria-label="crear deck"
            aria-expanded={createMenuOpen}
            aria-haspopup="true"
            onClick={handleCreateMenuOpen}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 64,
              height: 64,
              boxShadow: 6,
              zIndex: (theme) => theme.zIndex.drawer,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                  : theme.palette.primary.main,
              '&:hover': {
                boxShadow: 12,
                transform: 'scale(1.08)',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                    : theme.palette.primary.dark,
              },
              '&:active': {
                transform: 'scale(0.96)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <AddIcon
              sx={{
                fontSize: 32,
                transform: createMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </Fab>
        </Zoom>

        {/* Botón flotante para copiar token JWT */}
        <Zoom in timeout={500}>
          <Fab
            color="success"
            aria-label="copiar token"
            onClick={async () => {
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  // Intentar con Clipboard API (solo funciona en HTTPS o localhost)
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(token);
                  } else {
                    // Fallback para HTTP: usar textarea temporal
                    const textArea = document.createElement('textarea');
                    textArea.value = token;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                  }
                  showToast('Token copiado al portapapeles con éxito');
                } catch (err) {
                  showToast('Error al copiar el token', 'error');
                }
              } else {
                showToast('No hay token disponible', 'warning');
              }
            }}
            sx={{
              position: 'fixed',
              bottom: 24,
              left: 24,
              width: 64,
              height: 64,
              boxShadow: 6,
              zIndex: (theme) => theme.zIndex.drawer,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? `linear-gradient(145deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                  : theme.palette.success.main,
              '&:hover': {
                boxShadow: 12,
                transform: 'scale(1.08)',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? `linear-gradient(145deg, ${theme.palette.success.light}, ${theme.palette.success.main})`
                    : theme.palette.success.dark,
              },
              '&:active': {
                transform: 'scale(0.96)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <TokenIcon
              sx={{
                fontSize: 28,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(15deg)',
                },
              }}
            />
          </Fab>
        </Zoom>

        {/* Menú desplegable mejorado con animaciones escalonadas */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            zIndex: (theme) => theme.zIndex.drawer,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            pointerEvents: createMenuOpen ? 'auto' : 'none',
          }}
        >
          {/* Opción 1: Desde Documento */}
          <Slide
            direction="up"
            in={createMenuOpen}
            timeout={{
              enter: 300,
              exit: 200
            }}
            style={{
              transitionDelay: createMenuOpen ? '0ms' : '100ms',
            }}
          >
            <Zoom
              in={createMenuOpen}
              timeout={{
                enter: 300,
                exit: 200
              }}
              style={{
                transitionDelay: createMenuOpen ? '0ms' : '100ms',
              }}
            >
              <Paper
                elevation={6}
                onClick={() => handleCreateOption('document')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCreateOption('document');
                  }
                }}
                tabIndex={createMenuOpen ? 0 : -1}
                role="button"
                aria-label="Crear deck desde documento PDF o Word"
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: '50px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: (theme) =>
                    theme.palette.mode === 'dark' ? '1px solid rgba(240, 147, 251, 0.3)' : '1px solid rgba(240, 147, 251, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(-4px) scale(1.05)',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.95)' : 'rgba(250, 250, 250, 0.95)',
                    boxShadow: 8,
                    border: (theme) =>
                      theme.palette.mode === 'dark' ? '1px solid rgba(240, 147, 251, 0.5)' : '1px solid rgba(240, 147, 251, 0.4)',
                  },
                  '&:active': {
                    transform: 'translateX(-4px) scale(1.02)',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: '#f093fb',
                    outlineOffset: 2,
                  },
                }}
              >
                <DocumentIcon sx={{ color: '#f093fb', fontSize: 24 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: (theme) => theme.palette.text.primary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Desde Documento
                </Typography>
              </Paper>
            </Zoom>
          </Slide>

          {/* Opción 2: Crear con IA */}
          <Slide
            direction="up"
            in={createMenuOpen}
            timeout={{
              enter: 300,
              exit: 200
            }}
            style={{
              transitionDelay: createMenuOpen ? '50ms' : '50ms',
            }}
          >
            <Zoom
              in={createMenuOpen && !user?.isTestUser}
              timeout={{
                enter: 300,
                exit: 200
              }}
              style={{
                transitionDelay: createMenuOpen ? '50ms' : '50ms',
              }}
            >
              <Paper
                elevation={6}
                onClick={() => handleCreateOption('ai')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCreateOption('ai');
                  }
                }}
                tabIndex={createMenuOpen ? 0 : -1}
                role="button"
                aria-label="Crear deck con inteligencia artificial desde un tema"
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: '50px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: (theme) =>
                    theme.palette.mode === 'dark' ? '1px solid rgba(156, 39, 176, 0.3)' : '1px solid rgba(156, 39, 176, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(-4px) scale(1.05)',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.95)' : 'rgba(250, 250, 250, 0.95)',
                    boxShadow: 8,
                    border: (theme) =>
                      theme.palette.mode === 'dark' ? '1px solid rgba(156, 39, 176, 0.5)' : '1px solid rgba(156, 39, 176, 0.4)',
                  },
                  '&:active': {
                    transform: 'translateX(-4px) scale(1.02)',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'secondary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                <AutoFixHighIcon color="secondary" sx={{ fontSize: 24 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: (theme) => theme.palette.text.primary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Crear con IA
                </Typography>
              </Paper>
            </Zoom>
          </Slide>

          {/* Opción 3: Crear Manual */}
          <Slide
            direction="up"
            in={createMenuOpen}
            timeout={{
              enter: 300,
              exit: 200
            }}
            style={{
              transitionDelay: createMenuOpen ? '100ms' : '0ms',
            }}
          >
            <Zoom
              in={createMenuOpen}
              timeout={{
                enter: 300,
                exit: 200
              }}
              style={{
                transitionDelay: createMenuOpen ? '100ms' : '0ms',
              }}
            >
              <Paper
                elevation={6}
                onClick={() => handleCreateOption('manual')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCreateOption('manual');
                  }
                }}
                tabIndex={createMenuOpen ? 0 : -1}
                role="button"
                aria-label="Crear deck manual vacío"
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: '50px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: (theme) =>
                    theme.palette.mode === 'dark' ? '1px solid rgba(25, 118, 210, 0.3)' : '1px solid rgba(25, 118, 210, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(-4px) scale(1.05)',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(40, 40, 40, 0.95)' : 'rgba(250, 250, 250, 0.95)',
                    boxShadow: 8,
                    border: (theme) =>
                      theme.palette.mode === 'dark' ? '1px solid rgba(25, 118, 210, 0.5)' : '1px solid rgba(25, 118, 210, 0.4)',
                  },
                  '&:active': {
                    transform: 'translateX(-4px) scale(1.02)',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                <CreateIcon color="primary" sx={{ fontSize: 24 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: (theme) => theme.palette.text.primary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Crear Manual
                </Typography>
              </Paper>
            </Zoom>
          </Slide>
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

        {/* Modal para Controlar estados deck manuales*/}
        <Dialog
          open={statusDialogManualOpen}
          onClose={() => setStatusDialogManualOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Crear Nuevo Deck Con Portada</DialogTitle>
          <DialogContent>
            {/* Proceso de generación */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generando tu deck...
              </Typography>
              <Stepper activeStep={generationManualStep} alternativeLabel>
                {generationManualSteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <LinearProgress sx={{ mt: 2 }} />
              {estimatedTime && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Tiempo estimado: {estimatedTime} seg.
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogManualOpen(false)}>  <CircularProgress size={20} /> Generando...</Button>
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
          in = {!user?.isTestUser}
          open={aiDeckGeneratorOpen}
          onClose={() => setAiDeckGeneratorOpen(false)}
          onGenerate={handleAIDeckGenerated}
        />

        {/* Modal para generación desde documento */}
        <DocumentUploadModal
          open={documentUploadOpen}
          onClose={() => setDocumentUploadOpen(false)}
          onGenerate={handleDocumentGenerate}
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
