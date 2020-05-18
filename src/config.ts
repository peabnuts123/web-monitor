/**
 * Config data per-site
 */
export interface SiteConfig {
  url: string;
  selector: string;
}

/**
 * Config data as defined by config file
 */
export interface Config {
  sites: SiteConfig[];
}

/**
 * File name for config file
 */
export const CONFIG_FILE_NAME = 'config.toml';
