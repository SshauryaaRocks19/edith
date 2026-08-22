/**
 * LeetCode Discuss — Parser Code (Stage 2)
 *
 * LeetCode uses obfuscated, hashed class names that change on every deploy.
 * The selectors below use partial-match attribute selectors ([class*='...'])
 * to be as resilient as possible to class name changes.
 *
 * Self-Healing Layer 2:
 *   If critical fields are empty, _needs_healing is flagged true and
 *   raw HTML is surfaced for the Gemini fallback.
 */

const title =
  $("h4[class*='title'], h1[class*='title'], [class*='discuss-title']").first().text().trim() || null;

const body =
  $("[class*='discuss-markdown-container'], [class*='post__content']").first().text().trim() || null;

const date_posted =
  $("[class*='post-time'], time[datetime]").first().attr("datetime") ||
  $("[class*='post-time']").first().text().trim() ||
  null;

const comments = [];
$("[class*='comment-item'] [class*='comment-content'], [class*='reply-item'] p").each((_, el) => {
  const text = $(el).text().trim();
  if (text) comments.push(text);
});

const _needs_healing = !title || !body;
const _raw_html = _needs_healing ? $("[class*='discuss-detail'], main, body").first().html() : null;

return {
  title,
  body,
  date_posted,
  comments: comments.slice(0, 20),
  _needs_healing,
  _raw_html,
};
