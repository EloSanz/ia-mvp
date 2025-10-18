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
  ClearAll as ClearAllIcon
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
      filtered = filtered.filter(card => card.difficulty === parseInt(difficultyFilter));
    }

    if (tagFilter && tagFilter !== 'all') {
      filtered = filtered.filter(card => card.tagId === tagFilter);
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
    setPage(null, 0);
  };

  try {
    return (
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ color: safeMuiTheme.palette?.text?.secondary, fontSize: '0.875rem', py: 1.5 }}
              >
                Consigna
              </TableCell>
              <TableCell
                sx={{
                  color: safeMuiTheme.palette?.text?.secondary,
                  fontSize: '0.875rem',
                  py: 1.5,
                  minWidth: 200
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="inherit">Buscar</Typography>
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

              {/* Tag: ahora el texto "Tag" arriba y el Select debajo */}
              <TableCell
                sx={{
                  color: safeMuiTheme.palette?.text?.secondary,
                  fontSize: '0.875rem',
                  py: 1.5,
                  minWidth: 180
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="inherit" sx={{ alignSelf: 'flex-start' }}>Tag</Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
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
                </Box>
              </TableCell>

              {/* Dificultad derecha: texto arriba, Select debajo */}
              <TableCell
                sx={{
                  color: safeMuiTheme.palette?.text?.secondary,
                  fontSize: '0.875rem',
                  py: 1.5,
                  minWidth: 150
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="inherit">Dificultad</Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
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
                </Box>
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
                {/* Actualicé colSpan a 6 porque ahora hay 6 columnas en el header */}
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery || difficultyFilter !== 'all' || tagFilter !== 'all'
                      ? 'No se encontraron flashcards con esos filtros'
                      : 'No hay flashcards en este deck'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchQuery || difficultyFilter !== 'all' || tagFilter !== 'all'
                      ? 'Intenta con otros términos de búsqueda o filtros'
                      : 'Crea tu primera flashcard para comenzar'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, mb: 2 }}>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Ir al principio">
              <span>
                <IconButton onClick={goToFirstPage} disabled={page === 0}>
                  <FirstPageIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Ir al final">
              <span>
                <IconButton
                  onClick={goToLastPage}
                  disabled={
                    (searchQuery.trim()
                      ? page >= Math.ceil((searchTotal || 0) / rowsPerPage) - 1
                      : page >= Math.ceil((totalCards || 0) / rowsPerPage) - 1)
                  }
                >
                  <LastPageIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Restablecer filas por página a 15">
              <span>
                <IconButton onClick={resetRowsPerPage} disabled={rowsPerPage === 15}>
                  <RestartAltIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Limpiar búsqueda y filtros, volver al inicio">
              <span>
                <IconButton onClick={clearTable}>
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
