"use client";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (newLang: "en" | "am") => {
    setLang(newLang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-gray-200 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
        aria-label="Language selector"
      >
        {/* Globe Icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 8.716 6.747M12 3a8.997 8.997 0 0 0-8.716 6.747m0 0A9.015 9.015 0 0 0 3 12c0 1.921.682 3.68 1.816 5.047M5.284 9.747a9.008 9.008 0 0 1 0 4.506m13.432 0a9.008 9.008 0 0 0 0-4.506m0 0A9.015 9.015 0 0 1 21 12c0 1.921-.682 3.68-1.816 5.047"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg border border-white/10 bg-[#0b0b0b]/95 backdrop-blur-md shadow-xl">
          <button
            onClick={() => handleLanguageChange("en")}
            className={`w-full px-4 py-2 text-left text-sm transition first:rounded-t-lg ${
              lang === "en"
                ? "bg-yellow-400/20 text-yellow-300"
                : "text-gray-200 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">English</span>
              {lang === "en" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4 text-yellow-400"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
          </button>
          <button
            onClick={() => handleLanguageChange("am")}
            className={`w-full px-4 py-2 text-left text-sm transition last:rounded-b-lg ${
              lang === "am"
                ? "bg-yellow-400/20 text-yellow-300"
                : "text-gray-200 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">አማርኛ</span>
              {lang === "am" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4 text-yellow-400"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
