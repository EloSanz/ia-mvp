import { defineConfig, loadEnv } from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno desde .env, .env.local, etc.
  const env = loadEnv(mode, process.cwd(), '');

  // Leer hosts permitidos desde VITE_ALLOWED_HOSTS (coma-separados) o usar el host conocido
  const allowedHosts = [
    ...(env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',').map(s => s.trim()) : [])
  ];

  // URL de la API para el proxy. Define VITE_API_URL en tu .env si la API no está en localhost:3000
  const apiUrl = env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      // Permitir solicitudes desde hosts listados (previene el error de host no permitido en Vite)
      allowedHosts,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || apiUrl,
          changeOrigin: true,
          secure: false
        }
      }
    },
    allowedHosts: [
      'icards-djfeb7c0cvdxhpav.canadacentral-01.azurewebsites.net',
    ],
  }
});
