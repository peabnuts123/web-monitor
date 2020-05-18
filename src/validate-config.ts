import { Config, SiteConfig, CONFIG_FILE_NAME } from "./config";

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
