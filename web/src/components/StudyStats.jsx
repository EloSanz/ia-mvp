/**
 * StudyStats Component
 *
 * Componente para mostrar estadísticas en tiempo real durante las sesiones de estudio
 * Incluye progreso, tiempos, distribución de dificultad y métricas clave
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  Icon
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Psychology as BrainIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const StudyStats = ({ session, stats, progress, formatTime, compact = false }) => {
  if (!session) {
    return null;
  }

  // Asegurar que stats tenga valores por defecto
  const safeStats = stats || {
    cardsReviewed: 0,
    easyCount: 0,
    normalCount: 0,
    hardCount: 0,
    timeSpent: 0,
    averageResponseTime: 0
  };

  const StatItem = ({ icon: IconComponent, label, value, color = 'primary' }) => (
    <Box display="flex" alignItems="center" gap={1}>
      <IconComponent fontSize="small" color={color} />
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  if (compact) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {session.deckName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sesión activa
              </Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <StatItem
                icon={CheckIcon}
                label="Revisadas"
                value={`${progress.current}/${progress.total}`}
              />
              <StatItem
                icon={TimeIcon}
                label="Tiempo"
                value={formatTime(safeStats.timeSpent * 1000)}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress.percentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {progress.percentage}% completado
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              📊 Estadísticas de Estudio
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sesión: {session.deckName}
            </Typography>
          </Box>
          <Chip label="Activa" color="success" size="small" icon={<CheckIcon />} />
        </Box>

        {/* Progreso Principal */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body1" fontWeight={500}>
              Progreso de la sesión
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress.current} de {progress.total} tarjetas
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.percentage}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            {progress.percentage}% completado
          </Typography>
        </Box>

        {/* Estadísticas en Grid */}
        <Grid container spacing={3}>
          {/* Columna 1: Conteos por dificultad */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              📈 Distribución por Dificultad
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 1 }} />
                  <Typography variant="body2">Fácil</Typography>
                </Box>
                <Typography variant="body1" fontWeight={500}>
                  {safeStats.easyCount}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: 1 }} />
                  <Typography variant="body2">Normal</Typography>
                </Box>
                <Typography variant="body1" fontWeight={500}>
                  {safeStats.normalCount}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: 1 }} />
                  <Typography variant="body2">Difícil</Typography>
                </Box>
                <Typography variant="body1" fontWeight={500}>
                  {safeStats.hardCount}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Columna 2: Métricas de Rendimiento */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              ⚡ Rendimiento
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <StatItem
                icon={CheckIcon}
                label="Tarjetas Revisadas"
                value={safeStats.cardsReviewed}
              />
              <StatItem
                icon={TimeIcon}
                label="Tiempo Total"
                value={formatTime(safeStats.timeSpent * 1000)}
              />
              <StatItem
                icon={TrendingIcon}
                label="Tiempo Promedio"
                value={
                  safeStats.averageResponseTime > 0 ? `${safeStats.averageResponseTime}s` : '--'
                }
              />
            </Box>
          </Grid>

          {/* Columna 3: Información de Sesión */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              📋 Información de Sesión
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <StatItem icon={ScheduleIcon} label="Tarjetas Totales" value={session.totalCards} />
              <StatItem icon={BrainIcon} label="Estado" value="Activa" color="success" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ID de Sesión
                </Typography>
                <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                  {session.id?.slice(0, 8)}...
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StudyStats;
