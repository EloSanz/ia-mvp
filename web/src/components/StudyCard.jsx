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
                fontSize: '32px',
                lineHeight: 1.4,
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
                  bottom: 'calc(100% + 12px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  animation: 'subtlePulse 2s ease-in-out infinite',
                  '@keyframes subtlePulse': {
                    '0%, 100%': { opacity: 0.8, transform: 'translateX(-50%) scale(1)' },
                    '50%': { opacity: 1, transform: 'translateX(-50%) scale(1.05)' }
                  }
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
            {/* Pregunta sin label redundante */}
            <Typography
              sx={{
                mb: 4, // margin 32px
                fontSize: '18px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.7)',
                fontStyle: 'italic',
                lineHeight: 1.5
              }}
            >
              {card.front}
            </Typography>

            <Box sx={{
              my: 2,
              py: 3,
              px: 3,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: 1
            }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 2
                }}
              >
                Respuesta:
              </Typography>
              <Typography
                component="div"
                sx={{
                  fontSize: '24px',
                  lineHeight: 1.6,
                  fontWeight: 400,
                  color: '#FFFFFF',
                  textAlign: 'center'
                }}
              >
                {card.back}
              </Typography>
            </Box>
          </Box>

          {/* Botones de dificultad en la parte inferior */}
          <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, px: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              {/* Botón Fácil */}
              <Button
                onClick={() => onReview(1)}
                disabled={disabled || loading}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  minWidth: 140,
                  p: 2,
                  borderRadius: '12px',
                  border: '2px solid transparent',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    borderColor: '#10B981',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  }
                }}
              >
                {/* Badge numérico esquina superior derecha */}
                <Box sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  bgcolor: '#10B981',
                  color: '#FFFFFF'
                }}>
                  1
                </Box>
                {/* Label principal */}
                <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
                  Fácil
                </Typography>
                {/* Intervalo */}
                <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.2 }}>
                  Revisar en 7 días
                </Typography>
              </Button>

              {/* Botón Normal */}
              <Button
                onClick={() => onReview(2)}
                disabled={disabled || loading}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  minWidth: 140,
                  p: 2,
                  borderRadius: '12px',
                  border: '2px solid transparent',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                    borderColor: '#F59E0B',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  }
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  bgcolor: '#F59E0B',
                  color: '#FFFFFF'
                }}>
                  2
                </Box>
                <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
                  Normal
                </Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.2 }}>
                  Revisar en 3 días
                </Typography>
              </Button>

              {/* Botón Difícil */}
              <Button
                onClick={() => onReview(3)}
                disabled={disabled || loading}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  minWidth: 140,
                  p: 2,
                  borderRadius: '12px',
                  border: '2px solid transparent',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: '#EF4444',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  }
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  bgcolor: '#EF4444',
                  color: '#FFFFFF'
                }}>
                  3
                </Box>
                <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
                  Difícil
                </Typography>
                <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.2 }}>
                  Revisar pronto
                </Typography>
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default StudyCard;
