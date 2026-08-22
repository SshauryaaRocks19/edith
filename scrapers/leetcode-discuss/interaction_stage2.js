/**
 * LeetCode Discuss — Interaction Code (Stage 2)
 *
 * Input: { url: string, company: string, role: string }
 * Navigates to a single discuss post and waits for the content to render.
 * LeetCode is React-rendered, so we must wait for the post body to mount.
 */

await navigate(input.url);

// LeetCode renders asynchronously — wait for the post content element
await wait("[class*='discuss-markdown-container'], [class*='post__content']");

// Wait for top-level comments to load
try {
  await wait("[class*='comment-item'], [class*='reply-item']", { timeout: 4000 });
} catch (_) {
  // No comments — continue
}

const data = await parse();

collect({
  source: "leetcode-discuss",
  url: input.url,
  company: input.company,
  role: input.role,
  date_posted: data.date_posted,
  title: data.title,
  body: data.body,
  comments: data.comments,
  signals: {
    topics: [],
    difficulty: "unknown",
    recency: "recent",
  },
});
