import { promises as fs, existsSync } from 'fs';
import path from 'path';

import { SNAPSHOT_OLD_SUFFIX, SNAPSHOT_NEW_SUFFIX, newSnapshotFilePath, oldSnapshotFilePath, snapshotName } from './util/snapshot';
import Logger from './util/Logger';
import { SiteConfig } from './config';
import { SnapshotManifest, writeSnapshotManifest } from './snapshot-manifest';


/**
 * Prune "old" snapshots and rename "new" snapshots to "old" ones
 * @param sites Sites for which to prune snapshots
 */
export default async function updateSnapshots(sites: SiteConfig[], snapshotManifest: SnapshotManifest) {
  const oldSnapshotFiles = sites.map((site) => oldSnapshotFilePath(site.url));
  const newSnapshotFiles = sites.map((site) => newSnapshotFilePath(site.url));

  Logger.log(`Cleaning up ${oldSnapshotFiles.length} "old" and ${newSnapshotFiles.length} "new" snapshots...`);

  // Delete all old snapshot files
  await Promise.all(oldSnapshotFiles.map((snapshotFile) => {
    // Check file exists otherwise `unlink()` throws an error
    if (existsSync(snapshotFile)) {
      return fs.unlink(snapshotFile);
    }
  }));

  // Rename all "new" snapshot files to "old"
  await Promise.all(newSnapshotFiles.map((snapshotFile) => {
    const newFilePath = path.join(path.dirname(snapshotFile), path.basename(snapshotFile, SNAPSHOT_NEW_SUFFIX)) + SNAPSHOT_OLD_SUFFIX;
    return fs.rename(snapshotFile, newFilePath);
  }));

  // Update snapshot manifest
  sites.forEach((site) => {
    const siteManifest = snapshotManifest.sites[snapshotName(site.url)];

    if (siteManifest === undefined) {
      // Default site manifest
      snapshotManifest.sites[snapshotName(site.url)] = {
        lastRun: new Date(),
      };
    } else {
      // Set last run for this site to today
      siteManifest.lastRun = new Date();
    }
  });

  // Write snapshot manifest to disk
  await writeSnapshotManifest(snapshotManifest);

  Logger.log(`Finished cleaning up snapshots.`);
}
