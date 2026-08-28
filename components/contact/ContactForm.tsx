"use client";

import { useState } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
const socialLinks = [
  { icon: "images/grp-1.png", href: "#", label: "Facebook" },
  { icon: "images/grp-2.png", href: "#", label: "Twitter" },
  { icon: "images/grp-3.png", href: "#", label: "LinkedIn" },
  { icon: "images/grp-4.png", href: "#", label: "Instagram" },
];

export default function StayConnectedSection({ initialSubject = '' }: { initialSubject?: string }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    practiceType: initialSubject,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await apiClient<{ id: string }>("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.practiceType || "General enquiry",
          message: formData.message,
        }),
      }, { authenticated: false });
      setFeedback({ type: "success", message: "Thanks — your message has been received." });
      setFormData({ firstName: "", lastName: "", email: "", phone: "", practiceType: initialSubject, message: "" });
    } catch (caught) {
      setFeedback({ type: "error", message: caught instanceof ApiClientError ? caught.message : "Your message could not be sent." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-8 bg-white">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-bold font-heading leading-tight sm:text-[40px]">
            Stay <span style={{ color: "#064071" }}>Connected</span>
          </h2>
          <p className="text-[16px] font-sans font-normal sm:text-[18px]">
            Message us anytime on your preferred platform
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start rounded-2xl p-0 sm:p-6 lg:p-8">
          {/* Left — form */}
          <div className="border border-[#064071] p-4 rounded-lg">
            <h3 className="font-heading font-bold text-[30px] leading-tight sm:text-[40px]">
              Send Us a <span style={{ color: "#064071" }}>Message</span>
            </h3>
            <p className="mt-1 text-[16px] fotn-normal font-sans">
              Fill out the form below and our team will get back to you
              promptly.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter Your Phone Number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Practice Type
                </label>
                <input
                  type="text"
                  name="practiceType"
                  value={formData.practiceType}
                  onChange={handleChange}
                  placeholder="Enter Your Practice"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell Us About Your Goals And How We Can Help..."
                  required
                  minLength={10}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {feedback && <p role={feedback.type === "error" ? "alert" : "status"} className={`text-sm ${feedback.type === "error" ? "text-red-600" : "text-emerald-700"}`}>{feedback.message}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "#0d2e5e" }}
              >
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>

          {/* Right — map + social */}
          <div>
            <h3 className="font-heading font-bold text-[30px] leading-tight sm:text-[40px]">
              Get <span style={{ color: "#064071" }}>Directions</span>:
            </h3>

            <div className="mt-4 w-full h-[260px] sm:h-[300px] rounded-2xl overflow-hidden border border-slate-200">
              <iframe
                title="Location map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.618!2d-0.1278!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMwJzI2LjYiTiAwwrAwNyc0MC4xIlc!5e0!3m2!1sen!2suk!4v1600000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <h3 className="mt-8 text-[30px] font-bold font-heading leading-tight sm:text-[40px]">
              Follow <span style={{ color: "#064071" }}>Us</span>:
            </h3>

            <div className="mt-3 flex items-center gap-3">
              {socialLinks.map(({ icon, href, label }) => (
                <a key={label} href={href} aria-label={label}>
                  <img
                    src={icon}
                    className="w-10 h-10 object-contain"
                    alt=""
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
