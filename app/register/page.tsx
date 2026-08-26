"use client";

import Link from "next/link";
import { FormEvent, use, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardForRole, useAuth } from "@/components/auth/AuthProvider";
import { ApiClientError } from "@/lib/api/client";
import type { Role } from "@/lib/api/types";
import { formatPlanPrice, getMembershipPlan, type BillingCycle } from "@/lib/membership-plans";

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = use(searchParams)
  const membership = queryValue(params.membership)
  const planSlug = queryValue(params.plan)
  const selectedPlan = getMembershipPlan(membership, planSlug)
  const billing: BillingCycle = queryValue(params.billing) === 'annual' ? 'annual' : 'monthly'
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<Exclude<Role, "ADMIN">>(selectedPlan || queryValue(params.role) === 'vet' ? "VET" : "PET_OWNER");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      const user = await register({
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        role,
      });
      if (user.role === 'VET') {
        const selection = new URLSearchParams()
        if (selectedPlan) {
          selection.set('membership', selectedPlan.membership)
          selection.set('plan', selectedPlan.slug)
          selection.set('billing', billing)
        }
        router.push(`/register-practice${selection.size ? `?${selection.toString()}` : ''}`)
      } else {
        router.push(dashboardForRole(user.role));
      }
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setFieldErrors(caught.details ?? {});
        setError(caught.details ? "Please correct the highlighted fields." : caught.message);
      } else {
        setError("Account creation failed.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14">
      <form onSubmit={submit} className="mx-auto max-w-lg space-y-5 rounded-2xl bg-white p-8 shadow-sm">
        <div>
          <Link href={selectedPlan ? '/#pricing' : '/'} className="text-sm text-[#01AEAD]">← Back to MY VET</Link>
          <h1 className="mt-4 text-3xl font-bold text-[#064071]">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">Create your account to start your listing. No payment card is needed today.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setRole("PET_OWNER")} className={`rounded-lg border p-3 text-sm ${role === "PET_OWNER" ? "border-[#01AEAD] bg-teal-50 text-[#064071]" : "border-slate-200"}`}>Pet owner</button>
          <button type="button" onClick={() => setRole("VET")} className={`rounded-lg border p-3 text-sm ${role === "VET" ? "border-[#01AEAD] bg-teal-50 text-[#064071]" : "border-slate-200"}`}>Veterinary practice</button>
        </div>
        {role === 'VET' && selectedPlan && (
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#078a83]">Your selected plan</p>
                <p className="mt-1 font-semibold text-[#064071]">{selectedPlan.name} · {selectedPlan.audience}</p>
              </div>
              <p className="shrink-0 text-right font-semibold text-[#064071]">{formatPlanPrice(selectedPlan, billing)}<span className="block text-[11px] font-normal text-slate-500">{billing === 'annual' ? 'per year' : 'per month'}</span></p>
            </div>
            <p className="mt-3 border-t border-teal-200 pt-3 text-xs text-[#087b75]">First 6 months free · No card required</p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" name="firstName" autoComplete="given-name" errors={fieldErrors.firstName} />
          <Field label="Last name" name="lastName" autoComplete="family-name" errors={fieldErrors.lastName} />
        </div>
        <Field label="Email" name="email" type="email" autoComplete="email" errors={fieldErrors.email} />
        <Field label="Password" name="password" type="password" minLength={10} autoComplete="new-password" errors={fieldErrors.password} hint="10+ characters with upper/lowercase letters and a number." />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button disabled={submitting} className="w-full rounded-full bg-[#064071] py-3 font-semibold text-white disabled:opacity-60">{submitting ? "Creating account…" : role === 'VET' ? "Create account & add practice" : "Create account"}</button>
      </form>
    </main>
  );
}

function Field({ label, name, type = "text", autoComplete, minLength, errors, hint }: { label: string; name: string; type?: string; autoComplete: string; minLength?: number; errors?: string[]; hint?: string }) {
  const errorId = `${name}-error`;
  return <label className="block text-sm font-medium">{label}<input name={name} type={type} required minLength={minLength} autoComplete={autoComplete} aria-invalid={Boolean(errors?.length)} aria-describedby={errors?.length ? errorId : undefined} className={`mt-2 w-full rounded-lg border px-3 py-2.5 ${errors?.length ? "border-red-500 ring-2 ring-red-100" : ""}`} />{hint && !errors?.length && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}{errors?.length ? <span id={errorId} className="mt-1 block text-xs font-normal text-red-600">{errors.join(" ")}</span> : null}</label>;
}
