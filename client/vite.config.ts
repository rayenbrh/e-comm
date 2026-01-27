import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  // Obtenir l'URL du backend depuis les variables d'environnement ou utiliser la valeur par défaut
  const getBackendUrl = () => {
    // En production, utiliser l'URL complète depuis .env
    // En développement, utiliser l'URL depuis .env ou localhost
    const apiUrl = process.env.VITE_API_URL
    if (apiUrl) {
      // Retirer /api de la fin si présent pour le proxy
      return apiUrl.replace(/\/api\/?$/, '')
    }
    return isDev ? 'http://localhost:5000' : 'https://gouidex-backend.2bj94x.easypanel.host'
  }

  const backendUrl = getBackendUrl()

  const config: any = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Build output
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            animations: ['framer-motion'],
            three: ['three', '@react-three/fiber', '@react-three/drei'],
          },
        },
      },
    },
  }

  // Configuration du serveur uniquement en développement
  if (isDev) {
    config.server = {
      port: 5173,
      host: true, // Important: permet l'accès depuis des hôtes externes/domaines
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'gouidex-frontend.2bj94x.easypanel.host',
        // Optionnel: autoriser tous les sous-domaines EasyPanel (utile si le sous-domaine change)
        // '.easypanel.host',
      ],
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: true, // Pour HTTPS
        },
        // Proxy uploads en développement pour que le frontend puisse utiliser des URLs relatives /uploads
        '/uploads': {
          target: backendUrl,
          changeOrigin: true,
          secure: true, // Pour HTTPS
        },
      },
    }
  }

  return config
})
