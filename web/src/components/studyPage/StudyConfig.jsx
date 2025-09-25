import React from 'react';

import { Card, CardContent, Typography, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';

export default function StudyConfig({ hasDecks, studyOptions, setStudyOptions, onStart, disabled }) {
  if (!hasDecks) return null;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={200} mb={2}>
          ⚙️ Configuración de Estudio
        </Typography>

        <Grid container spacing={3} alignItems="flex-end" sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Modo de Estudio</InputLabel>
              <Select
                value={studyOptions.mode}
                label="Modo de Estudio"
                onChange={(e) => setStudyOptions(prev => ({ ...prev, mode: e.target.value }))}
              >
                <MenuItem value="normal">Normal (todas las cards)</MenuItem>
                <MenuItem value="review">Solo revisión (vencidas)</MenuItem>
                <MenuItem value="new">Solo nuevas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <TextField
              fullWidth
              label="Límite de tarjetas (opcional)"
              type="number"
              value={studyOptions.limit}
              helperText="Deja vacío para estudiar todas las tarjetas disponibles"
              onChange={(e) => setStudyOptions(prev => ({ ...prev, limit: e.target.value }))}
              slotProps={{ input: { min: 1, max: 130 } }}
            />
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onStart}
              disabled={disabled}
              startIcon={<PlayIcon />}
              sx={{ height: 56 }}
            >
              Comenzar Estudio
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
