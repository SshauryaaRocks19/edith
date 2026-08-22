/**
 * TeamBlind Scraper — Interaction Code
 *
 * Stage 1: Search results page
 *   Input: { query: string }  e.g. "Stripe senior SWE interview experience"
 *
 * Stage 2: Individual thread page
 *   Input: { url: string, company: string, role: string }
 */

// ─── Stage 1: Search & collect thread URLs ────────────────────────────────────

const SEARCH_URL = `https://www.teamblind.com/search/${encodeURIComponent(input.query)}`;

await navigate(SEARCH_URL);
await wait(".postItem");

// Scroll to load all lazy-rendered posts
await scroll_to_end();

const data = await parse();

// Pass each thread to Stage 2
for (const thread of data.threads) {
  await next_stage({
    url: thread.url,
    company: input.company,
    role: input.role,
  });
}
