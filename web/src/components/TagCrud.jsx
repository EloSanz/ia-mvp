import React, { useState } from 'react';
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

const TagCrud = ({ card, tags, muiTheme, flashcards, setTags, loadDeckAndCards, tagsService }) => {
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState(card.tagId || '');

  const tagName = card.tagId ? tags.find((t) => t.id === card.tagId)?.name || 'Sin tag' : 'Sin tag';

  // Actualizar tag existente
  const handleTagChange = async (e) => {
    const tagId = e.target.value;
    setSelectedTagId(tagId);
    await flashcards.update(card.id, { ...card, tagId });
    loadDeckAndCards();
  };

  // Crear nueva tag y asignar
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    try {
      const tag = await tagsService.create({ name: newTagName.trim() });
      setTags((prev) => [...prev, tag.data]);
      setSelectedTagId(tag.data.id);
      await flashcards.update(card.id, { ...card, tagId: tag.data.id });
      setNewTagName('');
      setTagModalOpen(false);
      loadDeckAndCards();
    } catch (error) {
      console.error('Error creando tag:', error);
      // Podrías mostrar un error aquí
    } finally {
      setCreatingTag(false);
    }
  };

  return (
    <>
      <TextField
        value={tagName}
        size="small"
        variant="outlined"
        sx={{ width: 120, cursor: 'pointer' }}
        InputProps={{ readOnly: true }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTagModalOpen(true);
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      <Dialog open={tagModalOpen} onClose={() => setTagModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: muiTheme.fontFamily }}>Cambiar o crear tag</DialogTitle>
        <DialogContent sx={{ fontFamily: muiTheme.fontFamily }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="modal-tag-select-label">Tag existente</InputLabel>
            <Select
              labelId="modal-tag-select-label"
              value={selectedTagId}
              label="Tag existente"
              onChange={handleTagChange}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
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
              placeholder="Nueva tag..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              size="small"
              sx={{ width: 120 }}
            />
            <Button
              variant="outlined"
              size="small"
              disabled={!newTagName.trim() || creatingTag}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreateTag();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              +
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTagModalOpen(false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TagCrud;
