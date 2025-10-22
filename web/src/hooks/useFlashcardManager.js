import { useState } from 'react';
import { useApi } from '../contexts/ApiContext';

/**
 * Hook personalizado para manejar la lógica de flashcards
 * Centraliza toda la lógica de creación, edición, eliminación y revisión
 */
export const useFlashcardManager = (deckId) => {
  const { flashcards } = useApi();

  // Estados para modales
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);

  // Estados para datos
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [editingCard, setEditingCard] = useState(null);
  const [reviewingCard, setReviewingCard] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Estados de carga
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);

  // Funciones de manejo de modales
  const openEditDialog = (card) => {
    setEditingCard({ ...card });
    setEditDialogOpen(true);
  };

  const openReviewDialog = (card) => {
    setReviewingCard(card);
    setReviewDialogOpen(true);
    setShowAnswer(false);
  };

  const handleDeleteCard = (cardId) => {
    // Aquí necesitaríamos acceder a las cards para encontrar la que se va a eliminar
    // Por ahora, solo guardamos el ID
    setCardToDelete({ id: cardId });
    setDeleteDialogOpen(true);
  };

  // Funciones de operaciones CRUD
  const createCard = async (callback) => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;

    try {
      setCreating(true);
      const createData = {
        ...newCard,
        deckId: parseInt(deckId)
      };

      await flashcards.create(createData);
      setCreateDialogOpen(false);
      setNewCard({ front: '', back: '' });

      if (callback) callback();
    } catch (err) {
      console.error('❌ Error creating flashcard:', err);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const updateCard = async (callback) => {
    if (!editingCard?.front?.trim() || !editingCard?.back?.trim()) return;

    try {
      setEditing(true);
      await flashcards.update(editingCard.id, editingCard);
      setEditDialogOpen(false);
      setEditingCard(null);

      if (callback) callback();
    } catch (err) {
      console.error('❌ Error editing flashcard:', err);
      throw err;
    } finally {
      setEditing(false);
    }
  };

  const deleteCard = async (callback) => {
    if (!cardToDelete) return;

    try {
      await flashcards.delete(cardToDelete.id);
      setDeleteDialogOpen(false);
      setCardToDelete(null);

      if (callback) callback();
    } catch (err) {
      console.error('❌ Error deleting flashcard:', err);
      throw err;
    }
  };

  const reviewCard = async (difficulty, callback) => {
    if (!reviewingCard) return;

    try {
      await flashcards.review(reviewingCard.id, { difficulty });
      setReviewDialogOpen(false);
      setReviewingCard(null);
      setShowAnswer(false);

      if (callback) callback();
    } catch (err) {
      console.error('❌ Error reviewing flashcard:', err);
      throw err;
    }
  };

  // Funciones de utilidad
  const closeAllModals = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setReviewDialogOpen(false);
    setDeleteDialogOpen(false);
    setEditingCard(null);
    setReviewingCard(null);
    setCardToDelete(null);
    setShowAnswer(false);
  };

  return {
    // Estados de modales
    createDialogOpen,
    editDialogOpen,
    reviewDialogOpen,
    deleteDialogOpen,
    aiGeneratorOpen,

    // Estados de datos
    newCard,
    editingCard,
    reviewingCard,
    cardToDelete,
    showAnswer,

    // Estados de carga
    creating,
    editing,

    // Estados de paginación
    page,
    rowsPerPage,

    // Funciones de manejo de modales
    setCreateDialogOpen,
    setEditDialogOpen,
    setReviewDialogOpen,
    setDeleteDialogOpen,
    setAiGeneratorOpen,
    setNewCard,
    setEditingCard,
    setReviewingCard,
    setCardToDelete,
    setShowAnswer,
    setPage,

    // Funciones de operaciones
    openEditDialog,
    openReviewDialog,
    handleDeleteCard,
    createCard,
    updateCard,
    deleteCard,
    reviewCard,
    closeAllModals
  };
};
