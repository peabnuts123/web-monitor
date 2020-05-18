import path from 'path';

/** Folder containing snapshot files */
export const SNAPSHOT_FOLDER = path.resolve("snapshots");

/** File name suffix for "new" snapshots */
export const SNAPSHOT_NEW_SUFFIX = '.latest';

/** File name suffix for "old" snapshots */
export const SNAPSHOT_OLD_SUFFIX = '.old';

/**
 * Get the name of a snapshot for a given url
 * @param url Url for which to generate a file name
 */
export const snapshotName = (url: string) => url.replace(/\W/g, '_').replace(/_+/g, '_');

/**
 * Generate the "new" snapshot file name for a given URL
 * @param url Url for which to generate a file name
 */
export const newSnapshotFileName = (url: string) => `${snapshotName(url)}${SNAPSHOT_NEW_SUFFIX}`;

/**
 * Generate the "old" snapshot file name for a given URL
 * @param url Url for which to generate a file name
 */
export const oldSnapshotFileName = (url: string) => `${snapshotName(url)}${SNAPSHOT_OLD_SUFFIX}`;

/**
 * Generate the full path of a "new" snapshot for a given URL
 * @param url Url for which to generate a file name
 */
export const newSnapshotFilePath = (url: string) => path.join(SNAPSHOT_FOLDER, newSnapshotFileName(url));

/**
 * Generate the full path of a "old" snapshot for a given URL
 * @param url Url for which to generate a file name
 */
export const oldSnapshotFilePath = (url: string) => path.join(SNAPSHOT_FOLDER, oldSnapshotFileName(url));
