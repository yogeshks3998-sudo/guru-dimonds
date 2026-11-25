import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function caseInsensitiveProductAssetsPlugin(): Plugin {
  return {
    name: 'case-insensitive-product-assets',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url) {
          if (req.url.startsWith('/products/rings/')) {
            req.url = req.url.replace('/products/rings/', '/products/Rings/');
          } else if (req.url.startsWith('/products/earrings/')) {
            req.url = req.url.replace('/products/earrings/', '/products/Earrings/');
          } else if (req.url.startsWith('/products/god%20small%20statues/')) {
            req.url = req.url.replace('/products/god%20small%20statues/', '/products/God%20Small%20Statues/');
          } else if (req.url.startsWith('/products/neck%20jewellery/')) {
            req.url = req.url.replace('/products/neck%20jewellery/', '/products/Neck%20Jewellery/');
          } else if (req.url.startsWith('/products/pendants/')) {
            req.url = req.url.replace('/products/pendants/', '/products/Pendants/');
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), caseInsensitiveProductAssetsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
