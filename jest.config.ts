export default {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/test/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/src/test/__mocks__/styleMock.js',
    '@components': '<rootDir>/src/components',
    '@config': '<rootDir>/src/config',
    '@context': '<rootDir>/src/context',
    '@interfaces': '<rootDir>/src/interfaces',
    '@enums': '<rootDir>/src/enums',
    '@hooks': '<rootDir>/src/hooks',
    '@models': '<rootDir>/src/models',
    '@services': '<rootDir>/src/services',
    '@slices': '<rootDir>/src/slices',
    '@utils': '<rootDir>/src/utils',
    '@views': '<rootDir>/src/views',
  },
};
