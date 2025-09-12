import React, { useEffect, useState } from 'react';
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

export default function TagPage({ token }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editTag, setEditTag] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tags', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTags(data);
    } catch (err) {
      setError('Error al cargar tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTagName })
      });
      setCreateOpen(false);
      setNewTagName('');
      fetchTags();
    } catch {
      setError('Error al crear tag');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      await fetch(`/api/tags/${editTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: editTag.name })
      });
      setEditOpen(false);
      setEditTag(null);
      fetchTags();
    } catch {
      setError('Error al editar tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTags();
    } catch {
      setError('Error al eliminar tag');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Gestión de Tags
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setCreateOpen(true)}
        sx={{ mb: 2 }}
      >
        Nueva Tag
      </Button>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditTag(tag);
                        setEditOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(tag.id)}>
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
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle>Nueva Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newTagName.trim() || saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Editar Tag */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Editar Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={editTag?.name || ''}
            onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleEdit}
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
