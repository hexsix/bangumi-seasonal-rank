// @ts-check
import { defineConfig } from 'astro/config';

import icon from "astro-icon";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.rinshankaiho.fun",
  base: "/",
  trailingSlash: "always",
  integrations: [icon()],

  vite: {
    plugins: [tailwindcss()],
  },
});