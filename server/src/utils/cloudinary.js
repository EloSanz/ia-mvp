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