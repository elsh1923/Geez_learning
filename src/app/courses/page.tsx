"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

interface Course {
  _id: string;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  thumbnail?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { lang } = useLanguage();

  const texts = {
    en: {
      heading: "Courses",
      searchPlaceholder: "Search courses...",
      loading: "Loading courses...",
      error: "Failed to load courses. Please try again later.",
      empty: "No courses found. Ask the admin to add some!",
      noResults: "No courses match your search.",
    },
    am: {
      heading: "ኮርሶች",
      searchPlaceholder: "ኮርሶችን ይፈልጉ...",
      loading: "ኮርሶችን በመጫን ላይ...",
      error: "ኮርሶች መጫን አልተሳካም። እባክዎን ደግመው ይሞክሩ።",
      empty: "ኮርሶች የሉም። አስተዳዳሪው እንዲጨምር ይጠይቁ!",
      noResults: "የተፈለገውን የሚያሟሉ ኮርሶች የሉም።",
    },
  } as const;
  const t = texts[lang];

  useEffect(() => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => {
        const coursesData = data.courses || [];
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        setLoading(false);
      })
      .catch(() => {
        setError(t.error);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter courses based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = courses.filter((course) => {
      const titleEn = course.titleEn?.toLowerCase() || "";
      const titleAm = course.titleAm?.toLowerCase() || "";
      const descEn = course.descriptionEn?.toLowerCase() || "";
      const descAm = course.descriptionAm?.toLowerCase() || "";
      
      return (
        titleEn.includes(query) ||
        titleAm.includes(query) ||
        descEn.includes(query) ||
        descAm.includes(query)
      );
    });
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
      <Toaster position="top-right" />
      {/* Ambient golden glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-yellow-500/10 via-yellow-300/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20rem] right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-yellow-400/15 via-amber-300/10 to-transparent blur-3xl" />

      {/* Decorative Ge'ez backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden="true"
            className="pointer-events-none select-none font-extrabold tracking-tight text-yellow-300/15 mix-blend-overlay blur-[0.25px]"
            style={{ fontSize: "clamp(12rem, 22vw + 8rem, 40rem)", lineHeight: 1 }}
          >
            ግእዝ
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-0 py-16">
        <div className="mb-10 text-center">
          <h1 className="animate-fade-up bg-gradient-to-b from-gray-100 to-gray-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow sm:text-5xl">
            {t.heading}
          </h1>
          <div className="mx-auto mt-3 h-px w-28 animate-glow rounded bg-gradient-to-r from-yellow-500/70 via-yellow-300/70 to-yellow-500/70" />
        </div>

        {/* Search Bar */}
        <div className="mb-8 mx-auto max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-gray-100 placeholder-gray-400 backdrop-blur-md transition-all focus:border-yellow-400/50 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xl animate-fade-up">{t.loading}</div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 animate-fade-up">{t.error}</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-lg text-gray-400 animate-fade-up">
            {courses.length === 0 ? t.empty : t.noResults}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {filteredCourses.map((course, idx) => (
              <div
                key={course._id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(250,204,21,0.15)] animate-fade-up"
                style={{ animationDelay: `${100 * (idx + 1)}ms` as any }}
              >
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                      if (!token) { toast.error(lang === "en" ? "Please login to enroll" : "እባክዎ መጀመሪያ ይግቡ"); return; }
                      const res = await fetch("/api/progress/enroll", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ courseId: course._id }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message || "Enroll failed");
                      toast.success(lang === "en" ? "Enrolled! Redirecting..." : "ተመዝግበዋል! በመቀጠል...");
                      setTimeout(() => window.location.href = "/dashboard", 1000);
                    } catch (e: any) {
                      toast.error(e.message || (lang === "en" ? "Enroll failed" : "መመዝገብ አልተሳካም"));
                    }
                  }}
                  className="absolute right-3 top-3 z-10 rounded-full border border-yellow-400/60 bg-yellow-400/20 px-3 py-1 text-sm font-semibold text-yellow-300 backdrop-blur hover:bg-yellow-400/30"
                >
                  {lang === "en" ? "Enroll" : "መመዝገብ"}
                </button>
                <Link href={`/courses/${course._id}`} className="block">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-glow rounded-full bg-yellow-400/10 blur-2xl transition-opacity group-hover:opacity-100" />
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={lang === "en" ? course.titleEn : course.titleAm}
                      className="h-44 w-full object-cover opacity-90 transition group-hover:opacity-100"
                    />
                  ) : (
                    <div className="h-44 w-full bg-gradient-to-r from-yellow-500/10 to-transparent" />
                  )}
                  <div className="p-6">
                    <h2 className="mb-2 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-xl font-bold text-transparent">
                      {lang === "en" ? course.titleEn : course.titleAm}
                    </h2>
                    <p className="text-gray-300 line-clamp-3 min-h-[3.5rem]">{lang === "en" ? course.descriptionEn : course.descriptionAm}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
