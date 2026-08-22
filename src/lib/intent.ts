import { getGemini, INTENT_MODEL } from "./gemini";
import { SOURCES } from "./sources";
import { IntentManifest } from "./types";

const SOURCE_CATALOGUE = SOURCES.map(
  (s) => `- id: "${s.id}" | name: "${s.name}" | domain: "${s.domain}"`
).join("\n");

const SYSTEM_PROMPT = `You are the Intent Layer of an intelligent technical interview preparation platform called Edith.

Your job is to analyze a user's plain-English interview preparation request and produce a structured JSON manifest. This manifest has two responsibilities:

1. Extract structured parameters from the request (company, role, topics, etc.)
2. Reason over a provided list of available data sources and produce a ranked priority list of which sources are most likely to contain relevant interview experiences for this specific request.

## Source Ranking Rules
- Rank sources that are most likely to have high-signal, recent, verified interview experiences for the given company + role FIRST.
- Skip and exclude sources that are clearly irrelevant (e.g., security forums for a backend SWE role, entry-level subreddits for a senior role).
- The ranked_sources array should only contain sources you believe are worth scraping. Omit the rest entirely.
- Provide a brief, one-sentence reasoning for each included source.
- signal_threshold is the number of high-quality scraped records after which lower-ranked sources should be skipped. Set this based on how niche or broad the request is (e.g., 10 for a common company, 5 for a niche one).

## Output Format
Respond with ONLY valid JSON. No markdown, no explanation, no code fences.

{
  "company": "string",
  "role": "string",
  "role_level": "string (e.g. Senior, Staff, L5, E5, Junior)",
  "topics": ["string"],
  "recency_bias": "string (e.g. last 3 months, last 6 months, last year)",
  "search_query": "string (the optimized search query to use across sources)",
  "ranked_sources": [
    {
      "source_id": "string (must match an id from the provided source list)",
      "rank": 1,
      "reasoning": "string"
    }
  ],
  "signal_threshold": number
}`;

export async function resolveIntent(userRequest: string): Promise<IntentManifest> {
  const userPrompt = `Available sources:\n${SOURCE_CATALOGUE}\n\nUser request:\n"${userRequest}"`;

  const response = await getGemini().models.generateContent({
    model: INTENT_MODEL,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0,
      responseMimeType: "application/json",
    },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  });

  const raw = response.text?.trim() || "";
  
  let parsed: unknown;
  try {
    const cleanRaw = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    parsed = JSON.parse(cleanRaw);
  } catch {
    throw new Error("Failed to parse Gemini response as JSON");
  }

  let manifest: IntentManifest;

  try {
    manifest = parsed as IntentManifest;
  } catch {
    throw new Error(`Intent Layer returned invalid JSON: ${raw.slice(0, 200)}`);
  }

  if (
    !manifest.company ||
    !manifest.role ||
    !Array.isArray(manifest.topics) ||
    !Array.isArray(manifest.ranked_sources) ||
    manifest.ranked_sources.length === 0
  ) {
    throw new Error("Intent Layer returned an incomplete manifest");
  }

  const validSourceIds = new Set(SOURCES.map((s) => s.id));
  manifest.ranked_sources = manifest.ranked_sources
    .filter((s) => validSourceIds.has(s.source_id as never))
    .sort((a, b) => a.rank - b.rank);

  return manifest;
}
