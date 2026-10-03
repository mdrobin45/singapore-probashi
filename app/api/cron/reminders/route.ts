import { NextRequest, NextResponse } from "next/server";
import { getReminderCronKey, sendDueReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

// Called every few minutes by an external scheduler (e.g. cron-job.org) with
// ?key=<reminder cron key from Admin → Settings>, or by Vercel Cron with
// "Authorization: Bearer <CRON_SECRET>" when that env var is set.
async function handle(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const authorized =
    (cronSecret && auth === `Bearer ${cronSecret}`) ||
    (key && key === (await getReminderCronKey()));
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await sendDueReminders();
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
