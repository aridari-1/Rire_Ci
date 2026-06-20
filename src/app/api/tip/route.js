import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const { email, amount, comedianId, comedianName } = await request.json();

  if (!email || !amount || !comedianId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Initialize Paystack transaction
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      // Paystack uses kobo/cents — multiply by 100
      // For XOF (FCFA) Paystack accepts the amount directly in the lowest unit
      amount: amount * 100,
      currency: "XOF", // change to XOF once your Paystack account is approved for Côte d'Ivoire
      metadata: {
        comedian_id: comedianId,
        comedian_name: comedianName,
        type: "tip",
      },
    }),
  });

  const data = await res.json();

  if (!data.status) {
    return NextResponse.json({ error: data.message }, { status: 400 });
  }

  // Save a pending tip to Supabase
  await supabase.from("tips").insert({
    comedian_id: comedianId,
    amount,
    status: "pending",
    paystack_reference: data.data.reference,
  });

  return NextResponse.json({
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  });
}