import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

type Body = {
  pathname: string;
  draftSummary: string;
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

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemInstruction = [
    `You are a helpful support assistant for international students applying to the Global Korea Scholarship (GKS) Undergraduate program.`,
    `You are chatting with a student who is currently filling out their application.`,
    `Current page: ${body.pathname}`,
    `Current application draft summary:`,
    `<<<`,
    body.draftSummary || "(Empty)",
    `>>>`,
    `Provide concise, specific, actionable help. Answer questions about the application process, the current section they are on, or general GKS questions.`,
  ].join("\n");

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
