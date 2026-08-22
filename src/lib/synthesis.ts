import { getGemini, SYNTHESIS_MODEL } from "./gemini";
import { ScrapedSignal } from "./types";

type AggregatedSignals = {
  company: string;
  role: string;
  topics: Array<{ topic: string; frequency: number }>;
  difficulty: string;
  post_count: number;
};

function aggregateSignals(records: ScrapedSignal[]): AggregatedSignals {
  const company = records[0]?.company ?? "Unknown";
  const role = records[0]?.role ?? "Software Engineer";

  const topicCounts: Record<string, number> = {};
  for (const record of records) {
    for (const topic of record.signals.topics) {
      const key = topic.toLowerCase().trim();
      topicCounts[key] = (topicCounts[key] ?? 0) + 1;
    }
  }

  const topics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, frequency]) => ({ topic, frequency }));

  const difficultyCounts: Record<string, number> = { easy: 0, medium: 0, hard: 0, unknown: 0 };
  for (const record of records) {
    difficultyCounts[record.signals.difficulty] += 1;
  }

  const difficulty =
    Object.entries(difficultyCounts)
      .filter(([k]) => k !== "unknown")
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "medium";

  return { company, role, topics, difficulty, post_count: records.length };
}

const SYSTEM_PROMPT = `You are a senior technical interviewer at a world-class engineering company.

Your job is to generate a novel, original, production-grade coding challenge based on real-world interview signals. 

Rules:
- The problem MUST be completely original. Do NOT reproduce any copyrighted or proprietary problem statements from LeetCode, HackerRank, etc.
- The problem should be solvable in 35–45 minutes by a candidate at the stated role level.
- Generate exactly 3 examples and 2 hidden test cases.
- Respond in standard Markdown format (use ## for headers). Do not use JSON.

Format:
# [Challenge Title]
**Difficulty:** [Easy/Medium/Hard]
**Topics:** [Topic 1, Topic 2]

## Problem Statement
[Full problem statement]

## Constraints
- [Constraint 1]
- [Constraint 2]

## Examples
**Example 1**
- Input: ...
- Output: ...
- Explanation: ...

## Complexity
- **Time:** ...
- **Space:** ...
`;

export async function synthesizeChallengeStream(records: ScrapedSignal[]) {
  if (records.length === 0) {
    throw new Error("Cannot synthesize a challenge from zero records");
  }

  const signals = aggregateSignals(records);
  const topicList = signals.topics.map((t) => `"${t.topic}" (mentioned in ${t.frequency}/${signals.post_count} posts)`).join(", ");

  const userPrompt = `Generate a coding challenge based on the following real-world interview signals:

Company: ${signals.company}
Role: ${signals.role}
Difficulty observed: ${signals.difficulty}
High-frequency topics from ${signals.post_count} scraped interview posts:
${topicList}

The challenge should reflect what this company is actively testing in interviews right now.`;

  const responseStream = await getGemini().models.generateContentStream({
    model: SYNTHESIS_MODEL,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  });

  return responseStream;
}
