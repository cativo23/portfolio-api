import { Config } from 'jest';
import { compilerOptions } from './tsconfig.json';
import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'text', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/test/',
    '/coverage/',
    '.module.ts$',
    'eslint.config.js',
    'jest.config.ts',
    'main.ts',
    'migrations/',
    'seeder',
    'typeorm.config',
    '/entities/',
    '/types/',
    '/seeds/',
    'typeorm-common.config.ts',
  ],
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

export default config;
