// Enkel, återanvändbar OpenAI-klient för hela appen.
import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY!});
