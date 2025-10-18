import jwt from 'jsonwebtoken';
import { CustomError } from '../utils/custom.errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-seguro';

export class AuthError extends CustomError {
  constructor(message = 'Error de autenticación') {
    super(message, 401);
  }
}

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AuthError('Token inválido o expirado');
  }
};

export const authMiddleware = (req, res, next) => {
  try {
    // Obtiene el token del encabezado Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado.' });
    }

    // Verifica el token incluyendo la validez y expiración
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        // El error puede deberse a token expirado o inválido: deslogueamos y redirigimos al login
        return res.status(401).json({ message: 'Error de tocken.' });
      }

      // Si es válido, añade la información decodificada al objeto de request
      req.user = decoded;
      next();
    });
  } catch (error) {
    next(error);
  }
};
