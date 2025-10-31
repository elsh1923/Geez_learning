"use client";

import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface ProgressItem {
  _id: string;
  courseId?: string;
  moduleId?: string;
  completed?: boolean;
  points?: number;
  level?: number;
  badges?: string[];
  courseTitleEn?: string;
  courseTitleAm?: string;
  completedModules?: string[];
}

export default function MyProgressPage() {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { lang } = useLanguage();

  const t = {
    en: {
      title: "My Progress",
      loading: "Loading progress...",
      error: "Failed to load your progress.",
      completed: "Completed",
      totalPoints: "Total Points",
      activities: "Activities",
      noProgress: "No progress tracked yet.",
      course: "Course",
      module: "Module",
      inProgress: "In progress",
      pts: "pts",
    },
    am: {
      title: "የእኔ እድገት",
      loading: "እድገት በመጫን ላይ...",
      error: "እድገትዎን መጫን አልተሳካም።",
      completed: "ተጠናቋል",
      totalPoints: "ጠቅላላ ነጥብ",
      activities: "ክንውኖች",
      noProgress: "እስካሁን እድገት የለም።",
      course: "ኮርስ",
      module: "ሞጁል",
      inProgress: "በሂደት ላይ",
      pts: "ነጥብ",
    },
  }[lang];

  useEffect(() => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/progress/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => { setProgress(data.progress || []); setLoading(false); })
      .catch(() => { setError(t.error); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPoints = useMemo(() => progress.reduce((sum, p) => sum + (p.points || 0), 0), [progress]);
  const numCompleted = useMemo(() => progress.filter(p => (p.completedModules?.length || 0) > 0).length, [progress]);

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
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow backdrop-blur-md">
                <div className="text-gray-400">{t.completed}</div>
                <div className="text-2xl font-bold text-gray-100">{numCompleted}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow backdrop-blur-md">
                <div className="text-gray-400">{t.totalPoints}</div>
                <div className="text-2xl font-bold text-yellow-300">{totalPoints}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow backdrop-blur-md">
                <div className="text-gray-400">{t.activities}</div>
                <div className="text-2xl font-bold text-gray-100">{progress.length}</div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {progress.length === 0 ? (
                <div className="text-gray-400">{t.noProgress}</div>
              ) : (
                progress.map(item => (
                  <div key={item._id} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow backdrop-blur-md">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{t.course}: {lang === "en" ? (item.courseTitleEn || item.courseId || "-") : (item.courseTitleAm || item.courseId || "-")}</div>
                        {item.level && <div className="text-sm text-gray-400">Level {item.level}</div>}
                        {item.badges && item.badges.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.badges.map((badge, i) => (
                              <span key={i} className="rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-semibold text-yellow-300">{badge}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-300">{item.points || 0} {t.pts}</div>
                        <div className={(item.completedModules?.length || 0) > 0 ? "text-green-400" : "text-gray-400"}>{(item.completedModules?.length || 0) > 0 ? t.completed : t.inProgress}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
