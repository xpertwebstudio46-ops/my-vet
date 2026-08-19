"use client";

import Image from "next/image";
import { X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  if (!isOpen) return null;

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

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email Id
                </label>

                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <input
                  type="password"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none"
                />
              </div>

              <div className="text-right">
                <button className="text-sm text-gray-500">
                  Forgot your password?
                </button>
              </div>

              <button className="w-full rounded-md bg-[#064071] py-3 font-semibold text-white">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
