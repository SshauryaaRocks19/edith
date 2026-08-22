import { NextRequest } from "next/server";
import { WebhookPayload, ScrapedSignal } from "@/lib/types";
import { healRecord } from "@/lib/healing";

type RawRecord = ScrapedSignal & { _needs_healing?: boolean; _raw_html?: string | null };

function validateRecord(record: unknown): record is RawRecord {
  if (!record || typeof record !== "object") return false;
  const r = record as Record<string, unknown>;
  return (
    typeof r.source === "string" &&
    typeof r.url === "string" &&
    typeof r.company === "string" &&
    typeof r.role === "string" &&
    typeof r.title === "string" &&
    typeof r.body === "string" &&
    Array.isArray(r.comments) &&
    r.signals !== null &&
    typeof r.signals === "object"
  );
}

function sanitize(record: ScrapedSignal): ScrapedSignal {
  return {
    ...record,
    title: record.title.trim(),
    body: record.body.replace(/\s+/g, " ").trim(),
    comments: record.comments.map((c) => c.replace(/\s+/g, " ").trim()).filter(Boolean),
    company: record.company.trim(),
    role: record.role.trim(),
  };
}

export async function POST(request: NextRequest) {
  let payload: WebhookPayload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.scraper_id || !Array.isArray(payload.records)) {
    return Response.json({ error: "Missing required fields: scraper_id, records" }, { status: 400 });
  }

  const valid: ScrapedSignal[] = [];
  const healingQueue: Array<{ record: RawRecord; raw_html: string }> = [];
  const invalid: number[] = [];

  for (const [index, record] of payload.records.entries()) {
    const r = record as RawRecord;

    if (!validateRecord(r)) {
      invalid.push(index);
      continue;
    }

    const { _needs_healing, _raw_html, ...clean } = r;

    if (_needs_healing && _raw_html) {
      healingQueue.push({ record: clean as RawRecord, raw_html: _raw_html });
    } else {
      valid.push(sanitize(clean as ScrapedSignal));
    }
  }

  const healed: ScrapedSignal[] = [];

  await Promise.all(
    healingQueue.map(async ({ record, raw_html }) => {
      const partial = {
        title: record.title,
        body: record.body,
        date_posted: record.date_posted,
        company: record.company,
        role: record.role,
      };

      const result = await healRecord(raw_html, partial, {
        source: record.source,
        url: record.url,
      });

      const recovered: ScrapedSignal = {
        ...record,
        title: result.title ?? record.title,
        body: result.body ?? record.body,
        date_posted: result.date_posted ?? record.date_posted,
        company: result.company ?? record.company,
        role: result.role ?? record.role,
      };

      healed.push(sanitize(recovered));
    })
  );

  // TODO: persist valid + healed to database

  return Response.json({
    received: payload.records.length,
    accepted: valid.length,
    healed: healed.length,
    rejected: invalid.length,
    rejected_indices: invalid,
  });
}
