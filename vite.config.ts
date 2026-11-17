import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: [
      "node_modules/**",
      "**/node_modules/**",
      ".agents/**",
      "apps/web/.next/**",
      "apps/web/out/**",
      "apps/server/dist/**",
      "packages/db/dist/**",
    ],
    semi: true,
    singleQuote: false,
    sortPackageJson: true,
  },
  lint: {
    ignorePatterns: [
      "node_modules/**",
      "**/node_modules/**",
      ".agents/**",
      "apps/web/.next/**",
      "apps/web/out/**",
      "apps/server/dist/**",
      "packages/db/dist/**",
    ],
    options: {
      typeAware: false,
      typeCheck: false,
    },
  },
  staged: {
    "*.{js,ts,jsx,tsx,vue,svelte,json,jsonc,css,md}": "vp check --fix",
  },
});
