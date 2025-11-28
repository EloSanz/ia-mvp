import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Redirigir acceso directo por IP a icards.fun
app.use((req, res, next) => {
  const host = req.get('host') || '';
  const isICardsDomain = host.includes('icards.fun');
  
  // Si NO acceden por icards.fun (acceso directo por IP), redirigir
  // Pero NO redirigir rutas de API (necesitan funcionar para el proxy)
  if (!isICardsDomain && !req.path.startsWith('/api')) {
    const fullUrl = `https://icards.fun${req.path}${req.query ? '?' + new URLSearchParams(req.query).toString() : ''}`;
    return res.redirect(301, fullUrl);
  }
  
  next();
});

async function createServer() {
  // En desarrollo, crear servidor Vite
  if (process.env.NODE_ENV !== 'production') {
    // Vite carga automáticamente vite.config.js, incluyendo el proxy de /api
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Usar el middleware de Vite para desarrollo (incluye el proxy de /api configurado en vite.config.js)
    app.use(vite.middlewares);
  } else {
    // En producción, servir archivos estáticos
    app.use(express.static(resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`🔄 Redirecciones activas: Todas las rutas -> https://icards.fun (excepto /api)`);
  });
}

createServer().catch((err) => {
  console.error('Error al iniciar servidor:', err);
  process.exit(1);
});

