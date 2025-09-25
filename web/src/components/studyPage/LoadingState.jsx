import React from 'react';
import { Container, CircularProgress, Typography } from '@mui/material';

export default function LoadingState() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Cargando decks disponibles...
      </Typography>
    </Container>
  );
}
