/**
 * Reddit Scraper — Interaction Code (Stage 1)
 *
 * Input: {
 *   subreddit: string,   e.g. "cscareerquestions"
 *   query: string,       e.g. "Stripe senior SWE interview experience"
 *   company: string,
 *   role: string
 * }
 *
 * Reddit exposes a public JSON search API — no browser rendering needed.
 * We navigate to the JSON endpoint directly, which is faster and more reliable
 * than scraping the rendered HTML.
 */

const SEARCH_URL =
  `https://www.reddit.com/r/${input.subreddit}/search.json` +
  `?q=${encodeURIComponent(input.query)}&restrict_sr=1&sort=new&limit=25`;

await navigate(SEARCH_URL);

// Reddit's JSON API renders as plain text in the browser — parse immediately
const data = await parse();

for (const thread of data.threads) {
  await next_stage({
    url: thread.url,
    permalink: thread.permalink,
    company: input.company,
    role: input.role,
    subreddit: input.subreddit,
  });
}
