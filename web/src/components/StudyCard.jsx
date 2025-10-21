/**
 * StudyCard Component
 *
 * Componente principal para mostrar flashcards durante las sesiones de estudio
 * Maneja la transición entre pregunta y respuesta con animación 3D de volteo
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
  LinearProgress
} from '@mui/material';
import {
  Flip as FlipIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

const StudyCard = ({
  card,
  showingAnswer,
  onShowAnswer,
  onReview,
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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
        perspective: '1000px'
      }}
    >
      {/* Contenedor de la tarjeta con animación 3D */}
      <Box
        sx={{
          position: 'relative',
          width: 700,
          height: 400,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease-in-out',
          transform: showingAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
          cursor: !showingAnswer ? 'pointer' : 'default'
        }}
        onClick={!showingAnswer && !disabled && !loading ? onShowAnswer : undefined}
      >
        {/* Cara frontal (pregunta) */}
        <Card
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
            boxShadow: 4,
            borderRadius: 3
          }}
        >
          {/* Header con información de la card */}
          <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
            <Box display="flex" gap={1} alignItems="center" justifyContent="flex-start">
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
          </Box>

          {/* Barra de progreso para mostrar que se está cargando */}
          {loading && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
              <LinearProgress />
            </Box>
          )}

          {/* Contenido de la pregunta */}
          <Box sx={{ textAlign: 'center', px: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 600,
                fontSize: '2rem', // 32px
                lineHeight: 1.3,
                color: '#FFFFFF',
                textAlign: 'center',
                mb: 3,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {card.front}
            </Typography>
          </Box>

          {/* Botón en la parte inferior */}
          <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              disabled={disabled || loading}
              startIcon={<FlipIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                position: 'relative'
              }}
            >
              Mostrar Respuesta
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'background.paper',
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 0.5,
                  py: 0.25,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  minWidth: 20,
                  textAlign: 'center',
                  boxShadow: 1
                }}
              >
                ESPACIO
              </Box>
            </Button>
          </Box>
        </Card>

        {/* Cara trasera (respuesta) */}
        <Card
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
            boxShadow: 4,
            borderRadius: 3
          }}
        >
          {/* Header con información de la card */}
          <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
            <Box display="flex" gap={1} alignItems="center" justifyContent="flex-start">
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
          </Box>

          {/* Contenido de la respuesta */}
          <Box sx={{ textAlign: 'center', px: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.9rem' }}>
              Pregunta:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                fontWeight: 500,
                color: 'text.secondary',
                fontStyle: 'italic',
                fontSize: '0.9rem'
              }}
            >
              {card.front}
            </Typography>

            <Box sx={{
              my: 2,
              py: 2,
              px: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 1
            }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 500 }}
              >
                Respuesta:
              </Typography>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: 'text.primary',
                  textAlign: 'center'
                }}
              >
                {card.back}
              </Typography>
            </Box>
          </Box>

          {/* Botones de dificultad en la parte inferior */}
          <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, px: 2 }}>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                mb: 2,
                fontWeight: 500,
                textAlign: 'center',
                fontSize: '0.9rem'
              }}
            >
              ¿Qué tan fácil fue recordar esta respuesta?
            </Typography>

            <Box display="flex" gap={1.5} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => onReview(1)}
                disabled={disabled || loading}
                sx={{
                  minWidth: 80,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  py: 0.5,
                  position: 'relative'
                }}
              >
                Fácil
                <Box
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0.5,
                    px: 0.5,
                    py: 0.25,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    minWidth: 16,
                    textAlign: 'center',
                    boxShadow: 1
                  }}
                >
                  1
                </Box>
              </Button>

              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => onReview(2)}
                disabled={disabled || loading}
                sx={{
                  minWidth: 80,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  py: 0.5,
                  position: 'relative'
                }}
              >
                Normal
                <Box
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0.5,
                    px: 0.5,
                    py: 0.25,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    minWidth: 16,
                    textAlign: 'center',
                    boxShadow: 1
                  }}
                >
                  2
                </Box>
              </Button>

              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => onReview(3)}
                disabled={disabled || loading}
                sx={{
                  minWidth: 80,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  py: 0.5,
                  position: 'relative'
                }}
              >
                Difícil
                <Box
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0.5,
                    px: 0.5,
                    py: 0.25,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    minWidth: 16,
                    textAlign: 'center',
                    boxShadow: 1
                  }}
                >
                  3
                </Box>
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default StudyCard;
