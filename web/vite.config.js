import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://72.61.45.36:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (proxyReq.getHeader('authorization')) {
              proxyReq.setHeader('authorization', proxyReq.getHeader('authorization'));
            }
          });
        },
      },
    },
    host: '0.0.0.0',  // IMPORTANTE: Permitir conexiones externas
    port: 5173,
  },
});
