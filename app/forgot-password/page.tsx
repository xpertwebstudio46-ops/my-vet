"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const email = String(new FormData(event.currentTarget).get("email"));
    try {
      await apiClient<{ accepted: boolean }>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }, { authenticated: false });
      setMessage("If that account exists, password reset instructions have been sent.");
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "The request failed.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm text-[#01AEAD]">← Back to MY VET</Link>
        <h1 className="text-3xl font-bold text-[#064071]">Reset your password</h1>
        <p className="text-sm text-slate-600">Enter your account email and we’ll send a secure reset link.</p>
        <label className="block text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-lg border px-3 py-2.5" /></label>
        {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-full bg-[#064071] py-3 font-semibold text-white">Send reset link</button>
      </form>
    </main>
  );
}
