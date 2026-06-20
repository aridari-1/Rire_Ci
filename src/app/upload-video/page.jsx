"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UploadVideo() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [comedianSlug, setComedianSlug] = useState("serge-behi");
  const [isLocked, setIsLocked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file || !title) return;
    setUploading(true);
    setError("");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      const res = await fetch("/api/upload-video", { method: "POST", body: formData });
      const { videoId, error: uploadError } = await res.json();
      if (uploadError) throw new Error(uploadError);

      const { data: comedian } = await supabase
        .from("comedians").select("id").eq("slug", comedianSlug).single();
      if (!comedian) throw new Error("Comédien introuvable");

      const { error: dbError } = await supabase.from("videos").insert({
        comedian_id: comedian.id,
        title,
        bunny_video_id: videoId,
        is_locked: isLocked,
        lock_price: isLocked ? 500 : 0,
      });
      if (dbError) throw new Error(dbError.message);

      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (done) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <i className="ti ti-check" style={{ fontSize: 32, color: "var(--accent)" }} aria-hidden="true" />
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Vidéo uploadée !</h1>
      <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
        Elle apparaîtra sur le profil dans quelques secondes, le temps du traitement.
      </p>
      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 320 }}>
        <button
          onClick={() => { setDone(false); setTitle(""); setFile(null); setProgress(0); }}
          style={{ flex: 1, padding: "13px", borderRadius: 10, background: "var(--bg-2)", border: "0.5px solid var(--border)", color: "var(--text-1)", fontSize: 14, fontWeight: 600 }}
        >
          Ajouter une autre
        </button>
        <button
          onClick={() => router.push(`/comedien/${comedianSlug}`)}
          style={{ flex: 1, padding: "13px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600 }}
        >
          Voir le profil
        </button>
      </div>
    </div>
  );

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
        <button
          onClick={() => router.back()}
          style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-2)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Nouvelle vidéo</span>
        <div style={{ width: 34 }} />
      </nav>

      <div style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>

        {/* Upload zone */}
        <label style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 12, padding: "36px 20px", borderRadius: 14, cursor: "pointer", marginBottom: 20,
          background: file ? "rgba(255,69,0,0.06)" : "var(--bg-2)",
          border: `1.5px dashed ${file ? "var(--accent)" : "var(--border)"}`,
          transition: "all 0.15s",
        }}>
          <input type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: file ? "var(--accent-muted)" : "var(--bg-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className={`ti ${file ? "ti-check" : "ti-upload"}`} style={{ fontSize: 24, color: file ? "var(--accent)" : "var(--text-3)" }} aria-hidden="true" />
          </div>
          {file ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>{file.name}</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Choisir une vidéo</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>MP4, MOV — jusqu'à 2 GB</p>
            </div>
          )}
        </label>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6, fontWeight: 500 }}>
              Titre de la vidéo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Le chef qui dort en réunion 😭"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6, fontWeight: 500 }}>
              Slug du comédien
            </label>
            <input
              type="text"
              value={comedianSlug}
              onChange={(e) => setComedianSlug(e.target.value)}
              placeholder="serge-behi"
            />
          </div>

          {/* Exclusive toggle */}
          <div
            onClick={() => setIsLocked(!isLocked)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, background: "var(--bg-2)", border: `0.5px solid ${isLocked ? "var(--accent)" : "var(--border)"}`, cursor: "pointer", transition: "border-color 0.15s" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: isLocked ? "var(--accent-muted)" : "var(--bg-3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
                <i className={`ti ${isLocked ? "ti-lock" : "ti-lock-open"}`} style={{ fontSize: 17, color: isLocked ? "var(--accent)" : "var(--text-3)" }} aria-hidden="true" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>Contenu exclusif</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Réservé aux abonnés Fan Pass</p>
              </div>
            </div>
            <div style={{ width: 44, height: 26, borderRadius: 13, background: isLocked ? "var(--accent)" : "var(--bg-3)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: isLocked ? 21 : 3, transition: "left 0.2s" }} />
            </div>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div>
              <div style={{ height: 4, borderRadius: 2, background: "var(--bg-3)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.3s" }} />
              </div>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>Upload en cours...</p>
            </div>
          )}

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "rgba(255,69,0,0.1)", border: "0.5px solid rgba(255,69,0,0.3)" }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 15, color: "var(--accent)", flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: 13, color: "var(--accent)" }}>{error}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !file || !title}
            style={{
              width: "100%", padding: "15px", borderRadius: 10, border: "none",
              background: uploading || !file || !title ? "var(--bg-3)" : "var(--accent)",
              color: uploading || !file || !title ? "var(--text-3)" : "#fff",
              fontSize: 15, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 0.15s",
            }}
          >
            <i className="ti ti-upload" style={{ fontSize: 17 }} aria-hidden="true" />
            {uploading ? "Upload en cours..." : "Publier la vidéo"}
          </button>
        </div>
      </div>
    </div>
  );
}