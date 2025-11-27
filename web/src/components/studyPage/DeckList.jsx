import React from 'react';

import { Grid, Typography } from '@mui/material';
import DeckCard from './DeckCard';

export default function DeckList({ decks, selectedDeckId, onSelect, onViewDeck }) {
  if (!decks?.length) return null;

  return (
    <>
      <Typography variant="h5" fontWeight={600} mb={3}>
        📖 Selecciona un Deck para Estudiar
      </Typography>

      <Grid container spacing={1.5}>
        {decks.map((deck) => (
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={deck.id}>
            <DeckCard
              deck={deck}
              selected={selectedDeckId === String(deck.id)}
              onSelect={() => onSelect(String(deck.id))}
              onView={() => onViewDeck(deck.id)}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
