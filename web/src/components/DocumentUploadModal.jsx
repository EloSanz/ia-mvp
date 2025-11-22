import React, { useState, useCallback } from 'react';
import { useTheme as useMuiTheme } from '@mui/material';
import { useApi } from '../contexts/ApiContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Slider,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';

const DocumentUploadModal = ({ open, onClose, onGenerate }) => {
  const muiTheme = useMuiTheme();
  const { decks } = useApi();
  
  // Estados
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [generationStep, setGenerationStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(null);
  
  // Configuración
  const [formData, setFormData] = useState({
    flashcardCount: 10,
    generateCover: true
  });

  const generationSteps = [
    'Extrayendo texto del documento...',
    'Analizando contenido...',
    'Generando flashcards con IA...',
    'Creando portada...'
  ];

  // Drag & Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (selectedFile) => {
    // Validar tipo de archivo
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Solo se permiten archivos PDF, DOCX y DOC');
      return;
    }
    
    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('El archivo es demasiado grande. Máximo 5MB');
      return;
    }
    
    // Validar que no esté vacío
    if (selectedFile.size === 0) {
      setError('El archivo está vacío');
      return;
    }
    
    // Calcular tiempo estimado basado en tamaño
    const sizeMB = selectedFile.size / (1024 * 1024);
    let estimatedMin = 1;
    if (sizeMB < 0.5) {
      estimatedMin = 1;
    } else if (sizeMB < 1) {
      estimatedMin = 1.5;
    } else if (sizeMB < 2) {
      estimatedMin = 2;
    } else if (sizeMB < 3) {
      estimatedMin = 2.5;
    } else {
      estimatedMin = 3;
    }
    
    setEstimatedTime(`${Math.floor(estimatedMin)}-${Math.ceil(estimatedMin + 1)} minutos`);
    setFile(selectedFile);
    setError(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!file) return;

    let stepInterval = null;

    try {
      setUploading(true);
      setError(null);
      setGenerationStep(0);

      const formDataToSend = new FormData();
      formDataToSend.append('document', file);
      formDataToSend.append('flashcardCount', formData.flashcardCount);
      formDataToSend.append('generateCover', formData.generateCover);

      // Simular pasos de generación
      stepInterval = setInterval(() => {
        setGenerationStep(prev => {
          if (prev < generationSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2500);

      const response = await decks.generateFromDocument(formDataToSend);
      
      clearInterval(stepInterval);
      stepInterval = null;
      setGenerationStep(generationSteps.length - 1);

      console.log('✅ Deck generado exitosamente:', response.data);

      // Cerrar el modal y generar
      setTimeout(() => {
        onClose();
        resetForm();
        onGenerate(response.data.data);
      }, 500);

    } catch (err) {
      console.error('Error uploading document:', err);
      
      // Manejar timeout específicamente
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('El procesamiento está tomando más tiempo del esperado. El deck podría haberse creado exitosamente, por favor verifica tu lista de decks.');
      } else {
        const errorMessage = err.response?.data?.error || 'Error al procesar el documento';
        setError(errorMessage);
      }
    } finally {
      // Limpiar intervalo si aún existe
      if (stepInterval) {
        clearInterval(stepInterval);
      }
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setGenerationStep(0);
    setEstimatedTime(null);
    setFormData({
      flashcardCount: 10,
      generateCover: true
    });
    setError(null);
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setEstimatedTime(null);
  };

  const getFileExtension = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'docx') return 'DOCX';
    if (ext === 'doc') return 'DOC';
    return ext.toUpperCase();
  };

  // Determina el tipo de alerta según el error
  const getErrorSeverity = (errorMessage) => {
    if (errorMessage.includes('escaneada') || 
        errorMessage.includes('OCR') ||
        errorMessage.includes('muy poco texto') ||
        errorMessage.includes('páginas') ||
        errorMessage.includes('demasiado grande') ||
        errorMessage.includes('Solo se permiten')) {
      return 'warning'; // Errores que el usuario puede corregir
    }
    if (errorMessage.includes('IA') || errorMessage.includes('servidor')) {
      return 'error'; // Errores del sistema
    }
    return 'error'; // Default
  };

  // Proporciona sugerencias útiles según el tipo de error
  const getErrorSuggestion = (errorMessage) => {
    if (errorMessage.includes('escaneada') || errorMessage.includes('OCR')) {
      return 'Intenta usar un PDF generado digitalmente o convierte las imágenes a texto antes de subir.';
    }
    if (errorMessage.includes('muy poco texto') || errorMessage.includes('caracteres')) {
      return 'El documento debe tener suficiente contenido textual (al menos 300 caracteres).';
    }
    if (errorMessage.includes('páginas') || errorMessage.includes('largo')) {
      const match = errorMessage.match(/(\d+) páginas/);
      if (match && match[1]) {
        const pages = parseInt(match[1]);
        return `Intenta dividir el documento en partes más pequeñas (máximo 30 páginas por archivo).`;
      }
      return 'Intenta dividir el documento en partes más pequeñas (máximo 30 páginas).';
    }
    if (errorMessage.includes('demasiado grande') || errorMessage.includes('5MB')) {
      return 'Intenta comprimir el PDF o dividirlo en partes más pequeñas.';
    }
    if (errorMessage.includes('corrupto') || errorMessage.includes('protegido')) {
      return 'Asegúrate de que el documento no esté protegido con contraseña y sea válido.';
    }
    if (errorMessage.includes('Solo se permiten')) {
      return 'Formatos aceptados: PDF (.pdf), Word (.docx, .doc)';
    }
    if (errorMessage.includes('tardando demasiado')) {
      return 'Los documentos muy largos o complejos pueden tardar más. Intenta con uno más simple.';
    }
    return null; // No hay sugerencia específica
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={uploading}
    >
      <DialogTitle
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          fontFamily: muiTheme.fontFamily 
        }}
      >
        <FileIcon /> Crear Deck desde Documento
      </DialogTitle>

      <DialogContent sx={{ fontFamily: muiTheme.fontFamily }}>
        {error && (
          <Alert 
            severity={getErrorSeverity(error)} 
            sx={{ mb: 2 }} 
            onClose={() => setError(null)}
          >
            <Typography variant="body2" component="div">
              {error}
            </Typography>
            {getErrorSuggestion(error) && (
              <Typography variant="caption" component="div" sx={{ mt: 1, fontStyle: 'italic' }}>
                💡 {getErrorSuggestion(error)}
              </Typography>
            )}
          </Alert>
        )}

        {/* Proceso de generación */}
        {uploading && (
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
            {estimatedTime && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                Tiempo estimado: {estimatedTime}
              </Typography>
            )}
          </Box>
        )}

        {/* UI principal */}
        {!uploading && (
          <>
            {/* Zona de upload / archivo seleccionado */}
            {!file ? (
              <Paper
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                elevation={0}
                sx={{
                  border: '2px dashed',
                  borderColor: dragActive ? 'primary.main' : 'grey.400',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: dragActive ? 'action.hover' : 'transparent',
                  transition: 'all 0.2s',
                  mb: 3
                }}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.doc"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
                <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {dragActive
                    ? '¡Suelta el archivo aquí!'
                    : 'Arrastra un PDF o Word aquí'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  o haz clic para seleccionar un archivo
                </Typography>
                <Box mt={2}>
                  <Chip label="PDF" size="small" sx={{ mr: 1 }} />
                  <Chip label="DOCX" size="small" sx={{ mr: 1 }} />
                  <Chip label="DOC" size="small" />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Máximo 5MB • 30 páginas
                </Typography>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  mb: 3
                }}
              >
                <FileIcon color="primary" sx={{ fontSize: 40 }} />
                <Box flex={1}>
                  <Typography variant="body1" fontWeight="medium">
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(2)} KB
                    {estimatedTime && ` • Tiempo estimado: ${estimatedTime}`}
                  </Typography>
                </Box>
                <Chip 
                  label={getFileExtension(file.name)} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
                <Button
                  size="small"
                  onClick={removeFile}
                  startIcon={<CloseIcon />}
                >
                  Cambiar
                </Button>
              </Paper>
            )}

            {/* Configuración */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="600">
                ⚙️ Configuración
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="body2" sx={{ minWidth: 160 }}>
                  Cantidad de flashcards:
                </Typography>
                <Slider
                  value={formData.flashcardCount}
                  onChange={(e, value) => handleInputChange('flashcardCount', value)}
                  min={5}
                  max={25}
                  step={5}
                  valueLabelDisplay="auto"
                  marks
                  sx={{ flex: 1, maxWidth: 200 }}
                />
                <Typography variant="body2" fontWeight="600" sx={{ minWidth: 30 }}>
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
                label="Generar portada automática con IA"
              />
            </Box>

            {/* Cómo funciona */}
            <Alert severity="info" icon={<AIIcon />} sx={{ mt: 3, mb: 2 }}>
              <Typography variant="body2" component="div" fontWeight="600" gutterBottom>
                ✨ Cómo funciona la generación:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 1, pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  📝 El <strong>título del deck</strong> se tomará del título del documento o del nombre del archivo
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  🤖 La IA analizará el contenido y generará flashcards organizadas por secciones
                </Typography>
                <Typography component="li" variant="body2">
                  🎨 Se creará una portada automática con IA (opcional)
                </Typography>
              </Box>
            </Alert>

            {/* Requisitos */}
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" component="div" fontWeight="600" gutterBottom>
                ⚠️ Requisitos importantes:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Texto seleccionable</strong> (no imágenes escaneadas)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  2-30 páginas • Sin protección de contraseña
                </Typography>
                <Typography component="li" variant="body2">
                  Formatos: PDF, DOCX, DOC
                </Typography>
              </Box>
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          {uploading ? 'Generando...' : 'Cancelar'}
        </Button>
        {!uploading && (
          <Button
            onClick={handleGenerate}
            variant="contained"
            disabled={!file}
            startIcon={<AIIcon />}
          >
            Generar Deck
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DocumentUploadModal;


