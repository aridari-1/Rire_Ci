"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [type, setType] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");
    const ref = reference || trxref;

    if (!ref) { setStatus("error"); return; }

    verifyPayment(ref);
  }, []);

  async function verifyPayment(reference) {
    try {
      // Try tip verify first
      const tipRes = await fetch(`/api/tip/verify?reference=${reference}`);
      const tipData = await tipRes.json();

      if (tipData.success) {
        setType("tip");
        setStatus("success");
        return;
      }

      // Try subscription verify
      const subRes = await fetch(`/api/subscribe/verify?reference=${reference}`);
      const subData = await subRes.json();

      if (subData.success) {
        setType("subscription");
        setStatus("success");
        return;
      }

      setStatus("error");
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      {status === "loading" && (
        <>
          <i className="ti ti-loader" style={{ fontSize: 40, color: "var(--text-3)" }} aria-hidden="true" />
          <p style={{ color: "var(--text-2)", fontSize: 15, marginTop: 16 }}>Vérification du paiement...</p>
        </>
      )}

      {status === "success" && (
        <>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <i className="ti ti-check" style={{ fontSize: 32, color: "var(--accent)" }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
            {type === "tip" ? "Tip envoyé ! 💛" : "Abonnement activé ! ⭐"}
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            {type === "tip"
              ? "Ton tip a bien été reçu. Merci de soutenir la comédie ivoirienne 🇨🇮"
              : "Ton Fan Pass est activé. Tu as maintenant accès à tout le contenu exclusif."}
          </p>
          <button
            onClick={() => router.back()}
            style={{ padding: "14px 28px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}
          >
            Retour au profil
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,69,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <i className="ti ti-x" style={{ fontSize: 32, color: "var(--accent)" }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Paiement non confirmé</h1>
          <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Le paiement n'a pas pu être vérifié. Réessaie ou contacte le support.
          </p>
          <button
            onClick={() => router.back()}
            style={{ padding: "14px 28px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}
          >
            Retour
          </button>
        </>
      )}
    </div>
  );
}

export default function PaymentConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className="ti ti-loader" style={{ fontSize: 36, color: "var(--text-3)" }} aria-hidden="true" />
      </div>
    }>
      <PaymentConfirmContent />
    </Suspense>
  );
}