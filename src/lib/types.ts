import { SourceId } from "./sources";

export type ScrapedSignal = {
  source: SourceId;
  url: string;
  company: string;
  role: string;
  date_posted: string;
  title: string;
  body: string;
  comments: string[];
  signals: {
    topics: string[];
    difficulty: "easy" | "medium" | "hard" | "unknown";
    recency: "recent" | "older";
  };
};

export type SynthesisChallenge = {
  id: string;
  title: string;
  company_signal: string;
  topics: string[];
  difficulty: "easy" | "medium" | "hard";
  problem: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  test_cases: Array<{
    input: string;
    expected_output: string;
    hidden: boolean;
  }>;
  complexity: {
    time: string;
    space: string;
  };
  generated_at: string;
  freshness: string;
};

export type WebhookPayload = {
  scraper_id: string;
  run_id: string;
  records: ScrapedSignal[];
};

export type RankedSource = {
  source_id: string;
  rank: number;
  reasoning: string;
};

export type IntentManifest = {
  company: string;
  role: string;
  role_level: string;
  topics: string[];
  recency_bias: string;
  search_query: string;
  ranked_sources: RankedSource[];
  signal_threshold: number;
};
