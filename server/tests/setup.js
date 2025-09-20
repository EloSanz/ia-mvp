// Setup global para tests
import { jest } from '@jest/globals';

// Configurar mocks globales si es necesario
global.jest = jest;

// Cleanup después de cada test
afterEach(async () => {
  // Limpiar sesiones de StudyService
  try {
    const { StudyService } = await import('../src/services/study.service.js');
    StudyService.clearAllSessions();
  } catch (error) {
    // Ignorar si no se puede importar (tests que no usan StudyService)
  }

  // Limpiar cache
  try {
    const { cacheAdapter } = await import('../src/adapters/cache.adapter.js');
    cacheAdapter.clear();
  } catch (error) {
    console.error('Error al limpiar cache:', error);
    // Ignorar si no se puede importar
  }

  // Limpiar timers
  jest.clearAllTimers();

  // Limpiar mocks
  jest.clearAllMocks();
});
