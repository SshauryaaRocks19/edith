// Reddit Scraper — Interaction Code (Stage 1)

const query = (typeof input !== 'undefined' && input.query) ? input.query : "Software Engineer Interview";
const SEARCH_URL = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&sort=relevance`;

await navigate(SEARCH_URL);

// Wait for body to ensure basic DOM is ready
await wait("body");

const data = await parse();

if (data.threads && data.threads.length > 0) {
  for (const thread of data.threads) {
    await next_stage({
      url: thread.url,
      company: input.company || "Unknown",
      role: input.role || "Software Engineer",
    });
  }
}
