/**
 * Reddit Scraper — Parser Code (Stage 2)
 *
 * Reddit's .json endpoint returns a two-element array:
 *   [0] — the post (listing of one t3 post)
 *   [1] — the comments (listing of t1 comment objects)
 *
 * This is purely JSON — no CSS selectors needed.
 * No self-healing needed here: if JSON parsing fails, we return empty fields
 * which the webhook handler will reject cleanly via schema validation.
 */

const raw = $("pre, body").first().text().trim();

let title = null;
let body = null;
let date_posted = null;
const comments = [];

try {
  const json = JSON.parse(raw);

  const post = json?.[0]?.data?.children?.[0]?.data;
  if (post) {
    title = post.title ?? null;
    body = post.selftext ?? null;
    date_posted = post.created_utc
      ? new Date(post.created_utc * 1000).toISOString()
      : null;
  }

  const commentNodes = json?.[1]?.data?.children ?? [];
  for (const node of commentNodes) {
    if (node.kind === "t1" && node.data?.body) {
      comments.push(node.data.body);
      if (comments.length >= 20) break;
    }
  }
} catch (_) {
  // JSON parse failed — fields remain null, webhook will reject cleanly
}

return {
  title,
  body,
  date_posted,
  comments,
  _needs_healing: false,
  _raw_html: null,
};
