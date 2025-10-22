import React from 'react';
import { Container, Alert, Box, Button } from '@mui/material';

export default function SessionError({ onBack }) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Alert severity="error">
        Error al cargar la sesión de estudio. Por favor, intenta nuevamente.
      </Alert>
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={onBack}>
          Volver a Estudiar
        </Button>
      </Box>
    </Container>
  );
}
