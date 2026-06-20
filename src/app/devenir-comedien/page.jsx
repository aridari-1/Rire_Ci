"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const AVAILABLE_TAGS = ["Sketchs", "Maquis", "Nouchi", "Fonctionnaires", "Famille", "Politique", "Musique", "Couple", "Rue", "Bureau"];

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function DevenirComedien() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    bio: "",
    location: "",
    tags: [],
    cover_color: "#FF4500",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : prev.tags.length < 4 ? [...prev.tags, tag] : prev.tags,
    }));
  }

  async function handleSubmit() {
    if (!user) { router.push("/auth"); return; }
    if (!form.name || !form.bio || !form.location) {
      setError("Remplis tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    setError("");

    const slug = slugify(form.name);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("comedians").select("id").eq("slug", slug).single();

    if (existing) {
      setError("Ce nom de scène est déjà pris. Essaie un autre.");
      setLoading(false);
      return;
    }

    // Check if user already has a comedian profile
    const { data: alreadyComedian } = await supabase
      .from("comedians").select("id").eq("user_id", user.id).single();

    if (alreadyComedian) {
      setError("Tu as déjà un profil comédien.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("comedians").insert({
      user_id: user.id,
      name: form.name,
      slug,
      tagline: form.tagline,
      bio: form.bio,
      location: form.location,
      tags: form.tags,
      cover_color: form.cover_color,
      is_verified: false,
      featured: false,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setCreatedSlug(slug);
    setDone(true);
    setLoading(false);
  }

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <i className="ti ti-lock" style={{ fontSize: 40, color: "var(--text-3)" }} aria-hidden="true" />
      <p style={{ fontSize: 16, fontWeight: 600, marginTop: 12 }}>Connecte-toi d'abord</p>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6, marginBottom: 24 }}>Tu as besoin d'un compte pour créer un profil comédien.</p>
      <button onClick={() => router.push("/auth")} style={{ padding: "13px 28px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}>
        Se connecter
      </button>
    </div>
  );

  if (done) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <i className="ti ti-confetti" style={{ fontSize: 32, color: "var(--accent)" }} aria-hidden="true" />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Bienvenue sur rire.ci !</h1>
      <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.7, marginBottom: 28, maxWidth: 300 }}>
        Ton profil comédien <span style={{ color: "var(--accent)", fontWeight: 600 }}>{form.name}</span> est créé. Tu peux maintenant uploader tes premières vidéos.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 320 }}>
        <button
          onClick={() => router.push("/upload-video")}
          style={{ padding: "14px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <i className="ti ti-upload" style={{ fontSize: 17 }} aria-hidden="true" />
          Uploader ma première vidéo
        </button>
        <button
          onClick={() => router.push(`/comedien/${createdSlug}`)}
          style={{ padding: "14px", borderRadius: 10, background: "var(--bg-2)", color: "var(--text-1)", border: "0.5px solid var(--border)", fontSize: 15, fontWeight: 600 }}
        >
          Voir mon profil public
        </button>
      </div>
    </div>
  );

  const COLORS = ["#FF4500", "#9B59B6", "#3498DB", "#27AE60", "#E74C3C", "#F39C12", "#1ABC9C", "#E91E63"];

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px",
        background: "rgba(17,17,20,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid var(--border)",
      }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-2)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Créer mon profil</span>
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>{step}/3</span>
      </nav>

      {/* Progress bar */}
      <div style={{ height: 3, background: "var(--bg-3)" }}>
        <div style={{ height: "100%", width: `${(step / 3) * 100}%`, background: "var(--accent)", transition: "width 0.3s" }} />
      </div>

      <div style={{ padding: "28px 16px 40px", maxWidth: 480, margin: "0 auto" }}>

        {/* Step 1 — Identity */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Ton identité</h1>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 28, lineHeight: 1.6 }}>
              C'est ce que les fans verront sur ton profil.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                  Nom de scène <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Serge Behi"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
                {form.name && (
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 5 }}>
                    Ton lien : rire.ci/comedien/<span style={{ color: "var(--accent)" }}>{slugify(form.name)}</span>
                  </p>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                  Accroche <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(facultatif)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Le roi du maquis TikTok"
                  value={form.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                  maxLength={60}
                />
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, textAlign: "right" }}>{form.tagline.length}/60</p>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                  Ville <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cocody, Abidjan"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!form.name || !form.location) { setError("Remplis les champs obligatoires."); return; }
                setError("");
                setStep(2);
              }}
              style={{ width: "100%", padding: "15px", borderRadius: 10, background: form.name && form.location ? "var(--accent)" : "var(--bg-3)", color: form.name && form.location ? "#fff" : "var(--text-3)", border: "none", fontSize: 15, fontWeight: 600, marginTop: 28, transition: "all 0.15s" }}
            >
              Continuer
            </button>
            {error && <p style={{ color: "var(--accent)", fontSize: 13, marginTop: 10, textAlign: "center" }}>{error}</p>}
          </div>
        )}

        {/* Step 2 — Bio + Tags */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Ton univers</h1>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 28, lineHeight: 1.6 }}>
              Dis aux fans ce qui te rend unique.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                  Bio <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <textarea
                  placeholder="Parle de toi, de ton style, de ce qui t'inspire..."
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  maxLength={300}
                  rows={4}
                  style={{ resize: "none" }}
                />
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, textAlign: "right" }}>{form.bio.length}/300</p>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 10, fontWeight: 500 }}>
                  Thèmes <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(choisis jusqu'à 4)</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {AVAILABLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, border: "none",
                        background: form.tags.includes(tag) ? "var(--accent)" : "var(--bg-2)",
                        color: form.tags.includes(tag) ? "#fff" : "var(--text-2)",
                        outline: !form.tags.includes(tag) ? "0.5px solid var(--border)" : "none",
                        opacity: !form.tags.includes(tag) && form.tags.length >= 4 ? 0.4 : 1,
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!form.bio) { setError("Écris ta bio."); return; }
                setError("");
                setStep(3);
              }}
              style={{ width: "100%", padding: "15px", borderRadius: 10, background: form.bio ? "var(--accent)" : "var(--bg-3)", color: form.bio ? "#fff" : "var(--text-3)", border: "none", fontSize: 15, fontWeight: 600, marginTop: 28, transition: "all 0.15s" }}
            >
              Continuer
            </button>
            {error && <p style={{ color: "var(--accent)", fontSize: 13, marginTop: 10, textAlign: "center" }}>{error}</p>}
          </div>
        )}

        {/* Step 3 — Appearance + confirm */}
        {step === 3 && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Ton style</h1>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 28, lineHeight: 1.6 }}>
              Choisis une couleur pour personnaliser ton profil.
            </p>

            {/* Preview */}
            <div style={{ borderRadius: 14, background: "var(--bg-2)", border: "0.5px solid var(--border)", overflow: "hidden", marginBottom: 24 }}>
              <div style={{ height: 80, background: `linear-gradient(135deg, ${form.cover_color}44, ${form.cover_color}99)` }} />
              <div style={{ padding: "0 16px 16px", marginTop: -28 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: form.cover_color, border: "3px solid var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                  {form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <p style={{ fontSize: 16, fontWeight: 700 }}>{form.name || "Ton nom"}</p>
                {form.tagline && <p style={{ fontSize: 12, color: "var(--accent)", marginTop: 2 }}>{form.tagline}</p>}
                {form.location && <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>📍 {form.location}</p>}
              </div>
            </div>

            {/* Color picker */}
            <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 10, fontWeight: 500 }}>
              Couleur de profil
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => update("cover_color", color)}
                  style={{ width: 40, height: 40, borderRadius: "50%", background: color, border: form.cover_color === color ? "3px solid var(--text-1)" : "3px solid transparent", transition: "border 0.15s" }}
                />
              ))}
            </div>

            {/* Summary */}
            <div style={{ borderRadius: 12, background: "var(--bg-2)", border: "0.5px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
              {[
                { label: "Nom de scène", value: form.name },
                { label: "Ville", value: form.location },
                { label: "Thèmes", value: form.tags.length > 0 ? form.tags.join(", ") : "Aucun" },
              ].map((row, i) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderBottom: i < 2 ? "0.5px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--text-3)" }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", textAlign: "right", maxWidth: "60%" }}>{row.value}</span>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "rgba(255,69,0,0.1)", border: "0.5px solid rgba(255,69,0,0.3)", marginBottom: 14 }}>
                <i className="ti ti-alert-circle" style={{ fontSize: 15, color: "var(--accent)", flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: 13, color: "var(--accent)" }}>{error}</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: "100%", padding: "15px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}
            >
              <i className="ti ti-confetti" style={{ fontSize: 17 }} aria-hidden="true" />
              {loading ? "Création en cours..." : "Créer mon profil"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}