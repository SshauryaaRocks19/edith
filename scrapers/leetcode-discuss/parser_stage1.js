/**
 * LeetCode Discuss — Parser Code (Stage 1)
 * Extracts thread links from Google search results.
 */

const threads = [];
const seenUrls = new Set();

$('a[href*="/discuss/"]').each((_, el) => {
  let url = $(el).attr("href");
  if (url && url.length > 20) { // filter out basic UI links
    if (!url.startsWith("http")) {
      url = `https://leetcode.com${url}`;
    }
    
    // Clean tracking params
    url = url.split("?")[0].split("#")[0];

    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      threads.push({ url });
    }
  }
});

return { threads };
