import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { sendMail } from "@/lib/mailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userError) throw userError;

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    const { error: insertError } = await supabase.from("password_resets").insert([
      {
        user_id: user.id,
        reset_token: token,
        expires_at: expires.toISOString(),
      },
    ]);

    if (insertError) throw insertError;

    const link = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    try {
      await sendMail(
        email,
        "Password Reset Request",
        `
          <p>Hello ${user.name},</p>
          <p>You requested a password reset. Click the link below:</p>
          <p><a href="${link}">Reset Password</a></p>
          <p>This link expires in 1 hour.</p>
        `
      );
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json({
        success: false,
        warning: "Password reset email could not be sent. Please try again later.",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
