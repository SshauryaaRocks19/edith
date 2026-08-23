/**
 * LeetCode Discuss — Interaction Code (Stage 1)
 *
 * Stage 1: Search results page (Google Site Search)
 * Input: { query: string }
 */

const query = (typeof input !== 'undefined' && input.query) ? input.query : "Software Engineer Interview";
const SEARCH_URL = `https://leetcode.com/discuss/interview-experience?currentPage=1&orderBy=hot&query=${encodeURIComponent(query)}`;

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
