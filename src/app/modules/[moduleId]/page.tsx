"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import toast, { Toaster } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Module {
  _id: string;
  titleEn: string;
  titleAm: string;
  contentEn: string;
  contentAm: string;
  videoUrl?: string;
  courseId: string;
  order?: number;
}

export default function ModuleLearningPage() {
  const { moduleId } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const [module, setModule] = useState<Module | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const t = {
    en: {
      loading: "Loading module...",
      error: "Failed to load module.",
      back: "Back",
      next: "Next Module",
      previous: "Previous Module",
      quiz: "Take Quiz",
      noNext: "No next module",
      noPrevious: "No previous module",
    },
    am: {
      loading: "ሞጁል በመጫን ላይ...",
      error: "ሞጁል መጫን አልተሳካም።",
      back: "ተመለስ",
      next: "የሚቀጥለው ሞጁል",
      previous: "ያለፈው ሞጁል",
      quiz: "ፈተና ይውሰዱ",
      noNext: "የሚቀጥለው ሞጁል የለም",
      noPrevious: "ያለፈው ሞጁል የለም",
    },
  }[lang];

  useEffect(() => {
    if (!moduleId) return;
    const moduleIdStr = Array.isArray(moduleId) ? moduleId[0] : moduleId;
    
    Promise.all([
      fetch(`/api/modules/${moduleIdStr}`).then(r => r.json()),
    ])
      .then(([moduleData]) => {
        if (moduleData.module) {
          const currentModule = moduleData.module;
          setModule(currentModule);
          
          // Fetch all modules for this course to enable navigation
          fetch(`/api/courses/modules?courseId=${currentModule.courseId}`)
            .then(r => r.json())
            .then(data => {
              setAllModules(data.modules || []);
            })
            .catch(() => {});
          
          // Check if module is already completed
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          if (token) {
            fetch("/api/progress/me", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then(r => r.json())
              .then(data => {
                const progress = data.progress?.find((p: any) => p.courseId === currentModule.courseId);
                if (progress?.completedModules?.includes(currentModule._id)) {
                  setIsCompleted(true);
                }
              })
              .catch(() => {});
          }
        } else {
          setError(t.error);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(t.error);
        setLoading(false);
      });
  }, [moduleId, t.error]);

  // Find current, next, and previous modules
  const currentIndex = module ? allModules.findIndex(m => m._id === module._id) : -1;
  const nextModule = currentIndex >= 0 && currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;

  const getVideoEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) return <div className="text-center py-16 text-xl text-gray-100">{t.loading}</div>;
  if (error || !module) return <div className="text-center text-red-400 py-16">{error || t.error}</div>;

  const embedUrl = getVideoEmbedUrl(module.videoUrl);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
      <Toaster position="top-right" />
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-yellow-500/10 via-yellow-300/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20rem] right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-yellow-400/15 via-amber-300/10 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => router.back()} className="rounded-full border border-white/15 bg-white/5 px-4 py-1 font-semibold text-gray-100 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300">← {t.back}</button>
        </div>

        {/* Module Content */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-xl">
          <h1 className="mb-6 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-3xl font-extrabold text-transparent">
            {lang === "en" ? module.titleEn : module.titleAm}
          </h1>

          {/* Video */}
          {embedUrl && (
            <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                src={embedUrl}
                title={lang === "en" ? module.titleEn : module.titleAm}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

          {/* Text Content */}
          <div className="prose prose-invert max-w-none prose-headings:text-yellow-300 prose-p:text-gray-200 prose-a:text-yellow-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-100 prose-ul:text-gray-200 prose-ol:text-gray-200 prose-li:text-gray-200 prose-img:rounded-xl prose-img:shadow-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {lang === "en" ? module.contentEn : module.contentAm}
            </ReactMarkdown>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/modules/${module._id}/quizzes`}
                className="rounded-full bg-yellow-400 px-6 py-2 font-semibold text-black ring-1 ring-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.35)] transition hover:shadow-[0_0_26px_rgba(250,204,21,0.5)]"
              >
                {t.quiz}
              </Link>
              {isCompleted && (
                <div className="rounded-full border border-green-500/50 bg-green-500/10 px-6 py-2 font-semibold text-green-300">
                  ✓ {lang === "en" ? "Module Completed" : "ሞጁል ተጠናቋል"}
                </div>
              )}
              <Link
                href={`/courses/${module.courseId}`}
                className="rounded-full border border-white/15 bg-white/5 px-6 py-2 font-semibold text-gray-100 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
              >
                {t.back} to Course
              </Link>
            </div>
            
            {/* Navigation */}
            {(prevModule || nextModule) && (
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
                {prevModule ? (
                  <Link
                    href={`/modules/${prevModule._id}`}
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-semibold text-gray-100 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
                  >
                    ← {t.previous}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 font-semibold text-gray-500 cursor-not-allowed">
                    ← {t.previous}
                  </div>
                )}
                
                {nextModule ? (
                  <Link
                    href={`/modules/${nextModule._id}`}
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-semibold text-gray-100 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
                  >
                    {t.next} →
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 font-semibold text-gray-500 cursor-not-allowed">
                    {t.next} →
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

