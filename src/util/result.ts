import { SiteConfig } from "../config";

/**
 * Result of comparing 2 snapshots for a site
 */
export interface Result {
  different: boolean;
  site: SiteConfig;
  diff?: string;
}

/**
 * Same as `Result` except specific to sites that
 * have changed i.e. `different === true`
 */
export interface ChangedResult {
  different: true;
  site: SiteConfig;
  diff: string;
}
