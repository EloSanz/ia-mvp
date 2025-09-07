import React, { useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { AutoFixHigh as AIIcon } from '@mui/icons-material';

const AIFlashcardsGenerator = ({ open, onClose, onGenerate }) => {
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    try {
      setGenerating(true);
      setError(null);

      // Real request to backend
      const response = await axios.post('/api/flashcards/ai-generate', { text });
      const generatedCards = response.data.flashcards;
      onGenerate(generatedCards);
      onClose();
    } catch (err) {
      setError('Error al generar las flashcards');
      console.error('Error generating flashcards:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon /> Generar Flashcards con IA
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body1" gutterBottom>
          Ingresa el texto del que quieres generar flashcards. La IA analizará el contenido y creará
          preguntas y respuestas relevantes.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Texto para generar flashcards"
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            * Las flashcards generadas serán guardadas en el deck actual y podrás editarlas manualmente
            después.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={!text.trim() || generating}
          startIcon={generating ? <CircularProgress size={20} /> : <AIIcon />}
        >
          {generating ? 'Generando...' : 'Generar Flashcards'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIFlashcardsGenerator;
