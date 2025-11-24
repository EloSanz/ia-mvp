import multer from 'multer';

/**
 * Configuración de Multer para procesamiento de archivos en memoria
 * Estrategia: Archivos se procesan directamente desde RAM (file.buffer)
 * - No requiere filesystem temporal
 * - Funciona en cualquier entorno Azure
 * - Preparado para migrar a Azure Blob Storage en futuro
 */

// Usar memoria para archivos pequeños (5MB funciona perfecto)
const storage = multer.memoryStorage();

// Validación de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword' // .doc
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, DOCX y DOC'), false);
  }
};

// Configuración principal de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * Middleware para manejo de errores de multer
 * Proporciona mensajes de error amigables para el usuario
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo excede el límite de 5MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Demasiados archivos. Solo se permite un archivo a la vez.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Error al subir archivo: ${err.message}`
    });
  }
  
  // Error del fileFilter
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next();
};

