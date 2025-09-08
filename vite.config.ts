import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  server: {
    port: 3012,
  },
  build: {
    outDir: ".output",
  },
  ssr: {
    //  CJS 패키지를 SSR 번들에 포함시켜 named import 허용
    noExternal: ["react-to-print"],
  },
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      customViteReactPlugin: true,
      target: "bun",
    }),
    viteReact(),
    tailwindcss(),
  ],
});

export default config;
