import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendMail } from "@/lib/mailer";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
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
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.email_verified) return NextResponse.json({ message: "Email already verified" });

    const token = uuidv4();
    const expires_at = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

    const { error: tokenError } = await supabase.from("email_verification_tokens").insert([
      { user_id: user.id, token, expires_at }
    ]);

    if (tokenError) throw tokenError;

    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    try {
      await sendMail(
        user.email,
        "Verify Your Email",
        `
          <p>Hello ${user.name},</p>
          <p>Please verify your email by clicking the link below:</p>
          <p><a href="${verifyLink}">Verify Email</a></p>
          <p>This link expires in 1 hour.</p>
        `
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return NextResponse.json({ warning: "Could not send verification email" });
    }

    return NextResponse.json({ message: "Verification email resent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
