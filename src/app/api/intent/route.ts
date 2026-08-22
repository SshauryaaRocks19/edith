import { NextRequest } from "next/server";
import { resolveIntent } from "@/lib/intent";

export async function POST(request: NextRequest) {
  let body: { request?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.request || typeof body.request !== "string" || body.request.trim().length === 0) {
    return Response.json({ error: "Missing required field: request" }, { status: 400 });
  }

  try {
    const manifest = await resolveIntent(body.request.trim());
    return Response.json(manifest);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
