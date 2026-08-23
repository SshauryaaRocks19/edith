import { NextRequest } from "next/server";
import { resolveIntent } from "@/lib/intent";
import { synthesizeChallengeStream } from "@/lib/synthesis";
import { ScrapedSignal } from "@/lib/types";
import { fetchGithubInterviewData } from "@/lib/github";
import { getFromCache } from "@/lib/cache";
import { triggerBrightDataScrape } from "@/lib/brightdata";

export async function POST(request: NextRequest) {
  let body: { request?: string; company?: string; role?: string; topics?: string[] };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let naturalLanguageRequest: string;

  if (body.request) {
    naturalLanguageRequest = body.request.trim();
  } else if (body.company) {
    const topicsStr = body.topics && body.topics.length > 0 ? ` Focus on: ${body.topics.join(", ")}.` : "";
    naturalLanguageRequest = `Prepare me for a ${body.role ?? "Software Engineer"} interview at ${body.company}.${topicsStr}`;
  } else {
    return Response.json({ error: "Provide either a natural language request or a company name." }, { status: 400 });
  }

  try {
    const manifest = await resolveIntent(naturalLanguageRequest);

    let recordsToUse = await getFromCache(manifest.company, manifest.topics);

    if (recordsToUse.length === 0) {
      console.log(`Cache miss for ${manifest.company}. Triggering Bright Data scrape in the background...`);
      // Fire and forget
      triggerBrightDataScrape(manifest.company, manifest.role, naturalLanguageRequest).catch((e) => console.error(e));

      console.log(`Falling back to GitHub data for ${manifest.company}...`);
      recordsToUse = await fetchGithubInterviewData(manifest.company, manifest.topics);
    } else {
      console.log(`Cache hit for ${manifest.company}! Using ${recordsToUse.length} Bright Data records.`);
    }

    if (recordsToUse.length === 0) {
      console.log("No live github records found, falling back to mock records");
      recordsToUse = [
        {
          source: "teamblind" as any,
          url: "https://www.teamblind.com",
          company: manifest.company,
          role: manifest.role,
          date_posted: new Date().toISOString(),
          title: "Recent Interview Experience",
          body: `Interview at ${manifest.company} for ${manifest.role} role. Topics covered: ${manifest.topics.join(", ")}.`,
          comments: [],
          signals: {
            topics: manifest.topics,
            difficulty: "medium",
            recency: "recent",
          },
        },
      ];
    }

    const responseStream = await synthesizeChallengeStream(recordsToUse);

    const intentHeader = JSON.stringify(manifest);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`__INTENT__${intentHeader}__INTENT_END__\n`));
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (e: any) {
          controller.enqueue(encoder.encode(`\n\n[Synthesis error: ${e.message}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
