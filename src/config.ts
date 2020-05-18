/**
 * Config data per-site
 */
export interface SiteConfig {
  /** URL to monitor */
  url: string;
  /** Selector to specify which part of the page to monitor */
  selector: string;
  /** How often this URL should be monitored */
  frequency: string;
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
