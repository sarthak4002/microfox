/**
 * Common selectors for finding navigation/sidebar elements
 */
export const URL_SELECTORS = {
  sidebar: [
    'nav[role="navigation"]',
    'aside',
    '.sidebar',
    '.navigation',
    '.menu',
    '.docs-sidebar',
    '#sidebar',
    '.sidebar-nav',
    '.nav-sidebar',
    '[class*="sub svelte-v0fzog"]', // Brave
  ],
  // Do not add multiple selectors for the same content/sub-content (it will duplicate content)
  content: [
    '.content-docs', // Brave
    '[class*="section overview"]', // Reddit
    '[class*="section methods"]', // Reddit
  ],
};

/**
 * The query used to generate SDK
 */
export const SDK_QUERY =
  'I need a reddit sdk package with name "reddit". Auth is oauth2 with @microfox/reddit-oauth';

/**
 * URLs for API documentation
 */
export const API_DOCUMENTATION_URLS = ['https://www.reddit.com/dev/api'];

/**
 * URLs that have been scraped and processed
 */
export const SCRAPED_URLS = ['https://www.reddit.com/dev/api'];

/**
 * GitHub URLs for external packages to generate
 */
export const EXT_PACKAGE_URLS = [
  'https://github.com/slackapi/node-slack-sdk/tree/main/packages/web-api',
];
