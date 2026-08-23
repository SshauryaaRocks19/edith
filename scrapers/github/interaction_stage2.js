/**
 * GitHub Markdown Repos Scraper — Interaction Code (Stage 2)
 */

const targetUrl = input.raw_url || "https://raw.githubusercontent.com/facebook/react/main/README.md";
await navigate(targetUrl);

// Wait for body to ensure basic DOM is ready
await wait("body");

const data = await parse();

collect({
  source: "github",
  url: input.url || targetUrl,
  company: input.company || "Unknown",
  role: input.role || "Software Engineer",
  date_posted: data.date_posted || new Date().toISOString(),
  title: data.title || "",
  body: data.body || "",
  comments: [],
  _needs_healing: data._needs_healing,
  _raw_html: data._raw_html,
  signals: {
    topics: data.topics || [],
    difficulty: "unknown",
    recency: "recent",
  },
});
