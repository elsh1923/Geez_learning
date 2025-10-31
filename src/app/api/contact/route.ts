import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ message: "Name, email and message are required" }, { status: 400 });
    }

    // Optional: send via Resend if configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const CONTACT_TO = process.env.CONTACT_TO; // destination email
    // Always use Resend's default domain (no verification needed)
    // If you want to use a custom domain, verify it first at https://resend.com/domains
    const CONTACT_FROM = "Agazian Contact <onboarding@resend.dev>";

    if (RESEND_API_KEY && CONTACT_TO) {
      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: CONTACT_FROM,
            to: [CONTACT_TO],
            subject: `New contact message from ${name}`,
            text: `From: ${name} <${email}>\n\n${message}`,
            reply_to: email, // Allow replying directly to the user
          }),
        });

        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({ message: "Unknown error" }));
          console.error("Resend error:", errorData);
          // If domain not verified, log but don't fail - fall through to success
          if (errorData.message?.includes("domain is not verified")) {
            console.log("Domain not verified. Please verify your domain at https://resend.com/domains or use onboarding@resend.dev");
          }
        }
      } catch (err) {
        console.error("Resend API error:", err);
        // Fall through to success so user isn't blocked
      }
    } else {
      console.log("Contact message:", { name, email, message });
    }

    return NextResponse.json({ message: "Message sent" });
  } catch (err) {
    console.error("Contact endpoint error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
