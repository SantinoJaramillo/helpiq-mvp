/**
 * Två agenter:
 * - Manualsök: använder File Search mot vald vector store
 * - Webbsök: använder Web Search
 * Enkel "guardrail": vi gör en snabb input-kontroll i askAgent (före körning).
 */
import { Agent, Runner, fileSearchTool, webSearchTool } from "@openai/agents";
// openai-klienten behövs inte här för Runner i denna SDK-version
// import { openai } from "./openai"; // <-- inte nödvändig för Runner i den här versionen

// Enkel input-guardrail (justera efter behov)
function inputGuardrail(text: string): boolean {
  const banned = /hemlig|lösenord|api-nyckel/i;
  return !banned.test(text);
}

/**
 * Agent för manualsök — låst till en specifik vector store.
 * ÄNDRAT: options-nyckeln heter maxNumResults (inte max_results).
 */
export function makeManualAgent(vectorStoreId: string) {
  return new Agent({
    name: "Manualsök",
    model: "gpt-5",
    instructions:
      "Du hjälper servicetekniker. Svara ENDAST utifrån dokumenten i vector store. Hjälp med felsökning och ge lösningsförslag på varje möjligt fel. Ge tydliga svar, som att den du hjälper är ny på detta" +
      "Om info saknas: säg det rakt ut och föreslå nästa steg. " +
      "Inkludera 'Källor:' med filnamn och ungefärlig sida/sektion när möjligt.",
    tools: [
      // Sök över ALLA filer i den här vector storen
      fileSearchTool([vectorStoreId], { maxNumResults: 8 }) // <-- fixad nyckel
    ]
    // OBS: Inga 'guardrails' här — inte stött i denna version
  });
}

/**
 * Agent för webbsök — bra fallback om modellen inte finns.
 */
export function makeWebAgent() {
  return new Agent({
    name: "Webbsök",
    model: "gpt-4.1-mini",
    instructions: `
Du är en teknisk assistent för servicetekniker inom storköksservice.

MÅL:
1. Hjälp teknikern att snabbt hitta och förstå teknisk information om storköksutrustning.
   - Exempel: reservdelar, felsökning, manualer, specifikationer, mått, elscheman, installationsanvisningar, rengöringsrutiner, produktnyheter.
2. När en fråga kräver aktuell information eller dokumentation, ANVÄND webbsökning för att hitta:
   - Tillverkarens officiella webbsidor.
   - Tekniska datablad, reservdelslistor och manualer i PDF-format.
   - Auktoriserade återförsäljare eller servicepartners.
3. Svara alltid på svenska, med teknisk men lättförståelig ton.

STRUKTUR FÖR SVAR:
- Rubrik: Modell / Produkt / Fråga tydligt identifierad.
- Kort sammanfattning: 1–3 meningar om vad som hittats.
- Teknisk information: Tydligt strukturerad lista, tabell eller punktform.
- Tips / Kommentarer: Praktiska råd för serviceteknikern (t.ex. felsökningstips, säkerhetsnotis, skillnad mellan versioner).
- Källor: Lista längst ner med länkar (helst officiella tillverkarsidor).
- Avslutande fråga: T.ex. "Vill du att jag hämtar hela manualen eller visar sprängskissen?"

STIL:
- Professionell, konkret och serviceinriktad.
- Använd tydlig rubrikstruktur (### eller tabell).
- Undvik onödiga ord – prioritera snabb läsbarhet.
- Undvik spekulation; om information saknas, säg det och föreslå var den troligen finns.

EXEMPEL PÅ FRÅGOR DU SKA KLARA:
- "Visa reservdelar till Hällde RG-50S."
- "Finns det en manual till Electrolux E9CCGAA00?"
- "Hur felsöker man om en Rational SelfCookingCenter inte värmer?"
- "Vilka packningar behövs till Metos kettles från 2019?"
- "Vilken säkring används till en Hendi 3500W induktionsplatta?"
- "Vad är skillnaden mellan Hällde RG-50 och RG-50S?"

REGLER:
- Prioritera alltid officiella och tekniskt tillförlitliga källor (tillverkarens egna sidor).
- Ge aldrig juridisk, medicinsk eller personlig rådgivning.
- Använd tabeller för reservdelar och specifikationer när det är relevant.
- Om frågan är oklar, be om modellbeteckning, serienummer eller typ.
- Skriv alltid på svenska.
    `,
    tools: [webSearchTool()],
  });
}


/**
 * Kör en dialogsväng mot en agent.
 * ÄNDRAT:
 *  - Runner initieras utan { client, agents } (de finns inte här)
 *  - runner.run(agent, userText) (inte med { messages: [...] })
 *  - Enkel input-guardrail före körning
 */
export async function askAgent(agent: Agent, userText: string) {
  // Guardrail: blocka vissa inputs tidigt (exempel)
  if (!inputGuardrail(userText)) {
    return {
      output_text: "Det där kan jag inte hjälpa till med."
    } as any;
  }

  const runner = new Runner(); // <-- ingen client-prop här
  const result = await runner.run(agent, userText); // <-- korrekt signatur i din SDK
  return result; // innehåller bl.a. result.output_text
}
