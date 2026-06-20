"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { login, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit() {
    if (!email || !password) return;
    if (mode === "signup" && !name) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      if (mode === "signup") {
        await signUp(email, password, name);
        setStatus("verify");
      } else {
        await login(email, password);
        router.push("/");
      }
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  if (status === "verify") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <i className="ti ti-mail" style={{ fontSize: 28, color: "var(--accent)" }} aria-hidden="true" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Vérifie ton email</h1>
        <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          On a envoyé un lien à <span style={{ color: "var(--accent)" }}>{email}</span>. Clique dessus pour activer ton compte.
        </p>
        <button
          onClick={() => { setStatus("idle"); setMode("login"); }}
          style={{ width: "100%", padding: "14px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}
        >
          Aller à la connexion
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
            rire<span style={{ color: "var(--accent)" }}>.</span>ci
          </p>
          <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 6 }}>
            La comédie ivoirienne, en direct
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "var(--bg-2)", borderRadius: 10, padding: 3, gap: 3, marginBottom: 24 }}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setStatus("idle"); setErrorMsg(""); }}
              style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                background: mode === m ? "var(--accent)" : "transparent",
                color: mode === m ? "#fff" : "var(--text-3)",
                fontSize: 14, fontWeight: 600, transition: "all 0.15s",
              }}
            >
              {m === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <div>
              <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6 }}>Prénom</label>
              <input
                type="text"
                placeholder="Ex: Kouassi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6 }}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {status === "error" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "rgba(255,69,0,0.1)", border: "0.5px solid rgba(255,69,0,0.3)" }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 15, color: "var(--accent)", flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: 13, color: "var(--accent)" }}>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            style={{
              width: "100%", padding: "14px", borderRadius: 10, border: "none",
              background: "var(--accent)", color: "#fff",
              fontSize: 15, fontWeight: 600, marginTop: 4,
              opacity: status === "loading" ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {status === "loading" ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)", marginTop: 20 }}>
          {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setStatus("idle"); }}
            style={{ color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
          >
            {mode === "login" ? "S'inscrire" : "Se connecter"}
          </span>
        </p>
      </div>
    </div>
  );
}