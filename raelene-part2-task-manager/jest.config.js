module.exports = {
  testEnvironment: "node",

  // Jest will look for tests here
  testMatch: ["**/tests/**/*.test.js"],

  // Enable coverage
  collectCoverage: true,

  // focus coverage only on these files
  collectCoverageFrom: [
    "utils/raelene-cha.js"
  ],

  // Where coverage reports go
  coverageDirectory: "coverage/backend",

  // Report formats
  coverageReporters: ["text", "html"],

  // Reasonable thresholds (not 100%, not too strict)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};
