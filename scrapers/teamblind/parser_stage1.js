/**
 * TeamBlind Scraper — Parser Code (Stage 1)
 *
 * Extracts thread URLs from the search results page.
 * Uses a highly robust selector: any link containing "/post/"
 */

const threads = [];
const seenUrls = new Set();

$('a[href*="/post/"]').each((i, el) => {
  let url = $(el).attr('href');
  if (url) {
    if (!url.startsWith('http')) {
      url = 'https://www.teamblind.com' + (url.startsWith('/') ? '' : '/') + url;
    }
    
    // De-duplicate URLs
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      threads.push({ url });
    }
  }
});

return { threads };
