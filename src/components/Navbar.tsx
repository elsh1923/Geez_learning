"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

const Navbar = () => {
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLanguage();

  const t = {
    en: {
      home: "Home",
      courses: "Courses",
      dashboard: "Dashboard",
      leaderboard: "Leaderboard",
      contact: "Contact",
      login: "Login",
      register: "Register",
      logout: "Logout",
      hi: "Hi",
      brand: "Agazian",
    },
    am: {
      home: "መነሻ",
      courses: "ኮርሶች",
      dashboard: "ዳሽቦርድ",
      leaderboard: "ደረጃ ሰንጠረዥ",
      contact: "ያነጋግሩን",
      login: "መግባት",
      register: "መመዝገብ",
      logout: "መውጣት",
      hi: "ሰላም",
      brand: "አጋዚያን",
    },
  }[lang];

  const checkUser = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      setUser(token && userStr ? JSON.parse(userStr) : null);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Re-check user state when pathname changes (e.g., after login/register)
  useEffect(() => {
    checkUser();
  }, [pathname]);

  // On login/register navigation restore user (in case page doesn't fully reload)
  useEffect(() => {
    const cb = () => {
      checkUser();
    };
    window.addEventListener("storage", cb);
    // Also listen for focus events (when user returns to tab)
    window.addEventListener("focus", checkUser);
    return () => {
      window.removeEventListener("storage", cb);
      window.removeEventListener("focus", checkUser);
    };
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };
  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md animate-fade-up">
      <div className="w-full grid grid-cols-3 items-center border-b border-white/10 bg-[#0b0b0b]/80 px-6 py-3 shadow-[0_0_20px_rgba(255,215,0,0.06)]">
        {/* Left: Brand */}
        <div className="flex items-center">
          <Link href="/" className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent whitespace-nowrap">
            {t.brand}
          </Link>
        </div>

        {/* Center: Primary Nav Links */}
        <div className="flex items-center justify-center gap-6 md:gap-8">
          <Link href="/" className="relative px-2 py-2 text-[15px] md:text-[16px] font-semibold tracking-wide text-gray-100 transition hover:text-yellow-300 hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.35)] after:absolute after:left-1/2 after:-bottom-0.5 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded after:bg-yellow-400 after:transition-all hover:after:w-full">{t.home}</Link>
          <Link href="/courses" className="relative px-2 py-2 text-[15px] md:text-[16px] font-semibold tracking-wide text-gray-100 transition hover:text-yellow-300 hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.35)] after:absolute after:left-1/2 after:-bottom-0.5 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded after:bg-yellow-400 after:transition-all hover:after:w-full">{t.courses}</Link>
          {user && user.role !== "admin" && (
            <Link href="/dashboard" className="relative px-2 py-2 text-[15px] md:text-[16px] font-semibold tracking-wide text-gray-100 transition hover:text-yellow-300 hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.35)] after:absolute after:left-1/2 after:-bottom-0.5 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded after:bg-yellow-400 after:transition-all hover:after:w-full">{t.dashboard}</Link>
          )}
          <Link href="/progress/leaderboard" className="relative px-2 py-2 text-[15px] md:text-[16px] font-semibold tracking-wide text-gray-100 transition hover:text-yellow-300 hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.35)] after:absolute after:left-1/2 after:-bottom-0.5 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded after:bg-yellow-400 after:transition-all hover:after:w-full">{t.leaderboard}</Link>
          <Link href="/contact" className="relative px-2 py-2 text-[15px] md:text-[16px] font-semibold tracking-wide text-gray-100 transition hover:text-yellow-300 hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.35)] after:absolute after:left-1/2 after:-bottom-0.5 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded after:bg-yellow-400 after:transition-all hover:after:w-full">{t.contact}</Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="relative px-2 py-2 text-[15px] md:text-[16px] font-semibold tracking-wide text-yellow-300 transition hover:text-yellow-200 after:absolute after:left-1/2 after:-bottom-0.5 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded after:bg-yellow-400 after:transition-all hover:after:w-full">Admin</Link>
          )}
        </div>

        {/* Right: Language + Auth */}
        <div className="flex items-center justify-end">
          <LanguageToggle />
          {user ? (
            <>
              <span className="ml-4 text-gray-200">{t.hi}, {user?.name?.split(" ")[0] || (lang === "en" ? "User" : "ተጠቃሚ")}</span>
              <button onClick={handleLogout} className="ml-4 rounded-full border border-white/15 bg-white/5 px-4 py-1 font-semibold text-gray-100 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300">
                {t.logout}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="ml-4 rounded-full border border-white/15 bg-white/5 px-4 py-1 font-semibold text-gray-100 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300">
                {t.login}
              </Link>
              <Link href="/register" className="ml-2 rounded-full bg-yellow-400 px-4 py-1 font-semibold text-black ring-1 ring-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.35)] transition hover:shadow-[0_0_26px_rgba(250,204,21,0.5)]">
                {t.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
