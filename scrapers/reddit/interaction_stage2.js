/**
 * Reddit Scraper — Interaction Code (Stage 2)
 *
 * Input: { url: string, permalink: string, company: string, role: string, subreddit: string }
 *
 * `url` is the `.json` endpoint for the thread, which returns the post
 * body and all top-level comments as structured JSON — no HTML parsing needed.
 */

await navigate(input.url);

const data = await parse();

collect({
  source: `reddit-${input.subreddit}`,
  url: input.permalink,
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
