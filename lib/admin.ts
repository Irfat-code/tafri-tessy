import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Returns the signed-in user if their profile has is_admin = true.
export async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseAdmin.from("profiles").select("is_admin").eq("id", user.id).single();
  return data?.is_admin ? user : null;
}

export async function requireAdmin() {
  const user = await getAdmin();
  if (!user) redirect("/");
  return user;
}
