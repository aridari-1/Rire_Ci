"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const TAGS = ["Tout", "Sketchs", "Maquis", "Nouchi", "Famille", "Politique"];

const THUMB_COLORS = ["#1E1624","#141E1E","#1E1E14","#1A141E","#141A1E","#1E1A14"];

export default function Homepage() {
  const router = useRouter();
  const { user } = useAuth();
  const [comedians, setComedians] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("Tout");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: comediansData } = await supabase
      .from("comedians").select("*")
      .order("created_at", { ascending: false });

    const { data: videosData } = await supabase
      .from("videos")
      .select("*, comedians(name, slug, cover_color)")
      .eq("is_locked", false)
      .order("created_at", { ascending: false })
      .limit(20);

    setComedians(comediansData || []);
    setVideos(videosData || []);
    setLoading(false);
  }

  const filteredVideos = activeTag === "Tout"
    ? videos
    : videos.filter((v) => v.comedians && comedians.find(
        (c) => c.slug === v.comedians.slug && c.tags?.includes(activeTag)
      ));

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)" }}>rire<span style={{ color: "var(--accent)" }}>.</span>ci</p>
        <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 8 }}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px",
        background: "rgba(17,17,20,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid var(--border)",
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
          rire<span style={{ color: "var(--accent)" }}>.</span>ci
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => router.push("/recherche")}
            style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-2)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}
          >
            <i className="ti ti-search" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
          {user ? (
            <div
              onClick={() => router.push("/dashboard")}
              style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}
            >
              {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase()}
            </div>
          ) : (
            <button
              onClick={() => router.push("/auth")}
              style={{ padding: "7px 14px", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none" }}
            >
              Connexion
            </button>
          )}
        </div>
      </nav>

      {/* Tag filters */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto" }}>
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
              whiteSpace: "nowrap", border: "none", flexShrink: 0,
              background: activeTag === tag ? "var(--accent)" : "var(--bg-2)",
              color: activeTag === tag ? "#fff" : "var(--text-2)",
              outline: activeTag !== tag ? "0.5px solid var(--border)" : "none",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Comedians row */}
      {comedians.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 10px" }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Comédiens</span>
            <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>Voir tous</span>
          </div>
          <div style={{ display: "flex", gap: 12, padding: "0 16px 16px", overflowX: "auto" }}>
            {comedians.map((c, idx) => {
              const initials = c.name.split(" ").map((n) => n[0]).join("").toUpperCase();
              return (
                <div
                  key={c.id}
                  onClick={() => router.push(`/comedien/${c.slug}`)}
                  style={{ flexShrink: 0, width: 72, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: "50%", padding: 2, background: `linear-gradient(135deg, ${c.cover_color || "var(--accent)"}, #FF8C00)` }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, border: "2px solid var(--bg)", color: "var(--text-1)" }}>
                      {c.avatar_url ? <img src={c.avatar_url} alt={c.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-1)", textAlign: "center", fontWeight: 500, lineHeight: 1.3, width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.name.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 6, background: "#0D0D10" }} />

      {/* Videos header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          {activeTag === "Tout" ? "Tendances" : activeTag}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>
          {filteredVideos.length} vidéos
        </span>
      </div>

      {/* Video grid */}
      {filteredVideos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-3)" }}>
          <i className="ti ti-video-off" style={{ fontSize: 36 }} aria-hidden="true" />
          <p style={{ marginTop: 10, fontSize: 14 }}>Aucune vidéo pour ce thème.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)" }}>
          {filteredVideos.map((video, idx) => {
            const thumbBg = THUMB_COLORS[idx % THUMB_COLORS.length];
            const initials = video.comedians?.name?.split(" ").map((n) => n[0]).join("") || "?";
            return (
              <div
                key={video.id}
                onClick={() => router.push(`/comedien/${video.comedians?.slug}`)}
                style={{ background: "var(--bg)", cursor: "pointer" }}
              >
                {/* Thumb */}
                <div style={{ height: 110, background: thumbBg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,69,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="ti ti-player-play" style={{ fontSize: 14, color: "#fff", marginLeft: 2 }} aria-hidden="true" />
                  </div>
                  {video.duration && (
                    <span style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 10, fontWeight: 500, padding: "2px 5px", borderRadius: 4 }}>
                      {video.duration}
                    </span>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: "8px 10px 12px" }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {video.title}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {initials}
                    </div>
                    <span style={{ fontSize: 10, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {video.comedians?.name}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-3)", marginLeft: "auto", flexShrink: 0 }}>
                      {(video.views || 0).toLocaleString("fr-FR")} vues
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}