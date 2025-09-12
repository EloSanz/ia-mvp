import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';

const EditFlashcardModal = ({
  open,
  onClose,
  editingCard,
  setEditingCard,
  onEdit,
  editing,
  muiTheme
}) => {
  const handleFrontChange = (e) => {
    if (editingCard) {
      setEditingCard({ ...editingCard, front: e.target.value });
    }
  };

  const handleBackChange = (e) => {
    if (editingCard) {
      setEditingCard({ ...editingCard, back: e.target.value });
    }
  };

  const handleSubmit = () => {
    if (editingCard && editingCard.front.trim() && editingCard.back.trim()) {
      onEdit();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ fontFamily: muiTheme.fontFamily }}>
        Editar Flashcard
      </DialogTitle>
      <DialogContent sx={{ fontFamily: muiTheme.fontFamily }}>
        {editingCard && (
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Pregunta"
              value={editingCard.front || ''}
              onChange={handleFrontChange}
              onKeyPress={handleKeyPress}
              sx={{ mb: 2 }}
              multiline
              rows={3}
              autoFocus
              placeholder="Escribe la pregunta o concepto..."
            />
            <TextField
              fullWidth
              label="Respuesta"
              value={editingCard.back || ''}
              onChange={handleBackChange}
              onKeyPress={handleKeyPress}
              sx={{ mb: 2 }}
              multiline
              rows={3}
              placeholder="Escribe la respuesta o explicación..."
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={editing}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={editing || !editingCard?.front?.trim() || !editingCard?.back?.trim()}
        >
          {editing ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditFlashcardModal;
