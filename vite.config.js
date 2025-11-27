import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
        // visualizer({
        //     open: true,
        //     gzipSize: true,
        //     brotliSize: true,
        // }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'https://vocalgem.onrender.com',
                changeOrigin: true,
                secure: true
            }
        }
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split Three.js and related libraries into separate chunks
                    'three-core': ['three'],
                    'three-fiber': ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'transformers': ['@xenova/transformers'],
                    'pdf': ['jspdf', 'jspdf-autotable'],
                    'ui-icons': ['lucide-react'],
                }
            }
        },
        chunkSizeWarningLimit: 1000, // Increase warning limit for large chunks
        sourcemap: false, // Disable sourcemaps in production to reduce build size
    }
})
