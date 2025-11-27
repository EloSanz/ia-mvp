import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar
} from '@mui/material';
import {
  ContentCopy as CloneIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Style as CardIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useApi } from '../contexts/ApiContext';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';

export default function LibraryPreviewPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { library, decks: decksApi } = useApi();
  const { user } = useAuth();

  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadDeckPreview();
  }, [deckId]);

  const loadDeckPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await library.getPreview(deckId);
      setDeck(response.data.data);
    } catch (err) {
      console.error('Error loading deck preview:', err);
      setError('Deck no encontrado o no es público');
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async () => {
    try {
      setCloning(true);
      await decksApi.clone(deckId);

      // Efecto confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSnackbar({
        open: true,
        message: '✓ Deck clonado exitosamente',
        severity: 'success'
      });

      // Navegar a Mis Decks después de un delay
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      console.error('Error cloning deck:', err);
      const errorMessage = err.response?.data?.message || 'Error al clonar el deck';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      setCloning(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isOwnDeck = deck && user && deck.userId === user.id;

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (error || !deck) {
    return (
      <>
        <Navigation />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
          <Alert severity="error">{error || 'Deck no encontrado'}</Alert>
          <Box mt={2}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/library')}>
              Volver a Biblioteca
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Breadcrumbs deckName={deck.name} />

        {/* Banner Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Este es un preview de un deck público. {!isOwnDeck && 'Clona el deck para agregarlo a tu colección.'}
        </Alert>

        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
            <Box flex={1}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                {deck.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {deck.description}
              </Typography>

              {/* Metadata */}
              <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {deck.user?.username || 'Anónimo'}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(deck.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {/* Stats */}
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  icon={<CardIcon />}
                  label={`${deck.stats?.flashcardsCount || 0} flashcards`}
                  variant="outlined"
                />
                <Chip
                  icon={<CloneIcon />}
                  label={`${deck.clonesCount} clones`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Clone Button */}
            {!isOwnDeck && (
              <Button
                variant="contained"
                size="large"
                startIcon={<CloneIcon />}
                onClick={handleClone}
                disabled={cloning}
                sx={{
                  minWidth: 160,
                  height: 48,
                  fontWeight: 'bold'
                }}
              >
                {cloning ? 'Clonando...' : 'Clonar Deck'}
              </Button>
            )}
            {isOwnDeck && (
              <Chip
                label="Este es tu deck"
                color="success"
                sx={{ height: 48, fontSize: '1rem', px: 2 }}
              />
            )}
          </Box>
        </Paper>

        {/* Flashcards Table */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Flashcards ({deck.flashcards?.length || 0})
        </Typography>

        {deck.flashcards && deck.flashcards.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Frente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reverso</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tag</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deck.flashcards.map((card) => (
                  <TableRow key={card.id} hover>
                    <TableCell>{card.front}</TableCell>
                    <TableCell>{card.back}</TableCell>
                    <TableCell>
                      {card.tag && (
                        <Chip label={card.tag.name} size="small" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">Este deck no tiene flashcards aún</Alert>
        )}

        {/* Back Button */}
        <Box mt={4}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/library')}>
            Volver a Biblioteca
          </Button>
        </Box>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

