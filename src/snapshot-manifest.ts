import { promises as fs, existsSync } from 'fs';
import { SNAPSHOT_MANIFEST_PATH } from './util/snapshot';
import Logger, { LogLevel } from './util/Logger';

export interface SiteManifest {
  lastRun: Date;
}

export interface SnapshotManifest {
  sites: Record<string, SiteManifest>;
}

export default async function loadSnapshotManifest(): Promise<SnapshotManifest> {
  let manifest: SnapshotManifest;

  if (!existsSync(SNAPSHOT_MANIFEST_PATH)) {
    // Create default manifest if none exists
    Logger.log(LogLevel.debug, "No snapshot manifest exists, creating a default one");
    manifest = getDefaultManifest();
    await writeSnapshotManifest(manifest);
  } else {
    // Read snapshot manifest from disk
    manifest = await readSnapshotManifest();
  }

  Logger.log("Successfully read snapshot manifest.");

  return manifest;
}

export async function readSnapshotManifest(): Promise<SnapshotManifest> {
  const manifestFileContents = (await fs.readFile(SNAPSHOT_MANIFEST_PATH)).toString();
  const manifestFileRaw = JSON.parse(manifestFileContents);
  validateRawSnapshotManifest(manifestFileRaw);

  // Parse raw site manifest data
  const manifestSites: Record<string, SiteManifest> = {};
  Object.keys(manifestFileRaw.sites).forEach((snapshotKey) => {
    const siteManifestRaw = manifestFileRaw.sites[snapshotKey];

    manifestSites[snapshotKey] = {
      lastRun: new Date(siteManifestRaw.lastRun),
    };
  });

  // Parse raw snapshot manifest data
  const manifest: SnapshotManifest = {
    sites: manifestSites,
  };

  return manifest;
}

export async function writeSnapshotManifest(manifest: SnapshotManifest) {
  const manifestFileContents = JSON.stringify(manifest);
  await fs.writeFile(SNAPSHOT_MANIFEST_PATH, manifestFileContents);
}

function getDefaultManifest(): SnapshotManifest {
  return {
    sites: {},
  };
}

function validateRawSnapshotManifest(manifest: any) {
  if (manifest.sites === undefined) {
    throwSnapshotManifestValidationError(`Key 'sites' cannot be undefined`);
  } else if (Object.prototype.toString.call(manifest.sites) !== '[object Object]') {
    throwSnapshotManifestValidationError(`Key 'sites' must be an object, keyed by snapshot name. Got: ${manifest.sites} (${Object.prototype.toString.call(manifest.sites)})`);
  } else {
    // Validate site manifest objects
    Object.keys(manifest.sites).forEach((snapshotKey) => {
      const siteManifest = manifest.sites[snapshotKey];

      if (siteManifest.lastRun === undefined) {
        throwSiteManifestValidationError(`Key 'lastRun' cannot be undefined`, snapshotKey);
      } else if (isNaN(new Date(siteManifest.lastRun).getTime())) {
        throwSiteManifestValidationError(`Key 'lastRun' must be an ISO8601 formatted date string, parsable by 'new Date()'. Got: ${siteManifest.lastRun}`, snapshotKey);
      }
    });
  }
}

function throwSiteManifestValidationError(message: string, key: string) {
  throwSnapshotManifestValidationError(`Site manifest with key '${key}' is invalid: ${message}`);
}

function throwSnapshotManifestValidationError(message: string) {
  throw new Error(`Snapshot manifest is invalid: ${message}. Consider deleting manifest: ${SNAPSHOT_MANIFEST_PATH}`);
}
