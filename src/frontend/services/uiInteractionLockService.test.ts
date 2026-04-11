import { afterEach, describe, expect, it, vi } from 'vitest';
import { uiInteractionLockService } from './uiInteractionLockService';

describe('uiInteractionLockService', () => {
  afterEach(() => {
    uiInteractionLockService.resetForTest();
  });

  it('should keep the interaction locked until the last lock is released', () => {
    const releaseFirstLock = uiInteractionLockService.acquire();
    const releaseSecondLock = uiInteractionLockService.acquire();

    expect(uiInteractionLockService.isLocked()).toBe(true);

    releaseFirstLock();
    expect(uiInteractionLockService.isLocked()).toBe(true);

    releaseSecondLock();
    expect(uiInteractionLockService.isLocked()).toBe(false);
  });

  it('should notify subscribers only when the lock state changes', () => {
    const listener = vi.fn();
    const unsubscribe = uiInteractionLockService.subscribe(listener);

    const releaseFirstLock = uiInteractionLockService.acquire();
    const releaseSecondLock = uiInteractionLockService.acquire();
    releaseFirstLock();
    releaseSecondLock();
    unsubscribe();

    uiInteractionLockService.acquire()();

    expect(listener).toHaveBeenNthCalledWith(1, true);
    expect(listener).toHaveBeenNthCalledWith(2, false);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
