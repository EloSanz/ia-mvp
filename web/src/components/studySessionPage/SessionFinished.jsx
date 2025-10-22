import React from 'react';
import { Container, Box, Button, Typography, Fade } from '@mui/material';

export default function SessionFinished({ stats, formatTime, onRestart, onHome }) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Fade in timeout={500}>
        <Box textAlign="center">
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            🎉 ¡Sesión Completada!
          </Typography>

          <Box sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
              Estadísticas Finales
            </Typography>

            <Box display="flex" justifyContent="center" gap={4} flexWrap="wrap" sx={{ mt: 3 }}>
              <StatBig
                label="Tarjetas Revisadas"
                value={stats.cardsReviewed}
                color="success.main"
              />
              {/* Eliminamos tiempo total y promedio: no se muestran */}
            </Box>

            <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap" sx={{ mt: 3 }}>
              <Stat label="Fácil" value={stats.easyCount} color="success.main" />
              <Stat label="Normal" value={stats.normalCount} color="warning.main" />
              <Stat label="Difícil" value={stats.hardCount} color="error.main" />
            </Box>
          </Box>

          <Box sx={{ mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={onRestart}
              sx={{ mr: 2, textTransform: 'none' }}
            >
              Estudiar Otro Deck
            </Button>
            <Button variant="outlined" size="large" onClick={onHome} sx={{ textTransform: 'none' }}>
              Volver al Inicio
            </Button>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
}

function StatBig({ label, value, color }) {
  return (
    <Box textAlign="center">
      <Typography variant="h3" fontWeight={700} sx={{ color }}>
        {value}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
function Stat({ label, value, color }) {
  return (
    <Box textAlign="center">
      <Typography variant="h5" sx={{ color }}>
        {value} {label}
      </Typography>
    </Box>
  );
}
