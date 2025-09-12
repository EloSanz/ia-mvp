import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

const ReviewFlashcardModal = ({
  open,
  onClose,
  reviewingCard,
  showAnswer,
  setShowAnswer,
  onReview,
  muiTheme
}) => {
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleReview = (difficulty) => {
    onReview(difficulty);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: muiTheme.fontFamily }}>Estudiando Flashcard</DialogTitle>
      <DialogContent sx={{ fontFamily: muiTheme.fontFamily }}>
        {reviewingCard && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Pregunta:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: '1.2rem',
                textAlign: 'center',
                p: 3,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: 2
              }}
            >
              {reviewingCard.front}
            </Typography>

            {!showAnswer ? (
              <Box textAlign="center" sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" size="large" onClick={handleShowAnswer}>
                  Mostrar Respuesta
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                  Respuesta:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    p: 3,
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    borderRadius: 2
                  }}
                >
                  {reviewingCard.back}
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  ¿Qué tan fácil fue recordar esta respuesta?
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                  <Button variant="outlined" color="error" onClick={() => handleReview(3)}>
                    Difícil
                  </Button>
                  <Button variant="outlined" color="warning" onClick={() => handleReview(2)}>
                    Normal
                  </Button>
                  <Button variant="outlined" color="success" onClick={() => handleReview(1)}>
                    Fácil
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewFlashcardModal;
