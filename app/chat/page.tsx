// app/chat/page.tsx (SERVER-komponent)
import { Suspense } from "react";
import ChatClient from "./Client";

// Förhindra statisk export när vi läser query params via client
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-gray-500">Laddar chatten…</div>}>
      <ChatClient />
    </Suspense>
  );
}
