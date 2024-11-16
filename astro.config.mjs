// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react'; // Asegúrate de importar la integración de React

// https://astro.build/config
export default defineConfig({
  site: 'https://davidcito11.github.io',
  integrations: [
    tailwind(),  // Integración de Tailwind
    react(),     // Integración de React
  ],
});
