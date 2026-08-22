/**
 * TeamBlind Scraper — Parser Code (Stage 2)
 *
 * Runs in Cheerio context on an individual thread page.
 * Extracts: title, post body, top comments, and date.
 *
 * Self-Healing Layer 2:
 *   If a selector returns null/empty, the field is flagged so the
 *   Gemini fallback in the webhook handler can attempt re-extraction
 *   from the raw HTML stored in _raw_html.
 */

const title = $("h1.postTitle, h1[class*='title']").first().text().trim() || null;

const body = $(".postContent, [class*='postBody'], [class*='post-body']").first().text().trim() || null;

const date_posted =
  $("time[datetime]").first().attr("datetime") ||
  $(".postMeta span.time, [class*='timestamp']").first().text().trim() ||
  null;

const comments = [];
$(".comment .commentBody, [class*='comment-body'], [class*='commentContent']").each((_, el) => {
  const text = $(el).text().trim();
  if (text) comments.push(text);
});

// Surface raw HTML for Gemini fallback if critical fields are missing
const _needs_healing = !title || !body;
const _raw_html = _needs_healing ? $("main, #__next, body").first().html() : null;

return {
  title,
  body,
  date_posted,
  comments: comments.slice(0, 20),
  _needs_healing,
  _raw_html,
};
