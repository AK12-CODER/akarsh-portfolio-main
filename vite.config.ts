import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  let akEnvVars: Record<string, string> = {};
  const akEnvPaths = [
    path.resolve(process.cwd(), "ak.env"),
    path.resolve(process.cwd(), "src/ak.env"),
  ];

  for (const p of akEnvPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...val] = trimmed.split("=");
          if (key && val.length > 0) {
            akEnvVars[key.trim()] = val.join("=").trim();
          }
        }
      });
    }
  }

  const apiKey =
    process.env.VITE_GEMINI_API_KEY ||
    env.VITE_GEMINI_API_KEY ||
    akEnvVars.VITE_GEMINI_API_KEY ||
    akEnvVars.GEMINI_API_KEY ||
    "";

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(apiKey),
    },
  };
});

