// Reddit Scraper — Parser Code (Stage 1)

const threads = [];
const seenUrls = new Set();

$('a[href*="/comments/"]').each((i, el) => {
  let url = $(el).attr('href');
  if (url) {
    if (!url.startsWith('http')) {
      url = 'https://www.reddit.com' + (url.startsWith('/') ? '' : '/') + url;
    }
    
    // De-duplicate URLs
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      threads.push({ url });
    }
  }
});

return { threads };
