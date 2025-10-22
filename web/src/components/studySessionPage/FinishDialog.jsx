import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

export default function FinishDialog({ open, onClose, onFinish }) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="finish-dialog-title">
      <DialogTitle id="finish-dialog-title">
        ¡Felicitaciones! Has completado todas las tarjetas
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Has revisado todas las tarjetas disponibles en esta sesión.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ¿Quieres finalizar la sesión y ver tus estadísticas finales?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Continuar Estudiando
        </Button>
        <Button onClick={onFinish} variant="contained">
          Finalizar Sesión
        </Button>
      </DialogActions>
    </Dialog>
  );
}
