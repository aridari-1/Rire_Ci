"use client";

import { useState } from "react";

const PERKS = [
  { icon: "ti-lock-open", text: "Accès à toutes les vidéos exclusives" },
  { icon: "ti-star", text: "Badge fan sur ton profil" },
  { icon: "ti-bell", text: "Nouvelles vidéos en avant-première" },
  { icon: "ti-heart", text: "Message de remerciement du comédien" },
];

export default function SubscribeModal({ comedian, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("choose");
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
    const { authorizationUrl, error } = await res.json();
    if (error) throw new Error(error);

    // Store type and return path in sessionStorage — NOT in the URL
    sessionStorage.setItem("payment_type", "subscription");
    sessionStorage.setItem("payment_return_path", window.location.pathname);

    // Redirect to clean Paystack URL with no extra params
    window.location.href = authorizationUrl;
  } catch (err) {
    setErrorMsg(err.message);
    setStep("error");
  }
}


  const initials = comedian.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 480, background: "var(--bg-2)", borderRadius: "20px 20px 0 0", padding: "20px 20px 40px", border: "0.5px solid var(--border)" }}>

        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 24px" }} />

        {step === "success" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <i className="ti ti-star" style={{ fontSize: 30, color: "var(--accent)" }} aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Tu es maintenant fan !</h2>
            <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Bienvenue dans la communauté de <span style={{ color: "var(--accent)", fontWeight: 700 }}>{comedian.name}</span>. Toutes les vidéos exclusives sont débloquées.
            </p>
            <button onClick={onSuccess} style={{ width: "100%", padding: "14px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}>
              Voir le contenu exclusif
            </button>
          </div>
        )}

        {step === "error" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,69,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <i className="ti ti-x" style={{ fontSize: 30, color: "var(--accent)" }} aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Paiement non complété</h2>
            <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24 }}>{errorMsg}</p>
            <button onClick={() => setStep("choose")} style={{ width: "100%", padding: "14px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}>
              Réessayer
            </button>
          </div>
        )}

        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <i className="ti ti-loader" style={{ fontSize: 36, color: "var(--text-3)" }} aria-hidden="true" />
            <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 14 }}>En attente du paiement...</p>
            <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 6 }}>Complète le paiement dans la fenêtre Paystack</p>
          </div>
        )}

        {step === "choose" && (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: comedian.cover_color || "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Fan Pass · {comedian.name}</h2>
                <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, marginTop: 2 }}>500 F CFA / mois</p>
              </div>
            </div>

            {/* Perks */}
            <div style={{ borderRadius: 12, background: "var(--bg-3)", overflow: "hidden", marginBottom: 16 }}>
              {PERKS.map((perk, i) => (
                <div key={perk.text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: i < PERKS.length - 1 ? "0.5px solid var(--border)" : "none" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`ti ${perk.icon}`} style={{ fontSize: 15, color: "var(--accent)" }} aria-hidden="true" />
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{perk.text}</span>
                </div>
              ))}
            </div>

            <input type="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 12 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "var(--bg-3)", marginBottom: 16 }}>
              <i className="ti ti-device-mobile" style={{ fontSize: 18, color: "var(--text-3)", flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Orange Money, MTN MoMo ou carte · Résiliable à tout moment</span>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={!email}
              style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: email ? "var(--accent)" : "var(--bg-3)", color: email ? "#fff" : "var(--text-3)", fontSize: 15, fontWeight: 600, transition: "all 0.15s" }}
            >
              S'abonner pour 500 F / mois
            </button>
            <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "none", border: "none", color: "var(--text-3)", fontSize: 13, marginTop: 6 }}>
              Pas maintenant
            </button>
          </>
        )}
      </div>
    </div>
  );
}