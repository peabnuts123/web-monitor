import { promises as fs } from 'fs';
import path from 'path';

import { SNAPSHOT_FOLDER, SNAPSHOT_OLD_SUFFIX, SNAPSHOT_NEW_SUFFIX } from './util/snapshot';
import Logger from './util/Logger';


/**
 * Prune "old" snapshots and rename "new" snapshots to "old" ones
 */
export default async function updateSnapshots() {
  const snapshotFiles: string[] = await fs.readdir(SNAPSHOT_FOLDER);

  const newSnapshotFiles = snapshotFiles.filter((file) => path.extname(file) === SNAPSHOT_NEW_SUFFIX);
  const oldSnapshotFiles = snapshotFiles.filter((file) => path.extname(file) === SNAPSHOT_OLD_SUFFIX);

  Logger.log(`Cleaning up snapshots...`);

  // Delete all old snapshot files
  await Promise.all(oldSnapshotFiles.map((snapshotFile) => {
    const filePath = path.join(SNAPSHOT_FOLDER, snapshotFile);
    return fs.unlink(filePath);
  }));

  // Rename all "new" snapshot files to "old"
  await Promise.all(newSnapshotFiles.map((snapshotFile) => {
    const newFilePath = path.join(path.dirname(snapshotFile), path.basename(snapshotFile, SNAPSHOT_NEW_SUFFIX)) + SNAPSHOT_OLD_SUFFIX;
    return fs.rename(path.join(SNAPSHOT_FOLDER, snapshotFile), path.join(SNAPSHOT_FOLDER, newFilePath));
  }));

  Logger.log(`Finished cleaning up ${oldSnapshotFiles.length} "old" snapshots and ${newSnapshotFiles.length} "new" snapshots.`);
}
