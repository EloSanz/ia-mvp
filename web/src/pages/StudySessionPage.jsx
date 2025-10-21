import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, Alert, Snackbar, Typography } from '@mui/material';

import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import StudyCard from '../components/StudyCard';
import StudyControls from '../components/StudyControls';

import SessionLoading from '../components/studySessionPage/SessionLoading';
import SessionError from '../components/studySessionPage/SessionError';
import SessionFinished from '../components/studySessionPage/SessionFinished';
import FinishDialog from '../components/studySessionPage/FinishDialog';
import StudyStatsLite from '../components/studySessionPage/StudyStatsLite';

import { useStudySession } from '../hooks/useStudySession';
import { useLastDeck } from '../hooks/useLastDeck';

export default function StudySessionPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const studyOptions = location.state || {};
  const { clearLastDeck } = useLastDeck();

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
    canShowAnswer
  } = useStudySession();

  const [paused, setPaused] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  // Ref para evitar múltiples inicializaciones de sesión
  const initializedRef = useRef(new Set());

  // Resetear ref cuando cambie el deckId
  useEffect(() => {
    initializedRef.current.clear();
  }, [deckId]);

  // Solo inicializar sesión una vez por deckId
  useEffect(() => {
    if (deckId && !initializedRef.current.has(deckId)) {
      initializedRef.current.add(deckId);
      initializeSession();
    }
  }, [deckId]);

  const handleShowAnswer = () => {
    if (canShowAnswer) showAnswer();
  };

  const handleReview = async (difficulty) => {
    try {
      await reviewCard(difficulty);
      const nextCardResult = await nextCard();
      if (nextCardResult === null) setShowFinishDialog(true);
    } catch (err) {
      console.error('Error in handleReview:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Error al revisar la tarjeta',
        severity: 'error'
      });
    }
  };

  // Manejo de teclado para navegación rápida
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Solo procesar si no estamos en un input o textarea
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Prevenir comportamiento por defecto para las teclas que manejamos
      if (event.code === 'Space' || (event.key >= '1' && event.key <= '3')) {
        event.preventDefault();
      }

      switch (event.code) {
        case 'Space':
          // Mostrar respuesta si está disponible
          if (canShowAnswer && !showingAnswer && !loading && !paused) {
            handleShowAnswer();
          }
          break;
        case 'Digit1':
          // Fácil (1)
          if (showingAnswer && !loading && !paused) {
            handleReview(1);
          }
          break;
        case 'Digit2':
          // Normal (2)
          if (showingAnswer && !loading && !paused) {
            handleReview(2);
          }
          break;
        case 'Digit3':
          // Difícil (3)
          if (showingAnswer && !loading && !paused) {
            handleReview(3);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canShowAnswer, showingAnswer, loading, paused, handleShowAnswer, handleReview]);

  const initializeSession = async () => {
    try {
      await startSession(deckId, studyOptions.limit, studyOptions.tagId);
      setSnackbar({ open: true, message: '¡Sesión de estudio iniciada!', severity: 'success' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al iniciar la sesión',
        severity: 'error'
      });
    }
  };

  const handleSkip = async () => {
    try {
      const nextCardResult = await nextCard();
      if (nextCardResult === null) setShowFinishDialog(true);
      else setSnackbar({ open: true, message: 'Tarjeta saltada', severity: 'info' });
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
      clearLastDeck();
      setSnackbar({ open: true, message: '¡Sesión completada exitosamente!', severity: 'success' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al finalizar la sesión',
        severity: 'error'
      });
    }
  };

  const handleRestart = async () => {
    try {
      // Finalizar sesión actual
      if (session) {
        await finishSession();
      }
      // Iniciar nueva sesión con el mismo deck
      await initializeSession();
      setSnackbar({ open: true, message: 'Sesión reiniciada', severity: 'success' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al reiniciar la sesión',
        severity: 'error'
      });
    }
  };
  const handleGoHome = () => navigate('/');
  const handlePause = () => {
    setPaused(true);
    setSnackbar({ open: true, message: 'Sesión pausada', severity: 'info' });
  };
  const handleResume = () => {
    setPaused(false);
    setSnackbar({ open: true, message: 'Sesión reanudada', severity: 'success' });
  };
  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  if (!session && loading) {
    return (
      <>
        <Navigation />
        <SessionLoading />
      </>
    );
  }

  if (sessionFinished && finalStats) {
    return (
      <>
        <Navigation />
        <SessionFinished
          stats={finalStats}
          formatTime={formatTime}
          onRestart={handleRestart}
          onHome={handleGoHome}
        />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navigation />
        <SessionError onBack={() => navigate('/study')} />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 12 }}>
        <Breadcrumbs deckName={session?.deckName} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Estadísticas minimalistas (sin revisadas/tiempos) */}
        <StudyStatsLite
          stats={sessionStats || { easyCount: 0, normalCount: 0, hardCount: 0 }}
          progress={getProgress()}
        />

        {paused && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Sesión pausada. Haz clic en play para continuar.
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <StudyCard
            card={currentCard}
            showingAnswer={showingAnswer}
            onShowAnswer={handleShowAnswer}
            onReview={handleReview}
            loading={loading}
            disabled={paused || loading}
          />

          {/* Instrucciones de teclado mejoradas */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {!showingAnswer ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Presiona
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1,
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    ESPACIO
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    para voltear la tarjeta
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Califica la dificultad:
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'success.main', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    1
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Fácil
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'warning.main', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    2
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Normal
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'error.main', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    3
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Difícil
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Leyenda de atajos agrandada en esquina inferior */}
          <Box sx={{ 
            position: 'fixed', 
            bottom: 100, 
            right: 20, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            boxShadow: 3,
            zIndex: 1000,
            minWidth: 200
          }}>
            <Typography variant="subtitle2" color="text.primary" sx={{ fontSize: '0.9rem', display: 'block', mb: 1.5, fontWeight: 600 }}>
              ⌨️ Atajos de teclado
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  minWidth: 60,
                  textAlign: 'center'
                }}>
                  ESPACIO
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Voltear tarjeta
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  bgcolor: 'success.main', 
                  color: 'white', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  minWidth: 20,
                  textAlign: 'center'
                }}>
                  1
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Fácil
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  bgcolor: 'warning.main', 
                  color: 'white', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  minWidth: 20,
                  textAlign: 'center'
                }}>
                  2
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Normal
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  minWidth: 20,
                  textAlign: 'center'
                }}>
                  3
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Difícil
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <StudyControls
          session={session}
          progress={getProgress()}
          onPause={handlePause}
          onResume={handleResume}
          onFinish={handleFinish}
          onSkip={handleSkip}
          onRestart={handleRestart}
          loading={loading}
          paused={paused}
          canSkip={!!currentCard && !showingAnswer}
          canFinish
        />
      </Container>

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

      <FinishDialog
        open={showFinishDialog}
        onClose={() => setShowFinishDialog(false)}
        onFinish={handleFinish}
      />
    </>
  );
}
