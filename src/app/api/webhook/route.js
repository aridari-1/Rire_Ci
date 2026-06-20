import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  // Verify the request is genuinely from Paystack
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Only handle successful charges
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const { reference, metadata } = event.data;
  const type = metadata?.type;
  const comedianId = metadata?.comedian_id;

  if (type === "tip") {
    await supabase
      .from("tips")
      .update({ status: "completed" })
      .eq("paystack_reference", reference);
  }

  if (type === "subscription") {
    await supabase
      .from("subscriptions")
      .update({ status: "active" })
      .eq("paystack_reference", reference);
  }

  return NextResponse.json({ received: true });
}