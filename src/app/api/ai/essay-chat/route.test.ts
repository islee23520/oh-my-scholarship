import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

const generateContentMock = vi.fn();

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: generateContentMock,
      };
    },
  };
});

describe("POST /api/ai/essay-chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    generateContentMock.mockResolvedValue({ text: "Mocked Gemini response" });
  });

  it("returns 500 if GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    const req = new Request("http://localhost/api/ai/essay-chat", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("missing GEMINI_API_KEY");
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/ai/essay-chat", {
      method: "POST",
      body: "invalid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns a reply on success", async () => {
    const req = new Request("http://localhost/api/ai/essay-chat", {
      method: "POST",
      body: JSON.stringify({
        kind: "personal_statement",
        essay: "This is my essay.",
        messages: [{ role: "user", parts: [{ text: "Hello" }] }],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toBe("Mocked Gemini response");
  });

  it("normalizes Gemini JSON error payloads", async () => {
    generateContentMock.mockRejectedValueOnce(
      new Error(JSON.stringify({ error: { message: "API key expired. Please renew the API key." } })),
    );

    const req = new Request("http://localhost/api/ai/essay-chat", {
      method: "POST",
      body: JSON.stringify({
        kind: "personal_statement",
        essay: "This is my essay.",
        messages: [{ role: "user", parts: [{ text: "Hello" }] }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("API key expired. Please renew the API key.");
  });
});
