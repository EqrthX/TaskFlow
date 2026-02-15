import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/tests/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true, // ✅ สำคัญ: บอก ts-jest ว่าเราใช้ ESM module
    }],
  },
  extensionsToTreatAsEsm: ['.ts'],
};

export default config;