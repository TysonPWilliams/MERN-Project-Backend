// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  testTimeout: 10000,
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml'
    }]
  ]
}
