import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.js'],
        include: ['src/**/*.{test,spec}.{js,jsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov', 'json'],
            include: ['src/**/*.{js,jsx}'],
            exclude: [
                '**/*.test.{js,jsx}',
                '**/*.spec.{js,jsx}',
                '**/test/**',
                '**/node_modules/**',
                '**/dist/**',
                '**/.{idea,git,cache,output,temp}/**',
            ],
            reportsDirectory: './coverage',
        },
    },
})
