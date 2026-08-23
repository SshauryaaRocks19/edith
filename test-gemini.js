const { GoogleGenAI } = require("@google/genai");

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are a senior technical interviewer at a world-class engineering company.

Your job is to generate a novel, original, production-grade coding challenge based on real-world interview signals.

Rules:
- The problem MUST be completely original. Do NOT reproduce copyrighted problem statements.
- The problem should be solvable in 35–45 minutes.
- Generate exactly 3 examples (visible) and 2 test cases (hidden, for automated execution).
- For test cases, the Input must be valid stdin that a Python solution can read with input().
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

## Test Cases
<!-- These are used for automated verification. Input must be valid stdin. -->
### Test Case 1
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
`;

async function test() {
  const response = await client.models.generateContent({
    model: "gemini-3.6-flash",
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    },
    contents: [{ role: "user", parts: [{ text: "Generate a graph problem" }] }],
  });
  console.log(response.text);
}
test().catch(console.error);
