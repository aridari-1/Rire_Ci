"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { login, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | verify
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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#0E0C0A", color: "#F5F0EB" }}
    >
      <div className="w-full" style={{ maxWidth: 400 }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 700, color: "#FFD600" }}>
            rire<span style={{ color: "#FF6B2B" }}>.ci</span>
          </h1>
          <p style={{ color: "#6B6560", fontSize: 13, marginTop: 4 }}>
            La comédie ivoirienne, en direct
          </p>
        </div>

        {status === "verify" ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}
          >
            <div style={{ fontSize: 48 }}>📬</div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, marginTop: 12 }}>
              Vérifie ton email
            </h2>
            <p style={{ color: "#A09890", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
              On a envoyé un lien de confirmation à{" "}
              <span style={{ color: "#FFD600" }}>{email}</span>.
              Clique dessus pour activer ton compte.
            </p>
            <button
              onClick={() => { setStatus("idle"); setMode("login"); }}
              className="mt-6 w-full py-3 rounded-xl"
              style={{ background: "#FF6B2B", color: "#fff", fontSize: 14, fontWeight: 700 }}
            >
              Aller à la connexion
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl p-6"
            style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}
          >
            {/* Mode toggle */}
            <div
              className="flex rounded-xl overflow-hidden mb-6"
              style={{ background: "#0E0C0A", padding: 3, gap: 3 }}
            >
              {["login", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setStatus("idle"); setErrorMsg(""); }}
                  className="flex-1 py-2 rounded-lg transition-all"
                  style={{
                    background: mode === m ? "#FF6B2B" : "transparent",
                    color: mode === m ? "#fff" : "#6B6560",
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  {m === "login" ? "Connexion" : "Inscription"}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {/* Name (signup only) */}
              {mode === "signup" && (
                <div>
                  <label style={{ fontSize: 12, color: "#6B6560", display: "block", marginBottom: 6 }}>
                    Ton prénom
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Kouassi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 12,
                      background: "#0E0C0A", border: "0.5px solid #2A2420",
                      color: "#F5F0EB", fontSize: 14, outline: "none",
                    }}
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label style={{ fontSize: 12, color: "#6B6560", display: "block", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 12,
                    background: "#0E0C0A", border: `0.5px solid ${email ? "#FF6B2B" : "#2A2420"}`,
                    color: "#F5F0EB", fontSize: 14, outline: "none",
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: 12, color: "#6B6560", display: "block", marginBottom: 6 }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 12,
                    background: "#0E0C0A", border: `0.5px solid ${password ? "#FF6B2B" : "#2A2420"}`,
                    color: "#F5F0EB", fontSize: 14, outline: "none",
                  }}
                />
              </div>

              {/* Error */}
              {status === "error" && (
                <p style={{ color: "#FF4444", fontSize: 13 }}>❌ {errorMsg}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="w-full py-4 rounded-xl transition-all active:scale-95 mt-2"
                style={{
                  background: "#FF6B2B",
                  color: "#fff",
                  fontSize: 15, fontWeight: 700,
                  opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading"
                  ? "Chargement..."
                  : mode === "login" ? "Se connecter" : "Créer mon compte"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}