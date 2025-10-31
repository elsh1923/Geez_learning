"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Course {
  _id: string;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  thumbnail?: string;
  firstModuleId?: string;
}

export default function DashboardPage() {
  const [name, setName] = useState<string>("User");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("user");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  const t = {
    en: {
      welcome: (n: string) => `Welcome, ${n}`,
      profile: "Profile",
      email: "Email",
      role: "Role",
      quickLinks: "Quick Links",
      courses: "Courses",
      coursesDesc: "Browse courses and continue learning",
      progress: "My Progress",
      progressDesc: "Track your progress and points",
      leaderboard: "Leaderboard",
      leaderboardDesc: "See top learners and rankings",
      enrolled: "My Enrolled Courses",
      startLearning: "Start Learning",
      continueLearning: "Continue Learning",
      noEnrolled: "You haven't enrolled in any courses yet.",
    },
    am: {
      welcome: (n: string) => `እንኳን ደህና መጣችሁ፣ ${n}`,
      profile: "መገለጫ",
      email: "ኢሜይል",
      role: "ሚና",
      quickLinks: "ፈጣን አገናኞች",
      courses: "ኮርሶች",
      coursesDesc: "ኮርሶችን ይቃኙ እና ትምህርትዎን ይቀጥሉ",
      progress: "የእኔ እድገት",
      progressDesc: "እድገትዎን እና ነጥቦችን ይከታተሉ",
      leaderboard: "ደረጃ ሰንጠረዥ",
      leaderboardDesc: "ከፍተኛ ተማሪዎችን ይመልከቱ",
      enrolled: "የተመዘገቡ ኮርሶቼ",
      startLearning: "መማር ይጀምሩ",
      continueLearning: "መማር ይቀጥሉ",
      noEnrolled: "እስካሁን ምንም ኮርስ አልመዘገቡም።",
    },
  }[lang];

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setName(u?.name?.split(" ")[0] || "User");
        setEmail(u?.email || "");
        setRole((u?.role || "user").toUpperCase());
      } catch {}
    }

    // Fetch enrolled courses
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      fetch("/api/progress/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          const courseIds = (data.progress || []).map((p: any) => p.courseId).filter(Boolean);
          if (courseIds.length > 0) {
            return Promise.all(courseIds.map((id: string) => 
              Promise.all([
                fetch(`/api/courses/${id}`).then(r => r.json()).catch(() => ({ course: null })),
                fetch(`/api/courses/modules?courseId=${id}`).then(r => r.json()).catch(() => ({ modules: [] }))
              ]).then(([courseData, modulesData]) => {
                // Filter out courses that don't exist (deleted)
                if (!courseData.course) return null;
                return {
                  ...courseData.course,
                  firstModuleId: modulesData.modules?.[0]?._id
                };
              })
            ));
          }
          return [];
        })
        .then(results => {
          // Filter out null entries (deleted courses)
          setEnrolledCourses(results.filter((course: any) => course !== null));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-gray-100">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-yellow-500/10 via-yellow-300/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20rem] right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-yellow-400/15 via-amber-300/10 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="animate-fade-up bg-gradient-to-b from-gray-100 to-gray-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow sm:text-5xl">{t.welcome(name)}</h1>
          <div className="mx-auto mt-3 h-px w-28 animate-glow rounded bg-gradient-to-r from-yellow-500/70 via-yellow-300/70 to-yellow-500/70" />
        </div>

        {/* Profile Card */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="col-span-1 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="text-gray-400 mb-1">{t.profile}</div>
            <div className="text-2xl font-bold text-gray-100">{name}</div>
            <div className="text-gray-300"><span className="text-gray-400">{t.email}:</span> {email || "-"}</div>
            <div className="mt-2 inline-block rounded bg-yellow-400/15 px-2 py-0.5 text-sm font-semibold text-yellow-300 ring-1 ring-yellow-300/30">{t.role}: {role}</div>
          </div>
          {/* Quick Links */}
          <Link href="/courses" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(250,204,21,0.15)]">
            <div className="font-semibold text-lg bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">{t.courses}</div>
            <div className="text-gray-300">{t.coursesDesc}</div>
          </Link>
          <Link href="/progress/me" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(250,204,21,0.15)]">
            <div className="font-semibold text-lg bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">{t.progress}</div>
            <div className="text-gray-300">{t.progressDesc}</div>
          </Link>
          <Link href="/progress/leaderboard" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(250,204,21,0.15)]">
            <div className="font-semibold text-lg bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">{t.leaderboard}</div>
            <div className="text-gray-300">{t.leaderboardDesc}</div>
          </Link>
        </div>

        {/* Enrolled Courses */}
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-semibold">{t.enrolled}</h2>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : enrolledCourses.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-300">
              {t.noEnrolled} <Link href="/courses" className="text-yellow-300 hover:underline">Browse courses</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {enrolledCourses.map((course) => (
                <Link
                  key={course._id}
                  href={course.firstModuleId ? `/modules/${course.firstModuleId}` : `/courses/${course._id}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(250,204,21,0.15)]"
                >
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={lang === "en" ? course.titleEn : course.titleAm} className="h-32 w-full object-cover opacity-90 transition group-hover:opacity-100" />
                  ) : (
                    <div className="h-32 w-full bg-gradient-to-r from-yellow-500/10 to-transparent" />
                  )}
                  <div className="p-4">
                    <h3 className="mb-2 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-lg font-bold text-transparent">{lang === "en" ? course.titleEn : course.titleAm}</h3>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-300">{lang === "en" ? course.descriptionEn : course.descriptionAm}</p>
                    <div className="rounded-full bg-yellow-400 px-4 py-1 text-center text-sm font-semibold text-black">{t.startLearning}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
