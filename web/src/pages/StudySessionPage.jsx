import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, Alert, Snackbar } from '@mui/material';

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

  const initializeSession = async () => {
    try {
      await startSession(deckId, studyOptions.limit);
      setSnackbar({ open: true, message: '¡Sesión de estudio iniciada!', severity: 'success' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al iniciar la sesión',
        severity: 'error'
      });
    }
  };

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

  const handleRestart = () => navigate('/study');
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 12 }}>
        <Breadcrumbs />

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
          onGoHome={handleGoHome}
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
