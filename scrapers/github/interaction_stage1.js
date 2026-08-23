/**
 * GitHub Markdown Repos Scraper — Interaction Code (Stage 1)
 */

const query = (typeof input !== 'undefined' && input.query) ? input.query : "Software Engineer Interview";
const encodedQuery = encodeURIComponent(query + " interview");
const SEARCH_URL = `https://github.com/search?q=${encodedQuery}+in%3Aname+in%3Areadme&type=repositories&s=stars&o=desc`;

await navigate(SEARCH_URL);

// Wait for body to ensure basic DOM is ready
await wait("body");

const data = await parse();

if (data.repos && data.repos.length > 0) {
  for (const repo of data.repos) {
    await next_stage({
      url: repo.url,
      raw_url: repo.raw_url,
      company: input.company || "Unknown",
      role: input.role || "Software Engineer",
    });
  }
}
