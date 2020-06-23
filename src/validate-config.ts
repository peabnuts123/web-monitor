import { Config, SiteConfig, CONFIG_FILE_NAME } from "./config";

/**
 * A list of all valid frequencies and their corresponding
 * duration in milliseconds
 */
export const AllValidFrequencies = {
  '1min': 60 * 1000,
  '5min': 5 * 60 * 1000,
  '10min': 10 * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '20min': 20 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '1hour': 60 * 60 * 1000,
  '2hour': 2 * 60 * 60 * 1000,
  '3hour': 3 * 60 * 60 * 1000,
  '4hour': 4 * 60 * 60 * 1000,
  '6hour': 6 * 60 * 60 * 1000,
  '12hour': 12 * 60 * 60 * 1000,
  '1day': 24 * 60 * 60 * 1000,
};

/**
 * Test whether a given frequency string is within the set of valid frequencies.
 *
 * @param frequency Frequency string to test
 */
export function isValidFrequency(frequency: string) {
  return frequency in AllValidFrequencies;
}

/**
 * Validate a given config object to ensure it is fit for use
 */
export default function validateConfig(config: Config) {
  if (config.sites === undefined || !Array.isArray(config.sites)) {
    throwInvalidConfigError("`sites` key must be an array of objects");
  }

  config.sites.forEach(validateSite);
}

/**
 * Validate the config for a specific site
 *
 * @param siteConfig Site config to validate
 * @param index For logging, the index in the array at which this site config is located
 */
function validateSite(siteConfig: SiteConfig, index: number) {
  // Site config object
  if (typeof siteConfig !== 'object') {
    throwInvalidConfigError("all `sites` entries must be an object. Entry index " + index + " is of type: " + typeof siteConfig);
    // URL
  } else if (!siteConfig.url) {
    throwInvalidSiteConfigError("`url` is a required field", index);
  } else if (typeof siteConfig.url !== 'string') {
    throwInvalidSiteConfigError("`url` must be a string", index);
    // Selector
  } else if (!siteConfig.selector) {
    throwInvalidSiteConfigError("`selector` is a required field", index);
  } else if (typeof siteConfig.selector !== 'string') {
    throwInvalidSiteConfigError("`selector` must be a string", index);
    // Frequency
  } else if (!siteConfig.frequency) {
    throw throwInvalidSiteConfigError("`frequency` is a required field", index);
  } else if (typeof siteConfig.frequency !== 'string') {
    throw throwInvalidSiteConfigError("`frequency` must be a string", index);
  } else if (!isValidFrequency(siteConfig.frequency)) {
    throw throwInvalidSiteConfigError("`frequency` must be one of: " + Object.keys(AllValidFrequencies).join(', '), index);
  }
}

/**
 * Convenience function for consistent error messaging.
 * Throw an error that a site config object is invalid.
 *
 * @param message The message explaining why the site config is invalid
 * @param index The index in the array at which this site config is located
 */
function throwInvalidSiteConfigError(message: string, index: number) {
  throwInvalidConfigError(`site config object at index ${index} is invalid: ${message}`);
}

/**
 * Convenience function for consistent error messaging.
 * Throw an error that the config object is invalid.
 *
 * @param message The message explaining why the site config is invalid
 */
function throwInvalidConfigError(message: string) {
  throw new Error(`${CONFIG_FILE_NAME} is invalid: ${message}`);
}
