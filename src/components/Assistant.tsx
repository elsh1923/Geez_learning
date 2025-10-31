"use client";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Assistant() {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const { lang } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const me = { role: "user" as const, content: input };
    setMessages(prev => [...prev, me]);
    setInput("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: me.content, lang }),
      });
      if (!res.ok) {
        const errTxt = await res.text();
        console.error("AI error:", errTxt);
        throw new Error("ai-failed");
      }
      const data = await res.json();
      if (data.reply) setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: lang === "en" ? "Sorry, something went wrong." : "ይቅርታ፣ ችግር አጋጥሟል።" }]);
    }
  };

  return (
    <>
      <button
        onClick={() => setShow(!show)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 text-black shadow-[0_0_26px_rgba(250,204,21,0.6)] ring-1 ring-yellow-300 transition hover:shadow-[0_0_40px_rgba(250,204,21,0.8)]"
        title="AI Assistant"
      >
        🤖
      </button>
      {show && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#0f0f0f]/90 p-4 text-gray-100 shadow-2xl backdrop-blur-lg">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-yellow-300">AI Assistant</h3>
            <button onClick={() => setShow(false)} className="text-gray-400 transition hover:text-gray-200">✕</button>
          </div>
          <div className="mb-2 max-h-64 space-y-2 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-xl p-2 text-sm ${m.role === "user" ? "bg-yellow-300 text-black" : "bg-white/10 text-gray-100 border border-white/10"}`}>{m.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <textarea className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" rows={2} placeholder={lang === "en" ? "Type your question..." : "ጥያቄዎን ያስገቡ..."} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())} />
            <button onClick={send} className="rounded-lg bg-yellow-400 px-3 py-1 font-semibold text-black shadow-[0_0_18px_rgba(250,204,21,0.45)] transition hover:shadow-[0_0_28px_rgba(250,204,21,0.6)]">{lang === "en" ? "Send" : "ላክ"}</button>
          </div>
        </div>
      )}
    </>
  );
}
