"use client";

import { ESSAY_LIMITS, ESSAY_PROMPTS, type EssayKind } from "@/lib/ai/prompts";

export function EssayEditor({
  kind,
  value,
  onChange,
}: {
  kind: EssayKind;
  value: string;
  onChange: (v: string) => void;
  context?: { track?: string; fieldOfStudy?: string; country?: string };
}) {
  const limit = ESSAY_LIMITS[kind];
  const prompts = ESSAY_PROMPTS[kind];

  const overLimit = value.length > limit.maxChars;

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-sm font-medium">Cover these points:</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          {prompts.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>

      <textarea
        className="h-96 w-full rounded-xl border border-zinc-300 bg-white p-3 font-serif text-sm leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing here. Save is automatic."
      />

      <div className="flex items-center justify-between text-xs">
        <span className={overLimit ? "text-red-600" : "text-zinc-500"}>
          {value.length.toLocaleString()} / {limit.maxChars.toLocaleString()} characters
          (~{limit.pages} pages)
        </span>
      </div>
    </div>
  );
}
