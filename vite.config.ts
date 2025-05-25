// import { fileURLToPath, URL } from 'node:url';
// import react from '@vitejs/plugin-react';
// import { defineConfig } from 'vite';
// import tailwindcss from 'tailwindcss';
// import fs from 'fs';
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   css: {
//     postcss: {
//       plugins: [tailwindcss()]
//     }
//   },
//   base: '/',
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url))
//     }
//   },
//   build: {
//     chunkSizeWarningLimit: 3000
//   },
//   // server: {
//   //    https: {
//   //     key: fs.readFileSync(path.resolve(__dirname, 'localhost.key')),
//   //     cert: fs.readFileSync(path.resolve(__dirname, 'localhost.crt')),
//   //   },
//   // }
// });
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  base: "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  server: {
    proxy: {
      // Proxying /api/directions to Google Directions API
      "/api/directions": {
        target: "https://maps.googleapis.com",
        changeOrigin: true,
        secure: true,
        // Rewrite the URL path from /api/directions to /maps/api/directions/json
        rewrite: (path) =>
          path.replace(/^\/api\/directions/, "/maps/api/directions/json"),
        // Modify the outgoing request to append the API key
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Extract the current URL path
            const originalPath = proxyReq.path; // e.g., /maps/api/directions/json?origin=...&destination=...
            // Parse the URL to manipulate query parameters
            const url = new URL(originalPath, "https://maps.googleapis.com");
            // Append the API key from environment variables
            url.searchParams.set(
              "key",
              "AIzaSyDBbmSw9fX9vAjkgPpJ3ahoYsmzagGr4LI"
            );
            // Update the proxy request path with the new query string
            proxyReq.path = url.pathname + url.search;
          });
        },
      },
      // Add proxy for API requests
      "/test": {
        target: "http://static.108.155.13.49.clients.your-server.de",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
