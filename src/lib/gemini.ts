import { GoogleGenAI } from "@google/genai";

export const INTENT_MODEL = "gemini-1.5-flash";
export const SYNTHESIS_MODEL = "gemini-1.5-flash";

let _client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}
