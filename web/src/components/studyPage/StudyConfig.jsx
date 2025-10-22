import React from 'react';

import {
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button
} from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';

export default function StudyConfig({
  hasDecks,
  studyOptions,
  setStudyOptions,
  onStart,
  disabled,
  availableTags,
  selectedTag,
  setSelectedTag
}) {
  if (!hasDecks) return null;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={200} mb={2}>
          ⚙️ Configuración de Estudio
        </Typography>

        <Grid
          container
          spacing={3}
          alignItems="flex-start"
        >
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Modo de Estudio</InputLabel>
              <Select
                value={studyOptions.mode}
                label="Modo de Estudio"
                onChange={(e) => setStudyOptions((prev) => ({ ...prev, mode: e.target.value }))}
              >
                <MenuItem value="normal">Normal (todas las cards)</MenuItem>
                <MenuItem value="review">Solo revisión (vencidas)</MenuItem>
                <MenuItem value="new">Solo nuevas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={9} md={3} width="20%">
            <FormControl fullWidth>
              <InputLabel>Filtro por Tag</InputLabel>
              <Select
                value={selectedTag}
                label="Filtro por Tag"
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <MenuItem value="">
                  <em>Todas las tags</em>
                </MenuItem>
                {availableTags?.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Límite de tarjetas (opcional)"
              type="number"
              value={studyOptions.limit}
              helperText="Deja vacío para estudiar todas las tarjetas disponibles"
              onChange={(e) => setStudyOptions((prev) => ({ ...prev, limit: e.target.value }))}
              slotProps={{ input: { min: 1, max: 130 } }}
              sx={{ mt: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onStart}
              disabled={disabled}
              startIcon={<PlayIcon />}
            >
              Comenzar Estudio
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
