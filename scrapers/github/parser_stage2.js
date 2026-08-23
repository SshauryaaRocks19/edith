/**
 * GitHub Markdown Repos Scraper — Parser Code (Stage 2)
 */

const rawText = $("pre").first().text().trim() || $("body").text().trim();

const titleMatch = rawText.match(/^#\s+(.+)/m);
const title = titleMatch ? titleMatch[1].trim() : null;
const body = rawText.slice(0, 12000) || null;

const TOPIC_KEYWORDS = [
  "dynamic programming", "dp", "graph", "bfs", "dfs", "tree", "binary search",
  "linked list", "stack", "queue", "heap", "hash map", "sliding window",
  "two pointers", "recursion", "backtracking", "greedy", "sorting", "system design"
];

const lowerBody = (body || "").toLowerCase();
const topics = TOPIC_KEYWORDS.filter((kw) => lowerBody.includes(kw));

const _needs_healing = true;
const _raw_html = $("body").html();

return {
  title,
  body,
  date_posted: null,
  topics,
  _needs_healing,
  _raw_html,
};
