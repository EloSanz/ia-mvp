import React, { useEffect, useState } from 'react';
import { Container, Alert, Box, Button } from '@mui/material';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import StudyHeader from '../components/studyPage/StudyHeader';
import StudyConfig from '../components/studyPage/StudyConfig';
import DeckList from '../components/studyPage/DeckList';
import LoadingState from '../components/studyPage/LoadingState';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { School as SchoolIcon, LibraryBooks as BooksIcon } from '@mui/icons-material';

export default function StudyPage() {
  const navigate = useNavigate();
  const { decks } = useApi();

  const [availableDecks, setAvailableDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [studyOptions, setStudyOptions] = useState({ limit: '', mode: 'normal' });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await decks.getAll();
        setAvailableDecks(res.data.data || []);
      } catch (e) {
        console.error(e);
        setError('Error al cargar los decks disponibles');
      } finally {
        setLoading(false);
      }
    })();
  }, [decks]);

  const handleStartStudy = () => {
    if (!selectedDeck) {
      setError('Por favor selecciona un deck para estudiar');
      return;
    }
    setError(null);
    navigate(`/study/session/${selectedDeck}`, {
      state: { deckId: selectedDeck, limit: studyOptions.limit || null, mode: studyOptions.mode }
    });
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <LoadingState />
      </>
    );
  }

  const hasDecks = availableDecks.length > 0;

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Breadcrumbs />
        <StudyHeader />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <StudyConfig
          hasDecks={hasDecks}
          studyOptions={studyOptions}
          setStudyOptions={setStudyOptions}
          onStart={handleStartStudy}
          disabled={!selectedDeck}
        />

        {hasDecks ? (
          <DeckList
            decks={availableDecks}
            selectedDeckId={selectedDeck}
            onSelect={setSelectedDeck}
            onViewDeck={(id) => navigate(`/decks/${id}`)}
          />
        ) : (
          <EmptyState onGoHome={() => navigate('/')} />
        )}
      </Container>
    </>
  );
}

function EmptyState({ onGoHome }) {
  return (
    <Box textAlign="center" py={8}>
      <SchoolIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
      No hay decks disponibles
      <Box mt={2} mb={3} color="text.secondary">
        Crea tu primer deck para comenzar a estudiar
      </Box>
      <Button variant="contained" size="large" onClick={onGoHome} startIcon={<BooksIcon />}>
        Ir a Mis Decks
      </Button>
    </Box>
  );
}
