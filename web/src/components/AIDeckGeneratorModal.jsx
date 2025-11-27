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
  Alert,
  Tabs,
  Tab,
  Slider,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { 
  AutoAwesome as AIIcon, 
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

const AIDeckGeneratorModal = ({ open, onClose, onGenerate }) => {
  const muiTheme = useMuiTheme();
  const { decks } = useApi();
  
  // Estados principales
  const [activeTab, setActiveTab] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState(null);
  const [generationStep, setGenerationStep] = useState(0);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    topic: '',
    flashcardCount: 10,
    generateCover: true
  });

  const generationSteps = [
    'Generando metadata del deck...',
    'Creando flashcards...',
    'Guardando en la base de datos...',
    'Generando portada...'
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      setError(null);
      const response = await decks.suggestTopics(3);
      setSuggestions(response.data.data.topics || []);
    } catch (err) {
      setError('Error al cargar sugerencias');
      console.error('Error loading suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleGenerate = async (mode, topic = null) => {
    const finalTopic = topic || formData.topic;
    
    if (!finalTopic.trim()) {
      setError('El tema es requerido');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setGenerationStep(0);

      const config = {
        mode,
        topic: finalTopic,
        flashcardCount: formData.flashcardCount,
        generateCover: formData.generateCover
      };

      // Simular pasos de generación
      const stepInterval = setInterval(() => {
        setGenerationStep(prev => {
          if (prev < generationSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000);

      const response = await decks.generateWithAI(config);
      
      clearInterval(stepInterval);
      setGenerationStep(generationSteps.length - 1);

      // Cerrar el modal inmediatamente y luego generar
      onClose();
      resetForm();
      onGenerate(response.data.data);

    } catch (err) {
      setError('Error al generar el deck');
      console.error('Error generating deck:', err);
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      topic: '',
      flashcardCount: 10,
      generateCover: true
    });
    setSuggestions([]);
    setGenerationStep(0);
    setActiveTab(0);
  };

  const handleClose = () => {
    if (!generating) {
      resetForm();
      onClose();
    }
  };

  const renderFreeMode = () => (
    <Box>
      <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
        Ingresa un tema y la IA creará un deck completo con flashcards relevantes.
      </Typography>
      <TextField
        autoFocus
        fullWidth
        label="Tema del deck"
        placeholder="Ej: Física cuántica, Historia de Roma, Programación en Python..."
        value={formData.topic}
        onChange={(e) => handleInputChange('topic', e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography variant="body2">Cantidad de flashcards:</Typography>
        <Slider
          value={formData.flashcardCount}
          onChange={(e, value) => handleInputChange('flashcardCount', value)}
          min={5}
          max={20}
          step={1}
          valueLabelDisplay="auto"
          sx={{ width: 200 }}
        />
        <Typography variant="body2" sx={{ minWidth: 30 }}>
          {formData.flashcardCount}
        </Typography>
      </Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.generateCover}
            onChange={(e) => handleInputChange('generateCover', e.target.checked)}
            color="primary"
          />
        }
        label="Generar portada automática por IA"
        sx={{ mt: 1 }}
      />
    </Box>
  );


  const renderSuggestedMode = () => (
    <Box>
      <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
        La IA analizará tus decks existentes y sugerirá temas relacionados.
      </Typography>
      
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.generateCover}
            onChange={(e) => handleInputChange('generateCover', e.target.checked)}
            color="primary"
          />
        }
        label="Generar portada automática por IA"
        sx={{ mb: 2 }}
      />
      
      {suggestions.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Button
            variant="contained"
            startIcon={loadingSuggestions ? <CircularProgress size={20} /> : <LightbulbIcon />}
            onClick={loadSuggestions}
            disabled={loadingSuggestions}
            sx={{ mb: 2 }}
          >
            {loadingSuggestions ? 'Generando sugerencias...' : 'Obtener Sugerencias'}
          </Button>
          <Typography variant="body2" color="text.secondary">
            Haz clic para obtener sugerencias personalizadas basadas en tus decks actuales
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>
            Temas sugeridos para ti:
          </Typography>
          {suggestions.map((suggestion, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {suggestion.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {suggestion.description}
                </Typography>
                <Typography variant="caption" color="primary">
                  💡 {suggestion.reasoning}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AIIcon />}
                  onClick={() => handleGenerate('suggested', suggestion.title)}
                  disabled={generating}
                >
                  Generar este deck
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={generating}
    >
      <DialogTitle
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          fontFamily: muiTheme.fontFamily 
        }}
      >
        <AIIcon /> Crear Deck con IA
      </DialogTitle>
      
      <DialogContent sx={{ fontFamily: muiTheme.fontFamily }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {generating && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generando tu deck...
            </Typography>
            <Stepper activeStep={generationStep} alternativeLabel>
              {generationSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        )}

        {!generating && (
          <>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              sx={{ mb: 2 }}
            >
              <Tab 
                icon={<PsychologyIcon />} 
                label="Tema Libre" 
                iconPosition="start"
              />
              <Tab 
                icon={<LightbulbIcon />} 
                label="Sugerencias Personalizadas" 
                iconPosition="start"
              />
            </Tabs>

            {activeTab === 0 && renderFreeMode()}
            {activeTab === 1 && renderSuggestedMode()}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={generating}>
          {generating ? 'Generando...' : 'Cancelar'}
        </Button>
        {activeTab < 2 && !generating && (
          <Button
            onClick={() => handleGenerate(activeTab === 0 ? 'free' : 'configured')}
            variant="contained"
            disabled={!formData.topic.trim()}
            startIcon={<AIIcon />}
          >
            Generar Deck
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AIDeckGeneratorModal;
