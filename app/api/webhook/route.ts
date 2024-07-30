import { db } from "@/db";
import { userTable } from "@/db/schema";
import { Webhook } from "@lemonsqueezy/lemonsqueezy.js";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export async function POST(request: Request) {
  //   if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
  // if (false) {
  //   return new Response("Lemon Squeezy Webhook Secret not set in .env", {
  //     status: 500,
  //   });
  // }

  // // First, make sure the request is from Lemon Squeezy.
  // const rawBody = await request.text();
  // const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  // const hmac = crypto.createHmac("sha256", secret);
  // const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  // const signature = Buffer.from(
  //   request.headers.get("X-Signature") ?? "",
  //   "utf8"
  // );

  // if (!crypto.timingSafeEqual(digest, signature)) {
  //   return new Response("Invalid signature", { status: 400 });
  // }

  const resJson = await request.json();
  const userIdFromWebhook = resJson.meta.custom_data.userId as string;
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, userIdFromWebhook),
  });
  if (user) {
    // user.notificationsCount += 10;
  }
  console.log({ userIdFromWebhook });
  console.log(resJson);
  return new Response("OK", { status: 200 });
}
