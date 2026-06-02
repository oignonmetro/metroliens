import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/metroliens/' doit correspondre au NOM DU DÉPÔT GitHub.
// Si ton dépôt s'appelle autrement, change cette valeur (ex. '/mon-jeu/').
export default defineConfig({
  plugins: [react()],
  base: '/metroliens/',
})
