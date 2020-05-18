import { promises as fs } from 'fs';
import toml from '@iarna/toml';
import { CONFIG_FILE_NAME, Config } from './config';
import validateConfig from './validate-config';

/**
 * Read and validate the config file from disk.
 */
export default async function loadConfig(): Promise<Config> {
  // Read config file contents
  const configFileString = (await fs.readFile(CONFIG_FILE_NAME)).toString();

  // Parse config file
  const config = toml.parse(configFileString) as any as Config;

  // Validate config file
  validateConfig(config);

  return config;
}
