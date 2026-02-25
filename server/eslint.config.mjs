import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals"; // ต้องใช้ตัวนี้ช่วยเรื่อง Jest และ Node

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,    // ให้รู้จัก console, module, require
        ...globals.jest,    // ให้รู้จัก describe, it, expect, jest
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-console": "warn",
    },
  },
  {
    // 🚩 ส่วนสำคัญ: สั่งให้ ESLint "ไม่ต้องตรวจ" โฟลเดอร์พวกนี้
    ignores: [
      "**/generated/**",      // ไฟล์ที่ Prisma สร้าง (Error เยอะสุดตรงนี้)
      "node_modules/**",
      "dist/**",
      "build/**"
    ],
  }
);