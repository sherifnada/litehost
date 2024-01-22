/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  testMatch: ["**/tests/**/*.ts"],

  // transform: {
  //   '^.+\\.m?[tj]s?$': ['ts-jest', { useESM: true }],
  // },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.(m)?js$': '$1',
  },
};