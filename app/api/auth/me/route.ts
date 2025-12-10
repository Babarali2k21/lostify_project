import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { data: session } = await supabase
      .from("sessions")
      .select("user_id, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, phone, email_verified, verified_at, created_at, student_id")
      .eq("id", session.user_id)
      .maybeSingle();

    if (error) {
      console.error("me fetch user error:", error);
      return NextResponse.json({ user: null }, { status: 200 });
    }

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("me error:", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
