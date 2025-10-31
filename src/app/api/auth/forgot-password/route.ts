import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json({ message: "If that email exists, we've sent a password reset link" }, { status: 200 });
    }

    // Clear any existing reset tokens first (invalidate old tokens)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Generate new reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Set new token and expiration (1 hour from now)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    
    // Save and verify it was saved
    await user.save();
    
    // Verify token was saved correctly
    const verifyUser = await User.findById(user._id).select("resetPasswordToken resetPasswordExpires");
    if (!verifyUser || !verifyUser.resetPasswordToken) {
      console.error("❌ Failed to save reset token to database");
      return NextResponse.json({ message: "Failed to generate reset token. Please try again." }, { status: 500 });
    }
    
    console.log("✅ Reset token saved successfully for:", user.email);
    console.log("Plain token (first 20 chars):", resetToken.substring(0, 20) + "...");
    console.log("Token hash (first 10 chars):", verifyUser.resetPasswordToken.substring(0, 10) + "...");
    console.log("Expires at:", verifyUser.resetPasswordExpires);

    // Generate reset URL - use encodeURIComponent to ensure proper URL encoding
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${encodeURIComponent(resetToken)}`;

    // Send email via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    let emailSent = false;
    
    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Agazian Contact <onboarding@resend.dev>",
            to: [user.email],
            subject: "Reset Your Password - Agazian",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #facc15;">Reset Your Password</h2>
                <p>Hello ${user.name},</p>
                <p>You requested to reset your password for your Agazian account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #facc15; color: #000; text-decoration: none; border-radius: 9999px; font-weight: bold; margin: 20px 0;">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">Best regards,<br>The Agazian Team</p>
              </div>
            `,
            text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, please ignore this email.`,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json().catch(() => ({ message: "Unknown error" }));
          console.error("Resend API error:", errorData);
          emailSent = false;
        } else {
          const emailData = await emailResponse.json().catch(() => ({}));
          console.log("✅ Password reset email sent successfully to:", user.email);
          emailSent = true;
        }
      } catch (emailError: any) {
        console.error("Email send error:", emailError);
        emailSent = false;
      }
    }

    // Always return reset URL so user can use it even if email fails
    // This works for all users without domain verification requirements
    return NextResponse.json({
      message: emailSent
        ? "If that email exists, we've sent a password reset link. You can also use the link below if you don't receive the email."
        : "Password reset link generated. Use the link below to reset your password.",
      resetUrl: resetUrl, // Always return URL for direct use
      emailSent,
      tokenPreview: resetToken.substring(0, 20) + "...", // For debugging - shows first 20 chars of plain token
    }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

