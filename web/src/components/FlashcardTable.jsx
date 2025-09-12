import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableContainer
} from '@mui/material';
import CardRow from './CardRow';

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
  openReviewDialog,
  openEditDialog,
  handleDeleteCard,
  setPage,
  flashcards,
  setTags,
  loadDeckAndCards,
  tagsService
}) => {
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ color: muiTheme.palette.text.secondary, fontSize: '0.875rem', py: 1.5 }}
            >
              Consigna
            </TableCell>
            <TableCell
              sx={{ color: muiTheme.palette.text.secondary, fontSize: '0.875rem', py: 1.5 }}
            >
              Tag
            </TableCell>
            <TableCell
              sx={{ color: muiTheme.palette.text.secondary, fontSize: '0.875rem', py: 1.5 }}
            >
              Dificultad
            </TableCell>
            <TableCell
              sx={{ color: muiTheme.palette.text.secondary, fontSize: '0.875rem', py: 1.5 }}
            >
              Revisiones
            </TableCell>
            <TableCell
              sx={{
                color: muiTheme.palette.text.secondary,
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
          {(searchQuery ? searchResults : cards).map((card) => (
            <CardRow
              key={card.id}
              card={card}
              tags={tags}
              muiTheme={muiTheme}
              openReviewDialog={openReviewDialog}
              openEditDialog={openEditDialog}
              handleDeleteCard={handleDeleteCard}
              flashcards={flashcards}
              setTags={setTags}
              loadDeckAndCards={loadDeckAndCards}
              tagsService={tagsService}
            />
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[15]}
        component="div"
        count={searchQuery ? searchTotal : totalCards}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={() => {}}
        labelRowsPerPage="Flashcards por página"
      />
    </TableContainer>
  );
};

export default FlashcardTable;
