import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-2 p-6">
      <h1 className="font-serif text-3xl text-forest">
        Welcome back, {profile?.full_name ?? "friend"}!
      </h1>
      <p className="text-sm text-gray-600">{profile?.email ?? user.email}</p>
      <p className="text-sm text-rose mt-4">Google login and database are working. 🌸</p>
    </main>
  );
}
