export default {
    testEnvironment: 'node',
    transform: {},
    extensionsToTreatAsEsm: ['.js'],
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    coverageDirectory: '../coverage',
    coverageReporters: ['text', 'lcov', 'clover'],
    collectCoverageFrom: [
      '../src/**/*.js',
      '../routes/**/*.js',
      '../services/**/*.js',
      '!**/*.test.js',
      '!../config/*.js'
    ],
    testMatch: [
      '<rootDir>/../**/*.test.js'
    ],
    setupFiles: ['dotenv/config'],
    testTimeout: 10000,
    verbose: true,
    clearMocks: true,
    restoreMocks: true,
    roots: [
      '<rootDir>/../src',
      '<rootDir>/../routes',
      '<rootDir>/../services'
    ]
  };