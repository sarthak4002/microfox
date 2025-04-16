import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { JSDOM } from 'jsdom';
import { generateText, generateObject } from 'ai';
import { models } from './ai/models';
import {
  API_DOCUMENTATION_URLS,
  SCRAPED_URLS,
  URL_SELECTORS,
} from './constants';
import { z } from 'zod';
import readline from 'readline';

// Parse command line arguments
const args = process.argv.slice(2);
const skipQuestions = args.includes('--skip-questions');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promise-based question function
function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

// Custom error classes for better error handling
class ScrapingError extends Error {
  constructor(
    message: string,
    public url?: string,
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

class SidebarNotFoundError extends Error {
  constructor(url: string) {
    super(`No sidebar found on page: ${url}`);
    this.name = 'SidebarNotFoundError';
  }
}

class NoUrlsFoundError extends Error {
  constructor(url: string) {
    super(`No URLs found on page: ${url}`);
    this.name = 'NoUrlsFoundError';
  }
}

class GeminiFilteringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiFilteringError';
  }
}

class FileUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileUpdateError';
  }
}

class ContentScrapingError extends Error {
  constructor(
    message: string,
    public url?: string,
  ) {
    super(message);
    this.name = 'ContentScrapingError';
  }
}

class NoContentFoundError extends Error {
  constructor(url: string) {
    super(`No content found on page: ${url}`);
    this.name = 'NoContentFoundError';
  }
}

// Schema for URL filtering response
const URLFilterSchema = z.object({
  urls: z
    .array(z.string())
    .describe('List of URLs that are relevant for API documentation'),
});

/**
 * Extract URLs from HTML content using JSDOM
 */
function extractUrlsFromHtml(html: string, baseUrl: string): string[] {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const urls = new Set<string>();

    // Try each sidebar selector
    let sidebarsFound = 0;
    for (const selector of URL_SELECTORS.sidebar) {
      const sidebar = document.querySelector(selector);
      if (sidebar) {
        sidebarsFound++;
        // Find all links within the sidebar
        const links = sidebar.querySelectorAll('a[href]');
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href) {
            try {
              // Convert relative URLs to absolute
              if (href.startsWith('/')) {
                const absoluteUrl = new URL(href, baseUrl).href;
                // Only include URLs from the same domain
                urls.add(absoluteUrl);
              } else if (href.startsWith('https://')) {
                urls.add(href);
              } else if (href.startsWith('#')) {
                console.log('Skipping anchor link:', href);
              }
            } catch (error) {
              console.warn(`⚠️ Invalid URL found: ${href}`);
            }
          }
        });
      }
    }

    if (sidebarsFound === 0) {
      throw new SidebarNotFoundError(baseUrl);
    }

    if (urls.size === 0) {
      throw new NoUrlsFoundError(baseUrl);
    }

    return Array.from(urls);
  } catch (error) {
    if (
      error instanceof SidebarNotFoundError ||
      error instanceof NoUrlsFoundError
    ) {
      throw error;
    }
    throw new ScrapingError(
      `Error extracting URLs from HTML: ${error instanceof Error ? error.message : String(error)}`,
      baseUrl,
    );
  }
}

/**
 * Extract content from HTML using JSDOM
 */
function extractContentFromHtml(html: string, url: string): string {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());

    // Try each content selector
    let contentFound = false;
    let contentText = '';

    for (const selector of URL_SELECTORS.content) {
      const contentElements = document.querySelectorAll(selector);
      if (contentElements.length > 0) {
        contentFound = true;
        contentElements.forEach(element => {
          // Get text content and clean it up
          const text = element.textContent || '';
          const cleanedText = text
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .replace(/\n+/g, '\n') // Replace multiple newlines with a single newline
            .replace(/"/g, '\\"') // Escape double quotes
            .replace(/\\/g, '\\\\') // Escape backslashes
            .trim(); // Remove leading and trailing whitespace

          if (cleanedText) {
            contentText += cleanedText + '\n\n';
          }
        });
      }
    }

    if (!contentFound) {
      throw new NoContentFoundError(url);
    }

    if (!contentText.trim()) {
      throw new NoContentFoundError(url);
    }

    return contentText.trim();
  } catch (error) {
    if (error instanceof NoContentFoundError) {
      throw error;
    }
    throw new ContentScrapingError(
      `Error extracting content from HTML: ${error instanceof Error ? error.message : String(error)}`,
      url,
    );
  }
}

/**
 * Filter URLs using Gemini to keep only relevant ones
 */
