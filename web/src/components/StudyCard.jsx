/**
 * StudyCard Component
 *
 * Componente principal para mostrar flashcards durante las sesiones de estudio
 * Maneja la transición entre pregunta y respuesta con animación 3D de volteo
 * v2: Altura dinámica + Scroll inteligente + Responsive
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
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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

  // Estilos del scrollbar personalizado
  const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.3)',
      },
    },
    // Firefox
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)',
  };

  // Dimensiones dinámicas según dispositivo
  const cardDimensions = {
    width: isMobile ? '100%' : isTablet ? 700 : 800,
    minHeight: isMobile ? 400 : 500,
    maxHeight: isMobile ? '75vh' : '80vh',
  };

  // Tamaños de fuente responsive
  const fontSizes = {
    question: isMobile ? '24px' : '32px',
    answer: isMobile ? '20px' : '24px',
    buttonLabel: isMobile ? '16px' : '18px',
    buttonSubtext: isMobile ? '11px' : '12px',
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: isMobile ? 450 : 550,
        perspective: '1000px',
        px: isMobile ? 1 : 0,
      }}
    >
      {/* Contenedor de la tarjeta con animación 3D */}
      <Box
        sx={{
          position: 'relative',
          width: cardDimensions.width,
          minHeight: cardDimensions.minHeight,
          maxHeight: cardDimensions.maxHeight,
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
            boxShadow: 4,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden',
          }}
        >
          {/* Barra de progreso para mostrar que se está cargando */}
          {loading && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
              <LinearProgress />
            </Box>
          )}

          {/* Header con información de la card - FIXED */}
          <Box sx={{ 
            px: isMobile ? 2 : 3, 
            pt: isMobile ? 2 : 3,
            pb: 1,
            flexShrink: 0,
          }}>
            <Box display="flex" gap={1} alignItems="center" justifyContent="flex-start" flexWrap="wrap">
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

          {/* Contenido de la pregunta - SCROLLEABLE */}
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: isMobile ? 2 : 4,
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            ...scrollbarStyles,
          }}>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 600,
                fontSize: fontSizes.question,
                lineHeight: 1.4,
                color: '#FFFFFF',
                textAlign: 'center',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {card.front}
            </Typography>
          </Box>

          {/* Botón en la parte inferior - FIXED */}
          <Box sx={{ 
            px: isMobile ? 2 : 3,
            pb: isMobile ? 2 : 3,
            pt: 1,
            display: 'flex', 
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              disabled={disabled || loading}
              startIcon={<FlipIcon />}
              sx={{
                px: isMobile ? 3 : 4,
                py: isMobile ? 1 : 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: isMobile ? '1rem' : '1.1rem',
                position: 'relative'
              }}
            >
              Mostrar Respuesta
              {!isMobile && (
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
              )}
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
            boxShadow: 4,
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden',
          }}
        >
          {/* Header con información de la card - FIXED */}
          <Box sx={{ 
            px: isMobile ? 2 : 3, 
            pt: isMobile ? 2 : 3,
            pb: 1,
            flexShrink: 0,
          }}>
            <Box display="flex" gap={1} alignItems="center" justifyContent="flex-start" flexWrap="wrap">
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

          {/* Pregunta recordatorio - FIXED (siempre visible) */}
          <Box sx={{ 
            px: isMobile ? 2 : 4,
            pt: isMobile ? 1.5 : 2,
            pb: isMobile ? 1 : 1.5,
            flexShrink: 0,
          }}>
            <Typography
              sx={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.7)',
                fontStyle: 'italic',
                lineHeight: 1.4,
                textAlign: 'center',
              }}
            >
              {card.front}
            </Typography>
          </Box>

          {/* Contenido de la respuesta - SCROLLEABLE */}
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: isMobile ? 2 : 4,
            py: isMobile ? 1 : 1.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            ...scrollbarStyles,
          }}>
            <Box sx={{
              py: isMobile ? 2 : 3,
              px: isMobile ? 2 : 3,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: 1
            }}>
              <Typography
                sx={{
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: isMobile ? 1.5 : 2
                }}
              >
                Respuesta:
              </Typography>
              <Typography
                component="div"
                sx={{
                  fontSize: fontSizes.answer,
                  lineHeight: 1.6,
                  fontWeight: 400,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}
              >
                {card.back}
              </Typography>
            </Box>
          </Box>

          {/* Botones de dificultad - FIXED y RESPONSIVE */}
          <Box sx={{ 
            px: isMobile ? 2 : 3,
            pb: isMobile ? 2 : 3,
            pt: 1,
            flexShrink: 0,
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 1.5 : 2, 
              justifyContent: 'center',
            }}>
              {/* Botón Fácil */}
              <Button
                onClick={() => onReview(1)}
                disabled={disabled || loading}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: isMobile ? 'auto' : 140,
                  p: isMobile ? 1.5 : 2,
                  borderRadius: isMobile ? '8px' : '12px',
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                  <Typography sx={{ fontSize: fontSizes.buttonLabel, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
                    Fácil
                  </Typography>
                  <Typography sx={{ fontSize: fontSizes.buttonSubtext, fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.2 }}>
                    Revisar en 7 días
                  </Typography>
                </Box>
                {/* Badge numérico */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  bgcolor: '#10B981',
                  color: '#FFFFFF',
                  ml: 1,
                }}>
                  1
                </Box>
              </Button>

              {/* Botón Normal */}
              <Button
                onClick={() => onReview(2)}
                disabled={disabled || loading}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: isMobile ? 'auto' : 140,
                  p: isMobile ? 1.5 : 2,
                  borderRadius: isMobile ? '8px' : '12px',
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                  <Typography sx={{ fontSize: fontSizes.buttonLabel, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
                    Normal
                  </Typography>
                  <Typography sx={{ fontSize: fontSizes.buttonSubtext, fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.2 }}>
                    Revisar en 3 días
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  bgcolor: '#F59E0B',
                  color: '#FFFFFF',
                  ml: 1,
                }}>
                  2
                </Box>
              </Button>

              {/* Botón Difícil */}
              <Button
                onClick={() => onReview(3)}
                disabled={disabled || loading}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: isMobile ? 'auto' : 140,
                  p: isMobile ? 1.5 : 2,
                  borderRadius: isMobile ? '8px' : '12px',
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                  <Typography sx={{ fontSize: fontSizes.buttonLabel, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
                    Difícil
                  </Typography>
                  <Typography sx={{ fontSize: fontSizes.buttonSubtext, fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.2 }}>
                    Revisar pronto
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  bgcolor: '#EF4444',
                  color: '#FFFFFF',
                  ml: 1,
                }}>
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
