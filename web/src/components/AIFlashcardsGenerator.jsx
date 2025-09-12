import React, { useState } from 'react';
import { useTheme as useMuiTheme } from '@mui/material';
import { useApi } from '../contexts/ApiContext';
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
  const muiTheme = useMuiTheme();
  const { flashcards: flashcardsService } = useApi();
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    try {
      setGenerating(true);
      setError(null);

      // Real request to backend - usando servicio centralizado
      const response = await flashcardsService.generateWithAI(text);
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
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', gap: 1, fontFamily: muiTheme.fontFamily }}
      >
        <AIIcon /> Generar Flashcards con IA
      </DialogTitle>
      <DialogContent sx={{ fontFamily: muiTheme.fontFamily }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body1" gutterBottom sx={{ fontFamily: muiTheme.fontFamily }}>
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
          sx={{ mt: 2, fontFamily: muiTheme.fontFamily }}
        />
        <Box mt={2}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: muiTheme.fontFamily }}
          >
            * Las flashcards generadas serán guardadas en el deck actual y podrás editarlas
            manualmente después.
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
