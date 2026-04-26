"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useDraft } from "@/lib/wizard/store";
import { btnPrimary } from "./WizardShell";

type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

export function SupportChat() {
  const pathname = usePathname();
  const draft = useDraft();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", parts: [{ text: input }] };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    // Create a safe summary of the draft to send as context
    const draftSummary = JSON.stringify({
      track: draft.track,
      profile: {
        country: draft.profile.citizenshipCountryCode,
      },
      education: {
        gpaValue: draft.education.gpaValue,
        gpaScale: draft.education.gpaScale,
      },
      languages: {
        topikLevel: draft.languages.topikLevel,
        englishTest: draft.languages.englishTest,
      },
      flags: draft.flags,
    }, null, 2);

    try {
      const r = await fetch("/api/ai/support-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pathname, draftSummary, messages: newMessages }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Request failed");
      
      setMessages([...newMessages, { role: "model", parts: [{ text: data.reply }] }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="flex h-[600px] w-80 shrink-0 flex-col space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:h-auto">
      <h3 className="text-sm font-semibold">Support Chat</h3>
      
      <div className="flex-1 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        {messages.length === 0 ? (
          <p className="text-xs text-zinc-500">Ask for help with your application.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[90%] whitespace-pre-wrap rounded-lg p-2 text-xs ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"}`}>
                  {m.parts[0].text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="rounded-lg border border-zinc-200 bg-white p-2 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">
                  Thinking...
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-start">
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950">
                  {error}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button type="submit" disabled={loading || !input.trim()} className={btnPrimary}>
          Send
        </button>
      </form>
    </aside>
  );
}
