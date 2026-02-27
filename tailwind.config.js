/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#001731',
                secondary: '#0E2C48',
                accent: '#C9A84C',
                'accent-hover': '#B08D35',
                surface: '#FFFFFF',
                text: '#001731',
                'text-muted': '#6B7280',
                silver: '#E5E7EB',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            transitionDuration: {
                '400': '400ms',
                '600': '600ms',
                '800': '800ms',
            },
        },
    },
    plugins: [],
}
