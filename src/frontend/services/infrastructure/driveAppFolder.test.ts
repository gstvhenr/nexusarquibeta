import { describe, expect, it } from 'vitest';
import {
  CANONICAL_APP_FOLDER_NAME,
  LEGACY_APP_FOLDER_NAME,
  selectPreferredAppFolder,
} from './driveAppFolder';

describe('driveAppFolder.selectPreferredAppFolder', () => {
  it('should prefer the folder containing sync artifacts over a newer legacy candidate', () => {
    const selected = selectPreferredAppFolder([
      {
        name: LEGACY_APP_FOLDER_NAME,
        ref: 'legacy',
        hasLegacySnapshot: true,
        lastModified: 200,
      },
      {
        name: CANONICAL_APP_FOLDER_NAME,
        ref: 'canonical',
        hasSyncArtifacts: true,
        lastModified: 100,
      },
    ]);

    expect(selected?.ref).toBe('canonical');
  });

  it('should prefer the newest candidate when no sync artifacts exist', () => {
    const selected = selectPreferredAppFolder([
      {
        name: CANONICAL_APP_FOLDER_NAME,
        ref: 'canonical',
        lastModified: 100,
      },
      {
        name: LEGACY_APP_FOLDER_NAME,
        ref: 'legacy',
        lastModified: 200,
      },
    ]);

    expect(selected?.ref).toBe('legacy');
  });

  it('should prefer the canonical folder name as deterministic tie-breaker', () => {
    const selected = selectPreferredAppFolder([
      {
        name: LEGACY_APP_FOLDER_NAME,
        ref: 'legacy',
        lastModified: 100,
      },
      {
        name: CANONICAL_APP_FOLDER_NAME,
        ref: 'canonical',
        lastModified: 100,
      },
    ]);

    expect(selected?.name).toBe(CANONICAL_APP_FOLDER_NAME);
  });
});
