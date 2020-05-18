import { promises as fs } from 'fs';
import toml from '@iarna/toml';
import { CONFIG_FILE_NAME, Config, SiteConfig } from './config';
import validateConfig, { isValidFrequency, ALL_VALID_FREQUENCIES } from './validate-config';
import Logger from './util/Logger';

/**
 * Read and validate the config file from disk.
 */
export default async function loadConfig(frequencyFilter: string | undefined): Promise<Config> {
  // Validate frequency
  if (frequencyFilter !== undefined && !isValidFrequency(frequencyFilter)) {
    throw new Error(`Cannot run - Supplied frequency filter '${frequencyFilter}' is not a valid option. Must be one of ${ALL_VALID_FREQUENCIES.join(', ')}`);
  }

  Logger.log(`Frequency filter: ${frequencyFilter}`);

  // Read config file contents
  const configFileString = (await fs.readFile(CONFIG_FILE_NAME)).toString();

  // Parse config file
  const config = toml.parse(configFileString) as any as Config;

  // Validate config file
  validateConfig(config);

  // Filter config (if supplied)
  if (frequencyFilter !== undefined) {
    config.sites = config.sites.filter((site: SiteConfig) => site.frequency === frequencyFilter);
  } else {
    Logger.logWarning("No filter supplied - monitoring ALL sites");
  }

  return config;
}
