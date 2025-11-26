import nodemailer from "nodemailer";
import { google } from "googleapis";

export async function sendMail(to: string, subject: string, html: string) {
    const CLIENT_ID = process.env.GMAIL_CLIENT_ID!;
    const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET!;
    const REDIRECT_URI = "[https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)";
    const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN!;
    const SENDER_EMAIL = process.env.GMAIL_USER!;

    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN,
    });

    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: SENDER_EMAIL,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken?.token || "",
        },
    });

    await transporter.sendMail({
        from: `"Lost & Found" <${SENDER_EMAIL}>`,
        to,
        subject,
        html,
    });
}
