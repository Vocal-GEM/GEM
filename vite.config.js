import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { visualizer } from 'rollup-plugin-visualizer'
import { execSync } from 'child_process'

// Get git version
let version = '0.0.0';
try {
    version = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
    console.warn('Failed to get git version', e);
}

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(`v0.1.0-${version}`)
    },
    base: './',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'Vocal GEM',
                short_name: 'VocalGEM',
                description: 'AI-Powered Voice Feminization Coach',
                theme_color: '#0f172a',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 6000000,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,glb}'],
                globIgnores: ['**/assets/transformers-*.js', '**/assets/pdf-*.js'],
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.pathname.includes('transformers-') || url.pathname.includes('pdf-'),
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'large-assets-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            }
        }),

        visualizer({
            open: true,
            gzipSize: true,
            brotliSize: true,
            filename: 'dist/stats.html' // Save analysis to file
        }),
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
                target: 'http://localhost:5000',
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
