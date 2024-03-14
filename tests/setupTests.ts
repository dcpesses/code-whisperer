import '@testing-library/jest-dom';
import { afterEach, beforeEach } from 'vitest';

import {
  mockWindowHistory,
  mockWindowLocation,
  restoreWindowHistory,
  restoreWindowLocation
} from '../tests/mockWindowLocation';

beforeEach(() => {
  mockWindowLocation('http://localhost:5173');
  mockWindowHistory();
});

afterEach(() => {
  restoreWindowLocation();
  restoreWindowHistory();
});
