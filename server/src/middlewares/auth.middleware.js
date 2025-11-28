import jwt from 'jsonwebtoken';
import { CustomError } from '../utils/custom.errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-seguro';

export class AuthError extends CustomError {
  constructor(message = 'Error de autenticación') {
    super(message, 401);
  }
}

export const generateToken = (userId, extraPayload = {}) => {
  return jwt.sign(
    { userId, ...extraPayload },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AuthError('Token inválido o expirado');
  }
};

export const authMiddleware = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
      throw new AuthError('Token no proporcionado');
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;

    req.isTestUser = !!decoded.isTestUser;
    req.displayName = decoded.displayName || null;
    next();
  } catch (error) {
    next(error);
  }
};
