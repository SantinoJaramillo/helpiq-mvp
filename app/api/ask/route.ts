import { NextRequest, NextResponse } from "next/server";
import { makeManualAgent, makeWebAgent, askAgent } from "@/lib/agents";
import { getVectorStoreId } from "@/lib/manuals";

// Försök plocka text från olika möjliga fält/format i den SDK-version du har.
function extractText(result: any): string {
  if (!result) return "";

  // Vanliga kandidater
  if (typeof result.output_text === "string") return result.output_text;
  if (typeof result.outputText === "string") return result.outputText;
  if (typeof result.text === "string") return result.text;

  // Ibland: finalOutput { type: "text", text: "..." }
  if (result.finalOutput?.type === "text" && typeof result.finalOutput.text === "string") {
    return result.finalOutput.text;
  }

  // Ibland: output som sträng/direct
  if (typeof result.output === "string") return result.output;

  // Ibland: messages-array där assistant-svar ligger
  if (Array.isArray(result.messages)) {
    const assistantBits = result.messages
      .filter((m: any) => m?.role === "assistant")
      .map((m: any) => {
        if (typeof m.content === "string") return m.content;
        if (m.content?.text) return m.content.text;
        return "";
      })
      .filter(Boolean);
    if (assistantBits.length) return assistantBits.join("\n").trim();
  }

  // Sista utväg: ge något tillbaka så vi ser vad som kommer
  try {
    return JSON.stringify(result, null, 2).slice(0, 4000); // begränsa längd
  } catch {
    return String(result);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { mode, text, manualId, companyId } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Tom fråga" }, { status: 400 });
    }

    let result: any;

    if (mode === "manual" && manualId && companyId) {
      // OBS: companyId måste matcha manualens company_id, annars kastar getVectorStoreId
      const vsId = await getVectorStoreId(manualId, companyId);
      result = await askAgent(makeManualAgent(vsId), text);
    } else {
      result = await askAgent(makeWebAgent(), text);
    }

    const out = extractText(result);

    // Om fortfarande tomt – returnera hela objektet för felsökning (tillfälligt)
    if (!out || !out.trim()) {
      return NextResponse.json({ debug: result });
    }

    return NextResponse.json({ text: out });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Okänt fel" }, { status: 500 });
  }
}
