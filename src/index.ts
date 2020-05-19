import { promises as fs, existsSync } from 'fs';

import Puppeteer, { Page, Browser } from 'puppeteer-core';
import toDiffableHtml from 'diffable-html';
import { argv } from 'yargs';

import loadConfig from './load-config';
import { Config, SiteConfig } from './config';
import Logger from './util/Logger';
import { newSnapshotFilePath, SNAPSHOT_FOLDER } from './util/snapshot';
import compareSnapshots from './compare-snapshots';
import sendEmailsForChangedResults from './send-emails-for-changed-results';
import updateSnapshots from './update-snapshots';


async function main(): Promise<void> {
  Logger.log("Process starting up!");

  // Parse command-line arguments
  const frequencyFilter: string | undefined = argv._[0];

  // Read from Config file
  const config: Config = await loadConfig(frequencyFilter);

  const numSitesTotal = config.sites.length;

  // Check there are sites to process
  if (numSitesTotal === 0) {
    Logger.log("No sites to process. Exiting");
    return;
  }

  // Connect to browser instance
  const browser: Browser = await Puppeteer.connect({ browserWSEndpoint: `ws://${process.env['BROWSER_HOST']}:3000` });
  // "Browser tab"
  let page: Page;


  try {
    page = await browser.newPage();

    // Ensure snapshot directory exists
    if (!existsSync(SNAPSHOT_FOLDER)) {
      Logger.log(`Creating snapshot folder as it does not exist: ${SNAPSHOT_FOLDER}`);
      await fs.mkdir(SNAPSHOT_FOLDER);
    }

    Logger.log(`Fetching "new" snapshots for ${numSitesTotal} sites...`);

    // Fetch formatted HTML for each site
    for (let i = 0; i < numSitesTotal; i++) {
      const site: SiteConfig = config.sites[i];

      const html = await getPageHtml(site.url, site.selector);
      const htmlFormatted = toDiffableHtml(html);

      // Write new snapshot to disk
      await fs.writeFile(newSnapshotFilePath(site.url), htmlFormatted);

      Logger.log(`[${i + 1} of ${numSitesTotal}] Wrote "new" snapshot for site '${site.url}'`);
    }

    Logger.log(`Finished fetching snapshots.`);

    // Compare all sites snapshots
    const results = await compareSnapshots(config.sites);

    // Send emails based on snapshot results
    await sendEmailsForChangedResults(results);

  } finally {
    await browser.close();

    // Clean up snapshots on-disk
    await updateSnapshots(config.sites);
  }

  Logger.log("Finished processing.");

  /**
   * Get the HTML for a part of a page, using connected puppeteer instance
   *
   * @param url URL to visit
   * @param selector CSS/jQuery selector to filter page
   */
  async function getPageHtml(url: string, selector: string) {
    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    return page.evaluate((selector: string) => {
      /* eslint-env browser */
      const element = document.querySelector(selector);
      if (element) {
        return element.outerHTML;
      } else {
        throw new Error(`No element found for selector: ${selector}`);
      }
      /* eslint-env node */
    }, selector);
  }
}

main();
