import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../contexts/ApiContext';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function TagPage({ _token }) {
  const { tags: tagsService } = useApi();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editTag, setEditTag] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await tagsService.getByDeckId(deckId);
      console.log('Tags loaded:', response.data);
      setTags(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error loading tags:', err);
      setError(
        `Error al cargar tags: ${err.response?.data?.message || err.message || 'Error desconocido'}`
      );
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, [tagsService]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreate = async () => {
    if (!newTagName?.trim()) {
      setError('El nombre de la tag es requerido');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await tagsService.create(deckId, { name: newTagName.trim() });
      console.log('Tag created successfully:', response);
      setCreateOpen(false);
      setNewTagName('');
      await fetchTags();
    } catch (err) {
      console.error('Error creating tag:', err);
      setError(
        `Error al crear tag: ${err.response?.data?.message || err.message || 'Error desconocido'}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editTag?.name?.trim()) {
      setError('El nombre de la tag es requerido');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await tagsService.update(deckId, editTag.id, { name: editTag.name.trim() });
      console.log('Tag updated successfully:', response);
      setEditOpen(false);
      setEditTag(null);
      await fetchTags();
    } catch (err) {
      console.error('Error updating tag:', err);
      setError(
        `Error al editar tag: ${err.response?.data?.message || err.message || 'Error desconocido'}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tag?')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await tagsService.delete(deckId, id);
      console.log('Tag deleted successfully');
      await fetchTags();
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError(
        `Error al eliminar tag: ${err.response?.data?.message || err.message || 'Error desconocido'}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={3} onClick={(e) => e.stopPropagation()} sx={{ isolation: 'isolate' }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Tags
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={(e) => {
          e.stopPropagation();
          setCreateOpen(true);
        }}
        sx={{ mb: 2 }}
      >
        Nueva Tag
      </Button>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} onClick={(e) => e.stopPropagation()}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tags.map((tag) => (
                <TableRow
                  key={tag.id}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ cursor: 'default' }}
                >
                  <TableCell>{tag.name}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTag(tag);
                        setEditOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tag.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Crear Tag */}
      <Dialog
        open={createOpen}
        onClose={(e) => {
          e?.stopPropagation();
          setCreateOpen(false);
        }}
        onClick={(e) => e.stopPropagation()}
        disableBackdropClick={false}
      >
        <DialogTitle>Nueva Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setCreateOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleCreate();
            }}
            variant="contained"
            disabled={!newTagName.trim() || saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Editar Tag */}
      <Dialog
        open={editOpen}
        onClose={(e) => {
          e?.stopPropagation();
          setEditOpen(false);
        }}
        onClick={(e) => e.stopPropagation()}
        disableBackdropClick={false}
      >
        <DialogTitle>Editar Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={editTag?.name || ''}
            onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
            onClick={(e) => e.stopPropagation()}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setEditOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            variant="contained"
            disabled={!editTag?.name?.trim() || saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
