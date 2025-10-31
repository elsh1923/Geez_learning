"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFound() {
  const { lang } = useLanguage();

  const t = {
    en: {
      title: "404",
      heading: "Page Not Found",
      message: "The page you're looking for doesn't exist.",
      goHome: "Go Home",
    },
    am: {
      title: "404",
      heading: "ገጽ አልተገኘም",
      message: "የሚፈልጉት ገጽ አልተገኘም።",
      goHome: "ወደ መነሻ ሂድ",
    },
  }[lang];

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-yellow-500/10 via-yellow-300/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20rem] right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-yellow-400/15 via-amber-300/10 to-transparent blur-3xl" />

      {/* Ge'ez backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden="true"
            className="pointer-events-none select-none font-extrabold tracking-tight text-yellow-300/15 mix-blend-overlay"
            style={{ fontSize: "clamp(10rem, 20vw + 8rem, 36rem)", lineHeight: 1 }}
          >
            ግእዝ
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-8xl font-extrabold text-transparent md:text-9xl">
          {t.title}
        </h1>
        <h2 className="mb-4 text-3xl font-bold text-gray-100 md:text-4xl">{t.heading}</h2>
        <p className="mb-8 text-gray-300">{t.message}</p>
        <Link
          href="/"
          className="inline-block animate-fade-up rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black shadow-[0_0_25px_rgba(250,204,21,0.45)] ring-1 ring-yellow-300 transition hover:shadow-[0_0_45px_rgba(250,204,21,0.6)] hover:brightness-110"
        >
          {t.goHome}
        </Link>
      </div>
    </section>
  );
}

