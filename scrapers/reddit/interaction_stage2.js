// Reddit Scraper — Interaction Code (Stage 2)

// Fallback URL so Bright Data's preview tester doesn't crash if it runs Stage 2 in isolation
const targetUrl = input.url || "https://www.reddit.com/r/cscareerquestions/comments/example";
await navigate(targetUrl);

// Wait for body to ensure basic DOM is ready
await wait("body");

const data = await parse();

collect({
  source: "reddit",
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
