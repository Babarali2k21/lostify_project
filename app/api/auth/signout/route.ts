import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "No session found" },
        { status: 200 }
      );
    }

    await supabase
      .from("sessions")
      .delete()
      .eq("token", token);

    const res = NextResponse.json({ success: true });

    res.cookies.set("session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0
    });

    return res;
  } catch (err) {
    console.error("signout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
