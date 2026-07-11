import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * eslint-config-next/core-web-vitals already bundles eslint-plugin-jsx-a11y and
 * its recommended rules, so accessibility linting is on by construction — this
 * app is an accessibility product and a11y lint failures should block.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**"]),
]);

export default eslintConfig;
