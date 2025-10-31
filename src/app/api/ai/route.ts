import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import dbConnect from "@/utils/dbconnect";

interface AIRequestBody {
  message: string;
  lang?: "en" | "am";
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Parse body
    const body: AIRequestBody = await req.json();
    const { message, lang } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    // OpenAI client
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Site context to ground answers about this app
    const SITE_CONTEXT_EN = `
You are the in-app AI assistant for the Agazian Ge'ez learning website.
Answer only about this website and its features. If a question is unrelated, politely say you don't know.

Main pages and routes:
- Home: "/" — hero, features (Courses, AI Assistant, Gamification), dark/golden theme
- Courses: "/courses" — list of admin-uploaded courses
- Course modules: "/courses/[courseId]" and "/courses/[courseId]/modules" — modules for a course
- Module quizzes: "/modules/[moduleId]/quizzes" — interactive quizzes
- My progress: "/progress/me" — user dashboard and progress
- Leaderboard: "/progress/leaderboard" — rankings, points
- Login: "/login" and Register: "/register" — authentication
- Contact: "/contact" — send a message; uses Resend if configured
- Language: English/Amharic toggle at top-right; selection persists
- Global floating AI button on all pages

Behavior:
- Styling uses dark/golden glassmorphism, animations.
- If asked how to navigate, provide the route paths.
- Keep answers concise and helpful. If code is requested, provide high-level guidance (no long snippets).
`;

    const SITE_CONTEXT_AM = `
እርስዎ የአጋዚያን ግእዝ መማሪያ ድር ጣቢያ ውስጣዊ ኤ.አይ ረዳት ናቸው። ስለዚህ ድር ጣቢያ ብቻ ይመልሱ፤ ካልተገናኘ ጥያቄ ከሆነ “አላውቅም” ይሉ።

ዋና ገፆችና መንገዶች:
- መነሻ: "/" — ሄሮ፣ ባህሪያት (ኮርሶች፣ ኤ.አይ ረዳት፣ ጌሚፊኬሽን)
- ኮርሶች: "/courses" — በአድሚን የተጨመሩ ኮርሶች
- የኮርስ ሞጁሎች: "/courses/[courseId]" እና "/courses/[courseId]/modules"
- የሞጁል ፈተናዎች: "/modules/[moduleId]/quizzes"
- የእኔ እድገት: "/progress/me"
- ደረጃ ሰንጠረዥ: "/progress/leaderboard"
- መግቢያ: "/login" እና መመዝገቢያ: "/register"
- ያነጋግሩን: "/contact" — መልዕክት ላክ
- ቋንቋ: እንግሊዝኛ/አማርኛ መቀየሪያ ከላይ ቀኝ
- ኤ.አይ አዝራር በሁሉም ገጾች

አቀራረብ:
- ጥቁር/ወርቃማ ገጽታ፣ ግላስሞርፊዝም፣ እንቅስቃሴዎች።
- መንገዶችን በቀጥታ ይግለጹ። መልሶች አጭርና ጠቃሚ ይሁኑ።
`;

    // System prompt based on selected language, grounded with site context
    const systemPrompt =
      lang === "am"
        ? `${SITE_CONTEXT_AM}`
        : `${SITE_CONTEXT_EN}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 400,
      top_p: 1,
    });

    const reply = completion.choices?.[0]?.message?.content || 
                  (lang === "am" ? "አልተረዳሁም።" : "Sorry, I couldn’t generate a response.");

    return NextResponse.json({ role: "assistant", reply });
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
