import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Minimal .env loader to ensure MONGO_URI/MONGODB_URI is available when running via tsx
function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^"|"$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (err) {
    console.warn("Could not load .env.local:", err);
  }
}

loadEnvLocal();

async function createAdmin() {
  // Dynamic import after env has been loaded
  const { default: dbConnect } = await import("@/utils/dbconnect");
  const { default: User } = await import("@/models/User");
  await dbConnect();

  const hashedPassword = await bcrypt.hash("Elshaday123", 10);

  const admin = await User.create({
    name: "Elshaday Dagne",
    email: "elshadaydagne57@gmail.com",
    password: hashedPassword,
    role: "admin",
  });

  console.log("✅ Admin created:", admin.email);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("❌ Error creating admin:", err);
  process.exit(1);
});
