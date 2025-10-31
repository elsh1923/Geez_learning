"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 rounded-full backdrop-blur-md transition border ${
          lang === "en"
            ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.35)]"
            : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("am")}
        className={`px-3 py-1 rounded-full backdrop-blur-md transition border ${
          lang === "am"
            ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.35)]"
            : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
        }`}
      >
        AM
      </button>
    </div>
  );
}
