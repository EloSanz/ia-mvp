/**
 * StudySessionPage
 *
 * Página para realizar sesiones de estudio activas
 * Maneja todo el flujo de estudio con flashcards
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Fade
} from '@mui/material';

import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import StudyCard from '../components/StudyCard';
import StudyStats from '../components/StudyStats';
import StudyControls from '../components/StudyControls';
import { useStudySession } from '../hooks/useStudySession';

const StudySessionPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const studyOptions = location.state || {};

  const {
    session,
    currentCard,
    loading,
    error,
    showingAnswer,
    responseTime,
    sessionStats,
    startSession,
    showAnswer,
    reviewCard,
    nextCard,
    finishSession,
    getProgress,
    formatTime,
    hasActiveSession,
    canShowAnswer,
    canReview
  } = useStudySession();

  const [paused, setPaused] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  useEffect(() => {
    if (deckId && !hasActiveSession) {
      initializeSession();
    }
  }, [deckId, hasActiveSession]);

  const initializeSession = async () => {
    try {
      await startSession(deckId, studyOptions.limit);
      setSnackbar({
        open: true,
        message: '¡Sesión de estudio iniciada!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al iniciar la sesión',
        severity: 'error'
      });
    }
  };

  const handleShowAnswer = () => {
    if (canShowAnswer) {
      showAnswer();
    }
  };

  const handleReview = async (difficulty) => {
    try {
      await reviewCard(difficulty);

      // Intentar obtener la siguiente card
      const nextCardResult = await nextCard();
      if (nextCardResult === null) {
        // Si no hay más cards, mostrar diálogo de finalización
        setShowFinishDialog(true);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al revisar la tarjeta',
        severity: 'error'
      });
    }
  };

  const handleSkip = async () => {
    try {
      const nextCardResult = await nextCard();
      if (nextCardResult === null) {
        // Si no hay más cards, mostrar diálogo de finalización
        setShowFinishDialog(true);
      } else {
        setSnackbar({
          open: true,
          message: 'Tarjeta saltada',
          severity: 'info'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al saltar la tarjeta',
        severity: 'error'
      });
    }
  };

  const handleFinish = async () => {
    try {
      const result = await finishSession();
      setFinalStats(result.finalStats);
      setSessionFinished(true);
      setShowFinishDialog(false);

      setSnackbar({
        open: true,
        message: '¡Sesión completada exitosamente!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al finalizar la sesión',
        severity: 'error'
      });
    }
  };

  const handleRestart = () => {
    navigate('/study');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handlePause = () => {
    setPaused(true);
    setSnackbar({
      open: true,
      message: 'Sesión pausada',
      severity: 'info'
    });
  };

  const handleResume = () => {
    setPaused(false);
    setSnackbar({
      open: true,
      message: 'Sesión reanudada',
      severity: 'success'
    });
  };

  const handleCloseFinishDialog = () => {
    setShowFinishDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!session && loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Inicializando sesión de estudio...
          </Typography>
        </Container>
      </>
    );
  }

  if (sessionFinished && finalStats) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Fade in={true} timeout={500}>
            <Box textAlign="center">
              <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
                🎉 ¡Sesión Completada!
              </Typography>

              <Box sx={{ mt: 4, mb: 6 }}>
                <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
                  Estadísticas Finales
                </Typography>

                <Box display="flex" justifyContent="center" gap={4} flexWrap="wrap" sx={{ mt: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight={700} color="success.main">
                      {finalStats.cardsReviewed}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Tarjetas Revisadas
                    </Typography>
                  </Box>

                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight={700} color="warning.main">
                      {formatTime(finalStats.timeSpent * 1000)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Tiempo Total
                    </Typography>
                  </Box>

                  <Box textAlign="center">
                    <Typography variant="h3" fontWeight={700} color="info.main">
                      {finalStats.averageResponseTime}s
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Tiempo Promedio
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap" sx={{ mt: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="success.main">
                      {finalStats.easyCount} Fácil
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h5" color="warning.main">
                      {finalStats.normalCount} Normal
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h5" color="error.main">
                      {finalStats.hardCount} Difícil
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleRestart}
                  sx={{ mr: 2, textTransform: 'none' }}
                >
                  Estudiar Otro Deck
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleGoHome}
                  sx={{ textTransform: 'none' }}
                >
                  Volver al Inicio
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error al cargar la sesión de estudio. Por favor, intenta nuevamente.
          </Alert>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={() => navigate('/study')}>
              Volver a Estudiar
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 12 }}>
        {/* Breadcrumbs para navegación contextual */}
        <Breadcrumbs />

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Estadísticas */}
        <StudyStats
          session={session}
          stats={sessionStats || {
            cardsReviewed: 0,
            easyCount: 0,
            normalCount: 0,
            hardCount: 0,
            timeSpent: 0,
            averageResponseTime: 0
          }}
          progress={getProgress()}
          formatTime={formatTime}
          compact={true}
        />

        {/* Estado de pausa */}
        {paused && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Sesión pausada. Haz clic en el botón de play para continuar.
          </Alert>
        )}

        {/* Card principal */}
        <Box sx={{ mb: 4 }}>
          <StudyCard
            card={currentCard}
            showingAnswer={showingAnswer}
            onShowAnswer={handleShowAnswer}
            onReview={handleReview}
            responseTime={responseTime}
            formatTime={formatTime}
            loading={loading}
            disabled={paused || loading}
          />
        </Box>

        {/* Controles */}
        <StudyControls
          session={session}
          progress={getProgress()}
          onPause={handlePause}
          onResume={handleResume}
          onFinish={handleFinish}
          onSkip={handleSkip}
          onRestart={handleRestart}
          onGoHome={handleGoHome}
          loading={loading}
          paused={paused}
          canSkip={!!currentCard && !showingAnswer}
          canFinish={true}
        />
      </Container>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Diálogo de confirmación de finalización automática */}
      <Dialog
        open={showFinishDialog}
        onClose={handleCloseFinishDialog}
        aria-labelledby="finish-dialog-title"
        aria-describedby="finish-dialog-description"
      >
        <DialogTitle id="finish-dialog-title">
          ¡Felicitaciones! Has completado todas las tarjetas
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Has revisado todas las tarjetas disponibles en esta sesión.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ¿Quieres finalizar la sesión y ver tus estadísticas finales?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFinishDialog} color="inherit">
            Continuar Estudiando
          </Button>
          <Button onClick={handleFinish} variant="contained">
            Finalizar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudySessionPage;
