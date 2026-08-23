import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const companies = ["Google", "Meta", "Netflix", "Amazon"];
const problemsPerCompany = 15; // Set to 15 to generate a solid prebuilt catalog

const SYSTEM_PROMPT = `You are a senior technical interviewer at top-tier tech companies.
Generate a JSON array of ${problemsPerCompany} unique, high-quality, realistic coding interview problems for the given company.

Each object in the array MUST have the following structure exactly:
{
  "title": "Problem Title",
  "difficulty": "Medium",
  "topics": ["Graph", "BFS"],
  "content": "# Problem Title\\n\\nFull markdown formatted problem description... (include Examples and Constraints, but DO NOT include Test Cases or Starter Code sections)"
}

Do NOT wrap the output in markdown code blocks like \`\`\`json. Return raw valid JSON.`;

async function generate() {
  const data: Record<string, any[]> = {};
  
  for (const company of companies) {
    console.log(`Generating problem set for ${company}...`);
    try {
      const prompt = `Generate ${problemsPerCompany} realistic recent interview problems for a Software Engineer role at ${company}. Focus on topics they are known to test frequently (e.g. Meta = Graphs/Arrays, Google = DP/Trees, Amazon = OOD/Graphs, Netflix = Concurrency/System-level algorithms).`;
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: { temperature: 0.7 }
      });
      
      const text = result.response.text();
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      data[company] = JSON.parse(cleanText);
      console.log(`Successfully generated ${data[company].length} problems for ${company}`);
    } catch (e) {
      console.error(`Failed to generate for ${company}:`, e);
      data[company] = [];
    }
  }

  const outPath = path.join(process.cwd(), "src", "lib", "problem_sets.json");
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`Saved generated sets to ${outPath}`);
}

generate();
