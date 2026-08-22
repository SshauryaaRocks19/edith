/**
 * TeamBlind Scraper — Parser Code (Stage 1)
 * Runs in Cheerio context after Stage 1 interaction.
 * Extracts thread URLs from the search results page.
 */

const threads = [];

$(".postItem a.postItem-title").each((_, el) => {
  const href = $(el).attr("href");
  if (href) {
    threads.push({
      url: href.startsWith("http") ? href : `https://www.teamblind.com${href}`,
    });
  }
});

return { threads };
