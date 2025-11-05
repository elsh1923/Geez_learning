"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Language = "en" | "am";

export default function Home() {
  const [showAI, setShowAI] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { lang } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Translation dictionary
  const texts = {
    en: {
      welcome: "Welcome to Agazian",
      subtitle:
        "Master Ge’ez with premium courses, AI assistance, and gamified learning.",
      getStarted: "Get Started",
      features: [
        { title: "Courses", desc: "Curated text and video lessons with clear progression." },
        { title: "AI Assistant", desc: "Ask questions, get instant guidance while learning." },
        { title: "Gamification", desc: "Earn points, climb the leaderboard, unlock badges." },
      ],
      aiTitle: "AI Assistant",
      aiSubtitle: "Ask me anything about your courses, modules, or quizzes!",
      aiPlaceholder: "Type your question...",
      aiSend: "Send",
    },
    am: {
      welcome: "እንኳን ወደ አጋዚያን በደህና መጡ",
      subtitle:
        "በከፍተኛ ጥራት ኮርሶች፣ AI እገዛ እና ጋሚፊኬሽን ግዕዝን በቀላሉ ይማሩ።",
      getStarted: "መጀመር",
      features: [
        { title: "ኮርሶች", desc: "የተዘጋጀ ጽሑፍ እና ቪዲዮ ትምህርቶች በተከታታይ ደረጃ." },
        { title: "AI አማራጭ", desc: "ጥያቄዎችዎን ይጠይቁ እና ፈጣን መመሪያ ይቀበሉ." },
        { title: "ጋሚፊኬሽን", desc: "ነጥቦች ያግኙ፣ ደረጃ ይድረሱ፣ መለያዎች ይክፈቱ." },
      ],
      aiTitle: "AI አማራጭ",
      aiSubtitle: "ስለ ኮርሶች፣ ሞጁሎች ወይም ጥያቄዎች ይጠይቁ!",
      aiPlaceholder: "ጥያቄዎን ያስገቡ...",
      aiSend: "ላክ",
    },
  } as const;

  const t = texts[lang];

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, lang }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: lang === "en" ? "Sorry, something went wrong." : "ይቅርታ፣ ችግር አጋጥሟል።" },
      ]);
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
      {/* Subtle radial glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-yellow-500/10 via-yellow-300/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20rem] right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-yellow-400/15 via-amber-300/10 to-transparent blur-3xl" />

      {/* Hero */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center">
        {/* Decorative Ge'ez letter background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              aria-hidden="true"
              className="pointer-events-none select-none font-extrabold tracking-tight text-yellow-300/20 mix-blend-overlay blur-[0.25px]"
              style={{ fontSize: "clamp(12rem, 24vw + 8rem, 42rem)", lineHeight: 1 }}
            >
              ግእዝ
            </span>
          </div>
        </div>

        {/* Centered content container to keep layout consistent */}
        <div className="w-full max-w-6xl px-0 mx-auto overflow-visible">
          <h1 className="mb-6 animate-fade-up bg-gradient-to-b from-gray-100 to-gray-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow sm:text-5xl md:text-6xl break-words leading-[1.2] pb-2 overflow-visible">
            {t.welcome}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl animate-fade-up text-lg text-gray-300 sm:text-xl [animation-delay:120ms]">
            {t.subtitle}
          </p>
          <Link
            href="/register"
            className="inline-block animate-fade-up rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black shadow-[0_0_25px_rgba(250,204,21,0.45)] ring-1 ring-yellow-300 transition hover:shadow-[0_0_45px_rgba(250,204,21,0.6)] hover:brightness-110 [animation-delay:200ms]"
          >
            {t.getStarted}
          </Link>

          {/* Feature Cards */}
          <div className="mt-24 grid w-full max-w-6xl grid-cols-1 gap-8 sm:grid-cols-3 mx-auto">
            {t.features.map((item, idx) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(250,204,21,0.15)] animate-fade-up"
                style={{ animationDelay: `${120 * (idx + 2)}ms` as any }}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-glow rounded-full bg-yellow-400/10 blur-2xl transition-opacity group-hover:opacity-100" />
                <h2 className="mb-2 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-xl font-bold text-transparent">
                  {item.title}
                </h2>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Chat Modal (local version for homepage) */}
      {showAI && (
        <div className="fixed bottom-28 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#0f0f0f]/90 p-4 text-gray-100 shadow-2xl backdrop-blur-lg">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-yellow-300">{t.aiTitle}</h3>
            <button
              onClick={() => setShowAI(false)}
              className="text-gray-400 transition hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <p className="mb-3 text-sm text-gray-400">{t.aiSubtitle}</p>
          <div className="mb-2 max-h-64 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-XL p-2 text-sm ${
                    msg.role === "user"
                      ? "bg-yellow-300 text-black"
                      : "bg-white/10 text-gray-100 border border-white/10"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <textarea
              className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              rows={2}
              placeholder={t.aiPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            />
            <button
              onClick={sendMessage}
              className="rounded-lg bg-yellow-400 px-3 py-1 font-semibold text-black shadow-[0_0_18px_rgba(250,204,21,0.45)] transition hover:shadow-[0_0_28px_rgba(250,204,21,0.6)]"
            >
              {t.aiSend}
            </button>
          </div>
        </div>
      )}

      {/* Floating AI Button (golden glow) */}
      <button
        onClick={() => setShowAI((s) => !s)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 text-black shadow-[0_0_30px_rgba(250,204,21,0.6)] ring-1 ring-yellow-300 transition hover:shadow-[0_0_45px_rgba(250,204,21,0.8)] animate-float"
        title={t.aiTitle}
      >
        🤖
      </button>
    </section>
  );
}
