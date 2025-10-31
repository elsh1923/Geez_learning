"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import toast, { Toaster } from "react-hot-toast";

interface Quiz {
  _id: string;
  questionEn: string;
  questionAm: string;
  optionsEn: string[];
  optionsAm: string[];
  correctAnswer: string;
}

export default function ModuleQuizzesPage() {
  const { moduleId } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<string>("");

  const t = {
    en: {
      title: "Quiz",
      loading: "Loading quizzes...",
      error: "Failed to load quizzes.",
      empty: "No quizzes for this module yet.",
      submit: "Submit Answers",
      back: "Back",
      correct: "Correct!",
      incorrect: "Incorrect",
      score: "Your Score",
      retry: "Try Again",
    },
    am: {
      title: "ፈተና",
      loading: "ፈተናዎችን በመጫን ላይ...",
      error: "ፈተናዎችን መጫን አልተሳካም።",
      empty: "ለዚህ ሞጁል እስካሁን ፈተና የለም።",
      submit: "መልሶች አስረክብ",
      back: "ተመለስ",
      correct: "ትክክል!",
      incorrect: "ስህተት",
      score: "የእኔ ነጥብ",
      retry: "ደግመው ይሞክሩ",
    },
  }[lang];

  useEffect(() => {
    if (!moduleId) return;
    const moduleIdStr = Array.isArray(moduleId) ? moduleId[0] : moduleId;
    setLoading(true);
    Promise.all([
      fetch(`/api/modules/quizzes?moduleId=${moduleIdStr}`).then(r => r.json()),
      fetch(`/api/modules/${moduleIdStr}`).then(r => r.json())
    ])
      .then(([quizzesData, moduleData]) => {
        setQuizzes(quizzesData.quizzes || []);
        setCourseId(moduleData.module?.courseId || "");
        setLoading(false);
      })
      .catch(() => {
        setError(t.error);
        setLoading(false);
      });
  }, [moduleId, t.error]);

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length !== quizzes.length) {
      toast.error(lang === "en" ? "Please answer all questions" : "እባክዎ ሁሉንም ጥያቄዎች ይመልሱ");
      return;
    }

    let correct = 0;
    quizzes.forEach(q => {
      if (selectedAnswers[q._id] === q.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
    
    // Calculate points: 10 points per correct answer
    const pointsEarned = correct * 10;
    const moduleIdStr = Array.isArray(moduleId) ? moduleId[0] : moduleId;
    const allCorrect = correct === quizzes.length;
    
    // Update progress - only mark module complete if ALL answers are correct
    if (courseId && moduleIdStr) {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        fetch("/api/progress/update", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courseId, moduleId: moduleIdStr, pointsEarned, markModuleComplete: allCorrect }),
        })
          .then(res => res.json())
          .then(data => {
            if (allCorrect) {
              const isAlreadyCompleted = data.alreadyCompleted;
              if (data.courseCompleted) {
                toast.success(lang === "en" ? `🎉 Perfect! All answers correct! ${isAlreadyCompleted ? "Module already completed." : `+${pointsEarned} points!`} Course completed!` : `🎉 ፍጹም! ሁሉም መልሶች ትክክል! ${isAlreadyCompleted ? "ሞጁል አስቀድሞ ተጠናቋል።" : `+${pointsEarned} ነጥቦች!`} ኮርስ ተጠናቋል!`);
              } else {
                toast.success(lang === "en" ? `🎉 Perfect! All answers correct! ${isAlreadyCompleted ? "Module already completed - no points awarded." : `+${pointsEarned} points!`} Module completed!` : `🎉 ፍጹም! ሁሉም መልሶች ትክክል! ${isAlreadyCompleted ? "ሞጁል አስቀድሞ ተጠናቋል - ነጥቦች አልተሰጡም።" : `+${pointsEarned} ነጥቦች!`} ሞጁል ተጠናቋል!`);
              }
            } else {
              toast.error(lang === "en" ? `You got ${correct}/${quizzes.length} correct. You need all correct to complete the module. No points awarded.` : `${correct}/${quizzes.length} ትክክል። ሞጁሉን ለማጠናቀቅ ሁሉም መልሶች ትክክል መሆን አለባቸው። ነጥቦች አልተሰጡም።`);
            }
          })
          .catch(() => {
            if (allCorrect) {
              toast.success(lang === "en" ? `You got ${correct}/${quizzes.length} correct!` : `${correct}/${quizzes.length} ትክክል!`);
            } else {
              toast.error(lang === "en" ? `You got ${correct}/${quizzes.length} correct. Try again!` : `${correct}/${quizzes.length} ትክክል። ደግመው ይሞክሩ!`);
            }
          });
      } else {
        if (allCorrect) {
          toast.success(lang === "en" ? `You got ${correct}/${quizzes.length} correct!` : `${correct}/${quizzes.length} ትክክል!`);
        } else {
          toast.error(lang === "en" ? `You got ${correct}/${quizzes.length} correct. Try again!` : `${correct}/${quizzes.length} ትክክል። ደግመው ይሞክሩ!`);
        }
      }
    }
  };

  if (loading) return <div className="text-center py-16 text-xl text-gray-100">{t.loading}</div>;
  if (error) return <div className="text-center text-red-400 py-16">{error}</div>;

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

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => router.back()} className="rounded-full border border-white/15 bg-white/5 px-4 py-1 font-semibold text-gray-100 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300">← {t.back}</button>
          <h1 className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">{t.title}</h1>
          {score !== null && (
            <div className="rounded-full border border-yellow-400/60 bg-yellow-400/20 px-4 py-1 text-yellow-300 font-semibold">
              {t.score}: {score}/{quizzes.length}
            </div>
          )}
        </div>

        {quizzes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-gray-300 text-center backdrop-blur-md">{t.empty}</div>
        ) : (
          <div className="space-y-6">
            {quizzes.map((q, idx) => {
              const isCorrect = submitted && selectedAnswers[q._id] === q.correctAnswer;
              const isIncorrect = submitted && selectedAnswers[q._id] !== q.correctAnswer && selectedAnswers[q._id];
              const showCorrect = submitted && selectedAnswers[q._id] !== q.correctAnswer;

              return (
                <div key={q._id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
                  <div className="mb-4 flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-gray-100">{idx + 1}. {lang === "en" ? q.questionEn : q.questionAm}</h2>
                    {submitted && isCorrect && (
                      <span className="ml-4 rounded-full bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-300">{t.correct}</span>
                    )}
                    {submitted && isIncorrect && (
                      <span className="ml-4 rounded-full bg-red-500/20 px-3 py-1 text-sm font-semibold text-red-300">{t.incorrect}</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {(lang === "en" ? q.optionsEn : q.optionsAm).map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q._id] === opt;
                      const isCorrectOpt = submitted && opt === q.correctAnswer;
                      const isWrongOpt = submitted && isSelected && opt !== q.correctAnswer;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => !submitted && setSelectedAnswers({ ...selectedAnswers, [q._id]: opt })}
                          disabled={submitted}
                          className={`w-full rounded-xl border p-4 text-left transition ${
                            isCorrectOpt
                              ? "border-green-500/50 bg-green-500/20 text-green-300"
                              : isWrongOpt
                              ? "border-red-500/50 bg-red-500/20 text-red-300"
                              : isSelected
                              ? "border-yellow-400/50 bg-yellow-400/20 text-yellow-300"
                              : "border-white/15 bg-white/5 text-gray-200 hover:border-yellow-400/30 hover:bg-yellow-400/10"
                          } ${submitted ? "cursor-default" : "cursor-pointer"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border combat${
                              isSelected ? "border-yellow-400 bg-yellow-400/20" : "border-white/30"
                            }`}>
                              {isSelected && <div className="h-2 w-2 rounded-full bg-yellow-400" />}
                            </div>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {showCorrect && (
                    <div className="mt-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                      {lang === "en" ? "Correct answer: " : "ትክክለኛ መልስ: "}{q.correctAnswer}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit Button */}
            {!submitted ? (
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  className="rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black ring-1 ring-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.35)] transition hover:shadow-[0_0_26px_rgba(250,204,21,0.5)]"
                >
                  {t.submit}
                </button>
              </div>
            ) : (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setSelectedAnswers({});
                    setScore(null);
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-2 font-semibold text-gray-100 transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
                >
                  {t.retry}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
