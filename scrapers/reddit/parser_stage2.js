// Reddit Scraper — Parser Code (Stage 2)

const title = $("h1").first().text().trim() || null;
const body = $("div[data-test-id='post-content'], div[id^='t3_']").first().text().trim() || null;
const date_posted = $("time").first().attr("datetime") || null;
const comments = [];

$("div[id^='t1_']").slice(0, 10).each((_, el) => {
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
  _raw_html
};
