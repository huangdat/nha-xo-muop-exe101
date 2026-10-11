import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// In development ('serve'), use '/' so the dev server serves http://localhost:5173/ correctly.
// In production ('build'), use './' (or VITE_BASE_PATH if set) so all assets are relative,
// allowing seamless deployment to any GitHub Pages repository (https://<user>.github.io/<repo>/).
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : (process.env.VITE_BASE_PATH || './'),
}))
