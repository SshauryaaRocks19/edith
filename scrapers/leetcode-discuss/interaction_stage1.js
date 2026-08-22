/**
 * LeetCode Discuss — Interaction Code (Stage 1)
 *
 * Input: { query: string, company: string, role: string }
 * Searches the interview-experience tag filtered by company name.
 */

const SEARCH_URL = `https://leetcode.com/discuss/interview-experience/?search=${encodeURIComponent(input.query)}&orderBy=newest_to_oldest`;

await navigate(SEARCH_URL);
await wait("[class*='topic-item'], [class*='discuss-topic']");

// Scroll to load more results
await scroll_to_end();
await wait(1000);

const data = await parse();

for (const thread of data.threads) {
  await next_stage({
    url: thread.url,
    company: input.company,
    role: input.role,
  });
}
