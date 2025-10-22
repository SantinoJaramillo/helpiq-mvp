"use client";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [manuals, setManuals] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabaseClient
        .from("manuals")
        .select("id, model_name");
      setManuals(data || []);
    })();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Välj manual</h1>

      <select
        className="border p-2 rounded"
        onChange={e => setSelected(e.target.value)}
        value={selected ?? ""}
      >
        <option value="">—</option>
        {manuals.map(m => (
          <option key={m.id} value={m.id}>{m.model_name}</option>
        ))}
      </select>

      <div className="flex gap-2">
        <a
          className={`px-4 py-2 border rounded ${!selected && "opacity-50 pointer-events-none"}`}
          href={`/chat?mode=manual&manualId=${selected}`}
        >
          Sök i manual
        </a>
        <a className="px-4 py-2 border rounded" href={`/chat?mode=web`}>
          Webbsök
        </a>
      </div>
    </div>
  );
}
