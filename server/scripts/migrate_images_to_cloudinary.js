import { PrismaClient } from '@prisma/client';
import { uploadImageToCloudinary } from '../src/utils/cloudinary.js';

const prisma = new PrismaClient();

(async () => {
    try {
        console.log('Iniciando migración de imágenes a Cloudinary...');

        // Obtener todos los decks con imágenes en base64
        const decks = await prisma.deck.findMany({
            // Consulta optimizada para traer solo los decks que realmente necesitan migración
            where: {
                AND: [
                    { coverUrl: { not: null } }, // El campo no debe ser nulo
                    {
                        coverUrl: {
                            not: { startsWith: 'https' } // Y no debe empezar con 'https'
                        }
                    }
                ]
            },
        });

        console.log(`Se encontraron ${decks.length} decks para migrar.`);

        if (decks.length === 0) {
            console.log('No se encontraron imágenes en formato base64 para migrar.');
            return;
        }

        for (const deck of decks) {
            try {
                console.log(`Migrando imagen del deck con ID ${deck.id}...`);

                if (deck.coverUrl.startsWith('https:')) {
                    console.log(`Deck ${deck.id} ya tiene una URL válida en Cloudinary. Se omite.`);
                    continue;
                }

                const formattedBase64 = `data:image/png;base64,${deck.coverUrl}`;
                // Subir imagen a Cloudinary
                const cloudinaryUrl = await uploadImageToCloudinary(formattedBase64, 'ICards');

                // Actualizar registro en la base de datos
                await prisma.deck.update({
                    where: { id: deck.id },
                    data: { coverUrl: cloudinaryUrl },
                });

                console.log(`Deck ${deck.id} migrado exitosamente.`);
            } catch (error) {
                console.error(`Error al migrar el deck ${deck.id}:`, error);
            }
        }

        console.log('Migración completada.');
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        await prisma.$disconnect();
    }
})();