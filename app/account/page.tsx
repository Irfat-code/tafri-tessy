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
    <main className="flex flex-col items-center gap-2 px-6 py-20">
      <h1 className="font-serif text-3xl text-forest">Welcome back, {profile?.full_name ?? "friend"}!</h1>
      <p className="text-sm text-gray-600">{profile?.email ?? user.email}</p>
      <p className="mt-4 text-sm text-rose">Your orders and bookings will appear here soon. 🌸</p>
      <form action="/auth/signout" method="post" className="mt-6">
        <button className="rounded-full border border-gray-300 px-5 py-2 text-sm hover:bg-white">Log out</button>
      </form>
    </main>
  );
}
