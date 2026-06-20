import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Commission rates ─────────────────────────────────────────────────────────
const TIP_PLATFORM_CUT = 0.07;    // rire.ci takes 7% of tips
const TIP_COMEDIAN_SHARE = 0.93;  // comedian keeps 93% of tips
const SUB_PLATFORM_CUT = 0.15;    // rire.ci takes 15% of subscriptions
const SUB_COMEDIAN_SHARE = 0.85;  // comedian keeps 85% of subscriptions
const SUB_PRICE = 500;            // Fan Pass fixed price in FCFA

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  // Verify the request is genuinely from Paystack
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    console.error("Invalid Paystack webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  // Only handle successful charges
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const { reference, metadata, amount } = event.data;
  const type = metadata?.type;
  const comedianId = metadata?.comedian_id;

  console.log(`Webhook received: ${type} | reference: ${reference} | comedian: ${comedianId}`);

  if (type === "tip") {
    // Paystack sends amount in smallest unit (kobo/pesewa) — divide by 100 for FCFA
    const grossAmount = Math.round(amount / 100);
    const platformCut = Math.round(grossAmount * TIP_PLATFORM_CUT);
    const comedianNet = Math.round(grossAmount * TIP_COMEDIAN_SHARE);

    const { error } = await supabase
      .from("tips")
      .update({
        status: "completed",
        platform_cut: platformCut,
        comedian_net: comedianNet,
      })
      .eq("paystack_reference", reference);

    if (error) {
      console.error("Failed to update tip:", error.message);
    } else {
      console.log(`Tip confirmed: gross=${grossAmount}F | platform=${platformCut}F (7%) | comedian=${comedianNet}F (93%)`);
    }
  }

  if (type === "subscription") {
    const grossAmount = SUB_PRICE;
    const platformCut = Math.round(grossAmount * SUB_PLATFORM_CUT);
    const comedianNet = Math.round(grossAmount * SUB_COMEDIAN_SHARE);

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        platform_cut: platformCut,
        comedian_net: comedianNet,
      })
      .eq("paystack_reference", reference);

    if (error) {
      console.error("Failed to update subscription:", error.message);
    } else {
      console.log(`Subscription confirmed: gross=${grossAmount}F | platform=${platformCut}F (15%) | comedian=${comedianNet}F (85%)`);
    }
  }

  return NextResponse.json({ received: true });
}