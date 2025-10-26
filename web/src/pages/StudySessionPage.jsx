import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, Alert, Snackbar, Typography, Button, Tooltip } from '@mui/material';
import { Keyboard as KeyboardIcon } from '@mui/icons-material';

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
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Ref para evitar múltiples inicializaciones de sesión
  const initializedRef = useRef(new Set());

  // Resetear ref cuando cambie el deckId
  useEffect(() => {
    initializedRef.current.clear();
  }, [deckId]);

  // Cerrar shortcuts al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShortcuts && !event.target.closest('[data-shortcuts-container]')) {
        setShowShortcuts(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShortcuts]);

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
      // Primero procesamos la respuesta (esto resetea showingAnswer y inicia la animación de volteo)
      await reviewCard(difficulty);
      
      // Esperamos a que termine la animación de volteo (0.6s) antes de cambiar la tarjeta
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Ahora obtenemos la siguiente tarjeta
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

        {/* Botón flotante de Atajos */}
        <Box sx={{ position: 'relative' }} data-shortcuts-container>
          <Tooltip title="Atajos de teclado">
            <Button
              color="inherit"
              startIcon={<KeyboardIcon />}
              onClick={() => setShowShortcuts(!showShortcuts)}
              sx={{
                position: 'fixed',
                bottom: 100, // Arriba del botón Finalizar
                right: 20,
                textTransform: 'none',
                borderRadius: '25px',
                px: 3,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 1000,
                minHeight: 48,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              Atajos
            </Button>
          </Tooltip>
          
          {showShortcuts && (
            <Box sx={{
              position: 'fixed',
              bottom: 160, // Arriba del botón Atajos
              right: 20,
              minWidth: 280,
              bgcolor: '#1A1F2E',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              p: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              zIndex: 1001,
              animation: 'tooltipFadeIn 0.2s ease',
              '@keyframes tooltipFadeIn': {
                from: { opacity: 0, transform: 'translateY(4px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '100%',
                right: '12px',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #1A1F2E'
              }
            }}>
              <Typography variant="subtitle2" sx={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#FFFFFF', 
                mb: 1.5 
              }}>
                ⌨️ Atajos de teclado
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px',
                    px: 1,
                    py: 0.5,
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    minWidth: 60,
                    textAlign: 'center'
                  }}>
                    ESPACIO
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#9CA3AF' }}>
                    Voltear tarjeta
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10B981',
                    borderRadius: '4px',
                    px: 1,
                    py: 0.5,
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    color: '#10B981',
                    minWidth: 20,
                    textAlign: 'center'
                  }}>
                    1
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#9CA3AF' }}>
                    Fácil
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid #F59E0B',
                    borderRadius: '4px',
                    px: 1,
                    py: 0.5,
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    color: '#F59E0B',
                    minWidth: 20,
                    textAlign: 'center'
                  }}>
                    2
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#9CA3AF' }}>
                    Normal
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #EF4444',
                    borderRadius: '4px',
                    px: 1,
                    py: 0.5,
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    color: '#EF4444',
                    minWidth: 20,
                    textAlign: 'center'
                  }}>
                    3
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#9CA3AF' }}>
                    Difícil
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
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
