"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/api/types";
import { dashboardForRole, useAuth } from "./AuthProvider";

export function RequireAuth({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!roles.includes(user.role)) router.replace(dashboardForRole(user.role));
  }, [loading, roles, router, user]);

  if (loading || !user || !roles.includes(user.role)) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-600">Checking your account…</div>;
  }
  return children;
}
