"use client";
/**
 * Minimal, fristående chattsida (utan ChatKit) som:
 * - Håller sin egen meddelandehistorik
 * - Anropar /api/ask i "manual" eller "web"-läge
 * - Efter manualsvar visar två knappar:
 *     [Sök på webben]  [Ny fråga]
 *
 * Du kan koppla tillbaka ChatKit senare; tills dess är detta stabilt och kompilerar.
 */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

// Enkel typ för egna meddelanden
type Msg = { role: "user" | "assistant" | "info"; text: string };

export default function ChatPage() {
  const sp = useSearchParams();
  const mode = (sp.get("mode") as "manual" | "web") || "web";
  const manualId = sp.get("manualId") || undefined;

  // I skarpt läge: hämta från auth/session
  const companyId = "demo-company";

  // UI-state
  const [messages, setMessages] = useState<Msg[]>([]);
  const [lastQuestion, setLastQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Input-ref (obs: union med null i TS-typen)
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Startmeddelande
  useEffect(() => {
    setMessages([{ role: "info", text: "Ställ en fråga för att börja." }]);
  }, []);

  async function askBackend(curMode: "manual" | "web", text: string) {
    setLastQuestion(text);
    setLoading(true);

    // Visa användarens fråga
    setMessages((prev) => [...prev, { role: "user", text }]);

    // Fråga vår backend
    const r = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: curMode, text, manualId, companyId })
    });
    const data = await r.json();

    // Visa svaret
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: data.text || data.error || "Ok" }
    ]);

    // Efter manualsvar: lägg in ”val”-text (knapparna finns i UI nedan)
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
    const form = e.currentTarget as any;
    const text: string = form.q.value?.trim();
    if (!text) return;
    form.reset();
    await askBackend(mode === "manual" ? "manual" : "web", text);
  }

  async function onSearchWebAgain() {
    if (!lastQuestion) return;
    // Visa tydligt vad som görs
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

      {/* Meddelandelista */}
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
              {m.role === "user" ? "Du" : m.role === "assistant" ? "Assistent" : "Tips"}
              {": "}
            </span>
            <span>{m.text}</span>
          </div>
        ))}
        {loading && <div className="text-xs text-gray-500 italic">Tänker…</div>}
      </div>

      {/* Form för ny fråga */}
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

      {/* Knappar efter manualsvar */}
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
