import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers"; // 从 next/headers 导入 cookies 方法

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  const isLoggedIn = token ? verifyToken(token) : false;

  return NextResponse.json({ isLoggedIn });
}
