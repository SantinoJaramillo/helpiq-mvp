"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type Msg = { role: "user" | "assistant" | "info"; text: string };

export default function ChatClient() {
  const sp = useSearchParams();
  const mode = (sp.get("mode") as "manual" | "web") || "web";
  const manualId = sp.get("manualId") || undefined;

  // TODO: ersätt med auth senare
  const companyId = "demo-company";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [lastQuestion, setLastQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMessages([{ role: "info", text: "Ställ en fråga för att börja." }]);
  }, []);

  async function askBackend(curMode: "manual" | "web", text: string) {
    setLastQuestion(text);
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text }]);

    const r = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: curMode, text, manualId, companyId })
    });
    const data = await r.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: data.text || data.error || "Ok" }
    ]);

    if (curMode === "manual") {
      setMessages((prev) => [
        ...prev,
        {
          role: "info",
          text: "Vill du göra samma sökning på webben? Eller ställa en ny fråga?"
        }
      ]);
    }

    setLoading(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // typa formuläret så vi slipper 'any'
    const form = e.currentTarget as HTMLFormElement & { q: { value: string } };
    const text = form.q?.value?.trim();
    if (!text) return;
    form.reset();
    await askBackend(mode === "manual" ? "manual" : "web", text);
  }

  async function onSearchWebAgain() {
    if (!lastQuestion) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: `(Samma fråga på webben): ${lastQuestion}` }
    ]);
    await askBackend("web", lastQuestion);
  }

  function onNewQuestion() {
    inputRef.current?.focus();
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">
        Chat – {mode === "manual" ? "Manualsök" : "Webbsök"}
      </h1>

      <div className="border rounded p-3 space-y-2 min-h-[360px] bg-white/50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "text-sm"
                : m.role === "assistant"
                ? "text-sm"
                : "text-xs text-gray-600 italic"
            }
          >
            <span className="font-medium">
              {m.role === "user" ? "Du" : m.role === "assistant" ? "Assistent" : "Tips"}:{" "}
            </span>
            <span>{m.text}</span>
          </div>
        ))}
        {loading && <div className="text-xs text-gray-500 italic">Tänker…</div>}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          name="q"
          className="border rounded p-2 w-full"
          placeholder="Ställ en fråga..."
        />
        <button className="px-4 py-2 border rounded" type="submit" disabled={loading}>
          Skicka
        </button>
      </form>

      {mode === "manual" && lastQuestion && (
        <div className="flex items-center gap-3 pt-2">
          <span className="text-sm">
            Vill du göra samma sökning på webben? eller ställa en ny fråga?
          </span>
          <button
            onClick={onSearchWebAgain}
            className="px-3 py-1.5 border rounded text-sm"
            title="Kör samma fråga i webbsök"
            disabled={loading}
          >
            Sök på webben
          </button>
          <button
            onClick={onNewQuestion}
            className="px-3 py-1.5 border rounded text-sm"
            title="Ställ en ny fråga"
          >
            Ny fråga
          </button>
        </div>
      )}
    </div>
  );
}
