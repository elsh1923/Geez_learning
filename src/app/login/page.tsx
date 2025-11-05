"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { lang } = useLanguage();

  const t = {
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      submit: "Login",
      submitting: "Logging in...",
      noAccount: "Don't have an account?",
      register: "Register",
      forgotPassword: "Forgot password?",
      genericError: "Something went wrong. Try again.",
    },
    am: {
      title: "መግቢያ",
      email: "ኢሜይል",
      password: "የይለፍ ቃል",
      submit: "መግባት",
      submitting: "በመግባት ላይ...",
      noAccount: "መለያ የለዎትም?",
      register: "መመዝገብ",
      forgotPassword: "የይለፍ ቃል ረስተዋል?",
      genericError: "ችግኝ አጋጥሟል። እባክዎ ደግመው ይሞክሩ።",
    },
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || t.genericError);
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(t.genericError);
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-yellow-500/10 via-yellow-300/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20rem] right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-yellow-400/15 via-amber-300/10 to-transparent blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-0">
        <form className="animate-fade-up w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-gray-100 shadow-xl backdrop-blur-md" onSubmit={handleSubmit}>
          <div className="mb-2 text-center">
            <h2 className="bg-gradient-to-b from-gray-100 to-gray-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent">{t.title}</h2>
            <div className="mx-auto mt-3 h-px w-20 animate-glow rounded bg-gradient-to-r from-yellow-500/70 via-yellow-300/70 to-yellow-500/70" />
          </div>
          {error && <div className="text-red-400 mb-2 text-center">{error}</div>}
          <div>
            <label className="mb-1 block font-semibold" htmlFor="email">{t.email}</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
          </div>
          <div>
            <label className="mb-1 block font-semibold" htmlFor="password">{t.password}</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-full bg-yellow-400 py-2 font-semibold text-black ring-1 ring-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.35)] transition hover:shadow-[0_0_26px_rgba(250,204,21,0.5)]">{loading ? t.submitting : t.submit}</button>
          <div className="flex flex-col items-center gap-2">
            <a href="/forgot-password" className="text-sm text-yellow-300 hover:underline">{t.forgotPassword}</a>
            <p className="text-center text-gray-300">{t.noAccount} <a href="/register" className="text-yellow-300 hover:underline">{t.register}</a></p>
          </div>
        </form>
      </div>
    </section>
  );
}
