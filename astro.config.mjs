// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // PUBLIC_API_URL can be overridden at build time or via .env
  // e.g. PUBLIC_API_URL=http://api:3001
});
