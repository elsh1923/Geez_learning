"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface LeaderboardItem {
  _id: string;
  userId?: { username?: string; email?: string } | string;
  points?: number;
}

export default function LeaderboardPage() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { lang } = useLanguage();

  const t = {
    en: { title: "Leaderboard", loading: "Loading leaderboard...", error: "Failed to load leaderboard.", empty: "No rankings yet." },
    am: { title: "የእድገት ሰንጠረዥ", loading: "ሰንጠረዡን በመጫን ላይ...", error: "ሰንጠረዡን መጫን አልተሳካም።", empty: "ደረጃ የለም።" },
  }[lang];

  useEffect(() => {
    setLoading(true);
    fetch("/api/progress/update/leaderboard")
      .then(res => res.json())
      .then(data => { setItems(data.leaderboard || []); setLoading(false); })
      .catch(() => { setError(t.error); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-yellow-500/10 via-yellow-300/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20rem] right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-yellow-400/15 via-amber-300/10 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="animate-fade-up bg-gradient-to-b from-gray-100 to-gray-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow sm:text-5xl">{t.title}</h1>
          <div className="mx-auto mt-3 h-px w-28 animate-glow rounded bg-gradient-to-r from-yellow-500/70 via-yellow-300/70 to-yellow-500/70" />
        </div>

        {loading ? (
          <div className="py-16 text-center text-xl animate-fade-up">{t.loading}</div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 animate-fade-up">{t.error}</div>
        ) : items.length === 0 ? (
          <div className="text-lg text-gray-400 animate-fade-up">{t.empty}</div>
        ) : (
          <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            {items.map((row, idx) => (
              <div key={row._id} className="flex items-center justify-between p-4 transition hover:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-black font-bold shadow-[0_0_12px_rgba(250,204,21,0.45)]">{idx + 1}</div>
                  <div>
                    <div className="font-semibold">
                      {typeof row.userId === "string" ? row.userId : (row.userId?.username || row.userId?.email || (lang === "en" ? "User" : "ተጠቃሚ"))}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {typeof row.userId === "string" ? "" : row.userId?.email}
                    </div>
                  </div>
                </div>
                <div className="text-primary font-bold text-yellow-300">{row.points || 0} pts</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
