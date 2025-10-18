/**
 * StudyCard Component
 *
 * Componente principal para mostrar flashcards durante las sesiones de estudio
 * Maneja la transición entre pregunta y respuesta con animaciones
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Fade
} from '@mui/material';
import {
  Flip as FlipIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

const StudyCard = ({
  card,
  showingAnswer,
  onShowAnswer,
  onReview,
  responseTime,
  formatTime,
  loading = false,
  disabled = false
}) => {
  if (!card) {
    return (
      <Card
        sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No hay más tarjetas para estudiar
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1:
        return 'success'; // Fácil
      case 2:
        return 'warning'; // Normal
      case 3:
        return 'error'; // Difícil
      default:
        return 'default';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 1:
        return 'Fácil';
      case 2:
        return 'Normal';
      case 3:
        return 'Difícil';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Card
      sx={{
        minHeight: 500,
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        transform: showingAnswer ? 'scale(1.02)' : 'scale(1)',
        boxShadow: showingAnswer ? 8 : 2,
        border: showingAnswer ? '2px solid' : 'none',
        borderColor: showingAnswer ? 'primary.main' : 'transparent'
      }}
    >
      {/* Header con información de la card */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={1} alignItems="center">
            <Chip
              size="small"
              label={getDifficultyLabel(card.difficulty)}
              color={getDifficultyColor(card.difficulty)}
              variant="outlined"
            />
            {card.reviewCount > 0 && (
              <Chip
                size="small"
                label={`${card.reviewCount} repeticiones`}
                variant="outlined"
                icon={<PsychologyIcon />}
              />
            )}
          </Box>

          {showingAnswer && (
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Tiempo de respuesta">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(responseTime)}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>

      {/* Contenido principal */}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        {/* Barra de progreso para mostrar que se está cargando */}
        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Área de contenido principal */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* PREGUNTA */}
          <Fade in={!showingAnswer} timeout={300}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  mb: 3,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  minHeight: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {card.front}
              </Typography>

              {!showingAnswer && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={onShowAnswer}
                  disabled={disabled || loading}
                  startIcon={<FlipIcon />}
                  sx={{
                    mt: 2,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem'
                  }}
                >
                  Mostrar Respuesta
                </Button>
              )}
            </Box>
          </Fade>

          {/* RESPUESTA */}
          <Fade in={showingAnswer} timeout={300}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: '0.9rem' }}>
                Pregunta:
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 400,
                  minHeight: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}
              >
                {card.front}
              </Typography>

              <Box sx={{ my: 3, py: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 1, fontSize: '0.9rem' }}
                >
                  Respuesta:
                </Typography>

                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 500,
                    lineHeight: 1.4,
                    minHeight: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.primary'
                  }}
                >
                  {card.back}
                </Typography>
              </Box>

              {/* Botones de dificultad */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  ¿Qué tan fácil fue recordar esta respuesta?
                </Typography>

                <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={() => onReview(1)}
                    disabled={disabled || loading}
                    sx={{
                      minWidth: 120,
                      textTransform: 'none',
                      fontSize: '1rem',
                      py: 1
                    }}
                  >
                    Fácil
                  </Button>

                  <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    onClick={() => onReview(2)}
                    disabled={disabled || loading}
                    sx={{
                      minWidth: 120,
                      textTransform: 'none',
                      fontSize: '1rem',
                      py: 1
                    }}
                  >
                    Normal
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    onClick={() => onReview(3)}
                    disabled={disabled || loading}
                    sx={{
                      minWidth: 120,
                      textTransform: 'none',
                      fontSize: '1rem',
                      py: 1
                    }}
                  >
                    Difícil
                  </Button>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Box>
      </CardContent>

      {/* Footer con información adicional */}
      {showingAnswer && card.nextReview && (
        <Box sx={{ p: 2, pt: 0, borderTop: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Próxima revisión: {new Date(card.nextReview).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default StudyCard;
