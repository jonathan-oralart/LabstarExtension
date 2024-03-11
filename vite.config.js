import { defineConfig } from 'vite'
// crxjs enables hot reloading of the extension when developing
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'


export default defineConfig({
  plugins: [
    crx({ manifest })
  ],
})