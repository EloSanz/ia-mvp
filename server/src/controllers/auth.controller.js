import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middlewares/auth.middleware.js';
import { ValidationError, AuthenticationError } from '../utils/custom.errors.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

const prisma = new PrismaClient();

export const AuthController = {
  /**
   * Registra un nuevo usuario
   */
  register: asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Validar datos
    if (!username || !password) {
      throw new ValidationError('Username y password son requeridos');
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      throw new ValidationError('El usuario ya existe');
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    });

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        token
      }
    });
  }),

  /**
   * Inicia sesión de usuario
   */
  login: asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Validar datos
    if (!username || !password) {
      throw new ValidationError('Username y password son requeridos');
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      throw new ValidationError('Credenciales inválidas');
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ValidationError('Credenciales inválidas');
    }

    // Generar token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        token
      }
    });
  })
};
