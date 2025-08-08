// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.rinshankaiho.fun",
  base: "/",
  trailingSlash: "always",
  integrations: [],

  vite: {
    plugins: [tailwindcss()],
  },
});