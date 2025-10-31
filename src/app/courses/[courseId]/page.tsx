"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

interface Module {
  _id: string;
  titleEn: string;
  titleAm: string;
  contentEn: string;
  contentAm: string;
  order?: number;
}

interface Course {
  _id: string;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  thumbnail?: string;
}

export default function CourseModulesPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = {
    en: {
      loading: "Loading course...",
      error: "Failed to load course/module data. Please try again later.",
      notFound: "Course not found",
      back: "Back",
      enroll: "Enroll",
      viewModules: "View modules",
      modules: "Modules",
      noModules: "No modules found for this course yet.",
      enrollError: "Please login to enroll",
      enrolled: "Enrolled! Redirecting to dashboard...",
      enrollFailed: "Enroll failed",
    },
    am: {
      loading: "ኮርስ በመጫን ላይ...",
      error: "ኮርስ/ሞጁል መረጃ መጫን አልተሳካም። እባክዎን ደግመው ይሞክሩ።",
      notFound: "ኮርስ አልተገኘም",
      back: "ተመለስ",
      enroll: "መመዝገብ",
      viewModules: "ሞጁሎችን ይመልከቱ",
      modules: "ሞጁሎች",
      noModules: "ለዚህ ኮርስ እስካሁን ምንም ሞጁሎች አልተገኙም።",
      enrollError: "እባክዎ መጀመሪያ ይግቡ",
      enrolled: "ተመዝግበዋል! ወደ ዳሽቦርድ በመቀጠል...",
      enrollFailed: "መመዝገብ አልተሳካም",
    },
  }[lang];

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/courses/${courseId}`).then(r => r.json()),
      fetch(`/api/courses/modules?courseId=${courseId}`).then(r => r.json()),
    ])
      .then(([courseData, modulesData]) => {
        setCourse(courseData.course || null);
        setModules(modulesData.modules || []);
        setLoading(false);
      })
      .catch(() => {
        setError(t.error);
        setLoading(false);
      });
  }, [courseId, t.error]);

  if (loading) return <div className="text-center py-16 text-xl text-gray-100">{t.loading}</div>;
  if (error) return <div className="text-center text-red-400 py-16">{error}</div>;
  if (!course) return <div className="text-center text-gray-300 py-16">{t.notFound}</div>;

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
      <Toaster position="top-right" />
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

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-14">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => router.back()} className="rounded-full border border-white/15 bg-white/5 px-4 py-1 font-semibold text-gray-100 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300">← {t.back}</button>
          <div className="text-right">
            <h1 className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">{lang === "en" ? course.titleEn : course.titleAm}</h1>
          </div>
        </div>

        {/* Course Card */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="relative md:col-span-1">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={lang === "en" ? course.titleEn : course.titleAm} className="h-56 w-full object-cover md:h-full" />
              ) : (
                <div className="h-56 w-full bg-gradient-to-r from-yellow-500/10 to-transparent md:h-full" />
              )}
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-glow rounded-full bg-yellow-400/10 blur-2xl" />
            </div>
            <div className="md:col-span-2 p-6">
              <p className="text-gray-300 leading-relaxed">{lang === "en" ? course.descriptionEn : course.descriptionAm}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={async () => {
                    try {
                      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                      if (!token) { toast.error(t.enrollError); return; }
                      const courseIdStr = Array.isArray(courseId) ? courseId[0] : courseId;
                      const res = await fetch("/api/progress/enroll", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ courseId: courseIdStr }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message || t.enrollFailed);
                      toast.success(t.enrolled);
                      setTimeout(() => router.push("/dashboard"), 1000);
                    } catch (e: any) {
                      toast.error(e.message || t.enrollFailed);
                    }
                  }}
                  className="rounded-full bg-yellow-400 px-5 py-2 font-semibold text-black ring-1 ring-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.35)] transition hover:shadow-[0_0_26px_rgba(250,204,21,0.5)]"
                >
                  {t.enroll}
                </button>
                <Link href={`/courses/${courseId}/modules`} className="rounded-full border border-white/15 bg-white/5 px-5 py-2 font-semibold text-gray-100 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300">{t.viewModules}</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <h2 className="mb-4 text-2xl font-semibold">{t.modules}</h2>
        {modules.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-300">{t.noModules}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {modules.map((module) => (
              <Link
                href={`/modules/${module._id}/quizzes`}
                key={module._id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(250,204,21,0.15)]"
              >
                <div className="mb-2 flex items-baseline gap-3">
                  <span className="text-sm font-bold text-yellow-300">Module {module.order ?? ""}</span>
                  <span className="text-lg font-bold text-gray-100 group-hover:underline">{lang === "en" ? module.titleEn : module.titleAm}</span>
                </div>
                <p className="line-clamp-2 text-gray-300">{lang === "en" ? module.contentEn : module.contentAm}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
