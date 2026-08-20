"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const password = String(new FormData(event.currentTarget).get("password"));
    try {
      await apiClient<{ reset: boolean }>("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }, { authenticated: false });
      setMessage("Your password has been reset. You can now sign in.");
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "The reset request failed.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm text-[#01AEAD]">← Back to MY VET</Link>
        <h1 className="text-3xl font-bold text-[#064071]">Choose a new password</h1>
        {!token && <p role="alert" className="text-sm text-red-600">This reset link is missing its security token.</p>}
        <label className="block text-sm font-medium">New password<input name="password" type="password" required minLength={10} autoComplete="new-password" className="mt-2 w-full rounded-lg border px-3 py-2.5" /></label>
        {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button disabled={!token} className="w-full rounded-full bg-[#064071] py-3 font-semibold text-white disabled:opacity-50">Reset password</button>
      </form>
    </main>
  );
}
