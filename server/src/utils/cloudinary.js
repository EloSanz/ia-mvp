import cloudinary from 'cloudinary';

// Configuración de Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube una imagen a Cloudinary y devuelve la URL pública.
 * @param {string} base64Image - Imagen en formato base64.
 * @param {string} folder - Carpeta en Cloudinary donde se almacenará la imagen.
 * @returns {Promise<string>} - URL pública de la imagen subida.
 */
export const uploadImageToCloudinary = async (base64Image, folder) => {

    try {
        const result = await cloudinary.v2.uploader.upload_large(base64Image, {
            folder,
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error al subir la imagen a Cloudinary:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            response: error.response,
        });
        throw new Error('No se pudo subir la imagen a Cloudinary');
    }
};

/**
 * Elimina una imagen de Cloudinary usando su URL.
 * @param {string} imageUrl - URL de la imagen en Cloudinary.
 * @returns {Promise<boolean>} - true si se eliminó exitosamente, false en caso contrario.
 */
export const deleteImageFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
            console.log('URL no válida o no es de Cloudinary, omitiendo eliminación');
            return false;
        }

        // Extraer el public_id de la URL de Cloudinary
        // Formato: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{extension}
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');

        if (uploadIndex === -1) {
            console.error('Formato de URL de Cloudinary no reconocido:', imageUrl);
            return false;
        }

        // El public_id está después de 'upload' y antes de la extensión
        // Puede incluir carpetas (ej: ICards/imagen.jpg)
        const publicIdWithExtension = urlParts.slice(uploadIndex + 1).join('/');
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remover extensión

        console.log(`Eliminando imagen de Cloudinary con public_id: ${publicId}`);

        const result = await cloudinary.v2.uploader.destroy(publicId);

        if (result.result === 'ok') {
            console.log(`✅ Imagen eliminada exitosamente de Cloudinary: ${publicId}`);
            return true;
        } else {
            console.error('Error al eliminar imagen de Cloudinary:', result);
            return false;
        }
    } catch (error) {
        console.error('Error al eliminar imagen de Cloudinary:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            response: error.response,
        });
        return false; // No fallar si no se puede eliminar la imagen
    }
};