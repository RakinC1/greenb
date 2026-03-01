import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest:  '#1a2e1a',
        moss:    '#2d4a2d',
        sage:    '#4a7c59',
        fern:    '#6aab7a',
        mint:    '#a8d5b5',
        cream:   '#f5f0e8',
        amber:   '#e8a835',
        'amber-light': '#f5c96a',
        rust:    '#c4622d',
        sky:     '#7bbfcf',
        muted:   '#5a7060',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        sans:     ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
