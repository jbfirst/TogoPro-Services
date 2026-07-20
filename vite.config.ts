import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "icon-maskable-512.png"],
      manifest: {
        name: "TogoPro Services",
        short_name: "TogoPro",
        description: "Annuaire de prestataires de services vérifiés à Lomé, Togo.",
        theme_color: "#C1440E",
        background_color: "#FDF7EC",
        display: "standalone",
        start_url: "/",
        scope: "/",
        lang: "fr",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Ne met en cache que les fichiers statiques (JS/CSS/images) — jamais les appels
        // API Supabase, pour ne jamais afficher de données prestataires périmées hors-ligne.
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
});
