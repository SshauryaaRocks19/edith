/**
 * TeamBlind Scraper — Interaction Code
 *
 * Stage 1: Search results page
 *   Input: { query: string }  e.g. "Stripe senior SWE interview experience"
 */

const query = (typeof input !== 'undefined' && input.query) ? input.query : "Software Engineer Interview";
const SEARCH_URL = `https://www.teamblind.com/search/${encodeURIComponent(query)}`;
await navigate(SEARCH_URL);

// Wait for body to ensure basic DOM is ready
await wait("body");

const data = await parse();

// Pass each thread to Stage 2
if (data.threads && data.threads.length > 0) {
  for (const thread of data.threads) {
    await next_stage({
      url: thread.url,
      company: input.company || "Unknown",
      role: input.role || "Software Engineer",
    });
  }
} else {
  console.log("No threads found for query: " + input.query);
}
