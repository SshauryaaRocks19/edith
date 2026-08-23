/**
 * TeamBlind Scraper — Interaction Code (Stage 2)
 *
 * Navigates to an individual thread page and parses it.
 */

// Fallback URL so Bright Data's preview tester doesn't crash if it runs Stage 2 in isolation
const targetUrl = input.url || "https://www.teamblind.com/post/example-post";
await navigate(targetUrl);

// Wait for body to ensure basic DOM is ready
await wait("body");

// Try to expand comments if possible, but don't fail if not
try {
  // Use a broad selector for buttons containing "more" or "comments"
  await click('button:contains("more"), button:contains("More"), [class*="showMore"]');
} catch (e) {
  // Ignore
}

const data = await parse();

collect({
  source: "teamblind",
  url: targetUrl,
  company: input.company || "Unknown",
  role: input.role || "Software Engineer",
  date_posted: data.date_posted || new Date().toISOString(),
  title: data.title || "",
  body: data.body || "",
  comments: data.comments || [],
  _needs_healing: data._needs_healing,
  _raw_html: data._raw_html,
  signals: {
    topics: [],
    difficulty: "unknown",
    recency: "recent",
  },
});
