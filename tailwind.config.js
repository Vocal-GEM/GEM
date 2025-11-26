/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Poppins', 'sans-serif'],
            },
            colors: {
                slate: {
                    50: 'rgb(var(--slate-50) / <alpha-value>)',
                    100: 'rgb(var(--slate-100) / <alpha-value>)',
                    200: 'rgb(var(--slate-200) / <alpha-value>)',
                    300: 'rgb(var(--slate-300) / <alpha-value>)',
                    400: 'rgb(var(--slate-400) / <alpha-value>)',
                    500: 'rgb(var(--slate-500) / <alpha-value>)',
                    600: 'rgb(var(--slate-600) / <alpha-value>)',
                    700: 'rgb(var(--slate-700) / <alpha-value>)',
                    800: 'rgb(var(--slate-800) / <alpha-value>)',
                    900: 'rgb(var(--slate-900) / <alpha-value>)',
                    950: 'rgb(var(--slate-950) / <alpha-value>)',
                },
                white: 'rgb(var(--white) / <alpha-value>)',
                black: 'rgb(var(--black) / <alpha-value>)',
                'teal': {
                    DEFAULT: '#14b8a6',
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                },
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s infinite',
                'shimmer': 'shimmer 2s infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': {
                        boxShadow: '0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
                    },
                    '50%': {
                        boxShadow: '0 0 30px rgba(20, 184, 166, 0.6), 0 0 60px rgba(139, 92, 246, 0.4)',
                    },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'glow-pulse': {
                    '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(20, 184, 166, 0.6))' },
                    '50%': { filter: 'drop-shadow(0 0 16px rgba(139, 92, 246, 0.8))' },
                },
            },
        },
    },
    plugins: [],
}
