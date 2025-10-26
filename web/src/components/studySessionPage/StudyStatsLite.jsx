import React from 'react';
import { Box, Card, CardContent, LinearProgress, Typography, Stack } from '@mui/material';

export default function StudyStatsLite({ stats, progress }) {
  const pct = progress?.percentage || 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ py: 2 }}>
        <Stack spacing={2}>
          {/* Progreso compacto en línea con contadores */}
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            {/* Barra de progreso compacta */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={pct} 
                  sx={{ 
                    flex: 1, 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'action.hover'
                  }} 
                />
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35, textAlign: 'right' }}>
                  {pct}%
                </Typography>
              </Box>
            </Box>

            {/* Contadores por dificultad */}
            <Box display="flex" gap={2} flexWrap="wrap">
              <Kpi label="Fácil" value={stats.easyCount} color="success.main" />
              <Kpi label="Normal" value={stats.normalCount} color="warning.main" />
              <Kpi label="Difícil" value={stats.hardCount} color="error.main" />
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Kpi({ label, value, color }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ color }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
