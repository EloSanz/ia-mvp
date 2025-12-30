import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      // 1. Configuramos el HMR para que pase por NGINX (Puerto 443)
      hmr: {
        clientPort: 443,
      },
      // 2. Permitimos tus dominios
      allowedHosts: [
        'icards.fun',
        'www.icards.fun',
        'icards-djfeb7c0cvdxhpav.canadacentral-01.azurewebsites.net',
      ],
      // 3. ELIMINAMOS el bloque 'proxy'. 
      // NGINX se encarga de redirigir /api al puerto 3000.
    },
  };
});