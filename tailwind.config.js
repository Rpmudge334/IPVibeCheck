/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                    950: '#020617', // Very dark background
                    900: '#0f172a',
                    800: '#1e293b',
                },
                mithril: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    400: '#38bdf8', // Glowing Text
                    500: '#0ea5e9', // Primary Accent
                    600: '#0284c7', // Button BGs
                    900: '#0c4a6e', // Deep Accents
                },
                forge: {
                    red: '#ef4444',    // Critical
                    amber: '#f59e0b',  // Suspicious
                    emerald: '#10b981' // Clean
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'],
                display: ['"Tengwar Annatar"', 'sans-serif'], // For decorative headers
                tolkien: ['"Cinzel"', 'serif'], // New Tolkien-ish font
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { opacity: 1, boxShadow: '0 0 10px #38bdf8' },
                    '50%': { opacity: .5, boxShadow: '0 0 5px #0ea5e9' },
                }
            }
        },
    },
    plugins: [],
}
