// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  testTimeout: 10000,
  maxWorkers: 1, // Run tests sequentially to avoid MongoDB connection conflicts
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml'
    }]
  ]
}
