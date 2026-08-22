/**
 * TeamBlind Scraper — Interaction Code (Stage 2)
 *
 * Input: { url: string, company: string, role: string }
 * Navigates to an individual thread page and parses the full post + comments.
 */

await navigate(input.url);
await wait(".postContent");

// Expand all truncated comments if a "show more" button exists
try {
  await click(".showMoreComments");
  await wait(500);
} catch (_) {
  // No expand button — continue
}

const data = await parse();

collect({
  source: "teamblind",
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
