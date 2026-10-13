// Tests d'interface (React Testing Library). Les tests de timerCore restent sous node:test.
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests/ui'],
  testMatch: ['**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/ui/setup.js'],
  moduleNameMapper: {
    // require.context n'existe pas hors webpack : on remplace le chargeur de ressources.
    '^(\\.\\./)+assets$': '<rootDir>/tests/ui/__mocks__/assets.js',
    '^\\./assets$': '<rootDir>/tests/ui/__mocks__/assets.js',
    '\\.(css)$': '<rootDir>/tests/ui/__mocks__/empty.js',
  },
};
