import { afterEach, describe, expect, it } from 'vitest';
import {
  isPublishedBrowserRuntime,
  readPublicRuntimeEnv,
  type PublicRuntimeEnvMap,
} from './runtimePublicEnv';

const originalLocation = window.location;

afterEach(() => {
  delete window.__NEXUS_ARQUI_RUNTIME_CONFIG;
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
});

describe('runtimePublicEnv', () => {
  it('should prefer the injected runtime config from window', () => {
    window.__NEXUS_ARQUI_RUNTIME_CONFIG = {
      VITE_FIREBASE_PROJECT_ID: ' nexusarqui-f6e11 ',
    } satisfies PublicRuntimeEnvMap;

    expect(readPublicRuntimeEnv('VITE_FIREBASE_PROJECT_ID')).toBe('nexusarqui-f6e11');
  });

  it('should identify remote published hosts', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { hostname: 'nexusarqui.app' },
    });

    expect(isPublishedBrowserRuntime()).toBe(true);
  });
});
