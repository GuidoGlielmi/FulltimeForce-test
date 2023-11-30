import type {Config} from 'jest';
import {defaults} from 'jest-config';

const config: Config = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {'@/(.*)': '<rootDir>/$1'},
};

export default config;
