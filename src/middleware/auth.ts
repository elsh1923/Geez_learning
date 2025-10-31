import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthUser {
  _id: string;           // MongoDB user ID
  role: "admin" | "user";
}

export async function verifyAuth(req: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Normalize userId to _id
    return {
      _id: decoded.userId || decoded._id,
      role: decoded.role,
    } as AuthUser;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
