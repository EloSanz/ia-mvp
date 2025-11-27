import prisma from '../config/database.js';
import { DeckRepository } from '../repositories/deck.repository.js';
import { deleteImageFromCloudinary } from '../utils/cloudinary.js';
import { ForbiddenError, NotFoundError } from '../utils/custom.errors.js';

/**
 * DeckService - Capa de servicio para la lógica de negocio de Decks.
 * Orquesta las operaciones entre el repositorio, servicios externos (Cloudinary),
 * y la lógica de negocio compleja.
 */
export const DeckService = {
  /**
   * Elimina un deck y maneja de forma segura la lógica de negocio asociada,
   * como la actualización de contadores de clones y la eliminación de imágenes de portada.
   *
   * @param {number} deckId El ID del deck a eliminar.
   * @param {number} userId El ID del usuario que realiza la solicitud para verificación de propiedad.
   */
  async deleteDeck(deckId, userId) {
    // 1. Obtener el deck y verificar la propiedad
    const deckToDelete = await DeckRepository.findById(deckId);

    if (!deckToDelete) {
      throw new NotFoundError('Deck no encontrado');
    }

    if (deckToDelete.userId !== userId) {
      throw new ForbiddenError('No tienes permiso para eliminar este deck');
    }

    // Se utiliza una transacción para garantizar que todas las operaciones relacionadas
    // (decrementar contador, eliminar imagen, eliminar deck) se completen exitosamente o fallen juntas.
    try {
      return await prisma.$transaction(async (tx) => {
        // 2. Si el deck es un clon, decrementar el contador de su padre
        // Usamos el 'tx' cliente de la transacción para esta operación
        if (deckToDelete.clonedFromId) {
          await tx.deck.update({
            where: { id: deckToDelete.clonedFromId },
            data: {
              clonesCount: {
                decrement: 1,
              },
            },
          }).catch(error => {
            // Ignorar el error si el padre no existe (P2025), puede haber sido eliminado.
            if (error.code !== 'P2025') throw error;
          });
        }

        // 3. Lógica para eliminar la imagen de portada de Cloudinary
        if (deckToDelete.coverUrl) {
          // Contar cuántos *otros* decks usan la misma URL de imagen
          const otherDecksWithSameCover = await tx.deck.count({
            where: {
              coverUrl: deckToDelete.coverUrl,
              id: {
                not: deckId, // Excluir el deck actual de la cuenta
              },
            },
          });

          // Si ningún otro deck usa la imagen, es seguro eliminarla de Cloudinary
          if (otherDecksWithSameCover === 0) {
            console.log(`[DeckService] Eliminando imagen de portada (${deckToDelete.coverUrl}) de Cloudinary.`);
            await deleteImageFromCloudinary(deckToDelete.coverUrl);
          }
        }

        // 4. Finalmente, eliminar el registro del deck de la base de datos
        // Esta operación también usa el cliente de la transacción 'tx'
        await tx.deck.delete({
          where: { id: deckId },
        });

        return true; // Éxito
      });
    } catch (error) {
      console.error(`[DeckService] Error en la transacción de eliminación de deck: ${error.message}`);
      // Re-lanzar el error para que el controlador lo maneje
      throw error;
    }
  }
};
