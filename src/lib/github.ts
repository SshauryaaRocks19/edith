import { ScrapedSignal } from "./types";

export async function fetchGithubInterviewData(company: string, topics: string[]): Promise<ScrapedSignal[]> {
  try {
    // 1. Search Github for repos matching the company + interview
    const query = encodeURIComponent(`${company} interview questions in:name,readme`);
    const searchRes = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=3`, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Edith-Interview-Prep-Bot"
      }
    });

    if (!searchRes.ok) {
      console.error("Github Search API failed:", await searchRes.text());
      return [];
    }

    const searchData = await searchRes.json();
    const repos = searchData.items || [];
    
    if (repos.length === 0) return [];

    const signals: ScrapedSignal[] = [];

    // 2. For the top repos, fetch their raw README
    for (const repo of repos) {
      const defaultBranch = repo.default_branch || "main";
      const rawUrl = `https://raw.githubusercontent.com/${repo.full_name}/${defaultBranch}/README.md`;
      
      const readmeRes = await fetch(rawUrl);
      if (!readmeRes.ok) continue;

      const readmeContent = await readmeRes.text();
      
      // Basic heuristic to skip empty or generic readmes
      if (readmeContent.length < 200) continue;

      signals.push({
        source: "github",
        url: repo.html_url,
        company: company,
        role: "Software Engineer", // Generic default
        date_posted: repo.updated_at,
        title: repo.name,
        body: readmeContent.slice(0, 15000), // Cap at 15k chars to fit in LLM context
        comments: [],
        signals: {
          topics: topics,
          difficulty: "unknown",
          recency: "recent"
        }
      });
    }

    return signals;
  } catch (error) {
    console.error("Failed to fetch from Github:", error);
    return [];
  }
}
