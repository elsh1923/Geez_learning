"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import toast, { Toaster } from "react-hot-toast";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const token = searchParams.get("token");

  const t = {
    en: {
      title: "Reset Password",
      subtitle: "Enter your new password below.",
      password: "New Password",
      confirmPassword: "Confirm Password",
      submit: "Reset Password",
      submitting: "Resetting...",
      backToLogin: "Back to Login",
      success: "Password reset successfully! Redirecting to login...",
      passwordsNotMatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 6 characters",
      noToken: "Invalid or missing reset token. Please request a new password reset.",
      genericError: "Something went wrong. Try again.",
    },
    am: {
      title: "የይለፍ ቃል ማስተካከል",
      subtitle: "አዲሱን የይለፍ ቃልዎን ከዚህ በታች ያስገቡ።",
      password: "አዲስ የይለፍ ቃል",
      confirmPassword: "የይለፍ ቃል ያረጋግጡ",
      submit: "የይለፍ ቃል ማስተካከል",
      submitting: "በማስተካከል ላይ...",
      backToLogin: "ወደ መግቢያ ተመለስ",
      success: "የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል! ወደ መግቢያ በመቀጠል...",
      passwordsNotMatch: "የይለፍ ቃሎች አይጣጣሙም",
      passwordTooShort: "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት",
      noToken: "ልክ ያልሆነ ወይም የጠፋ የማስተካከያ ማስታወሻ። እባክዎ አዲስ የይለፍ ቃል ማስተካከያ ይጠይቁ።",
      genericError: "ችግር አጋጥሟል። እባክዎ ደግመው ይሞክሩ።",
    },
  }[lang];

  useEffect(() => {
    if (!token) {
      toast.error(t.noToken);
    } else {
      // Debug: log token extraction
      console.log("🔑 Reset password page - Token extracted from URL:");
      console.log("Token (first 20 chars):", token.substring(0, 20) + "...");
      console.log("Token length:", token.length);
    }
  }, [token, t.noToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error(t.noToken);
      return;
    }

    if (password.length < 6) {
      toast.error(t.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.passwordsNotMatch);
      return;
    }

    setLoading(true);
    try {
      // Ensure token is properly extracted from URL
      const tokenToSend = token || searchParams.get("token") || "";
      
      if (!tokenToSend) {
        toast.error(t.noToken);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToSend, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || t.genericError);
        setLoading(false);
        return;
      }
      setSuccess(true);
      toast.success(t.success);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      toast.error(t.genericError);
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
        <Toaster position="top-right" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-300">
            <p>{t.noToken}</p>
            <Link href="/forgot-password" className="block text-yellow-300 hover:underline">
              Request Password Reset
            </Link>
            <Link href="/login" className="block text-yellow-300 hover:underline">
              ← {t.backToLogin}
            </Link>
          </div>
        </div>
      </section>
    );
  }

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
          {success ? (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center text-green-300">
              <p>{t.success}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block font-semibold" htmlFor="password">
                  {t.password}
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold" htmlFor="confirmPassword">
                  {t.confirmPassword}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
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
          )}
          <Link href="/login" className="block text-center text-sm text-yellow-300 hover:underline">
            ← {t.backToLogin}
          </Link>
        </form>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </section>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
