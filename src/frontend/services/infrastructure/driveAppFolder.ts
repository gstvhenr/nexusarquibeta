/**
 * Shared folder naming and deterministic resolution for the app root on Drive.
 *
 * The sync stack historically used two root folder names:
 * - `01. NexusArqui` (local Google Drive Desktop path)
 * - `NexusArqui` (legacy Google Drive API path)
 *
 * The resolver below keeps backward compatibility while ensuring every access
 * path picks the same logical root whenever possible.
 */

export const CANONICAL_APP_FOLDER_NAME = '01. NexusArqui';
export const LEGACY_APP_FOLDER_NAME = 'NexusArqui';

export const APP_FOLDER_CANDIDATES = [CANONICAL_APP_FOLDER_NAME, LEGACY_APP_FOLDER_NAME] as const;

export type DriveAppFolderName = (typeof APP_FOLDER_CANDIDATES)[number];

export interface DriveAppFolderCandidate<TRef = unknown> {
  name: DriveAppFolderName;
  ref: TRef;
  hasSyncArtifacts?: boolean;
  hasLegacySnapshot?: boolean;
  lastModified?: number | null;
}

function getArtifactRank(candidate: DriveAppFolderCandidate): number {
  if (candidate.hasSyncArtifacts) {
    return 2;
  }

  if (candidate.hasLegacySnapshot) {
    return 1;
  }

  return 0;
}

function getFolderNameRank(name: DriveAppFolderName): number {
  return name === CANONICAL_APP_FOLDER_NAME ? 0 : 1;
}

/**
 * Picks the most reliable app folder candidate.
 *
 * Priority order:
 * 1. Folder containing sync artifacts (`data/_meta.json`)
 * 2. Folder containing the legacy monolithic snapshot (`nexus-data.json`)
 * 3. Most recently modified candidate
 * 4. Canonical name (`01. NexusArqui`) as deterministic tiebreaker
 */
export function selectPreferredAppFolder<TRef>(
  candidates: DriveAppFolderCandidate<TRef>[],
): DriveAppFolderCandidate<TRef> | null {
  if (candidates.length === 0) {
    return null;
  }

  const [firstCandidate, ...remainingCandidates] = candidates;

  return remainingCandidates.reduce<DriveAppFolderCandidate<TRef>>((best, current) => {
    const currentArtifactRank = getArtifactRank(current);
    const bestArtifactRank = getArtifactRank(best);
    if (currentArtifactRank !== bestArtifactRank) {
      return currentArtifactRank > bestArtifactRank ? current : best;
    }

    const currentModified = current.lastModified ?? -1;
    const bestModified = best.lastModified ?? -1;
    if (currentModified !== bestModified) {
      return currentModified > bestModified ? current : best;
    }

    const currentNameRank = getFolderNameRank(current.name);
    const bestNameRank = getFolderNameRank(best.name);
    if (currentNameRank !== bestNameRank) {
      return currentNameRank < bestNameRank ? current : best;
    }

    return best;
  }, firstCandidate);
}
