import React from 'react';
import { TableRow, TableCell, Chip, IconButton, Tooltip, Box } from '@mui/material';
import { PlayArrow as PlayIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import TagCrud from './TagCrud';

const getDifficultyColor = (d) => {
  return d === 1 ? 'success' : d === 2 ? 'warning' : d === 3 ? 'error' : 'default';
};

const getDifficultyLabel = (d) => {
  return d === 1 ? 'Fácil' : d === 2 ? 'Normal' : d === 3 ? 'Difícil' : 'Sin dificultad';
};

const CardRow = ({
  card,
  tags,
  muiTheme,
  openReviewDialog,
  openEditDialog,
  handleDeleteCard,
  flashcards,
  setTags,
  loadDeckAndCards,
  tagsService,
  onCardTagUpdated,
  deckId,  // Nueva prop para pasar al TagCrud
  loadTags  // Función para recargar tags
}) => {
  return (
    <TableRow
      key={card.id}
      hover
      onClick={(e) => {
        // Excluir solo elementos específicos que tienen su propia funcionalidad
        const isTagTextField = e.target.closest('.MuiTextField-root');
        const isEditButton = e.target.closest('[aria-label="Editar"], [title="Editar"]');
        const isDeleteButton = e.target.closest('[aria-label="Eliminar"], [title="Eliminar"]');
        const isReviewButton = e.target.closest('[aria-label="Revisar"], [title="Revisar"]');

        // Si no es ninguno de los elementos excluidos, abrir la flashcard
        if (!isTagTextField && !isEditButton && !isDeleteButton && !isReviewButton) {
          openReviewDialog(card);
        }
      }}
      sx={{
        backgroundColor: muiTheme?.palette?.background?.paper || '#ffffff',
        cursor: 'pointer',
        '&:hover': { backgroundColor: muiTheme?.palette?.action?.hover || '#f5f5f5' }
      }}
    >
      <TableCell
        sx={{ color: muiTheme?.palette?.text?.primary || '#000000', fontSize: '0.95rem', py: 1.5 }}
      >
        {card.front.length > 25 ? card.front.substring(0, 25) + '…' : card.front}
      </TableCell>
      <TableCell sx={{ py: 1.5 }}>
        {/* Columna de búsqueda - vacía en las filas de datos */}
      </TableCell>
      <TableCell sx={{ py: 1.5 }}>
        <TagCrud
          card={card}
          tags={tags}
          muiTheme={muiTheme}
          flashcards={flashcards}
          setTags={setTags}
          loadDeckAndCards={loadDeckAndCards}
          tagsService={tagsService}
          onCardTagUpdated={onCardTagUpdated}
          deckId={deckId}  // Pasar deckId al TagCrud
          loadTags={loadTags}  // Pasar función para recargar tags
        />
      </TableCell>
      <TableCell sx={{ py: 1.5 }}>
        <Chip
          label={getDifficultyLabel(card.difficulty)}
          color={getDifficultyColor(card.difficulty)}
          size="small"
        />
      </TableCell>
      <TableCell sx={{ py: 1.5 }}>{card.reviewCount > 0 ? `${card.reviewCount}` : '0'}</TableCell>
      <TableCell sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip title="Revisar">
            <IconButton
              size="small"
              aria-label="Revisar"
              sx={{ color: muiTheme.palette.icon?.main || muiTheme.palette.primary.main }}
              onClick={(e) => {
                e.stopPropagation();
                openReviewDialog(card);
              }}
            >
              <PlayIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              aria-label="Editar"
              sx={{ color: muiTheme.palette.icon?.main || muiTheme.palette.secondary.main }}
              onClick={(e) => {
                e.stopPropagation();
                openEditDialog(card);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              aria-label="Eliminar"
              sx={{ color: muiTheme.palette.icon?.main || muiTheme.palette.error.main }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCard(card.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default CardRow;
