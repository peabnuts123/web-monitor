import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { SiteConfig } from "./config";
import { oldSnapshotFilePath, newSnapshotFilePath } from "./util/snapshot";
import diff from "./util/diff";
import Logger from "./util/Logger";
import { Result } from "./util/result";

const existsAsync = promisify(fs.exists);

export default async function compareSnapshots(sites: SiteConfig[]): Promise<Result[]> {
  const results: Result[] = [];

  Logger.log(`Comparing "old" vs. "new" snapshots for ${sites.length} sites...`);

  // Compare snapshots of each site
  for (let i = 0; i < sites.length; i++) {
    const site: SiteConfig = sites[i];

    // Snapshot file paths
    const oldSnapshotPath = oldSnapshotFilePath(site.url);
    const newSnapshotPath = newSnapshotFilePath(site.url);

    // Do not compare this site if it doesn't have an existing snapshot
    const oldSnapshotExists = await existsAsync(oldSnapshotPath);
    if (!oldSnapshotExists) {
      Logger.log(`Skipping snapshot diff for site '${site.url}'. This is the site's first snapshot, it will be compared next run`);
      continue;
    }

    // Diff snapshots
    const diffResult = await diff(oldSnapshotPath, newSnapshotPath, site.url);

    // Record results into collection
    const result: Result = {
      site,
      different: diffResult.different,
      diff: diffResult.diff,
    };

    // Log status update
    if (diffResult.different) {
      Logger.log(`[${i+1} of ${sites.length}] Snapshot for site '${site.url}' has changed, an email will be sent`);
    } else {
      Logger.log(`[${i+1} of ${sites.length}] Snapshot for site '${site.url}' is identical`);
    }

    results.push(result);
  }

  Logger.log(`Finished comparing snapshots.`);

  return results;
}
