/**
 * LeetCode Discuss — Parser Code (Stage 2)
 *
 * ALWAYS captures raw HTML to guarantee our webhook's Gemini agent
 * can self-heal the data if the DOM changes.
 */

const title = $("h1, h4").first().text().trim() || null;
const body = $("[class*='discuss-markdown-container'], [class*='post__content']").first().text().trim() || null;
const date_posted = $("[class*='post-time'], time").first().text().trim() || null;

const comments = [];
$("[class*='comment-item'], [class*='reply-item'] p").slice(0, 10).each((_, el) => {
  comments.push($(el).text().trim());
});

const _needs_healing = true;
const _raw_html = $("body").html();

return {
  title,
  body,
  date_posted,
  comments,
  _needs_healing,
  _raw_html,
};
