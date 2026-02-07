import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      // Enforce single API client: axios must only be used via src/lib/api-client.ts
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message: "Use apiClient from src/lib/api-client.ts instead of importing axios directly.",
            },
          ],
        },
      ],
    },
  },
  {
    // Disallow direct use of fetch in React components; components must
    // call services which in turn use the shared apiClient.
    files: ["src/app/**/*.tsx", "src/components/**/*.tsx"],
    rules: {
      "no-restricted-globals": ["error", "fetch"],
    },
  },
  {
    files: ["src/lib/api-client.ts"],
    rules: {
      // Allow axios import in the single shared API client
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
