import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../middlewares/auth.middleware.js';
import { ValidationError } from '../utils/custom.errors.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BaseController } from './base.controller.js';

export const AuthController = {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [Authentication]
   *     summary: Register a new user
   *     description: Creates a new user account and returns a JWT token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *           example:
   *             username: 'newuser'
   *             password: 'securepassword123'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RegisterResponse'
   *       400:
   *         description: Bad request - Invalid input data or user already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  register: asyncHandler(async (req, res) => {
    const { username, password } = req.body;

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

    BaseController.success(
      res,
      {
        id: user.id,
        username: user.username,
        token
      },
      'Usuario registrado exitosamente',
      201
    );
  }),

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Authentication]
   *     summary: Login user
   *     description: Authenticates a user and returns a JWT token for API access
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *           example:
   *             username: 'admin'
   *             password: 'admin123'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       400:
   *         description: Bad request - Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
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
      console.warn(`Intento de login fallido: usuario no existe -> ${username}`);
      throw new ValidationError('Credenciales inválidas');
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.warn(`Intento de login fallido: contraseña incorrecta -> ${username}`);
      throw new ValidationError('Credenciales inválidas');
    }

    // Generar token
    const token = generateToken(user.id);

    console.log(`🔐 LOGIN SUCCESS: User ${username} (ID: ${user.id}) logged in successfully`);
    console.log(`🔑 TOKEN GENERATED for user ${username}: ${token.substring(0, 20)}...`);

    BaseController.success(
      res,
      {
        id: user.id,
        username: user.username,
        token
      },
      'Login exitoso'
    );
  }),

  testLogin: asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('El nombre es requerido para el usuario de prueba');
    }

    const trimmedName = name.trim();

    const randomSuffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const username = `test-user-${randomSuffix}`;
    const dummyPassword = `test-${randomSuffix}-${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await bcrypt.hash(dummyPassword, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: passwordHash
      }
    });

    const token = generateToken(user.id, {
      isTestUser: true,
      displayName: trimmedName
    });

    BaseController.success(
      res,
      {
        id: user.id,
        username: user.username,
        displayName: trimmedName,
        isTestUser: true,
        token
      },
      'Login de usuario de prueba exitoso'
    );
  }),

  /**
   * @swagger
   * /api/auth/delete-test-user:
   *   delete:
   *     tags: [Authentication]
   *     summary: Delete test user (for integration tests)
   *     description: Deletes the currently authenticated test user and all their data
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Test user deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       401:
   *         description: Unauthorized
   */
  deleteTestUser: asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Solo permitir eliminar usuarios de prueba (que empiecen con "test-user-")
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.username.startsWith('test-user-')) {
      throw new ValidationError('Solo se pueden eliminar usuarios de prueba');
    }

    // Eliminar todas las flashcards del usuario
    await prisma.flashcard.deleteMany({
      where: { deck: { userId } }
    });

    // Eliminar todos los tags del usuario
    await prisma.tag.deleteMany({
      where: { deck: { userId } }
    });

    // Eliminar todos los decks del usuario
    await prisma.deck.deleteMany({
      where: { userId }
    });

    // Finalmente eliminar el usuario
    await prisma.user.delete({
      where: { id: userId }
    });

    BaseController.success(res, null, 'Usuario de prueba eliminado exitosamente');
  })
};
