/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "../../server/controllers/**/*.ts",
    "../../server/middlewares/**/*.ts",
    "!../../server/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov", "html", "json-summary"],
  testTimeout: 30000,
  verbose: true,
};
