import React, { useEffect, useState } from 'react';
import {
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

const TagCrud = ({
  card,
  tags,
  muiTheme,
  flashcards,
  setTags,
  loadDeckAndCards,
  tagsService,
  onCardTagUpdated
}) => {
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState(card.tagId ?? '');

  // Si el card cambia desde arriba, sincronizar selección
  useEffect(() => {
    setSelectedTagId(card.tagId ?? '');
  }, [card.tagId]);

  const displayName =
    tags.find((t) => t.id === selectedTagId)?.name ||
    (card.tagId ? tags.find((t) => t.id === card.tagId)?.name || 'Sin tag' : 'Sin tag');

  const updateTag = async (tagId) => {
    setSelectedTagId(tagId);
    try {
      await flashcards.update(card.id, { ...card, tagId: tagId || null });
      onCardTagUpdated?.(card.id, tagId || null); // opcional: para actualizar la lista arriba
      setOpen(false);
      // Si querés recargar desde el server, hacelo después de cerrar:
      // await loadDeckAndCards();
    } catch (error) {
      alert(`Error al actualizar la tag: ${error.response?.data?.message || error.message}`);
      setSelectedTagId(card.tagId ?? '');
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    try {
      const resp = await tagsService.create({ name: newTagName.trim() });
      const created = resp?.data?.data || resp?.data || resp; // tolerante al shape
      setTags((prev) => [...prev, created]);
      await updateTag(created.id);
      setNewTagName('');
    } finally {
      setCreatingTag(false);
    }
  };

  return (
    <div
      className="tag-crud"
      onClick={(e) => e.stopPropagation()} // evita que el click burbujee a la fila
    >
      <TextField
        value={displayName}
        size="small"
        variant="outlined"
        sx={{ width: 140, cursor: 'pointer' }}
        InputProps={{ readOnly: true }}
        onClick={() => setOpen(true)}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: muiTheme.fontFamily }}>Cambiar o crear tag</DialogTitle>
        <DialogContent sx={{ fontFamily: muiTheme.fontFamily }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="tag-select-label">Tag existente</InputLabel>
            <Select
              labelId="tag-select-label"
              value={selectedTagId}
              label="Tag existente"
              onChange={(e) => updateTag(e.target.value)}
            >
              <MenuItem value="">
                <em>Sin tag</em>
              </MenuItem>
              {tags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              placeholder="Nueva tag…"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              size="small"
              disabled={!newTagName.trim() || creatingTag}
              onClick={createTag}
            >
              +
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TagCrud;
