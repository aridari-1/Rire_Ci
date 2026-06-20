import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const { email, comedianId, comedianName } = await request.json();

  if (!email || !comedianId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: 500 * 100,
      currency: "GHS",
      callback_url: `${baseUrl}/paiement-confirme`,
      metadata: {
        comedian_id: comedianId,
        comedian_name: comedianName,
        type: "subscription",
      },
    }),
  });

  const data = await res.json();
  if (!data.status) {
    return NextResponse.json({ error: data.message }, { status: 400 });
  }

  await supabase.from("subscriptions").insert({
    comedian_id: comedianId,
    email,
    status: "pending",
    paystack_reference: data.data.reference,
  });

  return NextResponse.json({
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  });
}