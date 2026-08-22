/**
 * Reddit Scraper — Parser Code (Stage 1)
 *
 * Parses the Reddit JSON search response.
 * The page content is a raw JSON string rendered as text in the browser.
 */

const raw = $("pre, body").first().text().trim();

let threads = [];

try {
  const json = JSON.parse(raw);
  const posts = json?.data?.children ?? [];

  threads = posts
    .filter((p) => p.kind === "t3" && !p.data.is_video)
    .map((p) => ({
      url: `https://www.reddit.com${p.data.permalink}.json`,
      permalink: `https://www.reddit.com${p.data.permalink}`,
    }));
} catch (_) {
  // JSON parse failed — return empty so the run doesn't hard-fail
}

return { threads };
