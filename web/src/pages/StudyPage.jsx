/**
 * StudyPage
 *
 * Página principal para el sistema de estudio
 * Permite seleccionar un deck y configurar opciones de estudio
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  School as SchoolIcon,
  LibraryBooks as BooksIcon,
  AccessTime as TimeIcon,
  Psychology as BrainIcon,
  Info as InfoIcon
} from '@mui/icons-material';

import Navigation from '../components/Navigation';
import { useApi } from '../contexts/ApiContext';
import { useAuth } from '../contexts/AuthContext';

const StudyPage = () => {
  const navigate = useNavigate();
  const { decks } = useApi();
  const { user } = useAuth();

  const [availableDecks, setAvailableDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [studyOptions, setStudyOptions] = useState({
    limit: '', // vacío significa todas las cards
    mode: 'normal' // normal, review, new
  });

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const response = await decks.getAll();
      setAvailableDecks(response.data || []);
    } catch (err) {
      setError('Error al cargar los decks disponibles');
      console.error('Error loading decks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudy = async () => {
    if (!selectedDeck) {
      setError('Por favor selecciona un deck para estudiar');
      return;
    }

    try {
      setError(null);
      // Navegar a la página de sesión de estudio con los parámetros
      navigate(`/study/session/${selectedDeck}`, {
        state: {
          deckId: selectedDeck,
          limit: studyOptions.limit || null,
          mode: studyOptions.mode
        }
      });
    } catch (err) {
      setError('Error al iniciar la sesión de estudio');
      console.error('Error starting study:', err);
    }
  };

  const getDeckStats = (deck) => {
    // Aquí podríamos calcular estadísticas del deck
    // Por ahora, datos mock
    return {
      totalCards: deck.cardCount || 0,
      dueCards: Math.floor(Math.random() * deck.cardCount) || 0,
      newCards: deck.cardCount - (Math.floor(Math.random() * deck.cardCount) || 0)
    };
  };

  const DeckCard = ({ deck }) => {
    const stats = getDeckStats(deck);
    const isSelected = selectedDeck === deck.id.toString();

    return (
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onClick={() => setSelectedDeck(deck.id.toString())}
      >
        <CardContent sx={{ flex: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" component="h3" fontWeight={600}>
              {deck.name}
            </Typography>
            <Chip
              label={deck.isPublic ? 'Público' : 'Privado'}
              size="small"
              color={deck.isPublic ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {deck.description || 'Sin descripción'}
          </Typography>

          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Total de tarjetas:
              </Typography>
              <Chip
                label={stats.totalCards}
                size="small"
                icon={<BooksIcon />}
                variant="outlined"
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Pendientes:
              </Typography>
              <Chip
                label={stats.dueCards}
                size="small"
                color="warning"
                variant="outlined"
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Nuevas:
              </Typography>
              <Chip
                label={stats.newCards}
                size="small"
                color="info"
                variant="outlined"
              />
            </Box>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/decks/${deck.id}`);
            }}
          >
            Ver Deck
          </Button>

          {isSelected && (
            <Chip
              label="Seleccionado"
              color="primary"
              size="small"
              icon={<PlayIcon />}
            />
          )}
        </CardActions>
      </Card>
    );
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando decks disponibles...
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            📚 Sistema de Estudio
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Elige un deck y comienza a estudiar con repetición espaciada
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <Chip
              icon={<BrainIcon />}
              label="Algoritmo de repetición espaciada"
              variant="outlined"
              color="primary"
            />
            <Chip
              icon={<TimeIcon />}
              label="Optimizado para retención"
              variant="outlined"
              color="secondary"
            />
          </Box>
        </Box>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Opciones de estudio */}
        {availableDecks.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                ⚙️ Configuración de Estudio
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Modo de Estudio</InputLabel>
                    <Select
                      value={studyOptions.mode}
                      label="Modo de Estudio"
                      onChange={(e) => setStudyOptions(prev => ({ ...prev, mode: e.target.value }))}
                    >
                      <MenuItem value="normal">Normal (todas las cards)</MenuItem>
                      <MenuItem value="review">Solo revisión (vencidas)</MenuItem>
                      <MenuItem value="new">Solo nuevas</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Límite de tarjetas (opcional)"
                    type="number"
                    value={studyOptions.limit}
                    onChange={(e) => setStudyOptions(prev => ({ ...prev, limit: e.target.value }))}
                    helperText="Deja vacío para estudiar todas las tarjetas disponibles"
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" height="100%">
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleStartStudy}
                      disabled={!selectedDeck}
                      startIcon={<PlayIcon />}
                      sx={{ height: 56 }}
                    >
                      Comenzar Estudio
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Lista de Decks */}
        {availableDecks.length > 0 ? (
          <>
            <Typography variant="h5" fontWeight={600} mb={3}>
              📖 Selecciona un Deck para Estudiar
            </Typography>

            <Grid container spacing={3}>
              {availableDecks.map((deck) => (
                <Grid item xs={12} md={6} lg={4} key={deck.id}>
                  <DeckCard deck={deck} />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box textAlign="center" py={8}>
            <SchoolIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No hay decks disponibles
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Crea tu primer deck para comenzar a estudiar
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              startIcon={<BooksIcon />}
            >
              Ir a Mis Decks
            </Button>
          </Box>
        )}

        {/* Información del sistema */}
        <Card sx={{ mt: 4, bgcolor: 'grey.50' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <InfoIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Sobre el Sistema de Estudio
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              Este sistema utiliza el algoritmo de <strong>repetición espaciada</strong>, una técnica probada
              científicamente que optimiza el aprendizaje mostrando las tarjetas en intervalos cada vez
              mayores según tu desempeño.
            </Typography>

            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Fácil:</strong> La tarjeta se mostrará en 3 días
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Normal:</strong> La tarjeta se mostrará en 1 día
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                <strong>Difícil:</strong> La tarjeta se mostrará en 6 horas
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default StudyPage;
