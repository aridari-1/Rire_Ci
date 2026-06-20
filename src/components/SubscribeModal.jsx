"use client";

import { useState } from "react";

const PERKS = [
  "Accès à toutes les vidéos exclusives 🔒",
  "Badge fan sur ton profil ⭐",
  "Nouvelles vidéos en avant-première 🎬",
  "Message de remerciement du comédien 💌",
];

export default function SubscribeModal({ comedian, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("choose"); // choose | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubscribe() {
    if (!email) return;
    setStep("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          comedianId: comedian.id,
          comedianName: comedian.name,
        }),
      });

      const { authorizationUrl, reference, error } = await res.json();
      if (error) throw new Error(error);

      // Open Paystack popup
      const popup = window.open(authorizationUrl, "_blank", "width=500,height=700");

      // Poll until popup closes
      const timer = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(timer);
          const verifyRes = await fetch(`/api/subscribe/verify?reference=${reference}`);
          const { success } = await verifyRes.json();
          if (success) {
            setStep("success");
          } else {
            setErrorMsg("Le paiement n'a pas abouti. Réessaie.");
            setStep("error");
          }
        }
      }, 1000);

    } catch (err) {
      setErrorMsg(err.message);
      setStep("error");
    }
  }

  const initials = comedian.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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
            <div style={{ fontSize: 48 }}>⭐</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, marginTop: 12 }}>
              Tu es maintenant fan !
            </h2>
            <p style={{ color: "#A09890", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
              Bienvenue dans la communauté de{" "}
              <span style={{ color: "#FFD600", fontWeight: 700 }}>{comedian.name}</span>.
              Toutes les vidéos exclusives sont débloquées.
            </p>
            <button
              onClick={onSuccess}
              className="mt-6 w-full py-3 rounded-xl"
              style={{ background: "#FFD600", color: "#0E0C0A", fontSize: 15, fontWeight: 700 }}
            >
              Voir le contenu exclusif
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="text-center py-6">
            <div style={{ fontSize: 48 }}>😕</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, marginTop: 12 }}>
              Paiement non complété
            </h2>
            <p style={{ color: "#A09890", fontSize: 14, marginTop: 8 }}>{errorMsg}</p>
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
            {/* Header */}
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: comedian.cover_color,
                  fontFamily: "Georgia, serif",
                  fontSize: 20, fontWeight: 700, color: "#fff",
                }}
              >
                {initials}
              </div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, marginTop: 10 }}>
                Fan Pass de {comedian.name}
              </h2>
              <div className="flex items-baseline justify-center gap-1 mt-2">
                <span style={{ fontSize: 30, fontWeight: 700, color: "#FF6B2B", fontFamily: "Georgia, serif" }}>
                  500
                </span>
                <span style={{ fontSize: 14, color: "#A09890" }}>F CFA / mois</span>
              </div>
            </div>

            {/* Perks */}
            <div className="mt-5 rounded-xl overflow-hidden" style={{ border: "0.5px solid #2A2420" }}>
              {PERKS.map((perk, i) => (
                <div
                  key={perk}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < PERKS.length - 1 ? "0.5px solid #2A2420" : "none" }}
                >
                  <span style={{ color: "#FFD600" }}>✓</span>
                  <span style={{ fontSize: 13, color: "#A09890" }}>{perk}</span>
                </div>
              ))}
            </div>

            {/* Email input */}
            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-4 py-3 px-4 rounded-xl outline-none"
              style={{
                background: "#0E0C0A",
                border: `0.5px solid ${email ? "#FFD600" : "#2A2420"}`,
                color: "#F5F0EB", fontSize: 14,
              }}
            />

            {/* Payment note */}
            <div
              className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#0E0C0A", border: "0.5px solid #2A2420" }}
            >
              <span style={{ fontSize: 18 }}>📱</span>
              <span style={{ fontSize: 12, color: "#A09890" }}>
                Orange Money, MTN MoMo ou carte bancaire · Résiliable à tout moment
              </span>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={!email}
              className="mt-4 w-full py-4 rounded-xl transition-all active:scale-95"
              style={{
                background: email ? "#FFD600" : "#2A2420",
                color: email ? "#0E0C0A" : "#6B6560",
                fontSize: 15, fontWeight: 700,
              }}
            >
              S'abonner pour 500 F / mois
            </button>

            <button onClick={onClose} className="mt-3 w-full py-2"
              style={{ color: "#6B6560", fontSize: 13 }}>
              Pas maintenant
            </button>
          </>
        )}
      </div>
    </div>
  );
}