"use client";

import { useState } from "react";

const TIP_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function TipModal({ comedian, onClose }) {
  const [selected, setSelected] = useState(500);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("choose"); // choose | email | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const finalAmount = custom ? parseInt(custom) : selected;

  async function handlePay() {
    if (!email || !finalAmount) return;
    setStep("loading");

    try {
      const res = await fetch("/api/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: finalAmount,
          comedianId: comedian.id,
          comedianName: comedian.name,
        }),
      });

      const { authorizationUrl, reference, error } = await res.json();
      if (error) throw new Error(error);

      // Open Paystack in a popup
      const popup = window.open(authorizationUrl, "_blank", "width=500,height=700");

      // Poll until popup closes
      const timer = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(timer);
          // Verify the payment
          const verifyRes = await fetch(`/api/tip/verify?reference=${reference}`);
          const { success } = await verifyRes.json();
          setStep(success ? "success" : "error");
        }
      }, 1000);

    } catch (err) {
      setErrorMsg(err.message);
      setStep("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-t-2xl px-5 pt-5 pb-10"
        style={{ background: "#1A1714", maxWidth: 480, border: "0.5px solid #2A2420" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#2A2420" }} />

        {step === "success" && (
          <div className="text-center py-6">
            <div style={{ fontSize: 48 }}>💛</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, marginTop: 12 }}>
              Tip envoyé !
            </h2>
            <p style={{ color: "#A09890", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
              {comedian.name} a reçu{" "}
              <span style={{ color: "#FFD600", fontWeight: 700 }}>
                {finalAmount.toLocaleString("fr-FR")} F CFA
              </span>. Merci de soutenir la comédie ivoirienne 🇨🇮
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl"
              style={{ background: "#FF6B2B", color: "#fff", fontSize: 15, fontWeight: 700 }}
            >
              Fermer
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="text-center py-6">
            <div style={{ fontSize: 48 }}>😕</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, marginTop: 12 }}>
              Paiement non complété
            </h2>
            <p style={{ color: "#A09890", fontSize: 14, marginTop: 8 }}>
              {errorMsg || "Le paiement n'a pas abouti. Réessaie."}
            </p>
            <button
              onClick={() => setStep("choose")}
              className="mt-6 w-full py-3 rounded-xl"
              style={{ background: "#FF6B2B", color: "#fff", fontSize: 15, fontWeight: 700 }}
            >
              Réessayer
            </button>
          </div>
        )}

        {step === "loading" && (
          <div className="text-center py-10">
            <div style={{ fontSize: 36 }}>⏳</div>
            <p style={{ color: "#A09890", fontSize: 14, marginTop: 12 }}>
              En attente du paiement...
            </p>
            <p style={{ color: "#6B6560", fontSize: 12, marginTop: 6 }}>
              Complète le paiement dans la fenêtre Paystack
            </p>
          </div>
        )}

        {step === "choose" && (
          <>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, textAlign: "center" }}>
              Envoyer un tip à {comedian.name}
            </h2>
            <p style={{ color: "#6B6560", fontSize: 13, textAlign: "center", marginTop: 4 }}>
              100% va directement au comédien
            </p>

            <div className="grid grid-cols-3 gap-2 mt-5">
              {TIP_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setSelected(amt); setCustom(""); }}
                  className="py-3 rounded-xl transition-all active:scale-95"
                  style={{
                    background: selected === amt && !custom ? "#FF6B2B" : "#0E0C0A",
                    color: selected === amt && !custom ? "#fff" : "#A09890",
                    border: `0.5px solid ${selected === amt && !custom ? "#FF6B2B" : "#2A2420"}`,
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  {amt.toLocaleString("fr-FR")} F
                </button>
              ))}
            </div>

            <div className="mt-3 relative">
              <input
                type="number"
                placeholder="Autre montant..."
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
                className="w-full py-3 px-4 rounded-xl outline-none"
                style={{
                  background: "#0E0C0A",
                  border: `0.5px solid ${custom ? "#FF6B2B" : "#2A2420"}`,
                  color: "#F5F0EB", fontSize: 14,
                }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "#6B6560", fontSize: 13 }}>F CFA</span>
            </div>

            <button
              onClick={() => finalAmount >= 100 && setStep("email")}
              className="mt-4 w-full py-4 rounded-xl transition-all active:scale-95"
              style={{
                background: finalAmount >= 100 ? "#FF6B2B" : "#2A2420",
                color: finalAmount >= 100 ? "#fff" : "#6B6560",
                fontSize: 15, fontWeight: 700,
              }}
            >
              Continuer → {finalAmount ? `${finalAmount.toLocaleString("fr-FR")} F` : ""}
            </button>

            <button onClick={onClose} className="mt-3 w-full py-2"
              style={{ color: "#6B6560", fontSize: 13 }}>
              Annuler
            </button>
          </>
        )}

        {step === "email" && (
          <>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, textAlign: "center" }}>
              Ton email
            </h2>
            <p style={{ color: "#6B6560", fontSize: 13, textAlign: "center", marginTop: 4 }}>
              Pour recevoir le reçu de ton tip de{" "}
              <span style={{ color: "#FFD600", fontWeight: 700 }}>
                {finalAmount?.toLocaleString("fr-FR")} F
              </span>
            </p>

            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-5 py-3 px-4 rounded-xl outline-none"
              style={{
                background: "#0E0C0A",
                border: `0.5px solid ${email ? "#FF6B2B" : "#2A2420"}`,
                color: "#F5F0EB", fontSize: 14,
              }}
            />

            <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#0E0C0A", border: "0.5px solid #2A2420" }}>
              <span style={{ fontSize: 18 }}>📱</span>
              <span style={{ fontSize: 12, color: "#A09890" }}>
                Orange Money, MTN MoMo ou carte bancaire
              </span>
            </div>

            <button
              onClick={handlePay}
              disabled={!email}
              className="mt-4 w-full py-4 rounded-xl transition-all active:scale-95"
              style={{
                background: email ? "#FF6B2B" : "#2A2420",
                color: email ? "#fff" : "#6B6560",
                fontSize: 15, fontWeight: 700,
              }}
            >
              Payer {finalAmount?.toLocaleString("fr-FR")} F
            </button>

            <button onClick={() => setStep("choose")} className="mt-3 w-full py-2"
              style={{ color: "#6B6560", fontSize: 13 }}>
              ← Retour
            </button>
          </>
        )}
      </div>
    </div>
  );
}