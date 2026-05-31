import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverUrl = env.VITE_SERVER_URL || "http://localhost:4000";

  return {
    plugins: [react()],
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.js$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        "/api": {
          target: serverUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/socket.io": {
          target: serverUrl,
          ws: true,
        },
      },
    },
  };
});
