import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    const { data: record } = await supabase
      .from("email_verification_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (!record) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await supabase
      .from("users")
      .update({ email_verified: true })
      .eq("id", record.user_id);

    await supabase
      .from("email_verification_tokens")
      .delete()
      .eq("id", record.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
