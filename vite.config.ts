import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("tesseract.js")) return "vendor-ocr";
          if (
            id.includes("jspdf") ||
            id.includes("pdf-lib") ||
            id.includes("html-to-image") ||
            id.includes("qrcode")
          ) {
            return "vendor-documents";
          }
          if (id.includes("firebase")) return "vendor-firebase";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("react") || id.includes("react-dom")) return "vendor-react";
        },
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
    output: {
      dir: ".vercel/output",
      serverDir: ".vercel/output/functions/__server.func",
      publicDir: ".vercel/output/static",
    }
  }
});
