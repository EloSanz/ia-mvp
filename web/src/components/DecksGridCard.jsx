import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Skeleton,
  Tooltip,
  IconButton
} from '@mui/material';
import React from 'react';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
export default function DecksGridCard({ decks, deckMonitory, onEdit, onDelete, onNavigate }) {
  return (
    <Box sx={{ flexGrow: 1, p: 1 }}>
      <Grid container spacing={1.5}>
        {decks.map((deck) => (
          <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={deck.id}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#fff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  backgroundColor: 'rgba(255,255,255,0.08)'
                }
              }}
              onClick={() => onNavigate(deck.id)}
            >
              {/* Portada */}
              {deck.coverUrl ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={`data:image/png;base64,${deck.coverUrl}`}
                  alt={deck.name}
                  sx={{ objectFit: 'cover' }}
                />
              ) : deckMonitory?.id === deck.id ? (
                <Box
                  sx={{
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <CardMedia
                  component="img"
                  height="140"
                  width="100%"
                  image="/cards.png"
                  alt={deck.name}
                  sx={{ objectFit: 'cover' }}
                />
                // <Skeleton variant="rectangular" height={140} />
              )}

              {/* Contenido */}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    color: '#FFFFFF',
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.2em',
                    height: '2.4em' // 2 líneas * 1.2em
                  }}
                >
                  {deck.name}
                </Typography>
                {deck.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.2em',
                      height: '3.6em' // 3 líneas * 1.2em
                    }}
                  >
                    {deck.description}
                  </Typography>
                )}
                <Box 
                  display="flex" 
                  justifyContent="flex-end" 
                  gap={1.5}
                  sx={{ mt: 'auto' }}
                >
                  <Tooltip title="Editar deck">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(deck);
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#1E293B',
                          color: '#FFFFFF'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar deck">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(deck.id);
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#1E293B',
                          color: '#FFFFFF'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
