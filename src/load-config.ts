import { promises as fs } from 'fs';
import toml from '@iarna/toml';

import { CONFIG_FILE_NAME, Config } from './config';
import validateConfig, { AllValidFrequencies } from './validate-config';
import { SnapshotManifest } from './snapshot-manifest';
import { snapshotName } from './util/snapshot';
import Logger, { LogLevel } from './util/Logger';

/**
 * Read and validate the config file from disk.
 */
export default async function loadConfig(snapshotManifest: SnapshotManifest): Promise<Config> {
  // Read config file contents
  const configFileString = (await fs.readFile(CONFIG_FILE_NAME)).toString();

  // Parse config file
  const config = toml.parse(configFileString) as any as Config;

  // Validate config file
  validateConfig(config);

  // Filter config
  // Filter sites based on duration of time since they were last checked
  config.sites = config.sites.filter((site) => {
    // Lookup manifest for site
    const siteManifest = snapshotManifest.sites[snapshotName(site.url)];

    // If site has no manifest, then this is the site's first run,
    if (siteManifest === undefined) {
      // Always check site on first run
      Logger.log(LogLevel.debug, `Site '${site.url}' is being included in the run because it has not been run before`);
      return true;
    }

    // Resolve site's frequency as a duration in milliseconds
    const siteFrequencyMs = AllValidFrequencies[site.frequency as keyof typeof AllValidFrequencies];
    // Resolve duration of time since the site was last checked (in milliseconds)
    const timeSinceSiteLastRunMs = new Date().getTime() - siteManifest.lastRun.getTime();

    // Filter for this site if the amount of time since the last run is greater the
    //  the frequency as specified in the config file
    // There is also a 20s tolerance factored in here for inexact timings. 20s is enough
    //  to be confident that it will match expectations but not enough
    //  to push any timestamp into another bracket.
    const shouldInclude = timeSinceSiteLastRunMs + 20000 >= siteFrequencyMs;

    if (shouldInclude) {
      Logger.log(LogLevel.debug, `Site '${site.url}' is being included in the run because it has been ${timeSinceSiteLastRunMs}ms since last run and its period is ${siteFrequencyMs}ms`);
    }

    return shouldInclude;
  });

  return config;
}
