import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Commission rates ─────────────────────────────────────────────────────────
const TIP_COMEDIAN_SHARE = 0.93;  // comedian keeps 93% of tips
const SUB_COMEDIAN_SHARE = 0.85;  // comedian keeps 85% of subscriptions
const SUB_PRICE = 500;            // Fan Pass fixed price in FCFA

export async function POST(request) {
  const { comedianId } = await request.json();

  if (!comedianId) {
    return NextResponse.json({ error: "Missing comedianId" }, { status: 400 });
  }

  // Define bi-weekly period (last 14 days)
  const now = new Date();
  const periodEnd = now.toISOString().split("T")[0];
  const periodStart = new Date(now.setDate(now.getDate() - 14))
    .toISOString().split("T")[0];

  // Check no payout already exists for this period
  const { data: existingPayout } = await supabase
    .from("payouts")
    .select("id")
    .eq("comedian_id", comedianId)
    .eq("period_start", periodStart)
    .single();

  if (existingPayout) {
    return NextResponse.json({ error: "Un versement existe déjà pour cette période." }, { status: 400 });
  }

  // Get completed tips in this period
  const { data: tips } = await supabase
    .from("tips")
    .select("amount, comedian_net")
    .eq("comedian_id", comedianId)
    .eq("status", "completed")
    .gte("created_at", periodStart)
    .lte("created_at", periodEnd);

  // Get subscriptions activated in this period
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("comedian_net")
    .eq("comedian_id", comedianId)
    .eq("status", "active")
    .gte("created_at", periodStart)
    .lte("created_at", periodEnd);

  // Calculate amounts
  const tipsGross = tips?.reduce((sum, t) => sum + t.amount, 0) || 0;

  // Use stored comedian_net if available, otherwise calculate
  const tipsNet = tips?.reduce((sum, t) => {
    return sum + (t.comedian_net || Math.round(t.amount * TIP_COMEDIAN_SHARE));
  }, 0) || 0;

  const subsCount = subs?.length || 0;
  const subsGross = subsCount * SUB_PRICE;

  const subsNet = subs?.reduce((sum, s) => {
    return sum + (s.comedian_net || Math.round(SUB_PRICE * SUB_COMEDIAN_SHARE));
  }, 0) || 0;

  const totalNet = tipsNet + subsNet;

  if (totalNet === 0) {
    return NextResponse.json({
      error: "Aucun revenu à verser pour cette période."
    }, { status: 400 });
  }

  // Create payout record
  const { data: payout, error } = await supabase
    .from("payouts")
    .insert({
      comedian_id: comedianId,
      period_start: periodStart,
      period_end: periodEnd,
      tips_gross: tipsGross,
      tips_net: tipsNet,
      subs_gross: subsGross,
      subs_net: subsNet,
      total_net: totalNet,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`Payout created for comedian ${comedianId}:
    Period: ${periodStart} → ${periodEnd}
    Tips: ${tipsGross}F gross → ${tipsNet}F net (93%)
    Subs: ${subsGross}F gross → ${subsNet}F net (85%)
    Total to pay: ${totalNet}F`);

  return NextResponse.json({
    payout,
    breakdown: {
      period: { start: periodStart, end: periodEnd },
      tips: { gross: tipsGross, net: tipsNet, rate: "93%" },
      subscriptions: { count: subsCount, gross: subsGross, net: subsNet, rate: "85%" },
      totalNet,
    }
  });
}