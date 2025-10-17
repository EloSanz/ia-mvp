import React, { useState } from 'react';
import { useTheme as useMuiTheme } from '@mui/material';
import { useApi } from '../../contexts/ApiContext';
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
      console.log('🚀 Iniciando generación de flashcards con IA...');
      const response = await flashcardsService.generateWithAI(text, { timeout: 90000 });
      console.log('✅ Respuesta recibida:', response);
      const generatedCards = response.data.flashcards;
      console.log('📝 Flashcards generadas:', generatedCards);
      onGenerate(generatedCards);
      onClose();
    } catch (err) {
      let errorMessage = 'Error al generar las flashcards';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Timeout: La generación tomó demasiado tiempo. Intenta con un texto más corto.';
      } else if (err.response) {
        errorMessage = `Error del servidor: ${err.response.status} - ${err.response.data?.error || 'Error desconocido'}`;
      } else if (err.request) {
        errorMessage = 'Error de conexión: No se pudo conectar al servidor';
      }
      setError(errorMessage);
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
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: muiTheme.fontFamily, mb: 2 }}>
          💡 <strong>Tip:</strong> Para mejores resultados, usa textos de 200-500 palabras. Textos muy largos pueden tardar más en procesarse.
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