async function filterUrlsWithGemini(
  urls: string[],
  baseUrl: string,
): Promise<string[]> {
  if (urls.length === 0) {
    throw new GeminiFilteringError('No URLs provided for filtering');
  }

  console.log('🤖 Filtering URLs with Gemini...');

  try {
    const { object, usage } = await generateObject({
      model: models.googleGeminiPro,
      schema: URLFilterSchema,
      prompt: `Given these URLs from ${baseUrl}, return only the ones that are relevant for API documentation. 
      
      INCLUDE URLs that contain:
      - API endpoints and methods
      - Request/response formats and examples
      - Authentication details and authorization
      - Parameters, options, and configuration
      - API reference documentation
      - Integration guides
      
      EXCLUDE URLs that contain:
      - Changelogs, release notes, or version history
      - Pricing information, plans, or billing
      - Blog posts, news, or announcements
      - Support pages, help centers, or FAQs
      - Account management or user settings
      - Marketing pages or promotional content
      - Legal terms, privacy policies, or terms of service
      - Community forums or discussion boards
      
      URLs to analyze:
      ${urls.join('\n')}
      
      Return only the URLs that are most relevant for understanding and implementing the API.`,
      temperature: 0.2,
    });

    console.log('usage', usage);

    if (!object.urls || object.urls.length === 0) {
      throw new GeminiFilteringError('Gemini returned no URLs after filtering');
    }

    return object.urls;
  } catch (error) {
    if (error instanceof GeminiFilteringError) {
      throw error;
    }
    throw new GeminiFilteringError(
      `Error filtering URLs with Gemini: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Scrape content from URLs and extract relevant documentation URLs
 */
async function scrapeUrls(urls: string[]): Promise<string[]> {
  if (urls.length === 0) {
    throw new ScrapingError('No URLs provided for scraping');
  }

  const processedUrls = new Set<string>();
  const urlsToProcess = [...urls];
  const allFoundUrls = new Set<string>();
  const errors: Error[] = [];

  while (urlsToProcess.length > 0) {
    const url = urlsToProcess.shift()!;

    // Skip if already processed
    if (processedUrls.has(url)) {
      continue;
    }

    try {
      console.log(`🔍 Scraping ${url}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          Country: 'US',
        },
      });

      if (!response.ok) {
        throw new ScrapingError(`HTTP error! status: ${response.status}`, url);
      }

      const html = await response.text();

      // Extract URLs from sidebar
      const sidebarUrls = extractUrlsFromHtml(html, url);
      console.log(`📑 Found ${sidebarUrls.length} URLs in sidebar`);

      // Add new URLs to process queue
      for (const sidebarUrl of sidebarUrls) {
        if (
          !processedUrls.has(sidebarUrl) &&
          !urlsToProcess.includes(sidebarUrl)
        ) {
          urlsToProcess.push(sidebarUrl);
        }
        allFoundUrls.add(sidebarUrl);
      }

      processedUrls.add(url);
    } catch (error) {
      console.warn(`⚠️ Error scraping ${url}:`, error);
      errors.push(error instanceof Error ? error : new Error(String(error)));
      processedUrls.add(url);
    }
  }

  console.log('allFoundUrls', allFoundUrls);

  if (allFoundUrls.size === 0) {
    throw new ScrapingError('No URLs found during scraping process');
  }

  let filteredUrls = Array.from(allFoundUrls).filter(
    (url, index, self) => self.indexOf(url) === index,
  );

  // Filter URLs using Gemini
  // const baseUrl = new URL(urls[0]).origin;
  // filteredUrls = await filterUrlsWithGemini(filteredUrls, baseUrl);

  // if (filteredUrls.length === 0) {
  //   throw new ScrapingError('No relevant URLs found after filtering');
  // }

  // Log any errors that occurred during scraping
  if (errors.length > 0) {
    console.warn(`⚠️ ${errors.length} errors occurred during scraping:`);
    errors.forEach((error, index) => {
      console.warn(`  ${index + 1}. ${error.message}`);
    });
  }

  return filteredUrls;
}

/**
 * Scrape content from a list of URLs and save it to a JSON file
 */
