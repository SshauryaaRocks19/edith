/**
 * GitHub Markdown Repos Scraper — Parser Code (Stage 1)
 */

const repos = [];
const seen = new Set();

$("a[href]").each((_, el) => {
  const href = $(el).attr("href") || "";

  // Look for standard github repo paths: /username/repo
  if (/^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(href)) {
    const fullName = href.replace(/^\//, "");
    
    // Ignore standard github pages like /login, /about, etc
    if (["login", "about", "pricing", "contact", "explore", "trending"].includes(fullName.split('/')[0])) return;

    const repoUrl = `https://github.com${href}`;
    const rawUrl = `https://raw.githubusercontent.com/${fullName}/main/README.md`;

    if (!seen.has(repoUrl)) {
      seen.add(repoUrl);
      repos.push({ url: repoUrl, raw_url: rawUrl });
    }
  }
});

return { repos: repos.slice(0, 10) };
