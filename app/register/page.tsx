"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardForRole, useAuth } from "@/components/auth/AuthProvider";
import { ApiClientError } from "@/lib/api/client";
import type { Role } from "@/lib/api/types";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Exclude<Role, "ADMIN">>("PET_OWNER");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setSubmitting(true);
    try {
      const user = await register({
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        role,
      });
      router.push(user.role === 'VET' ? '/register-practice' : dashboardForRole(user.role));
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Account creation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14">
      <form onSubmit={submit} className="mx-auto max-w-lg space-y-5 rounded-2xl bg-white p-8 shadow-sm">
        <div>
          <Link href="/" className="text-sm text-[#01AEAD]">← Back to MY VET</Link>
          <h1 className="mt-4 text-3xl font-bold text-[#064071]">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">Choose the account type that matches how you use MY VET.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setRole("PET_OWNER")} className={`rounded-lg border p-3 text-sm ${role === "PET_OWNER" ? "border-[#01AEAD] bg-teal-50 text-[#064071]" : "border-slate-200"}`}>Pet owner</button>
          <button type="button" onClick={() => setRole("VET")} className={`rounded-lg border p-3 text-sm ${role === "VET" ? "border-[#01AEAD] bg-teal-50 text-[#064071]" : "border-slate-200"}`}>Veterinary practice</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">First name<input name="firstName" required autoComplete="given-name" className="mt-2 w-full rounded-lg border px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Last name<input name="lastName" required autoComplete="family-name" className="mt-2 w-full rounded-lg border px-3 py-2.5" /></label>
        </div>
        <label className="block text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-lg border px-3 py-2.5" /></label>
        <label className="block text-sm font-medium">Password<input name="password" type="password" required minLength={10} autoComplete="new-password" className="mt-2 w-full rounded-lg border px-3 py-2.5" /><span className="mt-1 block text-xs font-normal text-slate-500">10+ characters with upper/lowercase letters and a number.</span></label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button disabled={submitting} className="w-full rounded-full bg-[#064071] py-3 font-semibold text-white disabled:opacity-60">{submitting ? "Creating account…" : "Create account"}</button>
      </form>
    </main>
  );
}
