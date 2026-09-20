import fs from "node:fs";
import path from "node:path";

import { defineConfig } from "vite";
import type { Plugin } from "vite";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const UPLOAD_DIRS = ["banners", "previewsongs"];
const uploadsRoot = path.resolve(__dirname, "../backend/uploads");

const AUDIO_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav"
};

/**
 * Modo Pages (sem backend): banners e previas vem de backend/uploads,
 * servidos no dev e copiados para o dist no build.
 */
function staticUploads(): Plugin {
  let outDir = "dist";

  return {
    name: "static-uploads",

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },

    configureServer(server) {
      const base = server.config.base.replace(/\/$/, "");

      server.middlewares.use((req, res, next) => {
        // este middleware roda antes de o Vite remover a base da URL
        const raw = (req.url ?? "").split("?")[0];
        const url = decodeURIComponent(raw.startsWith(base) ? raw.slice(base.length) : raw);
        const [, dir, ...rest] = url.split("/");

        if (!UPLOAD_DIRS.includes(dir) || rest.length === 0) {
          return next();
        }

        const file = path.join(uploadsRoot, dir, ...rest);

        if (!file.startsWith(path.join(uploadsRoot, dir)) || !fs.existsSync(file)) {
          return next();
        }

        res.setHeader("Content-Type", AUDIO_TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream");
        fs.createReadStream(file).pipe(res);
      });
    },

    closeBundle() {
      for (const dir of UPLOAD_DIRS) {
        const from = path.join(uploadsRoot, dir);

        if (fs.existsSync(from)) {
          fs.cpSync(from, path.join(outDir, dir), { recursive: true });
        }
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  // `vite --mode pages` / `vite build --mode pages`: app 100% no navegador.
  const isPages = mode === "pages";

  return {
    // Repositorio em github.com/<usuario>/piu-randomizer -> /piu-randomizer/
    base: isPages ? process.env.PAGES_BASE ?? "/piu-randomizer/" : "/",
    define: {
      __STATIC_MODE__: JSON.stringify(isPages)
    },
    plugins: [react(), tailwindcss(), ...(isPages ? [staticUploads()] : [])]
  };
});
