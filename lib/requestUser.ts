import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Works for both clients of the API:
// - the website, which sends the login cookie
// - the mobile app, which sends "Authorization: Bearer <access token>"
export async function getRequestUser(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const { data } = await supabaseAdmin.auth.getUser(auth.slice(7));
    return data.user ?? null;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
