"use client";

import { useState } from "react";

const TIP_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function TipModal({ comedian, onClose }) {
  const [selected, setSelected] = useState(500);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("choose");
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
    const { authorizationUrl, error } = await res.json();
    if (error) throw new Error(error);
    // Save return path and payment type
    sessionStorage.setItem("payment_return_path", window.location.pathname);
    window.location.href = authorizationUrl + "&type=tip";
  } catch (err) {
    setErrorMsg(err.message);
    setStep("error");
  }
}

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 480, background: "var(--bg-2)", borderRadius: "20px 20px 0 0", padding: "20px 20px 40px", border: "0.5px solid var(--border)" }}>

        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 24px" }} />

        {step === "success" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <i className="ti ti-check" style={{ fontSize: 30, color: "var(--accent)" }} aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Tip envoyé !</h2>
            <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              {comedian.name} a reçu <span style={{ color: "var(--accent)", fontWeight: 700 }}>{finalAmount?.toLocaleString("fr-FR")} F CFA</span>. Merci de soutenir la comédie ivoirienne 🇨🇮
            </p>
            <button onClick={onClose} style={{ width: "100%", padding: "14px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}>
              Fermer
            </button>
          </div>
        )}

        {step === "error" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,69,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <i className="ti ti-x" style={{ fontSize: 30, color: "var(--accent)" }} aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Paiement non complété</h2>
            <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24 }}>{errorMsg || "Réessaie."}</p>
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
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Envoyer un tip</h2>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 20 }}>
              100% va directement à <span style={{ color: "var(--accent)", fontWeight: 600 }}>{comedian.name}</span>
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
              {TIP_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setSelected(amt); setCustom(""); }}
                  style={{
                    padding: "12px 4px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: selected === amt && !custom ? "var(--accent)" : "var(--bg-3)",
                    color: selected === amt && !custom ? "#fff" : "var(--text-2)",
                    border: `0.5px solid ${selected === amt && !custom ? "var(--accent)" : "var(--border)"}`,
                    transition: "all 0.15s",
                  }}
                >
                  {amt.toLocaleString("fr-FR")} F
                </button>
              ))}
            </div>

            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                type="number"
                placeholder="Autre montant..."
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
                style={{ paddingRight: 54 }}
              />
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: 13 }}>F CFA</span>
            </div>

            <button
              onClick={() => finalAmount >= 100 && setStep("email")}
              style={{
                width: "100%", padding: "14px", borderRadius: 10, border: "none",
                background: finalAmount >= 100 ? "var(--accent)" : "var(--bg-3)",
                color: finalAmount >= 100 ? "#fff" : "var(--text-3)",
                fontSize: 15, fontWeight: 600, transition: "all 0.15s",
              }}
            >
              Continuer {finalAmount >= 100 ? `· ${finalAmount.toLocaleString("fr-FR")} F` : ""}
            </button>
            <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "none", border: "none", color: "var(--text-3)", fontSize: 13, marginTop: 6 }}>
              Annuler
            </button>
          </>
        )}

        {step === "email" && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Ton email</h2>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 20 }}>
              Pour le reçu de ton tip de <span style={{ color: "var(--accent)", fontWeight: 600 }}>{finalAmount?.toLocaleString("fr-FR")} F</span>
            </p>

            <input type="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 12 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "var(--bg-3)", marginBottom: 16 }}>
              <i className="ti ti-device-mobile" style={{ fontSize: 18, color: "var(--text-3)", flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Orange Money, MTN MoMo ou carte bancaire</span>
            </div>

            <button
              onClick={handlePay}
              disabled={!email}
              style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: email ? "var(--accent)" : "var(--bg-3)", color: email ? "#fff" : "var(--text-3)", fontSize: 15, fontWeight: 600, transition: "all 0.15s" }}
            >
              Payer {finalAmount?.toLocaleString("fr-FR")} F
            </button>
            <button onClick={() => setStep("choose")} style={{ width: "100%", padding: "12px", background: "none", border: "none", color: "var(--text-3)", fontSize: 13, marginTop: 6 }}>
              ← Retour
            </button>
          </>
        )}
      </div>
    </div>
  );
}