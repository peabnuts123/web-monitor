import { promises as fs } from 'fs';
import path from 'path';

import { SNAPSHOT_OLD_SUFFIX, SNAPSHOT_NEW_SUFFIX, newSnapshotFilePath, oldSnapshotFilePath } from './util/snapshot';
import Logger from './util/Logger';
import { SiteConfig } from './config';


/**
 * Prune "old" snapshots and rename "new" snapshots to "old" ones
 * @param sites Sites for which to prune snapshots
 */
export default async function updateSnapshots(sites: SiteConfig[]) {
  const oldSnapshotFiles = sites.map((site) => oldSnapshotFilePath(site.url));
  const newSnapshotFiles = sites.map((site) => newSnapshotFilePath(site.url));

  Logger.log(`Cleaning up ${oldSnapshotFiles.length} "old" and ${newSnapshotFiles.length} "new" snapshots...`);

  // Delete all old snapshot files
  await Promise.all(oldSnapshotFiles.map(fs.unlink));

  // Rename all "new" snapshot files to "old"
  await Promise.all(newSnapshotFiles.map((snapshotFile) => {
    const newFilePath = path.join(path.dirname(snapshotFile), path.basename(snapshotFile, SNAPSHOT_NEW_SUFFIX)) + SNAPSHOT_OLD_SUFFIX;
    return fs.rename(snapshotFile, newFilePath);
  }));

  Logger.log(`Finished cleaning up snapshots.`);
}
