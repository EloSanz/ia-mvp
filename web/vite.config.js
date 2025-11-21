import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Limpiar headers duplicados
            if (proxyReq.getHeader('authorization')) {
              proxyReq.setHeader('authorization', proxyReq.getHeader('authorization'));
            }
          });
        },
      },
    },
    host: true,
    port: 5173,
  },
});
