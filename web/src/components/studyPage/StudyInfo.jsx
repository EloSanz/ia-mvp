import React from 'react';

import { Card, CardContent, Box, Typography } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

export default function StudyInfo() {
  return (
    <Card sx={{ mt: 4, bgcolor: 'grey.50' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <InfoIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>Sobre el Sistema de Estudio</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Este sistema utiliza el algoritmo de <strong>repetición espaciada</strong>…
        </Typography>

        <Box component="ul" sx={{ pl: 2, mt: 1 }}>
          <Typography component="li" variant="body2" color="text.secondary"><strong>Fácil:</strong> 3 días</Typography>
          <Typography component="li" variant="body2" color="text.secondary"><strong>Normal:</strong> 1 día</Typography>
          <Typography component="li" variant="body2" color="text.secondary"><strong>Difícil:</strong> 6 horas</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
