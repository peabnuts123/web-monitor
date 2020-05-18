/**
 * Simple typedef.
 * For: https://github.com/rayrutjes/diffable-html
 */
declare module "diffable-html" {
  /**
   * Given an HTML string, format it into a format convenient for diffing
   *
   * @param htmlString HTML string to format
   */
  export default function toDiffableHtml(htmlString: string): string;
}
