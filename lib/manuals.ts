import { supabaseService } from "./supabase";

export async function getVectorStoreId(manualId: string, companyId: string) {
  const { data, error } = await supabaseService
    .from("manuals")
    .select("vector_store_id, company_id")
    .eq("id", manualId)
    .single();

  if (error || !data) throw error || new Error("Manual saknas");
  if (data.company_id !== companyId) throw new Error("Obehörig åtkomst");

  return data.vector_store_id as string;
}
