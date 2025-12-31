import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StyleIcon from '@mui/icons-material/Style';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    textAlign: 'center',
                }}
            >
                <StyleIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.5 }} />
                <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 1 }}>
                    404
                </Typography>
                <Typography variant="h4" gutterBottom>
                    Página no encontrada
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Lo sentimos, la página que estás buscando no existe en iCards.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/')}
                    sx={{ px: 4, py: 1.5, textTransform: 'none', fontWeight: 'bold' }}
                >
                    Volver al Inicio
                </Button>
            </Box>
        </Container>
    );
};

export default NotFoundPage;
