"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const router = useRouter();
  const { lang } = useLanguage();

  const t = {
    en: {
      title: "Forgot Password",
      subtitle: "Enter your email address and we'll send you a link to reset your password.",
      email: "Email",
      submit: "Send Reset Link",
      submitting: "Sending...",
      backToLogin: "Back to Login",
      sent: "If that email exists, we've sent a password reset link.",
      genericError: "Something went wrong. Try again.",
    },
    am: {
      title: "የይለፍ ቃል ረስተዋል",
      subtitle: "ኢሜይል ድርሻዎን ያስገቡ እና የይለፍ ቃል ለመቀየር ማገናኛ እንልክልዎታለን።",
      email: "ኢሜይል",
      submit: "የማስተካከያ ማገናኛ ላክ",
      submitting: "በመላክ ላይ...",
      backToLogin: "ወደ መግቢያ ተመለስ",
      sent: "እንዲህ አይነት ኢሜይል ካለ፣ የይለፍ ቃል ማስተካከያ ማገናኛ ልከናል።",
      genericError: "ችግር አጋጥሟል። እባክዎ ደግመው ይሞክሩ።",
    },
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || t.genericError);
        setLoading(false);
        return;
      }
      setSent(true);
      setResetUrl(data.resetUrl || "");
      if (data.emailSent) {
        toast.success(t.sent);
      } else {
        toast.success(lang === "en" ? "Reset link generated. See below." : "የማስተካከያ ማገናኛ ተፈጥሯል። ከዚህ በታች ይመልከቱ።");
      }
    } catch (err) {
      toast.error(t.genericError);
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
      <Toaster position="top-right" />
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-yellow-500/10 via-yellow-300/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20rem] right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-yellow-400/15 via-amber-300/10 to-transparent blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <form
          className="animate-fade-up w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-gray-100 shadow-xl backdrop-blur-md"
          onSubmit={handleSubmit}
        >
          <div className="mb-2 text-center">
            <h2 className="bg-gradient-to-b from-gray-100 to-gray-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent">{t.title}</h2>
            <p className="mt-2 text-sm text-gray-300">{t.subtitle}</p>
            <div className="mx-auto mt-3 h-px w-20 animate-glow rounded bg-gradient-to-r from-yellow-500/70 via-yellow-300/70 to-yellow-500/70" />
          </div>
          {!sent ? (
            <>
              <div>
                <label className="mb-1 block font-semibold" htmlFor="email">
                  {t.email}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-yellow-400 py-2 font-semibold text-black ring-1 ring-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.35)] transition hover:shadow-[0_0_26px_rgba(250,204,21,0.5)]"
              >
                {loading ? t.submitting : t.submit}
              </button>
            </>
          ) : (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center text-green-300">
              <p className="mb-3 font-semibold">
                {lang === "en" 
                  ? "Your password reset link is ready:" 
                  : "የይለፍ ቃል ማስተካከያ ማገናኛዎ ዝግጁ ነው:"}
              </p>
              <div className="mb-3 rounded bg-black/30 p-3 text-left">
                <a
                  href={resetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-300 break-all hover:underline block"
                >
                  {resetUrl}
                </a>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resetUrl);
                  toast.success(lang === "en" ? "Link copied to clipboard!" : "ማገናኛ ወደ ደብተር ተቅድቷል!");
                }}
                className="mb-2 rounded-full bg-yellow-400 px-4 py-1 text-sm font-semibold text-black hover:bg-yellow-300 transition"
              >
                {lang === "en" ? "Copy Link" : "ገልብጥ"}
              </button>
              <p className="text-xs text-gray-400 mb-2">
                {lang === "en" 
                  ? "Click the link above or copy it to reset your password. This link expires in 1 hour." 
                  : "ከላይ ያለውን ማገናኛ ይጫኑ ወይም ይቅዱ የይለፍ ቃልዎን ለማስተካከል። ይህ ማገናኛ ከ1 ሰአት በኋላ ይዝጋል።"}
              </p>
              {resetUrl && (
                <p className="text-xs text-gray-400 mt-2">
                  {lang === "en" 
                    ? "📧 If we were able to send an email, please also check your inbox." 
                    : "📧 ኢሜይል ካስተላለፍን፣ እባክዎ የገቢ ሳጥንዎን ይፈትሹ።"}
                </p>
              )}
            </div>
          )}
          <Link href="/login" className="block text-center text-sm text-yellow-300 hover:underline">
            ← {t.backToLogin}
          </Link>
        </form>
      </div>
    </section>
  );
}

