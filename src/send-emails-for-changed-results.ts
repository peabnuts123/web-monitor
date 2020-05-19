import path from 'path';
import aws from 'aws-sdk';
import nodemailer from 'nodemailer';
import Email from 'email-templates';
import * as Diff2html from 'diff2html';
import { Result, ChangedResult } from './util/result';

import ENV from './env';
import Logger from './util/Logger';

interface TemplateData {
  diffHTML: string;
  siteNameText: string;
}

/**
 * Whether to preview the email or actually send it.
 * Useful for debugging email contents without spamming.
 */
const PREVIEW_EMAIL = false;
/**
 * Time between email processing - to avoid looking too dodgy
 */
const EMAIL_SENDING_INTERVAL_MS = 5000;

/**
 * Given the results of the snapshot comparisons, send out emails containing
 * a diff summary to those which have changed.
 *
 * @param allResults Results of comparing snapshots for all sites
 */
export default async function sendEmailsForChangedResults(allResults: Result[]): Promise<void> {
  // Filter for only results that are changed
  const changedResults: ChangedResult[] = allResults.filter((result) => result.different) as ChangedResult[];

  // Log status update
  if (changedResults.length > 0) {
    Logger.log(`Sending ${changedResults.length} change notice emails to email: ${ENV.Email.TO_ADDRESS}`);
    Logger.log("Changed sites: ", changedResults.map((result) => result.site.url));

    if (PREVIEW_EMAIL) {
      Logger.logWarning(`NOTE: Preview mode is enabled - no emails will be sent!`);
    }
  } else {
    Logger.log("No emails to send as no snapshots have changed.");
    return;
  }

  // Send an email per changed result, with a sleep in-between
  for (let i = 0; i < changedResults.length; i++) {
    const result = changedResults[i];

    // Construct an email to be sent
    const email = new Email<TemplateData>({
      // Message details
      message: {
        from: ENV.Email.FROM_ADDRESS,
        subject: `${ENV.Email.SUBJECT_PREFIX} ${result.site.url}`,
      },
      // Whether to actually send - mutually exclusive with 'preview'
      send: !PREVIEW_EMAIL,
      // Open browser to preview email
      preview: PREVIEW_EMAIL,
      // Connection to AWS SES
      transport: nodemailer.createTransport({
        SES: new aws.SES({
          // Explicitly define keys (don't rely on Environment variables)
          accessKeyId: ENV.AWS.ACCESS_KEY_ID,
          secretAccessKey: ENV.AWS.SECRET_ACCESS_KEY,
          region: ENV.AWS.REGION,

          // Can't find a list of available versions - I think this is the only one
          apiVersion: '2010-12-01',
        })
      }),
      // Template resolution
      views: {
        options: {
          extension: 'hbs',
        },
        root: path.resolve(__dirname, 'email-templates'),
      }
    });

    try {
      // Send the email
      await email
        .send({
          template: 'site-changed',
          message: {
            to: ENV.Email.TO_ADDRESS,
          },
          // Data to be sent to the template
          locals: {
            // Name of the site being monitored
            siteNameText: result.site.url,
            // HTML diff report
            diffHTML: Diff2html.html(Diff2html.parse(result.diff), {
              drawFileList: false,
            }),
          },
        });

      Logger.log(`[${i + 1} of ${changedResults.length}] Successfully sent change notice email for site '${result.site.url}'`);
    } catch (e) {
      // Sending email failed. We could try again but for now
      //  let's just log an error to the console
      Logger.logError(`[${i + 1} of ${changedResults.length}] Failed to send email for site '${result.site.url}'.`, e);
    }

    // Wait before processing another email
    await sleep(EMAIL_SENDING_INTERVAL_MS);
  }

  Logger.log(`Finished sending ${changedResults.length} ${changedResults.length === 1 ? 'email' : 'emails'}.`);
}

/**
 * Sleep, do nothing, wait.
 * @param ms Time to sleep, in milliseconds
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
