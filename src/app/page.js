"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

export default function Homepage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [comedians, setComedians] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trending");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data: comediansData } = await supabase
      .from("comedians")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: videosData } = await supabase
      .from("videos")
      .select("*, comedians(name, slug, cover_color, avatar_url)")
      .eq("is_locked", false)
      .order("created_at", { ascending: false })
      .limit(20);

    setComedians(comediansData || []);
    setVideos(videosData || []);
    setLoading(false);
  }

  const featured = comedians.filter((c) => c.featured);
  const all = comedians;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0E0C0A" }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 700, color: "#FFD600" }}>
            rire<span style={{ color: "#FF6B2B" }}>.ci</span>
          </h1>
          <p style={{ color: "#6B6560", fontSize: 13, marginTop: 8 }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0E0C0A", color: "#F5F0EB" }}>

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(14,12,10,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "0.5px solid #2A2420",
        }}
      >
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#FFD600" }}>
          rire<span style={{ color: "#FF6B2B" }}>.ci</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/recherche")}
            style={{ color: "#F5F0EB", fontSize: 18, background: "none", border: "none", cursor: "pointer" }}
          >
            🔍
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 12, color: "#6B6560" }}>
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={logout}
                style={{ fontSize: 12, color: "#FF6B2B", fontWeight: 600 }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/auth")}
              className="px-4 py-2 rounded-full"
              style={{ background: "#FF6B2B", color: "#fff", fontSize: 13, fontWeight: 700 }}
            >
              Connexion
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <div
        className="px-4 py-8 text-center"
        style={{
          background: "linear-gradient(180deg, #1A0E08 0%, #0E0C0A 100%)",
          borderBottom: "0.5px solid #2A2420",
        }}
      >
        <p style={{ fontSize: 12, color: "#FF6B2B", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          🇨🇮 La scène comique ivoirienne
        </p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}>
          Ris. Soutiens.<br />
          <span style={{ color: "#FFD600" }}>Rejoins la famille.</span>
        </h2>
        <p style={{ color: "#6B6560", fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
          Découvre les meilleurs comédiens d'Abidjan,<br />
          envoie des tips et accède à du contenu exclusif.
        </p>
        <button
          onClick={() => router.push("/recherche")}
          className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full mx-auto transition-all active:scale-95"
          style={{ background: "#1A1714", border: "0.5px solid #2A2420", color: "#A09890", fontSize: 14 }}
        >
          <span>🔍</span>
          <span>Rechercher un comédien...</span>
        </button>
      </div>

      {/* ── Featured comedians ── */}
      {featured.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F5F0EB" }}>
              ⭐ Comédiens en vedette
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
            {featured.map((c) => (
              <FeaturedCard key={c.id} comedian={c} onClick={() => router.push(`/comedien/${c.slug}`)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="px-4 mt-6">
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ background: "#1A1714", padding: 3, gap: 3 }}
        >
          {[
            { id: "trending", label: "🔥 Tendances" },
            { id: "comedians", label: "🎭 Comédiens" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-lg transition-all"
              style={{
                background: activeTab === tab.id ? "#FF6B2B" : "transparent",
                color: activeTab === tab.id ? "#fff" : "#6B6560",
                fontSize: 13, fontWeight: 700,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Trending videos ── */}
      {activeTab === "trending" && (
        <div className="px-4 mt-4 pb-24">
          {videos.length === 0 ? (
            <div className="text-center py-16" style={{ color: "#6B6560" }}>
              <div style={{ fontSize: 40 }}>🎬</div>
              <p style={{ marginTop: 8, fontSize: 14 }}>Aucune vidéo pour l'instant.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {videos.map((video) => (
                <TrendingVideoCard
                  key={video.id}
                  video={video}
                  onClick={() => router.push(`/comedien/${video.comedians?.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── All comedians ── */}
      {activeTab === "comedians" && (
        <div className="px-4 mt-4 pb-24 flex flex-col gap-3">
          {all.length === 0 ? (
            <div className="text-center py-16" style={{ color: "#6B6560" }}>
              <div style={{ fontSize: 40 }}>🎭</div>
              <p style={{ marginTop: 8, fontSize: 14 }}>Aucun comédien pour l'instant.</p>
            </div>
          ) : (
            all.map((c) => (
              <ComedianRow
                key={c.id}
                comedian={c}
                onClick={() => router.push(`/comedien/${c.slug}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Featured card ─────────────────────────────────────────────────────────────
function FeaturedCard({ comedian, onClick }) {
  const initials = comedian.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
      style={{ width: 160, background: "#1A1714", border: "0.5px solid #2A2420" }}
    >
      <div
        style={{
          height: 80,
          background: `linear-gradient(135deg, ${comedian.cover_color}44, ${comedian.cover_color}99)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 52, height: 52, borderRadius: "50%",
            background: comedian.cover_color,
            border: "2px solid #0E0C0A",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#fff",
          }}
        >
          {comedian.avatar_url
            ? <img src={comedian.avatar_url} alt={comedian.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            : initials}
        </div>
      </div>
      <div className="p-3">
        <p style={{ fontSize: 13, fontWeight: 700, color: "#F5F0EB" }}>{comedian.name}</p>
        <p style={{ fontSize: 11, color: "#6B6560", marginTop: 2 }}>{comedian.location}</p>
        {comedian.is_verified && (
          <span style={{ fontSize: 10, color: "#FF6B2B", fontWeight: 700 }}>✓ vérifié</span>
        )}
      </div>
    </div>
  );
}

// ── Trending video card ───────────────────────────────────────────────────────
function TrendingVideoCard({ video, onClick }) {
  const thumbBg = ["#2A1F1A","#1A1F2A","#1A2A1F","#2A2A1A","#2A1A2A","#1A2A2A"][
    Math.abs(video.title?.charCodeAt(0) || 0) % 6
  ];
  return (
    <div
      onClick={onClick}
      className="rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
      style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}
    >
      <div
        style={{ height: 90, background: thumbBg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
      >
        <div
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,107,43,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, paddingLeft: 3,
          }}
        >
          ▶
        </div>
        {video.duration && (
          <span
            style={{
              position: "absolute", bottom: 5, right: 6,
              background: "rgba(14,12,10,0.85)", color: "#F5F0EB",
              fontSize: 9, fontWeight: 500, padding: "2px 5px", borderRadius: 4,
            }}
          >
            {video.duration}
          </span>
        )}
      </div>
      <div style={{ padding: "8px 10px" }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: "#F5F0EB", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {video.title}
        </p>
        <p style={{ fontSize: 10, color: "#FF6B2B", marginTop: 4, fontWeight: 600 }}>
          {video.comedians?.name}
        </p>
      </div>
    </div>
  );
}

// ── Comedian row ──────────────────────────────────────────────────────────────
function ComedianRow({ comedian, onClick }) {
  const initials = comedian.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-xl cursor-pointer active:scale-95 transition-transform"
      style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}
    >
      <div
        style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
          background: comedian.cover_color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "#fff",
        }}
      >
        {comedian.avatar_url
          ? <img src={comedian.avatar_url} alt={comedian.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          : initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p style={{ fontSize: 14, fontWeight: 700, color: "#F5F0EB" }}>{comedian.name}</p>
          {comedian.is_verified && (
            <span style={{ fontSize: 10, color: "#FF6B2B", fontWeight: 700 }}>✓</span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#6B6560", marginTop: 1 }}>{comedian.tagline}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#FFD600" }}>{comedian.videoCount || 0}</p>
        <p style={{ fontSize: 10, color: "#6B6560" }}>vidéos</p>
      </div>
    </div>
  );
}