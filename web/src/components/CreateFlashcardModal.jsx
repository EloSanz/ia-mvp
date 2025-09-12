import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress
} from '@mui/material';

const CreateFlashcardModal = ({
  open,
  onClose,
  newCard,
  setNewCard,
  onCreate,
  creating,
  muiTheme
}) => {
  const handleFrontChange = (e) => {
    setNewCard({ ...newCard, front: e.target.value });
  };

  const handleBackChange = (e) => {
    setNewCard({ ...newCard, back: e.target.value });
  };

  const handleSubmit = () => {
    if (newCard.front.trim() && newCard.back.trim()) {
      onCreate();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: muiTheme.fontFamily }}>Crear Nueva Flashcard</DialogTitle>
      <DialogContent sx={{ fontFamily: muiTheme.fontFamily }}>
        <TextField
          autoFocus
          margin="dense"
          label="Anverso (pregunta)"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={newCard.front}
          onChange={handleFrontChange}
          onKeyPress={handleKeyPress}
          sx={{ mb: 2 }}
          placeholder="Escribe la pregunta o concepto..."
        />
        <TextField
          margin="dense"
          label="Reverso (respuesta)"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={newCard.back}
          onChange={handleBackChange}
          onKeyPress={handleKeyPress}
          placeholder="Escribe la respuesta o explicación..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={creating}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!newCard.front.trim() || !newCard.back.trim() || creating}
        >
          {creating ? <CircularProgress size={20} /> : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFlashcardModal;
