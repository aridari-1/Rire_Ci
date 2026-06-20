"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import TipModal from "@/components/TipModal";
import SubscribeModal from "@/components/SubscribeModal";

export default function ComedianProfile({ params }) {
  const { slug } = use(params);
  const [comedian, setComedian] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [showTip, setShowTip] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchComedian();
  }, [slug]);

  async function fetchComedian() {
    setLoading(true);

    const { data: comedianData, error: comedianError } = await supabase
      .from("comedians")
      .select("*")
      .eq("slug", slug)
      .single();

    if (comedianError || !comedianData) {
      setLoading(false);
      return;
    }

    const { data: videoData } = await supabase
      .from("videos")
      .select("*")
      .eq("comedian_id", comedianData.id)
      .order("created_at", { ascending: false });

    const { count: subCount } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("comedian_id", comedianData.id)
      .eq("status", "active");

    const { data: tipData } = await supabase
      .from("tips")
      .select("amount")
      .eq("comedian_id", comedianData.id);

    const totalTips = tipData?.reduce((sum, t) => sum + t.amount, 0) || 0;

    setComedian({
      ...comedianData,
      subscribers: subCount || 0,
      totalTips: totalTips.toLocaleString("fr-FR"),
      videoCount: videoData?.length || 0,
    });
    setVideos(videoData || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0E0C0A" }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, fontFamily: "Georgia, serif", color: "#FFD600", fontWeight: 700 }}>
            rire<span style={{ color: "#FF6B2B" }}>.ci</span>
          </div>
          <p style={{ color: "#6B6560", fontSize: 13, marginTop: 12 }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!comedian) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0E0C0A", color: "#F5F0EB" }}
      >
        <p>Comédien introuvable.</p>
      </div>
    );
  }

  const initials = comedian.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "#0E0C0A", color: "#F5F0EB" }}>

      {/* Nav */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(14,12,10,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "0.5px solid #2A2420",
        }}
      >
        <button style={{ color: "#FF6B2B", fontSize: 22 }} onClick={() => window.history.back()}>
          ←
        </button>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: "#FFD600" }}>
          rire<span style={{ color: "#FF6B2B" }}>.ci</span>
        </span>
        {user ? (
          <button
            onClick={logout}
            style={{ color: "#6B6560", fontSize: 12, fontWeight: 600 }}
          >
            Déconnexion
          </button>
        ) : (
          <button
            onClick={() => router.push("/auth")}
            style={{ color: "#FF6B2B", fontSize: 12, fontWeight: 600 }}
          >
            Connexion
          </button>
        )}
      </nav>

      {/* Cover */}
      <div
        style={{
          height: 120,
          background: `linear-gradient(135deg, ${comedian.cover_color}33 0%, ${comedian.cover_color}88 50%, #FFD60022 100%)`,
          borderBottom: `2px solid ${comedian.cover_color}44`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          {[...Array(8)].map((_, i) => (
            <circle key={i} cx={`${i * 14 + 7}%`} cy="60%" r="28" fill="none" stroke="#FFD600" strokeWidth="0.5" />
          ))}
        </svg>
      </div>

      <div className="px-4" style={{ marginTop: -44 }}>
        {/* Avatar + buttons */}
        <div className="flex items-end justify-between">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 84, height: 84,
              background: comedian.cover_color,
              border: "3px solid #0E0C0A",
              fontFamily: "Georgia, serif",
              fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}
          >
            {comedian.avatar_url
              ? <img src={comedian.avatar_url} alt={comedian.name} className="w-full h-full rounded-full object-cover" />
              : initials}
          </div>
          <div className="flex gap-2 pb-1">
            <button
              onClick={() => setShowTip(true)}
              className="px-4 py-2 rounded-full active:scale-95 transition-all"
              style={{ background: "#FF6B2B", color: "#fff", fontSize: 13, fontWeight: 700 }}
            >
              💛 Tip
            </button>
            <button
              onClick={() => !isSubscribed && setShowSubscribe(true)}
              className="px-4 py-2 rounded-full active:scale-95 transition-all"
              style={{
                background: isSubscribed ? "#1A1714" : "#FFD600",
                color: isSubscribed ? "#FFD600" : "#0E0C0A",
                border: isSubscribed ? "1px solid #FFD600" : "none",
                fontSize: 13, fontWeight: 700,
              }}
            >
              {isSubscribed ? "✓ Abonné" : "S'abonner"}
            </button>
          </div>
        </div>

        {/* Identity */}
        <div className="flex items-center gap-2 mt-3">
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700 }}>
            {comedian.name}
          </h1>
          {comedian.is_verified && (
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#FF6B2B22", color: "#FF6B2B", fontWeight: 700 }}>
              ✓ vérifié
            </span>
          )}
        </div>
        <p style={{ color: "#FFD600", fontSize: 13, marginTop: 2, fontStyle: "italic" }}>{comedian.tagline}</p>
        <p style={{ color: "#A09890", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>{comedian.bio}</p>
        <p style={{ color: "#6B6560", fontSize: 12, marginTop: 6 }}>📍 {comedian.location}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {comedian.tags?.map((tag) => (
            <span key={tag} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#1A1714", color: "#A09890", border: "0.5px solid #2A2420" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex mt-4 rounded-xl overflow-hidden" style={{ background: "#1A1714", border: "0.5px solid #2A2420" }}>
          {[
            { label: "Abonnés", value: comedian.subscribers.toLocaleString("fr-FR") },
            { label: "Total tips", value: `${comedian.totalTips} F` },
            { label: "Vidéos", value: comedian.videoCount },
          ].map((stat, i) => (
            <div key={stat.label} className="flex-1 flex flex-col items-center py-3"
              style={{ borderRight: i < 2 ? "0.5px solid #2A2420" : "none" }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700 }}>{stat.value}</span>
              <span style={{ fontSize: 11, color: "#6B6560", marginTop: 2 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Fan pass banner */}
        {!isSubscribed && (
          <div
            onClick={() => setShowSubscribe(true)}
            className="mt-4 rounded-xl p-4 flex items-center justify-between cursor-pointer active:opacity-80"
            style={{ background: "linear-gradient(90deg,#FFD60014,#FF6B2B14)", border: "0.5px solid #FF6B2B44" }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#FFD600" }}>Fan Pass mensuel</p>
              <p style={{ fontSize: 12, color: "#A09890", marginTop: 2 }}>
                Accès aux vidéos exclusives · Badge fan · Accès anticipé
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#FF6B2B" }}>500 F</p>
              <p style={{ fontSize: 11, color: "#6B6560" }}>/mois</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex mt-6 rounded-xl overflow-hidden" style={{ background: "#1A1714", padding: 3, gap: 3 }}>
          {[{ id: "videos", label: "Vidéos" }, { id: "exclusif", label: "Exclusif 🔒" }].map((tab) => (
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

        {/* Videos */}
        <div className="mt-4 pb-24 grid grid-cols-2 gap-3">
          {videos
            .filter((v) => activeTab === "exclusif" ? v.is_locked : !v.is_locked)
            .map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                coverColor={comedian.cover_color}
                isSubscribed={isSubscribed}
                onSubscribe={() => setShowSubscribe(true)}
              />
            ))}
          {videos.filter((v) => activeTab === "exclusif" ? v.is_locked : !v.is_locked).length === 0 && (
            <div className="col-span-2 text-center py-12" style={{ color: "#6B6560", fontSize: 14 }}>
              {activeTab === "exclusif" ? "Aucune vidéo exclusive pour l'instant." : "Aucune vidéo pour l'instant."}
            </div>
          )}
        </div>
      </div>

      {showTip && <TipModal comedian={comedian} onClose={() => setShowTip(false)} />}
      {showSubscribe && (
        <SubscribeModal
          comedian={comedian}
          onClose={() => setShowSubscribe(false)}
          onSuccess={() => { setIsSubscribed(true); setShowSubscribe(false); }}
        />
      )}
    </div>
  );
}