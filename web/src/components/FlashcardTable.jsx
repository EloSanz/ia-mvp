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
  Box
} from '@mui/material';
import CardRow from './CardRow';
import SearchBar from './SearchBar';

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
  openReviewDialog,
  openEditDialog,
  handleDeleteCard,
  setPage,
  flashcards,
  setTags,
  tagsService,
  onCardTagUpdated,
  loadDeckAndCards
}) => {
  // Verificaciones defensivas
  const safeMuiTheme = muiTheme || {};
  const safeCards = Array.isArray(cards) ? cards : [];
  const safeTags = Array.isArray(tags) ? tags : [];
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

  const displayCards = searchQuery ? safeSearchResults : safeCards;

  // Debug logging (remover después de solucionar)
  // console.log('FlashcardTable props:', {
  //   cardsLength: safeCards.length,
  //   tagsLength: safeTags.length,
  //   searchResultsLength: safeSearchResults.length,
  //   displayCardsLength: displayCards.length,
  //   muiTheme: !!safeMuiTheme,
  //   page,
  //   rowsPerPage,
  //   totalCards
  // });

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
              <TableCell
                sx={{ color: safeMuiTheme.palette?.text?.secondary, fontSize: '0.875rem', py: 1.5 }}
              >
                Tag
              </TableCell>
              <TableCell
                sx={{ color: safeMuiTheme.palette?.text?.secondary, fontSize: '0.875rem', py: 1.5 }}
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
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery
                      ? 'No se encontraron flashcards con esa búsqueda'
                      : 'No hay flashcards en este deck'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchQuery
                      ? 'Intenta con otros términos de búsqueda'
                      : 'Crea tu primera flashcard para comenzar'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[15]}
          component="div"
          count={searchQuery ? searchTotal || 0 : totalCards || 0}
          rowsPerPage={rowsPerPage || 15}
          page={page || 0}
          onPageChange={(e, newPage) => setPage && setPage(newPage)}
          onRowsPerPageChange={() => {}}
          labelRowsPerPage="Flashcards por página"
        />
      </TableContainer>
    );
  } catch (error) {
    // console.error('Error rendering FlashcardTable:', error);
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
