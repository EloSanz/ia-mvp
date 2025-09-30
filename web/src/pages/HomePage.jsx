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
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';
import Navigation from '../components/Navigation';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Breadcrumbs from '../components/Breadcrumbs';
import { useNavigation } from '../hooks/useNavigation';

import { useTheme as useMuiTheme } from '@mui/material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
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

  //Monitoreo de deck para portada IA
  const [deckMonitory,setDeckMonitory] =useState(null);

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
      debugger
      setCreating(true);
      const { data: createdDeck } =await decks.create(newDeck);
      if(newDeck.generateCover && createdDeck && createdDeck.data.id){
        console.log("Generando portada IA...:" ,createdDeck.data)
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
        debugger
        try {
           const { data: updated }= await decks.getById(deckMonitory.id);
          if (updated.data.coverUrl) {
            setDecksList(prev =>
              prev.map(d => (d.id === updated.data.id ? updated.data : d))
            );
            setDeckMonitory(null); // dejar de monitorear
            // loadDecks();             // refresca lista completa
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error fetching deck update:", err);
        }
      }, 10000);//Por lo general suel tardar menos de 30 segundos
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
        console.log(`Deck ${deckToDelete.id} eliminado, localStorage será limpiado automáticamente`);
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
              Estabas estudiando el deck #{lastDeckId}. Haz clic en "Continuar" para retomar tu sesión.
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
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Contacto" placement="bottom">
              <IconButton
                size="small"
                sx={{ color: muiTheme.palette.icon?.main || muiTheme.palette.text.primary }}
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

        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: muiTheme.palette.background.paper,
            borderRadius: 1,
            boxShadow: muiTheme.shadows[1],
            fontFamily: muiTheme.fontFamily,
            '& .MuiTableCell-root': {
              borderBottom: `1px solid ${muiTheme.palette.divider}`,
              color: muiTheme.palette.text.primary,
              fontFamily: muiTheme.fontFamily
            }
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: muiTheme.palette.text.secondary,
                    fontWeight: 'normal',
                    fontSize: '0.875rem',
                    py: 1.5
                  }}
                >
                  Deck
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: muiTheme.palette.text.secondary,
                    fontWeight: 'normal',
                    fontSize: '0.875rem',
                    py: 1.5
                  }}
                >
                  New
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: muiTheme.palette.text.secondary,
                    fontWeight: 'normal',
                    fontSize: '0.875rem',
                    py: 1.5
                  }}
                >
                  Learn
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: muiTheme.palette.text.secondary,
                    fontWeight: 'normal',
                    fontSize: '0.875rem',
                    py: 1.5
                  }}
                >
                  Due
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: muiTheme.palette.text.secondary,
                    fontWeight: 'normal',
                    fontSize: '0.875rem',
                    py: 1.5,
                    width: '100px'
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {decksList.map((deck) => (
                <TableRow
                  key={deck.id}
                  hover
                  onClick={() => navigate(`/decks/${deck.id}`)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: muiTheme.palette.background.paper,
                    '&:hover': {
                      backgroundColor: muiTheme.palette.action.hover,
                      '& .action-icons': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      color: muiTheme.palette.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1.5,
                      fontSize: '0.9rem'
                    }}
                  >
                    <SchoolIcon
                      sx={{
                        color: muiTheme.palette.icon?.main || muiTheme.palette.primary.main,
                        fontSize: '1.1rem'
                      }}
                    />
                    {deck.name}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: '#2196f3',
                      py: 1.5,
                      fontSize: '0.9rem'
                    }}
                  >
                    0
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: '#ff9800',
                      py: 1.5,
                      fontSize: '0.9rem'
                    }}
                  >
                    0
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: '#4caf50',
                      py: 1.5,
                      fontSize: '0.9rem'
                    }}
                  >
                    0
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1 }}>
                    <Box
                      className="action-icons"
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 0.5
                      }}
                    >
                      <Tooltip title="Editar deck" placement="top">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(deck);
                          }}
                          sx={{
                            color: 'grey.400',
                            padding: 0.5
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar deck" placement="top">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDeck(deck.id);
                          }}
                          sx={{
                            color: 'grey.400',
                            padding: 0.5,
                            '&:hover': {
                              color: 'error.main'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        placement="right"
                        title={
                          <img
                            src={`data:image/png;base64,${deck.coverUrl}`}
                            alt={deck.name}
                            style={{
                              maxWidth: 200,
                              maxHeight: 200,
                              objectFit: 'contain', // se muestra completa en el preview
                              borderRadius: 8
                            }}
                          />
                        }
                      >
                        {deck.coverUrl ? (
                          <Card sx={{ width: 35, height: 35 }}>
                            <CardMedia
                              component="img"
                              image={`data:image/png;base64,${deck.coverUrl}`}
                              alt={deck.name}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain', // miniatura sin recortes
                              }}
                            />
                          </Card>
                        ) : (
                          <Skeleton variant="rectangular" width={35} height={35} />
                        )}
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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

        {/* FAB para crear nuevo deck */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
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
                  onChange={e => setNewDeck({ ...newDeck, generateCover: e.target.checked })}
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
      </Container>
    </>
  );
};

export default HomePage;
