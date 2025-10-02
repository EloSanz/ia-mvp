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
    IconButton,
} from "@mui/material";
import React from "react";
import {
    Add as AddIcon,
    School as SchoolIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    GitHub as GitHubIcon,
    Email as EmailIcon,
    Info as InfoIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
export default function DecksGridCard({ decks, deckMonitory, onEdit, onDelete, onNavigate }) {
    return (
        <Box sx={{ flexGrow: 1, p: 2 }}>
            <Grid container spacing={2}>
                {decks.map((deck) => (
                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={deck.id}>
                        <Card
                            sx={{
                                borderRadius: 2,
                                boxShadow: 3,
                                backgroundColor: "rgba(255,255,255,0.05)",
                                color: "#fff",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Portada */}
                            {deck.coverUrl ? (
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={`data:image/png;base64,${deck.coverUrl}`}
                                    alt={deck.name}
                                    sx={{ objectFit: "cover" }}
                                />
                            ) : deckMonitory?.id === deck.id ? (
                                <Box
                                    sx={{
                                        height: 140,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image="/src/assets/deck-placeholder.png"
                                    alt={deck.name}
                                    sx={{ objectFit: "cover" }}
                                />
                                // <Skeleton variant="rectangular" height={140} />
                            )}

                            {/* Contenido */}
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{
                                        width: "15rem",           // ancho fijo
                                        // whiteSpace: "nowrap",     // no salta de línea
                                        overflow: "hidden",       // oculta el texto sobrante
                                        textOverflow: "ellipsis", // muestra "..."
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
                                            width: "15rem",           // ancho fijo
                                        }}
                                    >
                                        {deck.description}
                                    </Typography>
                                )}
                                <Typography variant="body2">
                                    <strong>New:</strong> {deck.newCount ?? 0}{" "}
                                    <strong>Learn:</strong> {deck.learnCount ?? 0}{" "}
                                    <strong>Due:</strong> {deck.dueCount ?? 0}
                                </Typography>
                                <Box display="flex" justifyContent="flex-end" gap={1}>
                                    <Tooltip title="Editar deck">
                                        <IconButton
                                            size="small"
                                            onClick={e => {
                                                e.stopPropagation();
                                                onEdit(deck);
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar deck">
                                        <IconButton
                                            size="small"
                                            onClick={e => {
                                                e.stopPropagation();
                                                onDelete(deck.id);
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Ver deck">
                                        <IconButton
                                            size="small"
                                            onClick={e => {
                                                e.stopPropagation();
                                                onNavigate(deck.id);
                                            }}
                                        >
                                            <SchoolIcon fontSize="small" />
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
