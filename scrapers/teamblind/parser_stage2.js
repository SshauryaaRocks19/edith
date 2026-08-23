/**
 * TeamBlind Scraper — Parser Code (Stage 2)
 *
 * Extracts title, body, and comments.
 * ALWAYS captures raw HTML to guarantee our webhook's Gemini agent
 * can self-heal the data if the DOM changes.
 */

const title = $("h1").first().text().trim() || null;

// Broad selectors for post bodies
const body = $("main p, article p, [class*='postBody'], [class*='post-body'], [class*='content']").map((_, el) => $(el).text()).get().join(" ").trim() || null;

const date_posted = $("time").first().text().trim() || null;

const comments = [];
$("div").filter((_, el) => $(el).text().length > 50).slice(1, 10).each((_, el) => {
   comments.push($(el).text().trim());
});

// Since TeamBlind changes constantly, we'll ALWAYS send the raw HTML 
// back to our webhook so `healRecord` can use Gemini to parse it perfectly.
const _needs_healing = true;
const _raw_html = $("body").html();

return {
  title,
  body,
  date_posted,
  comments,
  _needs_healing,
  _raw_html
};
