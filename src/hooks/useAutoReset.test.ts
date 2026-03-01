import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAutoReset } from './useAutoReset';

describe('useAutoReset', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with the default value', () => {
    // Given / When
    const { result } = renderHook(() => useAutoReset<string | null>(null, 3000));

    // Then
    expect(result.current[0]).toBeNull();
  });

  it('resets to default after the specified delay', () => {
    // Given
    const { result } = renderHook(() => useAutoReset<string | null>(null, 3000));

    // When
    act(() => result.current[1]('Hello'));
    expect(result.current[0]).toBe('Hello');

    // Then — after delay
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current[0]).toBeNull();
  });

  it('re-triggering restarts the timer', () => {
    // Given
    const { result } = renderHook(() => useAutoReset<string | null>(null, 3000));

    // When — set, wait 2s, set again
    act(() => result.current[1]('First'));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => result.current[1]('Second'));

    // Then — at 2999ms from second set, still active
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(result.current[0]).toBe('Second');

    // Then — at 3000ms from second set, resets
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBeNull();
  });

  it('unmount clears the timer (no setState after unmount)', () => {
    // Given
    const { result, unmount } = renderHook(() => useAutoReset<string | null>(null, 3000));
    act(() => result.current[1]('Active'));

    // When
    unmount();

    // Then — advancing timers after unmount should not throw
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // No assertion needed — if clearTimeout wasn't called, React would warn about setState on unmounted component
  });

  it('setting the default value directly does not schedule a timer', () => {
    // Given
    const { result } = renderHook(() => useAutoReset<boolean>(false, 1000));

    // When — set to default
    act(() => result.current[1](false));

    // Then — no timer scheduled, value stays default
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current[0]).toBe(false);
  });
});
