import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || typeof token !== "string" || !newPassword) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    const { data: record, error: recordError } = await supabase
      .from("password_resets")
      .select("*")
      .eq("reset_token", token)
      .gt("expires_at", nowIso)
      .maybeSingle();

    if (recordError) {
      console.error("Token lookup error:", recordError);
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    if (!record) {
      return NextResponse.json(
        { error: "Token expired or invalid" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hash })
      .eq("id", record.user_id);

    if (updateError) {
      console.error("Password update error:", updateError);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabase
      .from("password_resets")
      .delete()
      .eq("id", record.id);

    if (deleteError) {
      console.error("Password reset delete error:", deleteError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
