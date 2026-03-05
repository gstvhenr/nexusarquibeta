import { afterEach } from 'vitest';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

// Automatically unmount rendered components after every test.
// This prevents DOM pollution between test files sharing the same jsdom environment.
afterEach(() => {
  cleanup();
});
