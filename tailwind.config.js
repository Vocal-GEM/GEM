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
