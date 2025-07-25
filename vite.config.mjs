import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  // ... other config if any
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'workers/springWorker.js',
          dest: 'workers'
        }
      ]
    }),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    VitePWA({
      registerType: 'autoUpdate', // Automatically update the service worker
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Add your icons here
      manifest: {
        name: 'Face Stretcher',
        short_name: 'FaceStretch',
        description: 'A fun Mario 64 style face stretching app.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png', // Create these icon files in public/
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png', // Create these icon files in public/
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png', // Create these icon files in public/
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable', // Add a maskable icon
          }
        ],
      },
      devOptions: {
        enabled: true // Enable PWA in development mode
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000
      }
    })
  ],
  build: {
    outDir: '../dist', // Output to a dist folder in the root
    emptyOutDir: true, // Clear the dist folder before building
  },
  root: 'src', // Set the root to the src directory
  publicDir: '../public', // Set the public directory relative to the root
  server: {
    port: 3000 // Optional: specify dev server port
  }
});
