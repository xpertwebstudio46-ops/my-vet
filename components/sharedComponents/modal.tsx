"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { dashboardForRole, useAuth } from "@/components/auth/AuthProvider";
import { ApiClientError } from "@/lib/api/client";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      onClose();
      router.push(dashboardForRole(user.role));
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-50 rounded-full bg-white p-2 shadow"
        >
          <X size={18} />
        </button>

        {/* Left */}
        <div className="relative hidden w-1/2 md:block">
          <Image
            src="/images/modal-image.png"
            alt="Login"
            width={700}
            height={800}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right */}
        <div className="flex w-full items-center justify-center p-12 md:w-1/2">
          <div className="w-full max-w-sm">
            <h2 className="mb-2 text-center text-5xl font-bold text-[#064071]">
              Welcome
            </h2>

            <p className="mb-8 text-center text-gray-500">
              Login with Email
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email Id
                </label>

                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none"
                />
              </div>

              <div className="text-right">
                <Link href="/forgot-password" onClick={onClose} className="text-sm text-gray-500 hover:text-[#064071]">
                  Forgot your password?
                </Link>
              </div>

              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

              <button disabled={submitting} className="w-full rounded-md bg-[#064071] py-3 font-semibold text-white disabled:opacity-60">
                {submitting ? "Signing in…" : "Login"}
              </button>
              <p className="text-center text-sm text-gray-500">
                New here? <Link href="/register" onClick={onClose} className="font-semibold text-[#064071]">Create an account</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
