import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to './' for GitHub Pages compatibility (works for both root and subdirectory deployments).
// If your repo is at https://username.github.io/repo-name/, change base to '/repo-name/'.
export default defineConfig({
  plugins: [react()],
  base: './',
})
