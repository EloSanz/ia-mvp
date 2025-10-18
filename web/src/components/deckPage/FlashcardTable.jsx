import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableContainer,
  Typography,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  RestartAlt as RestartAltIcon,
  ClearAll as ClearAllIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import CardRow from '../CardRow';
import SearchBar from '../SearchBar';

const FlashcardTable = ({
  cards,
  tags,
  muiTheme,
  page,
  rowsPerPage,
  totalCards,
  searchQuery,
  searchResults,
  searchTotal,
  searching,
  onSearchChange,
  onClearSearch,
  difficultyFilter,
  onDifficultyFilterChange,
  tagFilter,
  onTagFilterChange,
  reviewFilter,
  onReviewFilterChange,
  openReviewDialog,
  openEditDialog,
  handleDeleteCard,
  setPage,
  flashcards,
  setTags,
  tagsService,
  onCardTagUpdated,
  loadDeckAndCards,
  setRowsPerPage
}) => {
  const safeMuiTheme = muiTheme || {};
  const safeCards = Array.isArray(cards) ? cards : [];
  const safeTags = Array.isArray(tags) ? tags : [];
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

  const applyFilters = (cards) => {
    let filtered = cards;

    if (difficultyFilter && difficultyFilter !== 'all') {
      filtered = filtered.filter((card) => card.difficulty === parseInt(difficultyFilter));
    }

    if (tagFilter && tagFilter !== 'all') {
      if (tagFilter === '') {
        filtered = filtered.filter((card) => !card.tagId);
      } else {
        filtered = filtered.filter((card) => card.tagId === tagFilter);
      }
    }

    // Aplicar filtro de revisiones
    if (reviewFilter && reviewFilter !== 'all') {
      if (reviewFilter === '0') {
        // Solo cards con 0 revisiones
        filtered = filtered.filter((card) => (card.reviewCount || 0) === 0);
      } else if (reviewFilter === 'lt5') {
        // Menos de 5 revisiones
        filtered = filtered.filter((card) => (card.reviewCount || 0) < 5);
      } else if (reviewFilter === 'lt10') {
        // Menos de 10 revisiones
        filtered = filtered.filter((card) => (card.reviewCount || 0) < 10);
      } else if (reviewFilter === 'lt20') {
        // Menos de 20 revisiones
        filtered = filtered.filter((card) => (card.reviewCount || 0) < 20);
      }
    }

    return filtered;
  };

  const displayCards = searchQuery ? safeSearchResults : applyFilters(safeCards);

  const goToFirstPage = () => {
    setPage(null, 0);
  };

  const goToLastPage = () => {
    const total = searchQuery.trim() ? searchTotal : totalCards;
    const lastPage = Math.max(0, Math.ceil(total / rowsPerPage) - 1);
    setPage(null, lastPage);
  };

  const resetRowsPerPage = () => {
    setRowsPerPage({ target: { value: 15 } });
  };

  const clearTable = () => {
    onClearSearch && onClearSearch();
    onDifficultyFilterChange && onDifficultyFilterChange('all');
    onTagFilterChange && onTagFilterChange('all');
    onReviewFilterChange && onReviewFilterChange('all');
    setPage(null, 0);
  };

  try {
    return (
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            {/* Primera fila: títulos */}
            <TableRow>
              <TableCell
                sx={{ color: safeMuiTheme.palette?.text?.secondary, fontSize: '0.875rem', py: 1.5 }}
                colSpan={2}
              >
                Consigna
              </TableCell>

              <TableCell
                sx={{
                  color: safeMuiTheme.palette?.text?.secondary,
                  fontSize: '0.875rem',
                  py: 1.5,
                  minWidth: 180
                }}
              >
                Tag
              </TableCell>

              <TableCell
                sx={{
                  color: safeMuiTheme.palette?.text?.secondary,
                  fontSize: '0.875rem',
                  py: 1.5,
                  minWidth: 150
                }}
              >
                Dificultad
              </TableCell>

              <TableCell
                sx={{ color: safeMuiTheme.palette?.text?.secondary, fontSize: '0.875rem', py: 1.5 }}
              >
                Revisiones
              </TableCell>

              <TableCell
                sx={{
                  color: safeMuiTheme.palette?.text?.secondary,
                  fontSize: '0.875rem',
                  py: 1.5,
                  width: 120
                }}
              >
                Acciones
              </TableCell>
            </TableRow>

            {/* Segunda fila: controles alineados bajo cada título */}
            <TableRow>
              {/* 1-2) Consigna + Buscar - aquí va el SearchBar */}
              <TableCell sx={{ py: 1 }} colSpan={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SearchBar
                    searchQuery={searchQuery || ''}
                    onSearchChange={onSearchChange}
                    onClearSearch={onClearSearch}
                    searching={searching}
                    placeholder="Buscar flashcards..."
                    label=""
                    size="small"
                  />
                </Box>
              </TableCell>

              {/* 3) Tag - Select de tags */}
              <TableCell sx={{ py: 1 }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select
                    value={tagFilter || 'all'}
                    onChange={(e) => onTagFilterChange(e.target.value)}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="">
                      <em>Sin tag</em>
                    </MenuItem>
                    {safeTags.map((tag) => (
                      <MenuItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>

              {/* 4) Dificultad - Select de dificultad */}
              <TableCell sx={{ py: 1 }}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={difficultyFilter || 'all'}
                    onChange={(e) => onDifficultyFilterChange(e.target.value)}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="1">Fácil</MenuItem>
                    <MenuItem value="2">Normal</MenuItem>
                    <MenuItem value="3">Difícil</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>

              {/* 5) Revisiones - Select de revisiones */}
              <TableCell sx={{ py: 1 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={reviewFilter || 'all'}
                    onChange={(e) => onReviewFilterChange(e.target.value)}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="0">0</MenuItem>
                    <MenuItem value="lt5">Menos de 5</MenuItem>
                    <MenuItem value="lt10">Menos de 10</MenuItem>
                    <MenuItem value="lt20">Menos de 20</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>

              {/* 6) Acciones - ícono de settings */}
              <TableCell sx={{ py: 0.5, textAlign: 'inherit', verticalAlign: 'middle' }}>
                <SettingsIcon sx={{ fontSize: '1.5rem', color: 'text.primary' }} />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayCards && displayCards.length > 0 ? (
              displayCards.map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  tags={safeTags}
                  muiTheme={safeMuiTheme}
                  openReviewDialog={openReviewDialog}
                  openEditDialog={openEditDialog}
                  handleDeleteCard={handleDeleteCard}
                  flashcards={flashcards}
                  setTags={setTags}
                  loadDeckAndCards={loadDeckAndCards}
                  tagsService={tagsService}
                  onCardTagUpdated={onCardTagUpdated}
                />
              ))
            ) : (
              <TableRow>
                {/* Actualicé colSpan a 5 porque ahora hay 5 columnas en el header */}
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery ||
                    difficultyFilter !== 'all' ||
                    tagFilter !== 'all' ||
                    reviewFilter !== 'all'
                      ? 'No se encontraron flashcards con esos filtros'
                      : 'No hay flashcards en este deck'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchQuery ||
                    difficultyFilter !== 'all' ||
                    tagFilter !== 'all' ||
                    reviewFilter !== 'all'
                      ? 'Intenta con otros términos de búsqueda o filtros'
                      : 'Crea tu primera flashcard para comenzar'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 1,
            mb: 2
          }}
        >
          <Stack direction="row" spacing={1}>
            <Tooltip title="Ir al principio">
              <span>
                <IconButton
                  onClick={goToFirstPage}
                  disabled={page === 0}
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover:not(:disabled)': {
                      backgroundColor: safeMuiTheme.palette?.action?.hover,
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <FirstPageIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Ir al final">
              <span>
                <IconButton
                  onClick={goToLastPage}
                  disabled={
                    searchQuery.trim()
                      ? page >= Math.ceil((searchTotal || 0) / rowsPerPage) - 1
                      : page >= Math.ceil((totalCards || 0) / rowsPerPage) - 1
                  }
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover:not(:disabled)': {
                      backgroundColor: safeMuiTheme.palette?.action?.hover,
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <LastPageIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Restablecer filas por página a 15">
              <span>
                <IconButton
                  onClick={resetRowsPerPage}
                  disabled={rowsPerPage === 15}
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover:not(:disabled)': {
                      backgroundColor: safeMuiTheme.palette?.action?.hover,
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <RestartAltIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Limpiar búsqueda y filtros, volver al inicio">
              <span>
                <IconButton
                  onClick={clearTable}
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: safeMuiTheme.palette?.action?.hover,
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <ClearAllIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20, 30, 50, 100]}
            component="div"
            count={searchQuery ? searchTotal || 0 : totalCards || 0}
            rowsPerPage={rowsPerPage || 15}
            page={page || 0}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            labelRowsPerPage="Flashcards por página"
          />
        </Box>
      </TableContainer>
    );
  } catch (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>Error al renderizar la tabla de flashcards</h3>
        <p>{error.message}</p>
        <details>
          <summary>Ver detalles del error</summary>
          <pre>{error.stack}</pre>
        </details>
      </div>
    );
  }
};

export default FlashcardTable;
