"use client";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
  const { lang } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const t = {
    en: {
      title: "Contact Us",
      subtitle: "Have questions or feedback? We'd love to hear from you.",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send Message",
      sending: "Sending...",
      sent: "Thanks! Your message has been sent.",
      failed: "Failed to send. Please try again.",
    },
    am: {
      title: "ያነጋግሩን",
      subtitle: "ጥያቄ ወይም አስተያየት ካለዎት ይላኩልን።",
      name: "ስም",
      email: "ኢሜይል",
      message: "መልዕክት",
      send: "መልዕክት ላክ",
      sending: "በመላክ ላይ...",
      sent: "አመሰግናለሁ! መልዕክትዎ ተልኳል።",
      failed: "መላክ አልተሳካም። እባክዎ ደግመው ይሞክሩ።",
    },
  }[lang];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSent(false);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("send-failed");
      setSent(true);
      setName(""); setEmail(""); setMessage("");
    } catch {
      setError(t.failed);
    } finally {
      setLoading(false);
      setTimeout(() => setSent(false), 3000);
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-yellow-500/10 via-yellow-300/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20rem] right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-yellow-400/15 via-amber-300/10 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="animate-fade-up bg-gradient-to-b from-gray-100 to-gray-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow sm:text-5xl">{t.title}</h1>
            <p className="mt-3 text-gray-300 animate-fade-up [animation-delay:120ms]">{t.subtitle}</p>
            <div className="mx-auto mt-4 h-px w-28 animate-glow rounded bg-gradient-to-r from-yellow-500/70 via-yellow-300/70 to-yellow-500/70" />
          </div>

          <form onSubmit={onSubmit} className="animate-fade-up space-y-5 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-md">
            {sent && <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-green-300">{t.sent}</div>}
            {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-red-300">{error}</div>}
            <div>
              <label htmlFor="name" className="mb-1 block font-semibold">{t.name}</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block font-semibold">{t.email}</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
            </div>
            <div>
              <label htmlFor="message" className="mb-1 block font-semibold">{t.message}</label>
              <textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-full bg-yellow-400 py-2 font-semibold text-black ring-1 ring-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.35)] transition hover:shadow-[0_0_26px_rgba(250,204,21,0.5)]">
              {loading ? t.sending : t.send}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