async function scrapeContentFromUrls(urls: string[]): Promise<void> {
  if (urls.length === 0) {
    throw new ContentScrapingError('No URLs provided for content scraping');
  }

  console.log(`🔍 Scraping content from ${urls.length} URLs...`);

  const scrapedContent: { url: string; content: string }[] = [];
  const errors: Error[] = [];

  for (const url of urls) {
    try {
      console.log(`📄 Scraping content from ${url}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          Country: 'US',
        },
      });

      if (!response.ok) {
        throw new ContentScrapingError(
          `HTTP error! status: ${response.status}`,
          url,
        );
      }

      const html = await response.text();
      const content = extractContentFromHtml(html, url);

      scrapedContent.push({ url, content });
      console.log(`✅ Successfully scraped content from ${url}`);
    } catch (error) {
      console.warn(`⚠️ Error scraping content from ${url}:`, error);
      errors.push(error instanceof Error ? error : new Error(String(error)));
    }
  }

  if (scrapedContent.length === 0) {
    throw new ContentScrapingError('No content was scraped from any URL');
  }

  // Save scraped content to JSON file
  const outputPath = path.join(__dirname, 'scraped-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(scrapedContent, null, 2));
  console.log(`✅ Saved scraped content to ${outputPath}`);

  // Log any errors that occurred during content scraping
  if (errors.length > 0) {
    console.warn(
      `⚠️ ${errors.length} errors occurred during content scraping:`,
    );
    errors.forEach((error, index) => {
      console.warn(`  ${index + 1}. ${error.message}`);
    });
  }
}

/**
 * Update the SCRAPED_URLS constant in constants.ts
 */
async function updateScrapedUrls(newUrls: string[]): Promise<void> {
  if (newUrls.length === 0) {
    throw new FileUpdateError('No URLs to update in constants.ts');
  }

  try {
    const constantsPath = path.join(__dirname, 'constants.ts');

    if (!fs.existsSync(constantsPath)) {
      throw new FileUpdateError(`Constants file not found: ${constantsPath}`);
    }

    let content = fs.readFileSync(constantsPath, 'utf8');

    // Create the new SCRAPED_URLS array content
    const urlsContent = newUrls.map(url => `  '${url}'`).join(',\n');

    // Replace the existing SCRAPED_URLS array
    const newContent = content.replace(
      /export const SCRAPED_URLS = \[[\s\S]*?\];/,
      `export const SCRAPED_URLS = [\n${urlsContent},\n];`,
    );

    // if (content === newContent) {
    //   throw new FileUpdateError('No changes were made to the constants.ts file');
    // }

    fs.writeFileSync(constantsPath, newContent);
    console.log('✅ Updated SCRAPED_URLS in constants.ts');
  } catch (error) {
    if (error instanceof FileUpdateError) {
      throw error;
    }
    throw new FileUpdateError(
      `Error updating constants.ts: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Main function to run the URL scraping process
 */
async function main() {
  try {
    console.log('🚀 Starting URL scraping process...');
    console.log(`📝 Initial URLs: ${API_DOCUMENTATION_URLS.length}`);

    if (API_DOCUMENTATION_URLS.length === 0) {
      throw new Error('No URLs provided in API_DOCUMENTATION_URLS');
    }

    const scrapedUrls = await scrapeUrls(API_DOCUMENTATION_URLS);
    console.log(`✨ Found ${scrapedUrls.length} relevant URLs`);

    await updateScrapedUrls(scrapedUrls);
    console.log('✅ URL scraping process completed successfully');

    // Default behavior: always scrape content
    let shouldScrapeContent = 'y';
    let shouldUpdateContent = 'n';
    let urlsToScrape = scrapedUrls;

    // Only ask questions if not skipping
    if (!skipQuestions) {
      shouldScrapeContent = await question(
        'Do you want to scrape content from these URLs? (y/n) [default: y]: ',
      );

      if (
        shouldScrapeContent.toLowerCase() === 'y' ||
        shouldScrapeContent === ''
      ) {
        shouldUpdateContent = await question(
          'Do you want to edit the URLs in constants.ts before scraping? (y/n) [default: n]: ',
        );

        if (shouldUpdateContent.toLowerCase() === 'y') {
          console.log(
            '\n📝 Please edit the SCRAPED_URLS array in constants.ts file.',
          );
          console.log('After editing, press Enter to continue...');
          await question('');

          // Clear require cache to force re-import of constants
          Object.keys(require.cache).forEach(key => {
            if (key.includes('constants.ts')) {
              delete require.cache[key];
            }
          });

          // Re-import the constants to get updated URLs
          const updatedConstants = require('./constants');
          urlsToScrape = updatedConstants.SCRAPED_URLS;
          console.log('urlsToScrape length after editing', urlsToScrape.length);

          if (urlsToScrape.length === 0) {
            console.warn(
              '⚠️ No URLs found in constants.ts after editing. Using previously scraped URLs.',
            );
            urlsToScrape = scrapedUrls;
          } else {
            console.log(
              `📝 Will scrape ${urlsToScrape.length} URLs from constants.ts`,
            );
          }
        }
      }
    }

    // Scrape content if user wants to or if skipping questions
    if (
      shouldScrapeContent.toLowerCase() === 'y' ||
      shouldScrapeContent === '' ||
      skipQuestions
    ) {
      await scrapeContentFromUrls(urlsToScrape);
      console.log('✅ Content scraping process completed successfully');
    }

    rl.close();
  } catch (error) {
    console.error('❌ Error during URL scraping:', error);

    // Provide more specific error messages based on error type
    if (error instanceof SidebarNotFoundError) {
      console.error(
        '❌ No sidebar found on the page. The page structure might have changed.',
      );
    } else if (error instanceof NoUrlsFoundError) {
      console.error(
        '❌ No URLs found on the page. The page might be empty or have a different structure.',
      );
    } else if (error instanceof GeminiFilteringError) {
      console.error(
        '❌ Error filtering URLs with Gemini. The AI model might be unavailable or returned unexpected results.',
      );
    } else if (error instanceof FileUpdateError) {
      console.error(
        '❌ Error updating the constants.ts file. The file might be read-only or have a different structure.',
      );
    } else if (error instanceof ScrapingError) {
      console.error(`❌ Error scraping URLs: ${error.message}`);
      if (error.url) {
        console.error(`   Problematic URL: ${error.url}`);
      }
    } else if (error instanceof ContentScrapingError) {
      console.error(`❌ Error scraping content: ${error.message}`);
      if (error.url) {
        console.error(`   Problematic URL: ${error.url}`);
      }
    } else if (error instanceof NoContentFoundError) {
      console.error(`❌ No content found on the page: ${error.message}`);
    }

    rl.close();
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}
