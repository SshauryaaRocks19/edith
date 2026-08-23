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
- The problem MUST be completely original. Do NOT reproduce copyrighted problem statements.
- The problem should be solvable in 35–45 minutes.
- Generate exactly 3 examples (visible) and 2 test cases (hidden, for automated execution).
- For test cases, the Input must be valid stdin that a Python solution can read with input().
- CRITICAL: You MUST begin your response with exactly one '#' for the challenge title. Do not omit the title, difficulty, or topics.
- CRITICAL: Do NOT add conversational filler like "Here is a problem". Start the problem statement immediately after the '## Problem Statement' heading.
- The '## Problem Statement' heading MUST be on its own line.
- Use proper capitalization and grammar. Do not start sentences with lowercase letters.
- Respond ONLY in the exact Markdown format below. Do not deviate.

# [Challenge Title]
**Difficulty:** [Easy/Medium/Hard]
**Topics:** [Topic 1, Topic 2]

## Problem Statement
[Full problem statement here]

## Constraints
- [Constraint 1]
- [Constraint 2]

## Examples
### Example 1
\`\`\`
Input: [describe input]
Output: [describe output]
Explanation: [brief explanation]
\`\`\`

### Example 2
\`\`\`
Input: [describe input]
Output: [describe output]
Explanation: [brief explanation]
\`\`\`

### Example 3
\`\`\`
Input: [describe input]
Output: [describe output]
Explanation: [brief explanation]
\`\`\`

## Test Cases
<!-- These are used for automated verification. Input must be valid stdin. -->
### Test Case 1
\`\`\`
Input: [exact stdin string]
Expected Output: [exact stdout string]
\`\`\`

### Test Case 2
\`\`\`
Input: [exact stdin string]
Expected Output: [exact stdout string]
\`\`\`

## Starter Code
### Python
\`\`\`python
# Write your solution here
import sys
input = sys.stdin.readline

def solve():
    pass

solve()
\`\`\`

### C++
\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}
\`\`\`

## Complexity
- **Time:** [O(?) with explanation]
- **Space:** [O(?) with explanation]
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
