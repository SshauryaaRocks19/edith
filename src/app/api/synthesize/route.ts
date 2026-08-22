import { NextRequest } from "next/server";
import { synthesizeChallengeStream } from "@/lib/synthesis";
import { ScrapedSignal } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: { records?: ScrapedSignal[] };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  if (!Array.isArray(body.records) || body.records.length === 0) {
    return new Response(JSON.stringify({ error: "Missing required field: records (must be a non-empty array)" }), { status: 400 });
  }

  try {
    const responseStream = await synthesizeChallengeStream(body.records);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (e: any) {
          controller.enqueue(encoder.encode(`\n\n[Error streaming response: ${e.message}]`));
        } finally {
          controller.close();
        }
      }
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
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
