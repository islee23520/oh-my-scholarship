import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ESSAY_LABELS, ESSAY_LIMITS, ESSAY_PROMPTS, type EssayKind } from "@/lib/ai/prompts";

export const runtime = "nodejs";

type Body = {
  kind: EssayKind;
  essay: string;
  context?: {
    track?: string;
    fieldOfStudy?: string;
    country?: string;
  };
  messages: { role: "user" | "model"; parts: { text: string }[] }[];
};

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY. Add it to .env.local." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const essay = (body.essay ?? "").trim();
  const limit = ESSAY_LIMITS[body.kind];
  const prompts = ESSAY_PROMPTS[body.kind];

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemInstruction = [
    `You are an experienced advisor helping international students apply to the Global Korea Scholarship (GKS) Undergraduate program.`,
    `You are chatting with a student about their essay.`,
    `Essay type: ${ESSAY_LABELS[body.kind]}.`,
    `Character limit: ${limit.maxChars} characters.`,
    `Required points to cover:`,
    ...prompts.map(p => `- ${p}`),
    body.context?.track ? `Applicant track: ${body.context.track}.` : null,
    body.context?.fieldOfStudy ? `Intended field: ${body.context.fieldOfStudy}.` : null,
    body.context?.country ? `Citizenship: ${body.context.country}.` : null,
    "",
    "Current essay text:",
    "<<<",
    essay || "(Empty)",
    ">>>",
    "",
    "Provide concise, specific, actionable feedback. Do not rewrite the essay for them.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: body.messages,
      config: {
        systemInstruction,
      },
    });

    return NextResponse.json({
      reply: response.text,
    });
  } catch (err) {
    const message = normalizeErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function normalizeErrorMessage(err: unknown) {
  if (!(err instanceof Error)) return "Unknown error";

  try {
    const parsed = JSON.parse(err.message) as {
      error?: {
        message?: string;
      };
    };

    if (parsed.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // Ignore parse failure and fall back to the original error message.
  }

  return err.message;
}
