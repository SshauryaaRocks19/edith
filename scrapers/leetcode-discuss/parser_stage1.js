/**
 * LeetCode Discuss — Parser Code (Stage 1)
 * Extracts thread links from the search results listing.
 */

const threads = [];

$("[class*='topic-item'] a, [class*='discuss-topic'] a").each((_, el) => {
  const href = $(el).attr("href");
  if (href && href.includes("/discuss/")) {
    const fullUrl = href.startsWith("http") ? href : `https://leetcode.com${href}`;
    if (!threads.some((t) => t.url === fullUrl)) {
      threads.push({ url: fullUrl });
    }
  }
});

return { threads };
