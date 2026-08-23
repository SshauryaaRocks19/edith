import { NextRequest } from "next/server";

const PISTON_API = "https://emkc.org/api/v2/piston";

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  cpp: { language: "c++", version: "10.2.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  java: { language: "java", version: "15.0.2" },
};

export async function POST(request: NextRequest) {
  let body: { language: string; code: string; test_cases: Array<{ input: string; expected_output: string }> };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const runtime = LANGUAGE_MAP[body.language?.toLowerCase()];
  if (!runtime) {
    return Response.json({ error: `Unsupported language: ${body.language}` }, { status: 400 });
  }

  const results = await Promise.all(
    body.test_cases.map(async (tc) => {
      try {
        const res = await fetch(`${PISTON_API}/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ name: "solution", content: body.code }],
            stdin: tc.input,
          }),
        });

        const data = await res.json();
        const actualOutput = (data.run?.stdout ?? "").trim();
        const expectedOutput = tc.expected_output.trim();
        const passed = actualOutput === expectedOutput;

        return {
          input: tc.input,
          expected_output: expectedOutput,
          actual_output: actualOutput,
          stderr: data.run?.stderr ?? "",
          passed,
        };
      } catch (e: any) {
        return {
          input: tc.input,
          expected_output: tc.expected_output,
          actual_output: "",
          stderr: e.message,
          passed: false,
        };
      }
    })
  );

  return Response.json({ results });
}
