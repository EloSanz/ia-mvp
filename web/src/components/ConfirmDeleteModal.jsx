import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar eliminación',
  message = '¿Estás seguro de que quieres eliminar este elemento?',
  itemName = '',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  showItemName = true,
  size = 'sm' // "xs", "sm", "md"
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={size}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: size === 'xs' ? 0.5 : 1
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'error.main' }}>
            <WarningIcon />
          </Avatar>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
        {showItemName && itemName && (
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" fontWeight="medium">
              &quot;{itemName}&quot;
            </Typography>
          </Box>
        )}
        <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: size === 'xs' ? 2 : 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ minWidth: size === 'xs' ? 80 : 100 }}>
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          sx={{ minWidth: size === 'xs' ? 80 : 100 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteModal;
