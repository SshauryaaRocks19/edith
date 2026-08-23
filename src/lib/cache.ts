import fs from "fs";
import path from "path";
import { ScrapedSignal } from "./types";

const CACHE_FILE = path.join(process.cwd(), "data", "scraped_records.json");

// Ensure data directory exists
if (!fs.existsSync(path.dirname(CACHE_FILE))) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
}

// Initialize cache file if it doesn't exist
if (!fs.existsSync(CACHE_FILE)) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify([], null, 2));
}

export async function saveToCache(records: ScrapedSignal[]): Promise<void> {
  const existing = await getCache();
  
  // Basic deduplication by URL
  const existingUrls = new Set(existing.map((r) => r.url));
  const newRecords = records.filter((r) => !existingUrls.has(r.url));
  
  const updated = [...existing, ...newRecords];
  fs.writeFileSync(CACHE_FILE, JSON.stringify(updated, null, 2));
}

export async function getFromCache(company: string, topics?: string[]): Promise<ScrapedSignal[]> {
  const records = await getCache();
  
  let matches = records.filter(
    (r) => r.company.toLowerCase() === company.toLowerCase()
  );
  
  // If topics are specified, do a loose matching (return those that overlap or all if none overlap heavily)
  if (topics && topics.length > 0) {
    // For now, we'll just return company matches to keep it simple and ensure we don't overfilter
    // A more advanced implementation would rank by topic matches
  }
  
  return matches;
}

async function getCache(): Promise<ScrapedSignal[]> {
  try {
    const data = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(data) as ScrapedSignal[];
  } catch (error) {
    console.error("Failed to read cache file:", error);
    return [];
  }
}
