import { getGemini, INTENT_MODEL } from "./gemini";

export type HealingField = "title" | "body" | "date_posted" | "company" | "role";

const FIELD_DESCRIPTIONS: Record<HealingField, string> = {
  title: "the title or heading of the forum post",
  body: "the main user-written body text of the forum post, excluding navigation, ads, sidebars, and comment sections",
  date_posted: "the date the post was published, in ISO 8601 format if possible",
  company: "the name of the company being discussed in the interview post",
  role: "the job title or role level being discussed (e.g. Senior SWE, L5, E5, Backend Engineer)",
};

const SYSTEM_PROMPT = `You are a precise data extraction assistant for an interview data pipeline.

You will be given raw HTML from a forum post page. Your job is to locate and extract a specific field from it.

Rules:
- Return ONLY the extracted value as plain text. No JSON, no markdown, no explanation.
- If you cannot find the field with confidence, return the exact string: __NOT_FOUND__
- Strip all HTML tags from your response.
- For body text, return the full meaningful content but exclude nav, headers, footers, ads, and comment sections.
- For dates, prefer ISO 8601 format (YYYY-MM-DD or full datetime).`;

export async function healField(
  rawHtml: string,
  field: HealingField,
  context?: { source?: string; url?: string }
): Promise<string | null> {
  const description = FIELD_DESCRIPTIONS[field];

  const contextHint = context?.source
    ? `This HTML is from the website: ${context.source}. URL: ${context.url ?? "unknown"}.`
    : "";

  const userPrompt = `${contextHint}

Extract the following field from this HTML:
Field: ${field} — ${description}

HTML:
${rawHtml.slice(0, 40000)}`;

  try {
    const response = await getGemini().models.generateContent({
      model: INTENT_MODEL,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0,
      },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    });

    const result = response.text?.trim();

    if (!result || result === "__NOT_FOUND__") {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

export async function healRecord(
  rawHtml: string,
  partial: Record<string, string | null>,
  context?: { source?: string; url?: string }
): Promise<Record<string, string | null>> {
  const fieldsToHeal = (Object.keys(FIELD_DESCRIPTIONS) as HealingField[]).filter(
    (field) => !partial[field] || partial[field]?.trim() === ""
  );

  const healed = { ...partial };

  await Promise.all(
    fieldsToHeal.map(async (field) => {
      const value = await healField(rawHtml, field, context);
      if (value) {
        healed[field] = value;
      }
    })
  );

  return healed;
}
