/**
 * StudyControls Component
 *
 * Componente con controles para gestionar la sesión de estudio
 * Incluye botones para pausar, continuar, finalizar y navegar
 */

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  SkipNext as SkipIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const StudyControls = ({
  session,
  progress,
  onPause,
  onResume,
  onFinish,
  onSkip,
  onRestart,
  onGoHome,
  loading = false,
  paused = false,
  canSkip = true,
  canFinish = true
}) => {
  const [confirmFinish, setConfirmFinish] = React.useState(false);

  const handleFinishClick = () => {
    setConfirmFinish(true);
  };

  const handleConfirmFinish = () => {
    setConfirmFinish(false);
    onFinish();
  };

  const handleCancelFinish = () => {
    setConfirmFinish(false);
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          p: 2,
          zIndex: 1000
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          maxWidth="lg"
          mx="auto"
        >
          {/* Información de progreso */}
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={`${progress.percentage}%`}
              color="primary"
              size="small"
              variant="outlined"
            />
            <Typography variant="body2" color="text.secondary">
              {progress.current} de {progress.total} tarjetas
            </Typography>
          </Box>

          {/* Controles principales */}
          <Box display="flex" gap={1} alignItems="center">
            {/* Botón Pausar/Reanudar */}
            <Tooltip title={paused ? 'Reanudar sesión' : 'Pausar sesión'}>
              <IconButton
                onClick={paused ? onResume : onPause}
                disabled={loading}
                color={paused ? 'primary' : 'default'}
                size="medium"
              >
                {paused ? <PlayIcon /> : <PauseIcon />}
              </IconButton>
            </Tooltip>

            {/* Botón Saltar (solo si hay más cards) */}
            {canSkip && (
              <Tooltip title="Saltar esta tarjeta">
                <IconButton
                  onClick={onSkip}
                  disabled={loading || paused}
                  color="default"
                  size="medium"
                >
                  <SkipIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Separador */}
            <Box sx={{ width: '1px', height: 28, bgcolor: 'divider', mx: 1.5 }} />

            {/* Botón Reiniciar */}
            <Tooltip title="Reiniciar sesión">
              <IconButton onClick={onRestart} disabled={loading} color="default" size="medium">
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {/* Botón Finalizar */}
            <Tooltip title="Finalizar sesión">
              <Button
                variant="contained"
                color="error"
                onClick={handleFinishClick}
                disabled={loading}
                startIcon={<StopIcon />}
                sx={{ textTransform: 'none' }}
              >
                Finalizar
              </Button>
            </Tooltip>

            {/* Botón Inicio */}
            <Tooltip title="Volver al inicio">
              <IconButton onClick={onGoHome} disabled={loading} color="default" size="large">
                <HomeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Espacio para que el contenido no quede oculto por los controles fijos */}
      <Box sx={{ height: 80 }} />

      {/* Diálogo de confirmación para finalizar */}
      <Dialog
        open={confirmFinish}
        onClose={handleCancelFinish}
        aria-labelledby="finish-dialog-title"
        aria-describedby="finish-dialog-description"
      >
        <DialogTitle id="finish-dialog-title">¿Finalizar sesión de estudio?</DialogTitle>
        <DialogContent>
          <DialogContentText id="finish-dialog-description">
            Estás a punto de finalizar la sesión de estudio. Se guardarán todas las estadísticas y
            podrás continuar más tarde desde donde te quedaste.
            <br />
            <br />
            <strong>Progreso actual: {progress.percentage}%</strong>
            <br />
            <strong>
              Tarjetas revisadas: {progress.current} de {progress.total}
            </strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelFinish} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmFinish}
            variant="contained"
            color="error"
            disabled={loading}
          >
            Finalizar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudyControls;
