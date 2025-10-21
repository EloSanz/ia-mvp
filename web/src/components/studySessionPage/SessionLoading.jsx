import React from 'react';
import { Container, CircularProgress, Typography } from '@mui/material';

export default function SessionLoading({ text = 'Inicializando sesión de estudio...' }) {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, textAlign: 'center' }}>
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        {text}
      </Typography>
    </Container>
  );
}
