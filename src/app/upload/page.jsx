"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadVideo() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [comedianSlug, setComedianSlug] = useState("serge-behi");
  const [isLocked, setIsLocked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file || !title) return;
    setUploading(true);
    setError("");

    try {
      // 1 — Upload to Bunny
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      const { videoId, error: uploadError } = await res.json();
      if (uploadError) throw new Error(uploadError);

      // 2 — Get comedian ID from Supabase
      const { data: comedian } = await supabase
        .from("comedians")
        .select("id")
        .eq("slug", comedianSlug)
        .single();

      if (!comedian) throw new Error("Comédien introuvable");

      // 3 — Save video record in Supabase
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#0E0C0A", color: "#F5F0EB" }}>
      <div className="w-full max-w-md">
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "#FFD600", marginBottom: 4 }}>
          rire<span style={{ color: "#FF6B2B" }}>.ci</span>
        </h1>
        <p style={{ color: "#6B6560", fontSize: 13, marginBottom: 28 }}>Ajouter une nouvelle vidéo</p>

        {done ? (
          <div className="text-center py-8">
            <div style={{ fontSize: 48 }}>🎬</div>
            <p style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>Vidéo uploadée !</p>
            <p style={{ color: "#A09890", fontSize: 13, marginTop: 6 }}>Elle apparaîtra sur le profil dans quelques secondes.</p>
            <button
              onClick={() => { setDone(false); setTitle(""); setFile(null); }}
              className="mt-6 px-6 py-3 rounded-xl"
              style={{ background: "#FF6B2B", color: "#fff", fontWeight: 700 }}>
              Ajouter une autre vidéo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <label style={{ fontSize: 12, color: "#6B6560", display: "block", marginBottom: 6 }}>Titre de la vidéo</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Le chef qui dort en réunion 😭"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: "#1A1714", border: "0.5px solid #2A2420", color: "#F5F0EB", fontSize: 14, outline: "none" }}
              />
            </div>

            {/* Comedian slug */}
            <div>
              <label style={{ fontSize: 12, color: "#6B6560", display: "block", marginBottom: 6 }}>Slug du comédien</label>
              <input
                type="text"
                value={comedianSlug}
                onChange={(e) => setComedianSlug(e.target.value)}
                placeholder="serge-behi"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: "#1A1714", border: "0.5px solid #2A2420", color: "#F5F0EB", fontSize: 14, outline: "none" }}
              />
            </div>

            {/* File picker */}
            <div>
              <label style={{ fontSize: 12, color: "#6B6560", display: "block", marginBottom: 6 }}>Fichier vidéo</label>
              <label
                style={{ display: "block", padding: "20px", borderRadius: 12, background: "#1A1714", border: `1px dashed ${file ? "#FF6B2B" : "#2A2420"}`, textAlign: "center", cursor: "pointer" }}>
                <input type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                {file ? (
                  <span style={{ color: "#FF6B2B", fontSize: 13, fontWeight: 600 }}>✓ {file.name}</span>
                ) : (
                  <span style={{ color: "#6B6560", fontSize: 13 }}>Cliquer pour choisir une vidéo</span>
                )}
              </label>
            </div>

            {/* Lock toggle */}
            <div
              className="flex items-center justify-between p-4 rounded-xl cursor-pointer"
              style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}
              onClick={() => setIsLocked(!isLocked)}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>Vidéo exclusive 🔒</p>
                <p style={{ fontSize: 12, color: "#6B6560", marginTop: 2 }}>Réservée aux abonnés (500 F/mois)</p>
              </div>
              <div style={{ width: 44, height: 26, borderRadius: 13, background: isLocked ? "#FF6B2B" : "#2A2420", position: "relative", transition: "background .2s" }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", position: "absolute", top: 3, left: isLocked ? 21 : 3, transition: "left .2s" }} />
              </div>
            </div>

            {error && <p style={{ color: "#FF6B2B", fontSize: 13 }}>❌ {error}</p>}

            <button
              onClick={handleUpload}
              disabled={uploading || !file || !title}
              className="w-full py-4 rounded-xl transition-all active:scale-95"
              style={{
                background: uploading || !file || !title ? "#2A2420" : "#FF6B2B",
                color: uploading || !file || !title ? "#6B6560" : "#fff",
                fontSize: 15, fontWeight: 700,
              }}
            >
              {uploading ? "Upload en cours..." : "Uploader la vidéo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}