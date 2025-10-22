import React from 'react';

import { Card, CardContent, CardActions, Box, Typography, Chip, Button } from '@mui/material';
import { LibraryBooks as BooksIcon, PlayArrow as PlayIcon } from '@mui/icons-material';

export default function DeckCard({ deck, selected, onSelect, onView }) {
  // Stats mockeadas (mismo cálculo que tenías)
  const totalCards = deck.cardCount || 0;
  const dueCards = totalCards > 0 ? Math.floor(Math.random() * totalCards) : 0;
  const reviewedCards = totalCards > 0 ? Math.floor(Math.random() * (totalCards - dueCards)) : 0;
  const newCards = Math.max(0, totalCards - dueCards - reviewedCards);

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
      }}
      onClick={onSelect}
    >
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" fontWeight={600}>
            {deck.name}
          </Typography>
          <Chip
            label={deck.isPublic ? 'Público' : 'Privado'}
            size="small"
            color={deck.isPublic ? 'success' : 'default'}
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {deck.description || 'Sin descripción'}
        </Typography>

        <Box display="flex" flexDirection="column" gap={1}>
          <Row label="Total de tarjetas:" value={totalCards} icon={<BooksIcon />} />
          <Row label="Pendientes:" value={dueCards} chipProps={{ color: 'warning' }} />
          <Row label="Nuevas:" value={newCards} chipProps={{ color: 'info' }} />
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            onView?.();
          }}
        >
          Ver Deck
        </Button>
        {selected && <Chip label="Seleccionado" color="primary" size="small" icon={<PlayIcon />} />}
      </CardActions>
    </Card>
  );
}

function Row({ label, value, icon, chipProps }) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Chip label={value} size="small" icon={icon} variant="outlined" {...chipProps} />
    </Box>
  );
}
