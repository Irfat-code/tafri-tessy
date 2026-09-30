"use client";

import { createClient } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const supabase = createClient();

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow text-center">
        <h1 className="font-serif text-3xl text-forest mb-2">Welcome back!</h1>
        <p className="text-sm text-gray-600 mb-6">Sign in to your account to continue.</p>
        <button
          onClick={signInWithGoogle}
          className="w-full rounded-lg border border-gray-300 py-3 font-medium hover:bg-gray-50"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
