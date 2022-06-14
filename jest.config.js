module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^#app$': '<rootDir>/node_modules/nuxt3/dist/app/index.mjs',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  moduleFileExtensions: ['ts', 'js', 'mjs', 'vue', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.vue$': '@vue/vue3-jest'
  },
  testRegex: '/__tests__/.+\\.spec\\.(js|ts)$',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/app/components/**/*.vue', '<rootDir>/app/composables/**/*.ts'],
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
}
