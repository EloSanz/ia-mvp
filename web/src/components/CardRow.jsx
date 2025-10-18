// CardRow.jsx (versión corregida)
import React from 'react';
import { TableRow, TableCell, Chip, IconButton, Tooltip, Box } from '@mui/material';
import { PlayArrow as PlayIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import TagCrud from './TagCrud';

const getDifficultyColor = (d) =>
  d === 1 ? 'success' : d === 2 ? 'warning' : d === 3 ? 'error' : 'default';

const getDifficultyLabel = (d) =>
  d === 1 ? 'Fácil' : d === 2 ? 'Normal' : d === 3 ? 'Difícil' : 'Sin dificultad';

const CardRow = ({
  card,
  tags,
  muiTheme = {},
  openReviewDialog,
  openEditDialog,
  handleDeleteCard,
  flashcards,
  setTags,
  loadDeckAndCards,
  tagsService,
  onCardTagUpdated
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

        if (!isTagTextField && !isEditButton && !isDeleteButton && !isReviewButton) {
          openReviewDialog(card);
        }
      }}
      sx={{
        backgroundColor: muiTheme?.palette?.background?.paper || '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: muiTheme?.palette?.action?.hover || '#f5f5f5',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-1px)'
        }
      }}
    >
      {/* 1-2) Consigna (ocupa ambas columnas: Consigna + Buscar) */}
      <TableCell
        sx={{
          color: muiTheme?.palette?.text?.primary || '#000000',
          fontSize: '0.95rem',
          py: 1.5,
          verticalAlign: 'top'
        }}
        colSpan={2}
      >
        {card.front.length > 120 ? card.front.substring(0, 120) + '…' : card.front}
      </TableCell>

      {/* 3) Tag (TagCrud) */}
      <TableCell sx={{ py: 1.5, verticalAlign: 'top' }}>
        <TagCrud
          card={card}
          tags={tags}
          muiTheme={muiTheme}
          flashcards={flashcards}
          setTags={setTags}
          loadDeckAndCards={loadDeckAndCards}
          tagsService={tagsService}
          onCardTagUpdated={onCardTagUpdated}
        />
      </TableCell>

      {/* 4) Dificultad (Chip) */}
      <TableCell sx={{ py: 1.5, verticalAlign: 'middle' }}>
        <Chip
          label={getDifficultyLabel(card.difficulty)}
          color={getDifficultyColor(card.difficulty)}
          size="small"
        />
      </TableCell>

      {/* 5) Revisiones */}
      <TableCell sx={{ py: 1.5, verticalAlign: 'middle' }}>
        {card.reviewCount > 0 ? `${card.reviewCount}` : '0'}
      </TableCell>

      {/* 6) Acciones */}
      <TableCell sx={{ py: 1, verticalAlign: 'middle' }}>
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            justifyContent: 'flex-end',
            opacity: 0.7,
            transition: 'opacity 0.2s ease-in-out',
            '&:hover': { opacity: 1 }
          }}
        >
          <Tooltip title="Revisar">
            <IconButton
              size="small"
              aria-label="Revisar"
              sx={{
                color: muiTheme.palette?.icon?.main || muiTheme.palette?.primary?.main,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: (muiTheme.palette?.primary?.main || '#1976d2') + '20',
                  transform: 'scale(1.1)'
                }
              }}
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
              sx={{
                color: muiTheme.palette?.icon?.main || muiTheme.palette?.secondary?.main,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: (muiTheme.palette?.secondary?.main || '#dc004e') + '20',
                  transform: 'scale(1.1)'
                }
              }}
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
              sx={{
                color: muiTheme.palette?.icon?.main || muiTheme.palette?.error?.main,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: (muiTheme.palette?.error?.main || '#f44336') + '20',
                  transform: 'scale(1.1)'
                }
              }}
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
