"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardForRole, useAuth } from "@/components/auth/AuthProvider";
import { ApiClientError } from "@/lib/api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setSubmitting(true);
    try {
      const user = await login(String(form.get("email")), String(form.get("password")));
      router.replace(dashboardForRole(user.role));
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm text-[#01AEAD]">← Back to MY VET</Link>
        <h1 className="text-3xl font-bold text-[#064071]">Welcome back</h1>
        <label className="block text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-lg border px-3 py-2.5" /></label>
        <label className="block text-sm font-medium">Password<input name="password" type="password" required autoComplete="current-password" className="mt-2 w-full rounded-lg border px-3 py-2.5" /></label>
        <div className="text-right"><Link href="/forgot-password" className="text-sm text-slate-500 hover:text-[#064071]">Forgot your password?</Link></div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button disabled={submitting} className="w-full rounded-full bg-[#064071] py-3 font-semibold text-white disabled:opacity-60">{submitting ? "Signing in…" : "Login"}</button>
        <p className="text-center text-sm text-slate-500">New here? <Link href="/register" className="font-semibold text-[#064071]">Create an account</Link></p>
      </form>
    </main>
  );
}
