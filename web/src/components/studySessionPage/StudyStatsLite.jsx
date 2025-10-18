import React from 'react';
import { Box, Card, CardContent, LinearProgress, Typography, Stack } from '@mui/material';

export default function StudyStatsLite({ stats, progress }) {
  const pct = Math.round((progress?.current || 0) * 100);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack spacing={1}>
          {/* Progreso sin “0/de n” */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Progreso
            </Typography>
            <LinearProgress variant="determinate" value={pct} />
            <Typography variant="caption" color="text.secondary">
              {pct}%
            </Typography>
          </Box>

          {/* Contadores por dificultad */}
          <Box display="flex" gap={3} flexWrap="wrap">
            <Kpi label="Fácil" value={stats.easyCount} color="success.main" />
            <Kpi label="Normal" value={stats.normalCount} color="warning.main" />
            <Kpi label="Difícil" value={stats.hardCount} color="error.main" />
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
