import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Next.js useSearchParams automatically decodes URL params, but handle both cases
    // Try the token as-is first (already decoded by Next.js)
    let decodedToken = token;
    let resetTokenHash = crypto.createHash("sha256").update(decodedToken).digest("hex");
    
    console.log("🔑 Validating reset token");
    console.log("Token received (first 20 chars):", token.substring(0, 20) + "...");
    console.log("Computed hash (first 10 chars):", resetTokenHash.substring(0, 10) + "...");
    
    // Find user with valid reset token
    let user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }, // Token not expired
    });

    // If not found and token contains % (URL encoded), try decoding
    if (!user && token.includes('%')) {
      try {
        decodedToken = decodeURIComponent(token);
        resetTokenHash = crypto.createHash("sha256").update(decodedToken).digest("hex");
        console.log("Trying URL-decoded token, new hash:", resetTokenHash.substring(0, 10) + "...");
        user = await User.findOne({
          resetPasswordToken: resetTokenHash,
          resetPasswordExpires: { $gt: Date.now() },
        });
      } catch (e) {
        console.log("URL decode failed:", e);
      }
    }
    
    // If still not found, try encoding it (in case it was double-encoded)
    if (!user) {
      try {
        const encodedToken = encodeURIComponent(token);
        const encodedHash = crypto.createHash("sha256").update(encodedToken).digest("hex");
        console.log("Trying encoded token, hash:", encodedHash.substring(0, 10) + "...");
        user = await User.findOne({
          resetPasswordToken: encodedHash,
          resetPasswordExpires: { $gt: Date.now() },
        });
      } catch (e) {
        // Continue
      }
    }

    if (!user) {
      // Debug logging to help troubleshoot
      console.log("❌ Token validation failed");
      console.log("Token received (first 20 chars):", token.substring(0, 20) + "...");
      console.log("Token received (full length):", token.length, "characters");
      console.log("Computed hash (first 10 chars):", resetTokenHash.substring(0, 10) + "...");
      
      // Find all users with reset tokens for debugging
      const allUsersWithTokens = await User.find({ 
        resetPasswordToken: { $exists: true, $ne: null } 
      }).select("resetPasswordToken resetPasswordExpires email");
      
      if (allUsersWithTokens.length > 0) {
        console.log("📋 Users with reset tokens in database:");
        allUsersWithTokens.forEach((u: any) => {
          const storedHash = u.resetPasswordToken || "";
          const expires = u.resetPasswordExpires;
          const isExpired = expires ? new Date(expires).getTime() < Date.now() : true;
          console.log(`  - ${u.email}: hash=${storedHash.substring(0, 10)}..., expired=${isExpired}, expires=${expires}`);
          
          // Try to verify: what token would produce this hash? (can't reverse, but can check if our token's hash matches)
          const testHash = crypto.createHash("sha256").update(token).digest("hex");
          const matches = testHash === storedHash;
          console.log(`    Test: Does received token match this user? ${matches ? "✅ YES" : "❌ NO"}`);
        });
      } else {
        console.log("⚠️ No users with reset tokens found in database");
      }
      
      return NextResponse.json({ 
        message: "Invalid or expired reset token. The token may have been used already or expired. Please request a new password reset." 
      }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

