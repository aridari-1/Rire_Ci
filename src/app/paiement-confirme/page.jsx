"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [type, setType] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const paymentType = searchParams.get("type");
    if (paymentType) setType(paymentType);
    if (!reference) { setStatus("error"); return; }
    verifyPayment(reference, paymentType);
  }, []);

  async function verifyPayment(reference, paymentType) {
    try {
      const endpoint = paymentType === "subscription"
        ? `/api/subscribe/verify?reference=${reference}`
        : `/api/tip/verify?reference=${reference}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.success) {
        setStatus("success");
      } else {
        // Try the other endpoint as fallback
        const fallbackEndpoint = paymentType === "subscription"
          ? `/api/tip/verify?reference=${reference}`
          : `/api/subscribe/verify?reference=${reference}`;
        const fallbackRes = await fetch(fallbackEndpoint);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success) {
          setType(paymentType === "subscription" ? "tip" : "subscription");
          setStatus("success");
        } else {
          setStatus("error");
        }
      }
    } catch (err) {
      setStatus("error");
    }
  }

  // Read return path from sessionStorage
  function handleBack() {
    const returnPath = sessionStorage.getItem("payment_return_path") || "/";
    sessionStorage.removeItem("payment_return_path");
    router.push(returnPath);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      {status === "loading" && (
        <>
          <i className="ti ti-loader" style={{ fontSize: 40, color: "var(--text-3)", animation: "spin 1s linear infinite" }} aria-hidden="true" />
          <p style={{ color: "var(--text-2)", fontSize: 15, marginTop: 16 }}>Vérification du paiement...</p>
        </>
      )}

      {status === "success" && type === "tip" && (
        <>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <i className="ti ti-coin" style={{ fontSize: 32, color: "var(--accent)" }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Tip envoyé ! 💛</h1>
          <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Ton tip a bien été reçu par le comédien. Merci de soutenir la comédie ivoirienne 🇨🇮
          </p>
          <button onClick={handleBack} style={{ padding: "14px 28px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}>
            Retour au profil
          </button>
        </>
      )}

      {status === "success" && type === "subscription" && (
        <>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <i className="ti ti-star" style={{ fontSize: 32, color: "var(--accent)" }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Abonnement activé ! ⭐</h1>
          <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Ton Fan Pass est actif. Tu as maintenant accès à tout le contenu exclusif de ce comédien.
          </p>
          <button onClick={handleBack} style={{ padding: "14px 28px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}>
            Voir le contenu exclusif
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
          <button onClick={handleBack} style={{ padding: "14px 28px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}>
            Retour
          </button>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
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