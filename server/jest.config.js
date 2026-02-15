/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // ถ้า test files อยู่ใน src/__tests__
  testMatch: ["**/tests/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
};