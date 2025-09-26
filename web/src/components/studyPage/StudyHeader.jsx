import React from 'react';

import { Box, Chip, Typography } from '@mui/material';
import { Psychology as BrainIcon, AccessTime as TimeIcon } from '@mui/icons-material';

export default function StudyHeader() {
  return (
    <Box textAlign="center" mb={4}>
      <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
        📚 Sistema de Estudio
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        Elige un deck y comienza a estudiar con repetición espaciada
      </Typography>
      <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
        <Chip icon={<BrainIcon />} label="Algoritmo de repetición espaciada" variant="outlined" color="primary" />
        <Chip icon={<TimeIcon />} label="Optimizado para retención" variant="outlined" color="secondary" />
      </Box>
    </Box>
  );
}
