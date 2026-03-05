import { describe, expect, it } from 'vitest';
import {
  INSTAGRAM_DEFAULT_HANDLE,
  INSTAGRAM_DEFAULT_URL,
  INSTAGRAM_INITIAL_SNAPSHOT,
} from './constants';

describe('instagram constants', () => {
  it('exposes default URL and handle', () => {
    expect(INSTAGRAM_DEFAULT_URL).toBe('https://www.instagram.com/rafaelmunaro.arq/');
    expect(INSTAGRAM_DEFAULT_HANDLE).toBe('@rafaelmunaro.arq');
  });

  it('provides valid initial snapshot seed', () => {
    expect(INSTAGRAM_INITIAL_SNAPSHOT.id).toBe('snap_instagram_20260213_0028');
    expect(INSTAGRAM_INITIAL_SNAPSHOT.posts).toBe(118);
    expect(INSTAGRAM_INITIAL_SNAPSHOT.followers).toBe(6859);
    expect(INSTAGRAM_INITIAL_SNAPSHOT.following).toBe(946);
    expect(Number.isNaN(new Date(INSTAGRAM_INITIAL_SNAPSHOT.recordedAt).getTime())).toBe(false);
  });
});
