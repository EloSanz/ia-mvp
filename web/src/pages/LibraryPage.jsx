import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  Style as CardIcon
} from '@mui/icons-material';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import useDeckPagination from '../hooks/useDeckPagination';
import Pagination from '../components/Pagination';

export default function LibraryPage() {
  const navigate = useNavigate();
  const { library } = useApi();

  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Hook de paginación
  const {
    paginatedDecks,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange,
    hasItems
  } = useDeckPagination(decks, 8); // 8 elementos por página

  useEffect(() => {
    loadDecks();
  }, [sortBy]);

  const loadDecks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await library.getAll(search, sortBy);
      setDecks(response.data.data || []);
    } catch (err) {
      console.error('Error loading public decks:', err);
      setError('Error al cargar los decks públicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDecks();
  };

  const handleDeckClick = (deckId) => {
    navigate(`/library/${deckId}`);
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Breadcrumbs />

        {/* Header - Estilo similar a StudyPage */}
        <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
          <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
            <Typography variant="h3" component="h1" fontWeight="bold">
              🌐 Biblioteca Comunitaria
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Descubre, aprende y comparte conocimiento
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explora decks públicos creados por la comunidad y clónalos para empezar a estudiar
          </Typography>
        </Box>

        {/* Search and Sort */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 800, mx: 'auto' }}>
          <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, minWidth: 300 }}>
            <TextField
              fullWidth
              placeholder="🔍 Buscar por nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  loadDecks();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
          </Box>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Ordenar por"
              sx={{
                borderRadius: 3
              }}
            >
              <MenuItem value="recent">📅 Más recientes</MenuItem>
              <MenuItem value="popularity">🔥 Más populares</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty State */}
        {!loading && decks.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>
              {search ? '🔍' : '🌐'}
            </Typography>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {search ? 'No encontramos decks con ese nombre' : '¡Sé el primero en compartir! 🚀'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {search
                ? 'Intenta con otros términos de búsqueda o explora todos los decks'
                : 'Comparte tus decks con la comunidad y ayuda a otros a aprender'}
            </Typography>
          </Box>
        )}

        {/* Decks Grid */}
        {!loading && hasItems && (
          <Grid container spacing={1.5}>
            {paginatedDecks.map((deck) => (
              <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={deck.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    borderRadius: 2,
                    boxShadow: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                      borderColor: 'primary.main'
                    }
                  }}
                  onClick={() => handleDeckClick(deck.id)}
                >
                  {/* Cover Image */}
                  {deck.coverUrl ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={`data:image/png;base64,${deck.coverUrl}`}
                      alt={deck.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <CardMedia
                      component="img"
                      height="140"
                      image="/cards.png"
                      alt={deck.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    {/* Deck Name */}
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.2em',
                        height: '2.4em',
                        mb: 1
                      }}
                    >
                      {deck.name}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.3em',
                        height: '2.6em',
                        fontSize: '0.875rem'
                      }}
                    >
                      {deck.description || 'Sin descripción'}
                    </Typography>

                    {/* Stats */}
                    <Box sx={{ mt: 'auto' }}>
                      {/* Author */}
                      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                          {deck.user?.username || 'Anónimo'}
                        </Typography>
                      </Box>

                      {/* Metrics */}
                      <Box display="flex" gap={1.5} alignItems="center">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" fontSize="0.75rem" fontWeight="600">
                            {deck.stats?.flashcardsCount || 0} cards
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CopyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="caption" fontSize="0.75rem" fontWeight="600" color="primary.main">
                            {deck.clonesCount} clones
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Paginación */}
        {!loading && hasItems && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={[8, 16, 24]}
          />
        )}
      </Container>
    </>
  );
}
