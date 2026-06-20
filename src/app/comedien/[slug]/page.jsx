"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import TipModal from "@/components/TipModal";
import SubscribeModal from "@/components/SubscribeModal";
import VideoCard from "@/components/VideoCard";

export default function ComedianProfile({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [comedian, setComedian] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [showTip, setShowTip] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => { fetchComedian(); }, [slug, user]);

  async function fetchComedian() {
    setLoading(true);
    const { data: comedianData } = await supabase
      .from("comedians").select("*").eq("slug", slug).single();

    if (!comedianData) { setLoading(false); return; }

    // Check if current user has an active subscription
    if (user) {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData?.session?.user?.email;
      if (email) {
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("comedian_id", comedianData.id)
          .eq("email", email)
          .eq("status", "active")
          .single();
        if (subData) setIsSubscribed(true);
      }
    }

    const { data: videoData } = await supabase
      .from("videos").select("*")
      .eq("comedian_id", comedianData.id)
      .order("created_at", { ascending: false });

    const { count: subCount } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("comedian_id", comedianData.id).eq("status", "active");

    const { data: tipData } = await supabase
      .from("tips").select("amount")
      .eq("comedian_id", comedianData.id)
      .eq("status", "completed");

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

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: 28, fontWeight: 700 }}>rire<span style={{ color: "var(--accent)" }}>.</span>ci</p>
    </div>
  );

  if (!comedian) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <i className="ti ti-mood-sad" style={{ fontSize: 40, color: "var(--text-3)" }} aria-hidden="true" />
      <p style={{ color: "var(--text-2)" }}>Comédien introuvable.</p>
      <button onClick={() => router.push("/")} style={{ padding: "10px 20px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 600 }}>Retour</button>
    </div>
  );

  const initials = comedian.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  const publicVideos = videos.filter((v) => !v.is_locked);
  const exclusiveVideos = videos.filter((v) => v.is_locked);

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
        <button onClick={() => router.back()} style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-2)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)" }}>{comedian.name}</span>
        <button style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-2)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
          <i className="ti ti-dots-vertical" style={{ fontSize: 16 }} aria-hidden="true" />
        </button>
      </nav>

      {/* Profile header */}
      <div style={{ padding: "24px 16px 0" }}>

        {/* Avatar + actions */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: `linear-gradient(135deg, ${comedian.cover_color || "var(--accent)"}, #FF8C00)`,
              padding: 2,
            }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "var(--text-1)", border: "2px solid var(--bg)" }}>
                {comedian.avatar_url
                  ? <img src={comedian.avatar_url} alt={comedian.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  : initials}
              </div>
            </div>
            {comedian.is_verified && (
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg)" }}>
                <i className="ti ti-check" style={{ fontSize: 10, color: "#fff" }} aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
            <button
              onClick={() => setShowTip(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600 }}
            >
              <i className="ti ti-coin" style={{ fontSize: 15 }} aria-hidden="true" />
              Tip
            </button>
            <button
              onClick={() => !isSubscribed && setShowSubscribe(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: isSubscribed ? "var(--bg-2)" : "transparent",
                color: isSubscribed ? "var(--accent)" : "var(--text-1)",
                border: `0.5px solid ${isSubscribed ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              <i className={`ti ${isSubscribed ? "ti-star-filled" : "ti-star"}`} style={{ fontSize: 15 }} aria-hidden="true" />
              {isSubscribed ? "Abonné" : "S'abonner"}
            </button>
          </div>
        </div>

        {/* Name + bio */}
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>
          {comedian.name}
        </h1>
        {comedian.tagline && (
          <p style={{ fontSize: 13, color: "var(--accent)", marginBottom: 8, fontWeight: 500 }}>
            {comedian.tagline}
          </p>
        )}
        {comedian.bio && (
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 10 }}>
            {comedian.bio}
          </p>
        )}
        {comedian.location && (
          <p style={{ fontSize: 13, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
            <i className="ti ti-map-pin" style={{ fontSize: 14 }} aria-hidden="true" />
            {comedian.location}
          </p>
        )}

        {/* Tags */}
        {comedian.tags?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {comedian.tags.map((tag) => (
              <span key={tag} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "var(--bg-2)", color: "var(--text-2)", border: "0.5px solid var(--border)" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          {[
            { label: "Abonnés", value: comedian.subscribers.toLocaleString("fr-FR") },
            { label: "Tips reçus", value: `${comedian.totalTips} F` },
            { label: "Vidéos", value: comedian.videoCount },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "var(--bg-2)", padding: "14px 8px", textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Fan pass banner — only if not subscribed */}
        {!isSubscribed && (
          <div
            onClick={() => setShowSubscribe(true)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, background: "var(--bg-2)", border: "0.5px solid var(--border)", marginBottom: 20, cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-crown" style={{ fontSize: 18, color: "var(--accent)" }} aria-hidden="true" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Fan Pass mensuel</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Vidéos exclusives · Badge · Accès anticipé</p>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)" }}>500 F</p>
              <p style={{ fontSize: 10, color: "var(--text-3)" }}>/mois</p>
            </div>
          </div>
        )}

        {/* Subscribed badge */}
        {isSubscribed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(255,69,0,0.06)", border: "0.5px solid rgba(255,69,0,0.3)", marginBottom: 20 }}>
            <i className="ti ti-star-filled" style={{ fontSize: 18, color: "var(--accent)" }} aria-hidden="true" />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Fan Pass actif</p>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Tu as accès à tout le contenu exclusif</p>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 6, background: "#0D0D10" }} />

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)", position: "sticky", top: 62, background: "var(--bg)", zIndex: 30 }}>
        {[
          { id: "videos", label: "Vidéos", count: publicVideos.length },
          { id: "exclusif", label: "Exclusif", count: exclusiveVideos.length, icon: "ti-lock" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "14px 0",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "none", border: "none",
              color: activeTab === tab.id ? "var(--text-1)" : "var(--text-3)",
              fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
              borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {tab.icon && <i className={`ti ${tab.icon}`} style={{ fontSize: 14 }} aria-hidden="true" />}
            {tab.label}
            <span style={{ fontSize: 11, color: activeTab === tab.id ? "var(--accent)" : "var(--text-3)", background: "var(--bg-2)", padding: "1px 6px", borderRadius: 10 }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", marginTop: 1 }}>
        {(activeTab === "videos" ? publicVideos : exclusiveVideos).map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            coverColor={comedian.cover_color}
            isSubscribed={isSubscribed}
            onSubscribe={() => setShowSubscribe(true)}
          />
        ))}
      </div>

      {/* Empty states */}
      {activeTab === "videos" && publicVideos.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-3)" }}>
          <i className="ti ti-video-off" style={{ fontSize: 36 }} aria-hidden="true" />
          <p style={{ marginTop: 10, fontSize: 14 }}>Aucune vidéo pour l'instant.</p>
        </div>
      )}

      {activeTab === "exclusif" && exclusiveVideos.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-3)" }}>
          <i className="ti ti-lock" style={{ fontSize: 36 }} aria-hidden="true" />
          <p style={{ marginTop: 10, fontSize: 14 }}>Aucune vidéo exclusive pour l'instant.</p>
        </div>
      )}

      {/* Exclusive upsell when not subscribed and locked videos exist */}
      {activeTab === "exclusif" && exclusiveVideos.length > 0 && !isSubscribed && (
        <div style={{ margin: "0 16px 24px", padding: "20px", borderRadius: 14, background: "var(--bg-2)", border: "0.5px solid var(--border)", textAlign: "center" }}>
          <i className="ti ti-crown" style={{ fontSize: 28, color: "var(--accent)" }} aria-hidden="true" />
          <p style={{ fontSize: 15, fontWeight: 600, marginTop: 10 }}>Contenu réservé aux fans</p>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6, lineHeight: 1.6 }}>
            Abonne-toi pour 500 F/mois et accède à toutes les vidéos exclusives.
          </p>
          <button
            onClick={() => setShowSubscribe(true)}
            style={{ marginTop: 16, padding: "12px 28px", borderRadius: 10, background: "var(--accent)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600 }}
          >
            Obtenir le Fan Pass
          </button>
        </div>
      )}

      <div style={{ height: 24 }} />

      {/* Modals */}
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